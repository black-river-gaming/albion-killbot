const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/utils");

const { updateSettingsCache } = require("../../../services/settings");
const { updateTrackCache } = require("../../../services/track");

async function refreshServerCache() {
  logger.debug(`Refreshing servers cache.`);

  try {
    await Promise.all([updateSettingsCache(), updateTrackCache()]);
  } catch (error) {
    logger.error(`Uanble to refresh servers cache: ${error.message}`, {
      error,
    });
  }
}

async function init() {
  runInterval("Refresh cache for server settings", refreshServerCache, {
    interval: 60000,
    runOnStart: true,
  });
}

module.exports = {
  name: "servers",
  init,
};
