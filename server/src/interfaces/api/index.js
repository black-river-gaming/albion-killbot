const logger = require("../../helpers/logger");
const api = require("./api");

const { PORT } = process.env;
const port = PORT || 80;

async function run() {
  logger.info(`Starting Api...`);
  await api.listen(port);
  logger.verbose(`Api is listening on port ${port}.`);
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
