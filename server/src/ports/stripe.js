const Stripe = require("stripe");
const logger = require("../helpers/logger");

const { STRIPE_ACCESS_TOKEN, STRIPE_PRODUCT, STRIPE_REDIRECT_URL } = process.env;

const isEnabled = STRIPE_ACCESS_TOKEN && STRIPE_PRODUCT;
const stripe = Stripe(STRIPE_ACCESS_TOKEN, {
  apiVersion: "2020-08-27",
});

async function getPrices({ currency = "usd", product = STRIPE_PRODUCT }) {
  try {
    const prices = await stripe.prices.list({
      currency,
      product,
    });
    // We can ignore prices.has_more for now, unless price list increases, which isn't expected
    return prices.data.map((price) => ({
      id: price.id,
      currency,
      price: price.unit_amount || Number(price.unit_amount_decimal),
      recurrence: {
        interval: price.recurring.interval,
        count: price.recurring.interval_count,
      },
    }));
  } catch (e) {
    logger.error("Unable to get prices from stripe:", e);
    throw e;
  }
}

async function createCheckoutSession(priceId, owner) {
  try {
    const checkout = await stripe.checkout.sessions.create({
      success_url: `${STRIPE_REDIRECT_URL}?status=success&checkout_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${STRIPE_REDIRECT_URL}?status=cancel`,
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

async function getCheckoutSession(checkoutId) {
  try {
    const checkout = await stripe.checkout.sessions.retrieve(checkoutId);

    return {
      id: checkout.id,
      url: checkout.url,
      status: checkout.status,
    };
  } catch (error) {
    logger.error("Unable to retrieve checkout session for stripe:", error);
    return null;
  }
}

module.exports = {
  createCheckoutSession,
  getCheckoutSession,
  getPrices,
  isEnabled,
};
