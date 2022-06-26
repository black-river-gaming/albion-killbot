const subscriptionsService = require("../../../services/subscriptions");

async function getSubscriptions(req, res) {
  try {
    const { user } = req.session.discord;
    const subscriptions = await subscriptionsService.getSubscriptionsByOwner(user.id);
    for (const subscription of subscriptions) {
      if (subscription.stripe) {
        subscription.stripe = await subscriptionsService.getStripeSubscription(subscription.stripe);
      }
    }
    return res.send(subscriptions);
  } catch (error) {
    return res.sendStatus(403);
  }
}

async function getSubscriptionsPrices(req, res) {
  try {
    const prices = await subscriptionsService.fetchSubscriptionPrices();
    return res.send(prices);
  } catch (error) {
    return res.sendStatus(500);
  }
}

async function assignSubscription(req, res) {
  try {
    const { server, checkoutId, subscriptionId } = req.body;
    if (!server || (!checkoutId && !subscriptionId)) return res.sendStatus(422);

    const otherSubs = await subscriptionsService.getSubscriptionByServerId(server);
    for (const otherSub of otherSubs) {
      await subscriptionsService.unassignSubscription(otherSub.id);
    }

    const subscription = subscriptionId
      ? await subscriptionsService.getSubscriptionById(subscriptionId)
      : await subscriptionsService.getSubscriptionByCheckoutId(checkoutId);
    if (!subscription) return res.sendStatus(404);

    const { user } = req.session.discord;
    if (subscription.owner !== user.id) return res.sendStatus(403);

    await subscriptionsService.assignSubscription(subscription.id, server);
    subscription.server = server;

    return res.send(subscription);
  } catch (error) {
    return res.sendStatus(500);
  }
}

async function buySubscription(req, res) {
  try {
    const { priceId } = req.body;
    const { user } = req.session.discord;

    const checkout = await subscriptionsService.buySubscription(priceId, user.id);
    if (!checkout) return res.sendStatus(404);

    return res.send(checkout);
  } catch (error) {
    return res.sendStatus(500);
  }
}

async function getBuySubscription(req, res) {
  try {
    const { checkoutId } = req.params;
    const checkout = await subscriptionsService.getBuySubscription(checkoutId);
    return res.send(checkout);
  } catch (error) {
    return res.sendStatus(500);
  }
}

async function manageSubscription(req, res) {
  try {
    const { customerId } = req.body;

    const session = await subscriptionsService.manageSubscription(customerId);
    if (!session) return res.sendStatus(404);

    return res.send(session);
  } catch (error) {
    return res.sendStatus(500);
  }
}

module.exports = {
  assignSubscription,
  buySubscription,
  getBuySubscription,
  getSubscriptions,
  getSubscriptionsPrices,
  manageSubscription,
};
