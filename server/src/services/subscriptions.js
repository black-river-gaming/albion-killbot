const moment = require("moment");
const logger = require("../helpers/logger");
const patreon = require("../ports/patreon");
const { getCollection } = require("../ports/database");
const { getAllSettings, setSettings, DEFAULT_SETTINGS } = require("./settings");

const SUBSCRIPTIONS_ONLY = Boolean(process.env.SUBSCRIPTIONS_ONLY);
const SUBSCRIPTIONS_COLLECTION = "subscriptions";

function isSubscriptionsEnabled() {
  return SUBSCRIPTIONS_ONLY;
}

async function getSubscription(guild) {
  if (!isSubscriptionsEnabled()) return null;
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.findOne({ guild });
}

async function getSubscriptionByOwner(owner) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.findOne({ owner });
}

async function hasSubscription(guild) {
  if (!isSubscriptionsEnabled()) return true;
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  const subscription = await collection.findOne({ guild });
  if (!subscription) return false;
  return moment(subscription.expires).diff() > 0;
}

module.exports = {
  getSubscription,
  getSubscriptionByOwner,
  hasSubscription,
  isSubscriptionsEnabled,
};
