const logger = require("../../helpers/logger");
const { SECOND } = require("../../helpers/constants");
const { runInterval, clearAllIntervals } = require("../../helpers/utils");
const queue = require("../../ports/queue");

const { fetchBattles } = require("./controllers/battles");
const { fetchEvents } = require("./controllers/events");

async function run() {
  logger.info("Starting Crawler...");
  await queue.init();
  runInterval("Fetch events", fetchEvents, { interval: 30 * SECOND });
  runInterval("Fetch battles", fetchBattles, { interval: 45 * SECOND });
}

async function cleanup(signal) {
  logger.info(`Shutting down Crawler. Signal: ${signal}`);
  clearAllIntervals();
}

module.exports = {
  run,
  cleanup,
};
