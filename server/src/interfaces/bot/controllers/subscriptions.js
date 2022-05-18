const logger = require("../../../helpers/logger");
const { isSubscriptionsEnabled, refreshSubscriptions } = require("../../../services/subscriptions");

async function refresh(client) {
  if (!isSubscriptionsEnabled()) return;

  const { shardId } = client;

  logger.info(`[#${shardId}] Refreshing subscriptions`);
  await refreshSubscriptions();
  logger.verbose(`[#${client.shardId}] Refresh subscriptions finished.`);
}

module.exports = {
  refresh,
};
