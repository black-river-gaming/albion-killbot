const moment = require("moment");
const stripe = require("../ports/stripe");
const { getCollection, find, findOne, updateOne, update, deleteOne } = require("../ports/database");

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
  return await updateOne(SUBSCRIPTIONS_COLLECTION, { _id }, { $set: { server } });
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

async function getSubscriptionById(_id) {
  if (!isSubscriptionsEnabled()) return null;
  return await findOne(SUBSCRIPTIONS_COLLECTION, { _id });
}

async function getSubscriptionByServerId(server) {
  if (!isSubscriptionsEnabled()) return [];
  return await findOne(SUBSCRIPTIONS_COLLECTION, { server });
}

async function findSubscriptionsByServerId(server) {
  return await find(SUBSCRIPTIONS_COLLECTION, { server });
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

async function hasSubscriptionByServerId(server) {
  if (!isSubscriptionsEnabled()) return true;
  const subscription = await findOne(SUBSCRIPTIONS_COLLECTION, { server });
  if (!subscription) return false;
  if (subscription.expires === "never") return true;
  return moment(subscription.expires).diff() > 0;
}

async function removeSubscription(_id) {
  return await deleteOne(SUBSCRIPTIONS_COLLECTION, { _id });
}

async function removeSubscriptionByStripeId(stripe) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.deleteOne({ stripe });
}

async function updateSubscriptionByServerId(serverId, subscription) {
  await updateOne(SUBSCRIPTIONS_COLLECTION, { server: serverId }, { $set: subscription });
  return await getSubscriptionByServerId(serverId);
}

async function updateSubscriptionByStripeId(stripeId, subscription) {
  await updateOne(SUBSCRIPTIONS_COLLECTION, { stripe: stripeId }, { $set: subscription });
  return await getSubscriptionByStripeId(stripeId);
}

async function unassignSubscription(_id) {
  return await updateOne(SUBSCRIPTIONS_COLLECTION, { _id }, { $unset: { server: "" } });
}

async function unassignSubscriptionsByServerId(server) {
  return await update(SUBSCRIPTIONS_COLLECTION, { server }, { $unset: { server: "" } });
}

module.exports = {
  addSubscription,
  assignSubscription,
  buySubscription,
  fetchSubscriptionPrices,
  findSubscriptionsByServerId,
  getBuySubscription,
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
  unassignSubscriptionsByServerId,
  updateSubscriptionByServerId,
  updateSubscriptionByStripeId,
};
