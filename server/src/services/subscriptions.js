const moment = require("moment");
const stripe = require("../ports/stripe");
const { getCollection } = require("../ports/database");

const SUBSCRIPTIONS_ONLY = Boolean(process.env.SUBSCRIPTIONS_ONLY);
const SUBSCRIPTIONS_COLLECTION = "subscriptions";

function isSubscriptionsEnabled() {
  return SUBSCRIPTIONS_ONLY;
}

async function addSubscription(owner, stripeSubscription) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);

  const subscription = {
    owner,
    expires: new Date(stripeSubscription.current_period_end * 1000),
    stripe: {
      subscription: stripeSubscription.id,
      customer: stripeSubscription.customer,
    },
  };

  return await collection.insertOne(subscription).insertedId;
}

async function assignServerSubscription(_id, guild) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.updateOne({ _id }, { $set: { guild } });
}

async function fetchSubscriptionPrices() {
  return await stripe.getPrices({});
}

async function buySubscription(priceId) {
  return await stripe.createCheckoutSession(priceId);
}

async function getBuySubscription(checkoutId) {
  return await stripe.getCheckoutSession(checkoutId);
}

async function getOwnerSubscriptions(owner) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.find({ owner }).toArray();
}

async function getServerSubscription(guild) {
  if (!isSubscriptionsEnabled()) return null;
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.findOne({ guild });
}

async function hasSubscription(guild) {
  if (!isSubscriptionsEnabled()) return true;
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  const subscription = await collection.findOne({ guild });
  if (!subscription) return false;
  return moment(subscription.expires).diff() > 0;
}

async function removeSubscription(_id) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.deleteOne({ _id });
}

async function unassignServerSubscription(guild) {
  const collection = getCollection(SUBSCRIPTIONS_COLLECTION);
  return await collection.updateOne({ guild }, { $unset: { guild: "" } });
}

module.exports = {
  addSubscription,
  assignServerSubscription,
  buySubscription,
  fetchSubscriptionPrices,
  getBuySubscription,
  getOwnerSubscriptions,
  getServerSubscription,
  hasSubscription,
  isSubscriptionsEnabled,
  removeSubscription,
  unassignServerSubscription,
};
