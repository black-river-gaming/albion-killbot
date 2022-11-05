const { getNumber } = require("../helpers/utils");
const { memoize, set, remove } = require("../helpers/cache");
const { hasSubscriptionByServerId, getSubscriptionByServerId, fetchAllSubscriptions } = require("./subscriptions");

const { MAX_PLAYERS, MAX_GUILDS, MAX_ALLIANCES, SUB_MAX_PLAYERS, SUB_MAX_GUILDS, SUB_MAX_ALLIANCES } = process.env;

const generateLimits = (subscription) => {
  let players = getNumber(MAX_PLAYERS, 10);
  let guilds = getNumber(MAX_GUILDS, 1);
  let alliances = getNumber(MAX_ALLIANCES, 1);

  if (subscription) {
    if (subscription.limits) {
      players = getNumber(subscription.limits.players, players);
      guilds = getNumber(subscription.limits.guilds, guilds);
      alliances = getNumber(subscription.limits.alliances, alliances);
    } else {
      players = getNumber(SUB_MAX_PLAYERS, players);
      guilds = getNumber(SUB_MAX_GUILDS, guilds);
      alliances = getNumber(SUB_MAX_ALLIANCES, alliances);
    }
  }

  return {
    players,
    guilds,
    alliances,
  };
};

async function getLimits(serverId) {
  return await memoize(`limits-${serverId}`, async () => {
    if (await hasSubscriptionByServerId(serverId)) {
      const subscription = await getSubscriptionByServerId(serverId);
      return generateLimits(subscription);
    }
  });
}

async function updateLimitsCache(timeout) {
  const subscriptions = await fetchAllSubscriptions();
  subscriptions.forEach((subscription) => {
    if (!subscription.server) return;

    const serverId = subscription.server;
    set(`limits-${serverId}`, generateLimits(subscription), { timeout });
  });
}

module.exports = {
  getLimits,
  updateLimitsCache,
};
