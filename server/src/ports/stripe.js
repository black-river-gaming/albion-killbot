const config = require("config");
const Stripe = require("stripe");
const logger = require("../helpers/logger");

const isEnabled = config.has("stripe.accessToken") && config.has("stripe.product");
let stripe = null;
if (isEnabled) {
  stripe = Stripe(config.get("stripe.accessToken"), {
    apiVersion: "2020-08-27",
  });
}

async function getPrices({ currency = "usd", product = config.get("stripe.product") }) {
  try {
    const prices = await stripe.prices.list({
      currency,
      product,
    });
    // We can ignore prices.has_more for now, unless price list increases, which isn't expected
    return prices.data
      .map((price) => ({
        id: price.id,
        currency,
        price: price.unit_amount || Number(price.unit_amount_decimal),
        recurrence: {
          interval: price.recurring.interval,
          count: price.recurring.interval_count,
        },
        metadata: price.metadata,
      }))
      .sort((pa, pb) => pa.price - pb.price);
  } catch (e) {
    logger.error("Unable to get prices from stripe:", e);
    throw e;
  }
}

async function createCheckoutSession(priceId, owner) {
  try {
    const checkout = await stripe.checkout.sessions.create({
      success_url: `${config.get("dashboard.url")}/premium?status=success&checkout_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.get("dashboard.url")}/premium?status=cancel`,
      client_reference_id: owner,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    });

    return {
      id: checkout.id,
      url: checkout.url,
      status: checkout.status,
    };
  } catch (error) {
    logger.error("Unable to create checkout session for stripe:", error);
    return null;
  }
}

async function createPortalSession(customerId) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${config.get("dashboard.url")}/premium`,
    });

    return {
      id: session.id,
      url: session.url,
    };
  } catch (error) {
    logger.error("Unable to create portal session for stripe:", error);
    return null;
  }
}

async function getCheckoutSession(id) {
  try {
    const checkout = await stripe.checkout.sessions.retrieve(id);

    return {
      id: checkout.id,
      url: checkout.url,
      status: checkout.status,
      subscription: checkout.subscription,
    };
  } catch (error) {
    logger.error("Unable to retrieve checkout session for stripe:", error);
    return null;
  }
}

async function getSubscription(id) {
  try {
    const subscription = await stripe.subscriptions.retrieve(id);
    const price = subscription.plan;

    return {
      id: subscription.id,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: subscription.current_period_end,
      customer: subscription.customer,
      price: {
        id: price.id,
        currency: price.currency,
        price: price.amount || Number(price.amount_decimal),
        recurrence: {
          interval: price.interval,
          count: price.interval_count,
        },
        metadata: price.metadata,
      },
    };
  } catch (error) {
    logger.error("Unable to retrieve checkout session for stripe:", error);
    return null;
  }
}

module.exports = {
  createCheckoutSession,
  createPortalSession,
  getCheckoutSession,
  getPrices,
  getSubscription,
  isEnabled,
};
