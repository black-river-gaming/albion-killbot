const config = require("config");
const logger = require("../../helpers/logger");
const database = require("../../ports/database");
const api = require("./api");

const port = config.get("api.port");

async function run() {
  if (!config.has("discord.token")) {
    throw new Error("Please define DISCORD_TOKEN environment variable with the discord token.");
  }

  logger.info(`Starting Albion-Killbot rest api.`);

  await database.init();
  await api.init(port);
  logger.verbose(`Api is listening on port ${port}.`);
}

async function cleanup(reason) {
  logger.info(`Shutting down Api. Reason: ${reason}`);

  if (api.server) {
    await api.server.close((error) => process.exit(error ? 1 : 0));
  } else {
    process.exit(0);
  }
}

module.exports = {
  run,
  cleanup,
};
