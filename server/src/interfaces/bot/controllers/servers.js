const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/utils");

const { updateLimitsCache } = require("../../../services/limits");
const { updateSettingsCache } = require("../../../services/settings");
const { updateTrackCache } = require("../../../services/track");

const REFRESH_INTERVAL = 60000;

async function refreshServerCache() {
  logger.debug(`Refreshing servers cache.`);

  try {
    await Promise.all([
      updateLimitsCache(REFRESH_INTERVAL + 30000),
      updateSettingsCache(REFRESH_INTERVAL + 30000),
      updateTrackCache(REFRESH_INTERVAL + 30000),
    ]);
  } catch (error) {
    logger.error(`Unable to refresh servers cache: ${error.message}`, {
      error,
    });
  }
}

async function init() {
  runInterval("Refresh cache for server settings", refreshServerCache, {
    interval: REFRESH_INTERVAL,
    runOnStart: true,
  });
}

module.exports = {
  name: "servers",
  init,
};
