const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/scheduler");

const { updateLimitsCache } = require("../../../services/limits");
const { updateSettingsCache } = require("../../../services/settings");
const { updateTrackCache } = require("../../../services/track");

const REFRESH_INTERVAL = 60000;

async function refreshServerCache(client) {
  logger.debug(`Refreshing servers cache.`);
  const guildIds = client.guilds.cache.map((guild) => guild.id);

  try {
    await Promise.all([updateLimitsCache(guildIds), updateSettingsCache(guildIds), updateTrackCache(guildIds)]);
  } catch (error) {
    logger.error(`Unable to refresh servers cache: ${error.message}`, {
      error,
    });
  }
}

async function preinit(client) {
  await runInterval("Refresh cache for server settings", refreshServerCache, {
    fnOpts: [client],
    interval: REFRESH_INTERVAL,
    runOnStart: true,
  });
}

module.exports = {
  name: "servers",
  preinit,
};
