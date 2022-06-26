const moment = require("moment");
const stripe = require("../ports/stripe");
const { getCollection, find, findOne } = require("../ports/database");
const { getNumber } = require("../helpers/utils");

const { MAX_PLAYERS, MAX_GUILDS, MAX_ALLIANCES, SUB_MAX_PLAYERS, SUB_MAX_GUILDS, SUB_MAX_ALLIANCES } = process.env;
const SUBSCRIPTIONS_MODE = Boolean(process.env.SUBSCRIPTIONS_MODE);
const SUBSCRIPTIONS_COLLECTION = "subscriptions";

function isSubscriptionsEnabled() {
  return SUBSCRIPTIONS_MODE;
}

async function addSubscription(subscription) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.insertOne(subscription).insertedId;
}

async function assignSubscription(_id, server) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.updateOne({ _id }, { $set: { server } });
}

async function fetchSubscriptionPrices() {
  return await stripe.getPrices({});
}

async function buySubscription(priceId, owner) {
  return await stripe.createCheckoutSession(priceId, owner);
}

async function getBuySubscription(checkoutId) {
  return await stripe.getCheckoutSession(checkoutId);
}

async function manageSubscription(customerId) {
  return await stripe.createPortalSession(customerId);
}

async function getSubscriptionsByOwner(owner) {
  if (!isSubscriptionsEnabled()) return [];
  return await find(SUBSCRIPTIONS_COLLECTION, { owner });
}

async function getSubscriptionById(subscriptionId) {
  if (!isSubscriptionsEnabled()) return null;
  return await findOne(SUBSCRIPTIONS_COLLECTION, { _id: subscriptionId });
}

async function getSubscriptionByServerId(server) {
  if (!isSubscriptionsEnabled()) return [];
  return await findOne(SUBSCRIPTIONS_COLLECTION, { server });
}

async function getSubscriptionByStripeId(stripe) {
  if (!isSubscriptionsEnabled()) return null;
  return await findOne(SUBSCRIPTIONS_COLLECTION, { stripe });
}

async function getSubscriptionByCheckoutId(checkoutId) {
  if (!isSubscriptionsEnabled()) return null;
  const checkout = await stripe.getCheckoutSession(checkoutId);
  return await findOne(SUBSCRIPTIONS_COLLECTION, { stripe: checkout.subscription });
}

async function getStripeSubscription(id) {
  return await stripe.getSubscription(id);
}

async function getLimitsByServerId(server) {
  let players = getNumber(MAX_PLAYERS, 10);
  let guilds = getNumber(MAX_GUILDS, 1);
  let alliances = getNumber(MAX_ALLIANCES, 1);

  if (isSubscriptionsEnabled() && (await hasSubscriptionByServerId(server))) {
    players = getNumber(SUB_MAX_PLAYERS, players);
    guilds = getNumber(SUB_MAX_GUILDS, guilds);
    alliances = getNumber(SUB_MAX_ALLIANCES, alliances);
  }

  return {
    players,
    guilds,
    alliances,
  };
}

async function hasSubscriptionByServerId(server) {
  if (!isSubscriptionsEnabled()) return true;
  const subscription = await findOne(SUBSCRIPTIONS_COLLECTION, { server });
  if (!subscription) return false;
  if (subscription.expires === "never") return true;
  return moment(subscription.expires).diff() > 0;
}

async function removeSubscription(_id) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.deleteOne({ _id });
}

async function removeSubscriptionByStripeId(stripe) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.deleteOne({ stripe });
}

async function updateSubscriptionByStripeId(stripe, subscription) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.updateOne({ stripe }, { $set: subscription });
}

async function unassignSubscription(_id) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.updateOne({ _id }, { $unset: { server: "" } });
}

module.exports = {
  addSubscription,
  assignSubscription,
  buySubscription,
  fetchSubscriptionPrices,
  getBuySubscription,
  getLimitsByServerId,
  getStripeSubscription,
  getSubscriptionByCheckoutId,
  getSubscriptionById,
  getSubscriptionByServerId,
  getSubscriptionByStripeId,
  getSubscriptionsByOwner,
  hasSubscriptionByServerId,
  isSubscriptionsEnabled,
  manageSubscription,
  removeSubscription,
  removeSubscriptionByStripeId,
  unassignSubscription,
  updateSubscriptionByStripeId,
};
