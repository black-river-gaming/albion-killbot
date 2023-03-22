const logger = require("../../helpers/logger");
const database = require("../../ports/database");
const queue = require("../../ports/queue");

const controllers = require("./controllers");

async function run() {
  logger.info("Starting Crawler...");
  await queue.init();
  await database.init();
  await controllers.init();
}

async function cleanup(reason) {
  logger.info(`Shutting down Crawler. Reason: ${reason}`);
  process.exit(0);
}

module.exports = {
  run,
  cleanup,
};
