const subscriptionsService = require("../../../services/subscriptions");

async function getSubscriptions(req, res) {
  try {
    const { user } = req.session.discord;
    const subscriptions = await subscriptionsService.getOwnerSubscriptions(user.id);
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

async function buySubscription(req, res) {
  try {
    const { priceId } = req.params;
    const checkout = await subscriptionsService.buySubscription(priceId);
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

module.exports = {
  buySubscription,
  getBuySubscription,
  getSubscriptions,
  getSubscriptionsPrices,
};
