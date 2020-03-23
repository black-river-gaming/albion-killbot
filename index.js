require("dotenv").config();

const Discord = require("discord.js");
const moment = require("moment");
const config = require("./config");
const messages = require("./messages");
const commands = require("./commands");
const events = require("./queries/events");
const battles = require("./queries/battles");
const guilds = require("./queries/guilds");

const token = process.env.TOKEN;
if (!token) {
  console.log(
    "Please define TOKEN environment variable with the discord token."
  );
  process.exit(0);
}
const COMMAND_PREFIX = "!";
const INTERVAL = {
  THRESHOLD: 3, // Ex, 30 seconds interval can go from 15 to 60 with 2 THRESHOLD
  FACTOR: 1.2, // Multiply/divide by this number each iteration
  MIN_RATIO: 30, // Maximum ratio to decrease interval
  MAX_RATIO: 70 // Minimum ratio to increase interval
};

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const client = new Discord.Client();
client.commands = commands;

const scanEvents = async () => {
  // TODO: Have getConfig method to support guild arrays (bulk get)
  const allGuildConfigs = {};
  for (let guild of client.guilds.array()) {
    allGuildConfigs[guild.id] = await config.getConfig(guild);
  }
  const getEvents = await events.getEvents(allGuildConfigs);
  const eventsByGuild = getEvents.eventsByGuild;

  for (let guild of client.guilds.array()) {
    guild.config = allGuildConfigs[guild.id];
    if (!guild.config || !eventsByGuild[guild.id]) continue;
    // Debug
    const newEventsCount = eventsByGuild[guild.id].length;
    if (newEventsCount > 0) {
      console.log(
        `Sending ${newEventsCount} new events to guild "${guild.name}"`
      );
    }
    eventsByGuild[guild.id].forEach(event => {
      sendGuildMessage(guild, messages.embedEvent(event, guild.config.lang));
    });
  }

  return getEvents.rate;
};

const scanBattles = async () => {
  const getBattles = await battles.getBattles(client.guilds.array());
  const battlesByGuild = getBattles.battlesByGuild;

  for (let guild of client.guilds.array()) {
    guild.config = await config.getConfig(guild);
    if (!guild.config || !battlesByGuild[guild.id]) continue;

    // Debug
    const newBattlesCount = battlesByGuild[guild.id].length;
    if (newBattlesCount > 0) {
      console.log(
        `Sending ${newBattlesCount} new battles to guild "${guild.name}"`
      );
    }
    battlesByGuild[guild.id].forEach(battle =>
      sendGuildMessage(guild, messages.embedBattle(battle, guild.config.lang))
    );
  }

  return getBattles.rate;
};

const scanRanking = async () => {
  for (let guild of client.guilds.array()) {
    guild.config = await config.getConfig(guild);
    if (!guild.config) continue;
    for (let trackedGuild of guild.config.trackedGuilds) {
      const rankings = await guilds.getGuildRankings(trackedGuild.id);
      await sendGuildMessage(
        guild,
        messages.embedRankings(trackedGuild, rankings, guild.config.lang)
      );
    }
  }
};

const sendGuildMessage = async (guild, message) => {
  guild.config = await config.getConfig(guild);
  const channel = client.channels.find(c => c.id === guild.config.channel);
  if (!channel) {
    console.log(`WARNING: Channel not configured for guild ${guild.name}.`);
    return;
  }
  try {
    await channel.send(message);
  } catch (e) {
    console.log(
      `Unable to send message to guild ${guild.name}/${channel.name}: ${e}`
    );
  }
};

// TODO: Handle when the bot joins/leaves guilds
// See more: https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildCreate
client.on("ready", async () => {
  console.log(`Connected successfully as ${client.user.tag}`);

  // Events that fires daily (12:00 pm)
  setInterval(() => {
    const now = moment();
    if (now.hour() === 12 && now.minute() === 0) {
      scanRanking();
    }
  }, 60000); // Every minute

  // Interval events
  const runInterval = async (func, baseTime) => {
    let time = baseTime;

    const exit = false;
    while (!exit) {
      const rate = await func();

      // Change interval based on rate
      if (rate >= INTERVAL.MAX_RATIO)
        time = Math.round(
          Math.max(baseTime / INTERVAL.THRESHOLD, time / INTERVAL.FACTOR)
        );
      else if (rate <= INTERVAL.MIN_RATIO)
        time = Math.round(
          Math.min(baseTime * INTERVAL.THRESHOLD, time * INTERVAL.FACTOR)
        );
      console.log(`${func.name} - Unread rate: ${rate}%. New time: ${time}ms`);

      await sleep(time);
    }
  };

  runInterval(scanEvents, 30000);
  runInterval(scanBattles, 90000);
});

client.on("message", async message => {
  if (message.author.bot) return;
  // For now, bot only accepts commands from server admins
  if (!message.guild) {
    message.reply("Sorry, I can only accept commands inside a channel.");
    return;
  }
  if (message.author.id !== message.guild.owner.id) return;
  if (!message.content || !message.content.startsWith(COMMAND_PREFIX)) return;

  // This is needed to inherit configs to guild object
  const guild = client.guilds.find(g => g.id === message.guild.id);
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

(async () => {
  await config.connect();
  client.login(token);
})();
