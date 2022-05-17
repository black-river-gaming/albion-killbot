const logger = require("../../helpers/logger");
const { runInterval } = require("../../helpers/utils");
const queue = require("../../ports/queue");

const { fetchBattles } = require("./controllers/battles");
const { fetchEvents } = require("./controllers/events");

async function run() {
  logger.info("Starting Crawler...");
  await queue.init();
  runInterval("Fetch events", fetchEvents, { interval: 30 });
  runInterval("Fetch battles", fetchBattles, { interval: 30, runOnStart: true });
}

async function cleanup() {
  logger.info("Shutting down Crawler.");
}

module.exports = {
  run,
  cleanup,
};
