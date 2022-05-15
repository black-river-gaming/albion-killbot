const logger = require("../../helpers/logger");
const queue = require("../../helpers/queue");
const { runInterval } = require("../../helpers/utils");
const { fetchBattles } = require("./controllers/battles");
const { fetchEvents } = require("./controllers/events");

async function run() {
  logger.info("Starting Crawler...");
  await queue.init();
  runInterval("Fetch events", fetchEvents, { interval: 30 });
  runInterval("Fetch battles", fetchBattles, { interval: 120 });
}

async function cleanup() {
  logger.info("Shutting down Crawler.");
}

module.exports = {
  run,
  cleanup,
};
