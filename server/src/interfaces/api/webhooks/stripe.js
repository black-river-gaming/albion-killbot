const config = require("config");
const express = require("express");
const router = express.Router();
const stripe = require("stripe");
const logger = require("../../../helpers/logger");
const { disableCache } = require("../middlewares/cache");
const subscriptionsService = require("../../../services/subscriptions");

router.use(disableCache);
router.use(express.raw({ type: "*/*" }));
router.post(`/webhook`, async (req, res) => {
  // Verify webhook secret and construct event
  let event;

  if (config.has("stripe.webhookSecret")) {
    try {
      const signature = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(req.body, signature, config.get("stripe.webhookSecret"));
    } catch (error) {
      logger.error("Failed to construct event.", {
        error,
      });
      return res.status(400).json({
        received: true,
        procesed: false,
        message: "Failed to construct event.",
      });
    }
  } else {
    event = req.body;
  }

  if (!event.type && !event.data) {
    return res
      .status(422)
      .json({ received: true, procesed: false, message: "Body does not have required fields or is not JSON object." });
  }

  const { type, data } = event;
  const owner = data.object.client_reference_id;

  // Respond quickly to Stripe before processing the Webhook
  res.json({ received: true });

  switch (type) {
    case "checkout.session.completed":
      if (!data.object.subscription || !owner)
        return logger.error(`Failed to create subscription because of missing stripe id or client reference id`, {
          data,
        });
      logger.info(`[${data.object.subscription}] Checkout completed. Linking subscription to owner [${owner}].`, {
        type,
        data,
        owner,
      });
      await subscriptionsService.updateSubscriptionByStripeId(data.object.subscription, {
        owner,
        stripe: data.object.subscription,
      });
      break;

    case "customer.subscription.updated":
      logger.info(`[${data.object.id}] Updating expiration: ${new Date(data.object.current_period_end * 1000)}`, {
        type,
        data,
      });
      await subscriptionsService.updateSubscriptionByStripeId(data.object.id, {
        expires: new Date(data.object.current_period_end * 1000),
      });
      break;

    case "customer.subscription.deleted":
      logger.info(`[${data.object.id}] Deleting subscription.`, {
        type,
        data,
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
