const config = require("config");
const { getNumber } = require("../helpers/utils");
const { memoize, set } = require("../helpers/cache");
const { getSubscriptionByServerId, fetchAllSubscriptions, isActiveSubscription } = require("./subscriptions");
const { MINUTE } = require("../helpers/constants");

const generateLimits = (subscription) => {
  let players = config.get("features.limits.players");
  let guilds = config.get("features.limits.guilds");
  let alliances = config.get("features.limits.alliances");

  if (subscription && isActiveSubscription(subscription)) {
    if (subscription.limits) {
      players = getNumber(subscription.limits.players, players);
      guilds = getNumber(subscription.limits.guilds, guilds);
      alliances = getNumber(subscription.limits.alliances, alliances);
    } else {
      players = getNumber(config.get("features.subscriptions.limits.players"), players);
      guilds = getNumber(config.get("features.subscriptions.limits.guilds"), guilds);
      alliances = getNumber(config.get("features.subscriptions.limits.alliances"), alliances);
    }
  }

  return {
    players,
    guilds,
    alliances,
  };
};

async function getLimits(serverId) {
  return await memoize(
    `limits-${serverId}`,
    async () => {
      const subscription = await getSubscriptionByServerId(serverId);
      return generateLimits(subscription);
    },
    {
      timeout: MINUTE,
    },
  );
}

function getPremiumLimits() {
  return {
    players: config.get("features.subscriptions.limits.players"),
    guilds: config.get("features.subscriptions.limits.guilds"),
    alliances: config.get("features.subscriptions.limits.alliances"),
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
