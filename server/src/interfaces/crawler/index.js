const logger = require("../../helpers/logger");
const queue = require("../../helpers/queue");
const { runInterval } = require("../../helpers/utils");
const { fetchEvents, fetchBattles } = require("./controllers/events");

async function run() {
  logger.info("Starting Crawler...");
  await queue.init();

  runInterval("Fetch events", fetchEvents, { interval: 30, runOnStart: true });
  runInterval("Fetch battles", fetchBattles, { interval: 120 });
}

module.exports = {
  run,
};
