const logger = require("../../helpers/logger");
const api = require("./api");

const { PORT } = process.env;
const port = PORT || 80;
let server;

async function run() {
  logger.info(`Starting Api...`);
  server = await api.listen(port);
  logger.verbose(`Api is listening on port ${port}.`);
}

async function cleanup() {
  logger.info(`Shutting down Api...`);
  if (server) {
    await server.close();
  }
}

module.exports = {
  run,
  cleanup,
};
