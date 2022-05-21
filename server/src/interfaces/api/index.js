const logger = require("../../helpers/logger");

async function run() {
  logger.info(`Starting Api...`);
}

async function cleanup(e) {
  if (e) {
    logger.error(`Error during cleanup:`, e);
  }
  logger.info(`Shutting down Api...`);
}

module.exports = {
  run,
  cleanup,
};
