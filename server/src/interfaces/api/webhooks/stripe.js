const config = require("config");
const express = require("express");
const router = express.Router();
const stripe = require("stripe");
const moment = require("moment");
const logger = require("../../../helpers/logger");
const { disableCache } = require("../middlewares/cache");
const subscriptionsService = require("../../../services/subscriptions");
const { sleep } = require("../../../helpers/scheduler");

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
  logger.debug(`Received stripe webhook event: ${type}.`, {
    type,
    data,
  });
  // Respond quickly to Stripe before processing the Webhook
  res.json({ received: true });

  const action = {
    "customer.subscription.created": async (data) => {
      const subscription = data.object;
      const stripeId = subscription.id;
      const expires = moment(subscription.current_period_end * 1000).toISOString();

      await subscriptionsService.addSubscription({
        stripe: stripeId,
        expires,
      });
      logger.info(`[${stripeId}] Subscription created. Expiration date: ${expires}`, {
        stripeId,
        expires,
      });
    },
    "customer.subscription.updated": async (data) => {
      // We are only interested in updated to the current period of the subscription
      if (data.previous_attributes?.current_period_end) {
        const subscription = data.object;
        const stripeId = subscription.id;
        const expires = moment(subscription.current_period_end * 1000).toISOString();

        await subscriptionsService.updateSubscriptionByStripeId(stripeId, { expires });
        logger.info(`[${stripeId}] Subscription updated. Expiration date: ${expires}`, {
          stripeId,
          expires,
        });
      }
    },
    "customer.subscription.deleted": async (data) => {
      const subscription = data.object;
      const stripeId = subscription.id;

      await subscriptionsService.removeSubscriptionByStripeId(stripeId);
      logger.info(`[${stripeId}] Subscription deleted.`, {
        stripeId,
      });
    },
    "checkout.session.completed": async (data) => {
      const checkout = data.object;
      const stripeId = checkout.subscription;
      const owner = checkout.client_reference_id;
      const serverId = checkout.metadata.server_id;

      if (!owner) {
        return logger.error(`[${stripeId}] Cannot provision subscription: missing client_reference_id.`, {
          checkout,
          subscriptionProvision: {
            stripe: stripeId,
          },
        });
      }
      if (serverId) await subscriptionsService.unassignSubscriptionsByServerId(serverId);

      // Sometimes the provision needs to wait for the subscription creation
      let subscriptionExists = false;
      while (!subscriptionExists) {
        if (await subscriptionsService.getSubscriptionByStripeId(stripeId)) subscriptionExists = true;
        else {
          logger.warn(`[${stripeId}] Waiting for subscription creation to continue provisioning...`, {
            subscriptionProvision: {
              owner,
              server: serverId,
              stripe: stripeId,
            },
            subscriptionExists,
          });
          await sleep(3000);
        }
      }

      await subscriptionsService.updateSubscriptionByStripeId(stripeId, {
        owner,
        server: serverId,
      });
      logger.info(`[${stripeId}] Subscription provisioned to owner: ${owner}.`, {
        subscriptionProvision: {
          owner,
          server: serverId,
          stripe: stripeId,
        },
      });
    },
  }[type];

  try {
    if (action) return action(data);
  } catch (error) {
    logger.error(`Failed execute webhook action "${type}": ${error.message}`, {
      error,
      type,
      data,
    });
  }
});

module.exports = {
  path: "/subscriptions/stripe",
  router,
};
