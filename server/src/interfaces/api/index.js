const logger = require("../../helpers/logger");
const database = require("../../ports/database");
const api = require("./api");

const { PORT } = process.env;
const port = PORT || 80;
let server;

async function run() {
  logger.info(`Starting Api...`);
  await database.init();
  server = await api.listen(port);
  logger.verbose(`Api is listening on port ${port}.`);
}

async function cleanup() {
  logger.info(`Shutting down Api...`);
  if (server) {
    await server.close(() => process.exit(0));
  }
}

module.exports = {
  run,
  cleanup,
};
