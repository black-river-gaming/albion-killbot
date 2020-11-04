const Discord = require("discord.js");
const moment = require("moment");
const logger = require("./logger")("bot");
const config = require("./config");
const messages = require("./messages");
const commands = require("./commands");
const database = require("./database");
const { sleep, fileSizeFormatter } = require("./utils");
const events = require("./queries/events");
const battles = require("./queries/battles");
const dailyRanking = require("./queries/dailyRanking");
const guilds = require("./queries/guilds");
const { hasSubscription } = require("./subscriptions");

const COMMAND_PREFIX = "!";

const client = new Discord.Client({
  autoReconnect: true,
});
client.commands = commands;

client.on("ready", async () => {
  logger.info(`Connected to Discord as ${client.user.tag}`);
});

client.on("disconnect", async () => {
  logger.info("Disconnected from Discord.");
});

client.on("reconnecting", async () => {
  logger.info("Trying to reconnect to Discord.");
});

client.on("error", async e => {
  logger.info(`Discord error: ${e}.`);
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content || !message.content.startsWith(COMMAND_PREFIX)) return;
  if (!message.member) return;
  // For now, bot only accepts commands from server admins
  if (!message.member.hasPermission("ADMINISTRATOR")) return;

  // This is needed to inherit configs to guild object
  const guild = message.guild;
  guild.config = await config.getConfig(guild);
  if (!hasSubscription(guild.config)) return;

  const args = message.content
    .slice(COMMAND_PREFIX.length)
    .trim()
    .split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (commands[cmd]) {
    commands[cmd].run(client, guild, message, args);
  }
});

client.on("guildCreate", async guild => {
  logger.info(`Joined guild "${guild.name}". Creating default settings.`);
  guild.config = await config.getConfig(guild);
  guild.config.channel = exports.getDefaultChannel(guild).id;
  config.setConfig(guild);
  const l = messages.getI18n(guild);
  exports.sendGuildMessage(guild, l.__("JOIN"));
});

client.on("guildDelete", guild => {
  logger.info(`Left guild "${guild.name}". Deleting settings.`);
  config.deleteConfig(guild);
});

exports.getDefaultChannel = guild => {
  // get "original" default channel
  if (guild.channels.cache.has(guild.id)) return guild.channels.cache.get(guild.id);

  // Check for a "general" channel, which is often default chat
  const generalChannel = guild.channels.cache.find(channel => channel.name === "general");
  if (generalChannel) return generalChannel;
  // Now we get into the heavy stuff: first channel in order where the bot can speak
  // hold on to your hats!
  return guild.channels.cache
    .filter(c => c.type === "text" && c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
    .sort((a, b) => a.position - b.position)
    .first();
};

const msgErrors = {};
exports.sendGuildMessage = async (guild, message, category = "general") => {
  if (!guild.config) guild.config = await config.getConfig(guild);
  if (!guild.config.categories) guild.config.categories = {};
  if (guild.config.categories[category] === false) return;

  let channelId = guild.config.channel[category];
  if (!channelId) channelId = guild.config.channel.general;
  // Old structure backport
  if (typeof guild.config.channel === "string") channelId = guild.config.channel;

  const l = messages.getI18n(guild);
  let channel = client.channels.cache.find(c => c.id === channelId);
  if (!channel) {
    logger.warn(`Channel not configured for guild ${guild.name}.`);
    channel = exports.getDefaultChannel(guild);
  }
  if (!channel) return;
  try {
    await channel.send(message);
    msgErrors[guild.id] = 0;
  } catch (e) {
    logger.error(`Unable to send message to guild ${guild.name}/${channel.name}: ${e}`);

    if (
      e.code === Discord.Constants.APIErrors.UNKNOWN_CHANNEL ||
      e.code === Discord.Constants.APIErrors.MISSING_ACCESS ||
      e.code === Discord.Constants.APIErrors.MISSING_PERMISSIONS
    ) {
      if (!msgErrors[guild.id]) msgErrors[guild.id] = 0;
      msgErrors[guild.id]++;
      // If more than 50 msg errors occur in succession, bot will leave and warn owner
      if (msgErrors[guild.id] > 50) {
        logger.warn(`Leaving guild ${guild.name} due to excessive message errors. Warning owner.`);
        await guild.owner.send(l.__("LEAVE", { guild: guild.name }));
        await guild.leave();
        msgErrors[guild.id] = 0;
      }
    }
  }
};

exports.client = client;

exports.run = async token => {
  database.connect();
  await client.login(token);

  // Events that fires daily (Default: 12:00 pm)
  const runDaily = async (func, name, hour = 12, minute = 0) => {
    if (!func) return logger.warn("There is an undefined function. Please check your settings.");
    const exit = false;
    while (!exit) {
      await sleep(60000);
      const now = moment();
      if (now.hour() === hour && now.minute() === minute) {
        try {
          await func(exports);
        } catch (e) {
          logger.error(`Error in function ${name}: ${e}`);
        }
      }
    }
  };

  // Events that run on an interval (Default: 30 seconds)
  const runInterval = async (func, name, interval = 30000) => {
    if (!func) return logger.warn("There is an undefined function. Please check your settings.");
    const exit = false;
    while (!exit) {
      await sleep(interval);
      try {
        await func(exports);
      } catch (e) {
        logger.error(`Error in function ${name}: ${e}`);
      }
    }
  };

  runDaily(guilds.showRanking, "Show Monthly Ranking");
  runDaily(dailyRanking.scanDaily, "Show PvP Ranking (daily)", 0, 0);
  runDaily(dailyRanking.clear, "Clear PvP Ranking", 0, 5);
  runInterval(dailyRanking.scan, "Show PvP Ranking", 3600000);
  runInterval(events.get, "Get Events", 30000);
  runInterval(events.scan, "Show Events", 5000);
  runInterval(battles.get, "Get Battles", 60000);
  runInterval(battles.scan, "Show Battles", 60000);
  runInterval(() => {
    logger.debug(`Memory usage (approx): ${fileSizeFormatter(process.memoryUsage().heapUsed)}`);
  }, 60000);
};
