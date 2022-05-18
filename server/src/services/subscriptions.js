const moment = require("moment");
const logger = require("../helpers/logger");
const subscriptions = require("../ports/subscriptions");
const { getAllSettings, setSettings } = require("./settings");

const SUBSCRIPTIONS_ONLY = Boolean(process.env.SUBSCRIPTIONS_ONLY);

function isSubscriptionsEnabled() {
  return SUBSCRIPTIONS_ONLY;
}

function getSubscription(setting) {
  if (!isSubscriptionsEnabled()) return null;
  if (!setting || !setting.subscription) return null;
  return setting.subscription;
}

function hasSubscription(setting) {
  if (!isSubscriptionsEnabled()) return true;
  if (!setting || !setting.subscription) return false;
  return moment(setting.subscription.expires).diff() > 0;
}

async function activateSubscription(setting, userId) {
  if (!isSubscriptionsEnabled()) return false;
  if (!setting) return false;

  try {
    setting.subscription = await subscriptions.activateSubscription(userId);
    await setSettings(setting.guild, setting);
    logger.info(`[#${setting.guild}] Subscription activated until ${setting.subscription.expires.toString()}`);
    return true;
  } catch (e) {
    logger.verbose(`[#${setting.guild}] Unable to active subscription:`, e);
    return false;
  }
}

async function refreshSubscriptions() {
  if (!isSubscriptionsEnabled()) return;

  const settings = await getAllSettings();

  for (const setting of settings) {
    const subscription = getSubscription(setting);
    if (!subscription) continue;

    try {
      setting.subscription = await subscriptions.renewSubscription(subscription);
      await setSettings(setting.guild, setting);
      logger.info(`[#${setting.guild}] Subscription extended until ${setting.subscription.expires.toString()}`);
    } catch (e) {
      logger.verbose(`[#${setting.guild}] Unable to renew subscription:`, e);
    }
  }
}

async function cancelSubscription(settings) {
  if (!isSubscriptionsEnabled()) return false;
  if (!settings || !settings.subscription) return false;

  logger.verbose(`[#${settings.guild}] Subscription cancelled`);
  settings.subscription = null;

  await setSettings(settings.guild, settings);
  return true;
}

module.exports = {
  activateSubscription,
  cancelSubscription,
  getSubscription,
  hasSubscription,
  isSubscriptionsEnabled,
  refreshSubscriptions,
};
