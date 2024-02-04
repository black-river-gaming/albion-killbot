const path = require("node:path");
const modules = require("../../helpers/modules");
const logger = require("../../helpers/logger");
const database = require("../../ports/database");
const queue = require("../../ports/queue");

async function run() {
  logger.info("Starting Crawler...");
  await queue.init();
  await database.init();
  await modules.loadControllers(path.join(__dirname, "controllers"), {});
}

async function cleanup(reason) {
  logger.info(`Shutting down Crawler. Reason: ${reason}`);
  process.exit(0);
}

module.exports = {
  run,
  cleanup,
};
