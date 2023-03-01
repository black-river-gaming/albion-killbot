const logger = require("../../../helpers/logger");
const subscriptionsService = require("../../../services/subscriptions");
const serversService = require("../../../services/servers");

const { DISCORD_COMMUNITY_SERVER, DISCORD_COMMUNITY_PREMIUM_ROLE } = process.env;
// TODO: Get this list from stripe
const SUPPORTED_CURRENCIES = ["usd", "brl"];

async function getSubscriptions(req, res) {
  try {
    const { user } = req.session.discord;
    const subscriptions = await subscriptionsService.fetchSubscriptionsByOwner(user.id);

    for (const subscription of subscriptions) {
      if (subscription.stripe)
        subscription.stripe = await subscriptionsService.getStripeSubscription(subscription.stripe);
      if (subscription.server) subscription.server = await serversService.getServer(subscription.server);
    }

    return res.send(subscriptions);
  } catch (error) {
    return res.sendStatus(403);
  }
}

async function getSubscriptionsPrices(req, res) {
  try {
    let { currency } = req.query;
    if (currency && SUPPORTED_CURRENCIES.indexOf(currency.toLowerCase()) === -1) {
      currency = "usd";
    }

    const prices = await subscriptionsService.fetchSubscriptionPrices(currency);
    const currencies = SUPPORTED_CURRENCIES;

    return res.send({ currencies, prices });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
}

async function assignSubscription(req, res) {
  try {
    const { server, checkoutId, subscriptionId } = req.body;
    if (!server || (!checkoutId && !subscriptionId)) return res.sendStatus(422);

    const subscription = subscriptionId
      ? await subscriptionsService.getSubscriptionById(subscriptionId)
      : await subscriptionsService.getSubscriptionByCheckoutId(checkoutId);
    if (!subscription) return res.sendStatus(404);

    const { user } = req.session.discord;
    if (subscription.owner !== user.id) return res.sendStatus(403);

    await subscriptionsService.unassignSubscriptionsByServerId(server);
    await subscriptionsService.assignSubscription(subscription.id, server);
    subscription.server = server;

    return res.send(subscription);
  } catch (error) {
    logger.error(`Error while assigning subscription: `, error);
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

subscriptionsService.subscriptionEvents.on("add", (subscription) => {
  if (DISCORD_COMMUNITY_SERVER && DISCORD_COMMUNITY_PREMIUM_ROLE && subscription.owner) {
    serversService.addMemberRole(
      DISCORD_COMMUNITY_SERVER,
      subscription.owner,
      DISCORD_COMMUNITY_PREMIUM_ROLE,
      "Add Premium User role",
    );
  }
});

subscriptionsService.subscriptionEvents.on("remove", (subscription) => {
  if (DISCORD_COMMUNITY_SERVER && DISCORD_COMMUNITY_PREMIUM_ROLE && subscription.owner) {
    serversService.removeMemberRole(
      DISCORD_COMMUNITY_SERVER,
      subscription.owner,
      DISCORD_COMMUNITY_PREMIUM_ROLE,
      "Remove Premium User role",
    );
  }
});

module.exports = {
  assignSubscription,
  buySubscription,
  getBuySubscription,
  getSubscriptions,
  getSubscriptionsPrices,
  manageSubscription,
};
