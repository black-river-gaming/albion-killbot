const logger = require("../../helpers/logger");
const { clearAllIntervals } = require("../../helpers/scheduler");
const queue = require("../../ports/queue");

const controllers = require("./controllers");

async function run() {
  logger.info("Starting Crawler...");
  await queue.init();
  await controllers.init();
}

async function cleanup(reason) {
  logger.info(`Shutting down Crawler. Reason: ${reason}`);
  clearAllIntervals();
}

module.exports = {
  run,
  cleanup,
};
