const logger = require("../../helpers/logger");
const database = require("../../ports/database");
const api = require("./api");

const { PORT } = process.env;
const port = PORT || 80;
let server;

async function run() {
  const { DISCORD_TOKEN } = process.env;
  if (!DISCORD_TOKEN) {
    throw new Error("Please define DISCORD_TOKEN environment variable with the discord token.");
  }

  logger.info(`Starting Albion-Killbot rest api.`);

  await database.init();
  server = await api.listen(port);
  logger.verbose(`Api is listening on port ${port}.`);
}

async function cleanup(reason) {
  logger.info(`Shutting down Api. Reason: ${reason}`);

  if (server) {
    await server.close((error) => process.exit(error ? 1 : 0));
  } else {
    process.exit(0);
  }
}

module.exports = {
  run,
  cleanup,
};
