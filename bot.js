const Discord = require("discord.js");
const moment = require("moment");
const logger = require("./logger")("bot");
const config = require("./config");
const messages = require("./messages");
const commands = require("./commands");
const database = require("./database");
const { sleep, fileSizeFormatter } = require("./utils");
const { getEvents, getEventsByGuild } = require("./queries/events");
const { getBattles, getBattlesByGuild } = require("./queries/battles");
const dailyRanking = require("./queries/dailyRanking");
const guilds = require("./queries/guilds");

const COMMAND_PREFIX = "!";

const client = new Discord.Client({
  autoReconnect: true,
});
client.commands = commands;

const getDefaultChannel = guild => {
  // get "original" default channel
  if (guild.channels.has(guild.id)) return guild.channels.get(guild.id);

  // Check for a "general" channel, which is often default chat
  const generalChannel = guild.channels.find(channel => channel.name === "general");
  if (generalChannel) return generalChannel;
  // Now we get into the heavy stuff: first channel in order where the bot can speak
  // hold on to your hats!
  return guild.channels
    .filter(c => c.type === "text" && c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
    .sort((a, b) => a.position - b.position)
    .first();
};

const scanEvents = async client => {
  logger.info("[scanEvents] Notifying new events to all Discord Servers.");
  const allGuildConfigs = await config.getConfigByGuild(client.guilds.array());
  const eventsByGuild = await getEventsByGuild(allGuildConfigs);

  for (let guild of client.guilds.array()) {
    guild.config = allGuildConfigs[guild.id];
    if (!guild.config || !eventsByGuild[guild.id]) continue;

    const newEventsCount = eventsByGuild[guild.id].length;
    if (newEventsCount > 0) {
      logger.info(`[scanEvents] Sending ${newEventsCount} new events to guild "${guild.name}"`);
    }

    for (let event of eventsByGuild[guild.id]) {
      dailyRanking.add(guild, event, allGuildConfigs[guild.id]);
      const mode = guild.config.mode;
      const hasInventory = event.Victim.Inventory.filter(i => i != null).length > 0;

      if (mode === "image") {
        // Image output
        await sendGuildMessage(guild, await messages.embedEventAsImage(event, guild.config.lang));
        if (hasInventory) {
          await sendGuildMessage(guild, await messages.embedInventoryAsImage(event, guild.config.lang));
        }
      } else {
        // Text output (default)
        await sendGuildMessage(guild, messages.embedEvent(event, guild.config.lang));
      }
    }
  }
};

const scanBattles = async client => {
  logger.info("[scanBattles] Notifying new battles to all Discord Servers.");
  const allGuildConfigs = await config.getConfigByGuild(client.guilds.array());
  const battlesByGuild = await getBattlesByGuild(allGuildConfigs);

  for (let guild of client.guilds.array()) {
    guild.config = await config.getConfig(guild);
    if (!guild.config || !battlesByGuild[guild.id]) continue;

    const newBattlesCount = battlesByGuild[guild.id].length;
    if (newBattlesCount > 0) {
      logger.info(`[scanBattles] Sending ${newBattlesCount} new battles to guild "${guild.name}"`);
    }
    battlesByGuild[guild.id].forEach(battle =>
      sendGuildMessage(guild, messages.embedBattle(battle, guild.config.lang)),
    );
  }
};

const scanRanking = async client => {
  const allGuildConfigs = await config.getConfigByGuild(client.guilds.array());
  for (let guild of client.guilds.array()) {
    guild.config = allGuildConfigs[guild.id];
    if (!guild.config) continue;
    for (let trackedGuild of guild.config.trackedGuilds) {
      const rankings = await guilds.getGuildRankings(trackedGuild.id);
      await sendGuildMessage(guild, messages.embedRankings(trackedGuild, rankings, guild.config.lang));
    }
  }
};

const scanDailyRanking = async (client, mode) => {
  logger.info("[scanRankings] Sending daily guild rankings to all servers.");
  const allGuildConfigs = await config.getConfigByGuild(client.guilds.array());
  for (const guild of client.guilds.array()) {
    guild.config = allGuildConfigs[guild.id];
    if (mode === "daily" && guild.config.dailyRanking !== "daily") continue;
    else if (!guild.config.dailyRanking || guild.config.dailyRanking === "off") continue;
    const ranking = await dailyRanking.getRanking(guild);
    if (ranking.killRanking.length === 0 && ranking.deathRanking.length === 0) continue;
    await sendGuildMessage(guild, messages.embedDailyRanking(ranking, guild.config.lang));
  }
};

const msgErrors = {};
const sendGuildMessage = async (guild, message) => {
  if (!guild.config) guild.config = await config.getConfig(guild);
  const l = messages.getI18n(guild);
  let channel = client.channels.find(c => c.id === guild.config.channel);
  if (!channel) {
    logger.warn(`Channel not configured for guild ${guild.name}.`);
    channel = getDefaultChannel(guild);
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
      }
    }
  }
};

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
  if (!guild.config.channel) {
    guild.config.channel = message.channel.id;
    config.setConfig(guild);
  }

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
  guild.config.channel = getDefaultChannel(guild).id;
  config.setConfig(guild);
  const l = messages.getI18n(guild);
  sendGuildMessage(guild, l.__("JOIN"));
});

client.on("guildDelete", guild => {
  logger.info(`Left guild "${guild.name}". Deleting settings.`);
  config.deleteConfig(guild);
});

exports.run = async token => {
  database.connect();
  await client.login(token);

  // Events that fires daily (Default: 12:00 pm)
  const runDaily = async (func, hour = 12, minute = 0) => {
    const exit = false;
    while (!exit) {
      await sleep(60000);
      const now = moment();
      if (now.hour() === hour && now.minute() === minute) {
        try {
          await func();
        } catch (e) {
          logger.error(`Error in function ${func.name}: ${e}`);
        }
      }
    }
  };

  // Events that run on an interval (Default: 30 seconds)
  const runInterval = async (func, interval = 30000) => {
    const exit = false;
    while (!exit) {
      await sleep(interval);
      try {
        await func(client);
      } catch (e) {
        logger.error(`Error in function ${func.name}: ${e}`);
      }
    }
  };

  runDaily(scanRanking);
  runDaily((client) => scanDailyRanking(client, "daily"), 0, 0);
  runDaily(dailyRanking.clear, 0, 0);
  runInterval(scanDailyRanking, 1800000);
  runInterval(getEvents, 30000);
  runInterval(scanEvents, 5000);
  runInterval(getBattles, 60000);
  runInterval(scanBattles, 60000);
  runInterval(() => {
    logger.debug(`Memory usage (approx): ${fileSizeFormatter(process.memoryUsage().heapUsed)}`);
  }, 60000);
};
