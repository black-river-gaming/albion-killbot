const { getNumber } = require("../helpers/utils");
const { memoize, set } = require("../helpers/cache");
const { getSubscriptionByServerId, fetchAllSubscriptions, isActiveSubscription } = require("./subscriptions");

const { MAX_PLAYERS, MAX_GUILDS, MAX_ALLIANCES, SUB_MAX_PLAYERS, SUB_MAX_GUILDS, SUB_MAX_ALLIANCES } = process.env;

const generateLimits = (subscription) => {
  let players = getNumber(MAX_PLAYERS, 10);
  let guilds = getNumber(MAX_GUILDS, 1);
  let alliances = getNumber(MAX_ALLIANCES, 1);

  if (subscription && isActiveSubscription(subscription)) {
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
    const subscription = await getSubscriptionByServerId(serverId);
    return generateLimits(subscription);
  });
}

function getPremiumLimits() {
  return {
    players: SUB_MAX_PLAYERS,
    guilds: SUB_MAX_GUILDS,
    alliances: SUB_MAX_ALLIANCES,
  };
}

async function updateLimitsCache(serverIds, { timeout, debug } = {}) {
  const subscriptions = await fetchAllSubscriptions();

  serverIds.forEach((serverId) => {
    const subscription = subscriptions.find((subscription) => subscription.server === serverId);
    set(`limits-${serverId}`, generateLimits(subscription), { timeout, debug });
  });
}

module.exports = {
  getLimits,
  getPremiumLimits,
  updateLimitsCache,
};
