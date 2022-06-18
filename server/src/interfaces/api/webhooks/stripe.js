const express = require("express");
const router = express.Router();
const stripe = require("stripe");
const logger = require("../../../helpers/logger");
const { disableCache } = require("../middlewares/cache");
const subscriptionsService = require("../../../services/subscriptions");

const { STRIPE_WEBHOOK_SECRET } = process.env;

router.use(disableCache);
router.use(express.raw({ type: "*/*" }));
router.post(`/webhook`, async (req, res) => {
  // Verify webhook secret and construct event
  let event;
  if (STRIPE_WEBHOOK_SECRET) {
    try {
      const signature = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (error) {
      logger.error(`Error in construct event:`, error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  } else {
    event = req.body;
  }

  const { type, data } = event;
  const owner = data.object.client_reference_id;

  // Respond quickly to Stripe before processing the Webhook
  res.json({ received: true });

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
});

module.exports = {
  path: "/subscriptions/stripe",
  router,
};
