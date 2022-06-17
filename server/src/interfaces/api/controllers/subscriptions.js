const logger = require("../../../helpers/logger");
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
    const { user } = req.session.discord;

    const checkout = await subscriptionsService.buySubscription(priceId, user.id);
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

async function stripeWebhook(req, res) {
  const { type, data } = req.body;
  const owner = data.object.client_reference_id;

  switch (type) {
    case "checkout.session.completed":
      logger.info(`[${data.object.subscription}] Creating new subscription for discord user [${owner}].`, {
        metadata: data,
      });
      await subscriptionsService.addSubscription({
        owner,
        expires: new Date(),
        stripe: data.object.subscription,
      });
      break;

    case "customer.subscription.updated":
      logger.info(`[${data.object.id}] Updating expiration: ${new Date(data.object.current_period_end * 1000)}`, {
        metadata: data,
      });
      await subscriptionsService.updateSubscriptionByStripeId(data.object.id, {
        expires: new Date(data.object.current_period_end * 1000),
      });
      break;

    case "customer.subscription.deleted":
      logger.info(`[${data.object.id}] Deleting subscription.`, {
        metadata: data,
      });
      await subscriptionsService.removeSubscriptionByStripeId(data.object.id);
      break;

    default:
      logger.debug(`Received stripe webhook event "${type}".`);
  }

  return res.json({ received: true });
}

module.exports = {
  buySubscription,
  getBuySubscription,
  getSubscriptions,
  getSubscriptionsPrices,
  stripeWebhook,
};
