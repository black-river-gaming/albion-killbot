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

// const COMMAND_PREFIX = "!";

const client = new Client({
  autoReconnect: true,
  intents: [Intents.FLAGS.GUILDS],
});

// client.commands = commands;
client.on("shardReady", async (id) => {
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

  runDaily(`${shardPrefix} Display Guild rankings`, guilds.displayRankings, {
    fnOpts: [client],
  });

  runInterval(`${shardPrefix} Collect Guild data`, guilds.updateGuilds, {
    fnOpts: [client],
    interval: DAY / 4,
  });

  runDaily(`${shardPrefix} Display ranking for daily setting`, rankings.displayRankings, {
    fnOpts: [client, { setting: "daily" }],
    hour: 0,
    minute: 0,
    runOnStart: true,
  });

  runInterval(`${shardPrefix} Display rankings for hourly setting`, rankings.displayRankings, {
    fnOpts: [client, { setting: "hourly" }],
    interval: HOUR,
    // runOnStart: true
  });

  // Only one shard needs to run this
  if (id == 0) {
    runDaily(`Clear rankings data`, rankings.clearRankings, {
      fnOpts: [client],
      hour: 0,
      minute: 5,
      runOnStart: true,
    });
  }

  // runInterval(subscriptions.refresh, "Refresh subscriptions", exports, FREQ_DAY, true);
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

// client.on("message", async (message) => {
//   if (!message.guild) return;
//   // Fetch guild config and create default if not config is found
//   const guild = message.guild;
//   guild.config = await config.getConfig(guild);
//   if (!guild.config) {
//     logger.info(`Guild "${guild.name}" has no configuration. Creating default settings.`);
//     guild.config = await config.setConfig(guild);
//   }
//   const prefix = guild.config.prefix || COMMAND_PREFIX;

//   if (message.author.bot) return;
//   if (!message.content || !message.content.startsWith(prefix)) return;
//   if (!message.member) return;
//   // For now, bot only accepts commands from server admins
//   if (!message.member.hasPermission("ADMINISTRATOR")) return;

//   const args = message.content.slice(prefix.length).trim().split(/ +/g);
//   const command = commands[args.shift().toLowerCase()];
//   if (!command) return;
//   if (!subscriptions.hasSubscription(guild.config) && !command.public) return;

//   await command.run(client, guild, message, args);

//   if (!guild.config.channel) {
//     const l = messages.getI18n(guild);
//     message.channel.send(l.__("CHANNEL_NOT_SET"));
//   }
// });

// client.on("guildCreate", async (guild) => {
//   logger.info(`Joined guild "${guild.name}". Creating default settings.`);
//   guild.config = await config.setConfig(guild);
//   const l = messages.getI18n(guild);
//   exports.sendGuildMessage(guild, l.__("JOIN"));
// });

// client.on("guildDelete", (guild) => {
//   logger.info(`Left guild "${guild.name}". Deleting settings.`);
//   config.deleteConfig(guild);
// });

// exports.getDefaultChannel = (guild) => {
//   // Get "original" default channel
//   if (guild.channels.cache.has(guild.id)) return guild.channels.cache.get(guild.id);

//   // Check for a "general" channel, which is often default chat
//   const generalChannel = guild.channels.cache.find((channel) => channel.name === "general");
//   if (generalChannel) return generalChannel;
//   // Now we get into the heavy stuff: first channel in order where the bot can speak
//   // hold on to your hats!
//   return guild.channels.cache
//     .filter((c) => c.type === "text" && c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
//     .sort((a, b) => a.position - b.position)
//     .first();
// };

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
