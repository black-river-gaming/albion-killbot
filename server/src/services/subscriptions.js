const moment = require("moment");
const logger = require("../helpers/logger");
const subscriptions = require("../ports/subscriptions");
const { getAllSettings, setSettings, DEFAULT_SETTINGS } = require("./settings");

const SUBSCRIPTIONS_ONLY = Boolean(process.env.SUBSCRIPTIONS_ONLY);

function isSubscriptionsEnabled() {
  return SUBSCRIPTIONS_ONLY;
}

function getSubscription(settings) {
  if (!isSubscriptionsEnabled()) return null;
  if (!settings || !settings.subscription) return null;
  return settings.subscription;
}

function hasSubscription(settings) {
  if (!isSubscriptionsEnabled()) return true;
  if (!settings || !settings.subscription) return false;
  return moment(settings.subscription.expires).diff() > 0;
}

async function activateSubscription(settings, userId) {
  if (!isSubscriptionsEnabled()) return false;
  if (!settings) return false;

  try {
    settings.subscription = await subscriptions.activateSubscription(userId);
    await setSettings(settings.guild, settings);
    logger.info(`[#${settings.guild}] Subscription activated until ${settings.subscription.expires.toString()}`);
  } catch (e) {
    logger.verbose(`[#${settings.guild}] Unable to active subscription:`, e);
    throw e;
  }
}

async function refreshSubscriptions() {
  if (!isSubscriptionsEnabled()) return;

  const allServerSettings = await getAllSettings();

  for (const settings of allServerSettings) {
    const subscription = getSubscription(settings);
    if (!subscription) continue;

    try {
      settings.subscription = await subscriptions.renewSubscription(subscription);
      await setSettings(settings.guild, settings);
      logger.info(`[#${settings.guild}] Subscription extended until ${settings.subscription.expires.toString()}`);
    } catch (e) {
      logger.verbose(`[#${settings.guild}] Unable to renew subscription:`, e);
    }
  }
}

async function cancelSubscription(settings) {
  if (!isSubscriptionsEnabled()) return false;
  if (!settings || !settings.subscription) return false;

  logger.verbose(`[#${settings.guild}] Subscription cancelled`);
  settings.subscription = { ...DEFAULT_SETTINGS.subscription };

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
