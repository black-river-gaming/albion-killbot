const config = require("config");
const logger = require("../../helpers/logger");
const database = require("../../ports/database");
const api = require("./api");

const port = config.get("api.port");

async function run() {
  if (!config.has("discord.token")) {
    throw new Error("Please define DISCORD_TOKEN environment variable with the discord token.");
  }
  if (!config.has("discord.clientId")) {
    throw new Error("Please define DISCORD_CLIENT_ID environment variable with the discord client id.");
  }
  if (!config.has("discord.clientSecret")) {
    throw new Error("Please define DISCORD_CLIENT_SECRET environment variable with the discord client secret.");
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
