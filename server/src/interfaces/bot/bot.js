const { Client, Intents } = require("discord.js");

const logger = require("../../helpers/logger");
const { runInterval, runDaily } = require("../../helpers/utils");
const { DAY, HOUR } = require("../../helpers/constants");

const database = require("../../ports/database");
const queue = require("../../ports/queue");

const events = require("./controllers/events");
const battles = require("./controllers/battles");
const guilds = require("./controllers/guilds");
const rankings = require("./controllers/rankings");

const commands = require("./commands");

const client = new Client({
  autoReconnect: true,
  intents: [Intents.FLAGS.GUILDS],
});

client.on("shardReady", async (id) => {
  await commands.init(client.application.id);

  client.shardId = id;
  const shardPrefix = `[#${id}]`;
  logger.info(`${shardPrefix} Shard ready as ${client.user.tag}. Guild count: ${client.guilds.cache.size}`);

  try {
    await events.subscribe(client);
    logger.info(`${shardPrefix} Subscribed to events queue.`);

    await battles.subscribe(client);
    logger.info(`${shardPrefix} Subscribed to battles queue.`);
  } catch (e) {
    logger.error(`Error in subscriptions:`, e);
  }

  runInterval(`${shardPrefix} Collect Guild data`, guilds.updateGuilds, {
    fnOpts: [client],
    interval: DAY / 4,
  });

  runDaily(`${shardPrefix} Display guild rankings for daily setting`, guilds.displayRankings, {
    fnOpts: [client, { setting: "daily" }],
  });
  runInterval(`${shardPrefix} Display guild rankings for hourly setting`, guilds.displayRankings, {
    fnOpts: [client, { setting: "hourly" }],
    interval: HOUR,
  });

  runDaily(`${shardPrefix} Display pvp ranking for daily setting`, rankings.displayRankings, {
    fnOpts: [client, { setting: "daily" }],
    hour: 0,
    minute: 0,
  });
  runInterval(`${shardPrefix} Display pvp ranking for hourly setting`, rankings.displayRankings, {
    fnOpts: [client, { setting: "hourly" }],
    interval: HOUR,
  });

  // Only one shard needs to run this
  if (id == 0) {
    runDaily(`Clear rankings data`, rankings.clearRankings, {
      fnOpts: [client],
      hour: 0,
      minute: 5,
    });
  }
});

client.on("shardDisconnect", async (ev, id) => {
  logger.info(`[#${id}] Disconnected from Discord: [${ev.code}] ${ev.reason}`);
  queue.unsubscribeAll();
});

client.on("shardReconnecting", async (id) => {
  logger.info(`[#${id}] Trying to reconnect to Discord.`);
  queue.unsubscribeAll();
});

client.on("error", async (e) => {
  logger.error(`Discord error: ${e.stack}`);
});

client.on("interactionCreate", commands.handle);

async function run() {
  await queue.init();
  await database.init();
  await client.login();
}

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
