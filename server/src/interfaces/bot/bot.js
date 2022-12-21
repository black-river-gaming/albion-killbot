const { Client, Intents } = require("discord.js");

const logger = require("../../helpers/logger");
const database = require("../../ports/database");
const queue = require("../../ports/queue");

const controllers = require("./controllers");
const commands = require("./commands");

const client = new Client({
  autoReconnect: true,
  intents: [Intents.FLAGS.GUILDS],
});

client.on("shardReady", async (id) => {
  process.env.SHARD = id;
  logger.info(`Shard online! Bot user: ${client.user.tag}. Guild count: ${client.guilds.cache.size}`);
  await commands.refresh(client.application.id);
});

client.on("shardDisconnect", async (ev) => {
  logger.info(`Disconnected from Discord: [${ev.code}] ${ev.reason}`);
});

client.on("shardReconnecting", async () => {
  logger.info(`Trying to reconnect to Discord.`);
});

client.on("error", async (e) => {
  logger.error(`Discord error: ${e.stack}`);
});

client.on("interactionCreate", commands.handle);

async function run() {
  await database.init();
  await queue.init();
  await controllers.init(client);
  await commands.init();
  await client.login();
}

//since each bot spawns in it's own process, we need this to catch uncaught exceptions
process.on("uncaughtException", async (error) => {
  logger.error(`Uncaught exception: `, error);
});

// If the file is called directly instead of required, run it
if (require.main == module) {
  (async () => {
    try {
      await run();
    } catch (e) {
      logger.error(e);
      process.exit(1);
    }
  })();
}

module.exports = {
  client,
  run,
};
