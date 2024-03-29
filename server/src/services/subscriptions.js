const config = require("config");
const EventEmitter = require("events");
const moment = require("moment");
const stripe = require("../ports/stripe");
const { find, findOne, insertOne, updateOne, updateMany, deleteOne } = require("../ports/database");
const { remove } = require("../helpers/cache");
const { SUBSCRIPTION_STATUS, DAY } = require("../helpers/constants");

const SUBSCRIPTIONS_COLLECTION = "subscriptions";
const subscriptionEvents = new EventEmitter();

/* Helpers */
function isSubscriptionsEnabled() {
  return config.get("features.subscriptions.enabled");
}

function getSubscriptionExpires(subscription, { unit } = {}) {
  if (!subscription || !subscription.expires) return 0;
  return moment(subscription.expires).diff(moment(), unit);
}

/* Stripe */
async function fetchSubscriptionPrices(currency) {
  return await stripe.getPrices({ currency });
}

async function createSubscriptionCheckout(priceId, owner, { server } = {}) {
  return await stripe.createCheckoutSession(priceId, owner, { server });
}

async function getBuySubscription(checkoutId) {
  return await stripe.getCheckoutSession(checkoutId);
}

async function getStripeSubscription(id) {
  return await stripe.getSubscription(id);
}

async function manageSubscription(customerId, { serverId } = {}) {
  return await stripe.createPortalSession(customerId, { serverId });
}

/* Subscriptions */
async function fetchSubscriptions({ owner, stripe, server, status } = {}) {
  const query = {};
  if (owner) query.owner = owner;
  if (server) query.server = server;
  if (stripe) query.stripe = stripe;
  if (status) {
    switch (status) {
      case SUBSCRIPTION_STATUS.FREE:
        query.expires = "never";
        break;
      case SUBSCRIPTION_STATUS.ACTIVE:
        query.expires = { $gte: new Date() };
        break;
      case SUBSCRIPTION_STATUS.EXPIRED:
        query.expires = { $lt: new Date() };
        break;
      default:
    }
  }

  return await find(SUBSCRIPTIONS_COLLECTION, query);
}

async function fetchAllSubscriptions() {
  return await find(SUBSCRIPTIONS_COLLECTION, {});
}

async function getSubscriptionById(_id) {
  if (!isSubscriptionsEnabled()) return null;
  return await findOne(SUBSCRIPTIONS_COLLECTION, { _id });
}

async function getSubscriptionByOwner(owner) {
  if (!isSubscriptionsEnabled()) return null;
  return await findOne(SUBSCRIPTIONS_COLLECTION, { owner });
}

async function fetchSubscriptionsByOwner(owner) {
  if (!isSubscriptionsEnabled()) return [];
  return await find(SUBSCRIPTIONS_COLLECTION, { owner });
}

async function getSubscriptionByServerId(server) {
  if (!isSubscriptionsEnabled()) return null;
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

function isActiveSubscription(subscription) {
  if (!isSubscriptionsEnabled()) return false;
  if (!subscription || !subscription.expires) return false;
  if (subscription.expires === "never") return true;
  // We have a grace period of 3 days
  return getSubscriptionExpires(subscription) > DAY * -3;
}

async function hasSubscriptionByServerId(server) {
  const subscription = await findOne(SUBSCRIPTIONS_COLLECTION, { server });
  return isActiveSubscription(subscription);
}

async function addSubscription(data) {
  const id = await insertOne(SUBSCRIPTIONS_COLLECTION, data);

  const subscription = await getSubscriptionById(id);
  subscriptionEvents.emit("add", subscription);

  if (subscription.server) remove(`limits-${subscription.server}`);

  return subscription;
}

async function assignSubscription(_id, server) {
  const subscription = await getSubscriptionById(_id);
  subscriptionEvents.emit("assign", subscription);

  if (subscription.server) remove(`limits-${subscription.server}`);

  return await updateOne(SUBSCRIPTIONS_COLLECTION, { _id }, { $set: { server } });
}

async function removeSubscription(_id) {
  const subscription = await getSubscriptionById(_id);
  subscriptionEvents.emit("remove", subscription);

  if (subscription.server) remove(`limits-${subscription.server}`);

  return await deleteOne(SUBSCRIPTIONS_COLLECTION, { _id });
}

async function removeSubscriptionByServerId(serverId) {
  const subscription = await getSubscriptionByServerId(serverId);
  subscriptionEvents.emit("remove", subscription);

  if (subscription.server) remove(`limits-${subscription.server}`);

  return await deleteOne(SUBSCRIPTIONS_COLLECTION, { server: serverId });
}

async function removeSubscriptionByStripeId(stripeId) {
  const subscription = await getSubscriptionByStripeId(stripeId);
  subscriptionEvents.emit("remove", subscription);

  if (subscription.server) remove(`limits-${subscription.server}`);

  return await deleteOne(SUBSCRIPTIONS_COLLECTION, { stripe: stripeId });
}

async function updateSubscription(subscriptionId, data) {
  await updateOne(SUBSCRIPTIONS_COLLECTION, { _id: subscriptionId }, { $set: data });

  const subscription = await getSubscriptionById(subscriptionId);
  subscriptionEvents.emit("update", subscription);

  if (subscription.server) remove(`limits-${subscription.server}`);

  return subscription;
}

async function updateSubscriptionByServerId(serverId, data) {
  await updateOne(SUBSCRIPTIONS_COLLECTION, { server: serverId }, { $set: data }, { upsert: true });

  const subscription = await getSubscriptionByServerId(serverId);
  subscriptionEvents.emit("update", subscription);

  if (subscription.server) remove(`limits-${subscription.server}`);

  return subscription;
}

async function updateSubscriptionByStripeId(stripeId, data, { upsert = false } = {}) {
  await updateOne(SUBSCRIPTIONS_COLLECTION, { stripe: stripeId }, { $set: data }, { upsert });

  const subscription = await getSubscriptionByStripeId(stripeId);
  subscriptionEvents.emit("update", subscription);

  return subscription;
}

async function unassignSubscription(_id) {
  const subscription = await getSubscriptionById(_id);
  subscriptionEvents.emit("unassign", subscription);

  if (subscription.server) remove(`limits-${subscription.server}`);

  return await updateOne(SUBSCRIPTIONS_COLLECTION, { _id }, { $unset: { server: "" } });
}

async function unassignSubscriptionsByServerId(serverId) {
  const subscription = await getSubscriptionByServerId(serverId);
  subscriptionEvents.emit("unassign", subscription);

  return await updateMany(SUBSCRIPTIONS_COLLECTION, { server: serverId }, { $unset: { server: "" } });
}

module.exports = {
  subscriptionEvents,
  addSubscription,
  assignSubscription,
  createSubscriptionCheckout,
  fetchAllSubscriptions,
  fetchSubscriptionPrices,
  fetchSubscriptions,
  fetchSubscriptionsByOwner,
  findSubscriptionsByServerId,
  getBuySubscription,
  getStripeSubscription,
  getSubscriptionByCheckoutId,
  getSubscriptionById,
  getSubscriptionByOwner,
  getSubscriptionByServerId,
  getSubscriptionByStripeId,
  getSubscriptionExpires,
  hasSubscriptionByServerId,
  isActiveSubscription,
  isSubscriptionsEnabled,
  manageSubscription,
  removeSubscription,
  removeSubscriptionByServerId,
  removeSubscriptionByStripeId,
  unassignSubscription,
  unassignSubscriptionsByServerId,
  updateSubscription,
  updateSubscriptionByServerId,
  updateSubscriptionByStripeId,
};
