require("dotenv").config();

const Discord = require("discord.js");
const moment = require("moment");
const config = require("./config");
const messages = require("./messages");
const commands = require("./commands");
const events = require("./queries/events");
const guilds = require("./queries/guilds");

const token = process.env.TOKEN;
if (!token) {
  console.log(
    "Please define TOKEN environment variable with the discord token."
  );
  process.exit(0);
}
const COMMAND_PREFIX = "!";

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const client = new Discord.Client();
client.commands = commands;

const scanEvents = async () => {
  const allGuildConfigs = {};
  client.guilds.tap(guild => {
    allGuildConfigs[guild.id] = guild.config;
  });
  const newEvents = await events.getEvents(allGuildConfigs);

  for (let guild of client.guilds.array()) {
    if (!guild.config || !newEvents[guild.id]) continue;

    const lang = guild.config.lang;
    if (newEvents[guild.id].length > 0) {
      console.log(
        `Sending ${newEvents[guild.id].length} new events to guild "${guild.name}"`
      );
    }
    newEvents[guild.id].forEach(event => {
      sendGuildMessage(guild, messages.embedEvent(event, lang));
    });
  }
};

const scanRanking = async () => {
  for (let guild of client.guilds.array()) {
    if (!guild.config) continue;
    for (let trackedGuild of guild.config.trackedGuilds) {
      const rankings = await guilds.getGuildRankings(trackedGuild.id);
      const lang = guild.config.lang;
      await sendGuildMessage(guild, messages.embedRankings(rankings, lang));
    }
  }
};

const sendGuildMessage = async (guild, message) => {
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

  // Update config for all guilds
  for (let guild of client.guilds.array()) {
    guild.config = await config.getConfig(guild.id);
  }

  // Specific times events
  let millisTill12 =
    moment()
      .hour(12)
      .minute(0)
      .second(0) -
    moment() +
    1;
  if (millisTill12 < 0) {
    millisTill12 += 86400000;
  }
  setTimeout(function() {
    scanRanking();
  }, millisTill12);

  // Interval events
  const exit = false;
  while (!exit) {
    await scanEvents();
    await sleep(30000);
  }
});

client.on("message", async message => {
  if (message.author.bot) return;
  // For now, bot only accepts commands from server admins
  if (message.author.id !== message.guild.owner.id) return;
  if (!message.content || !message.content.startsWith(COMMAND_PREFIX)) return;
  if (!message.guild) return;

  // This is needed to inherit configs to guild object
  const guild = client.guilds.find(g => g.id === message.guild.id);
  if (!guild.config) {
    guild.config = await config.getConfig(guild.id);
  }
  if (!guild.config.channel) {
    guild.config.channel = message.channel.id;
    config.setConfig(guild);
  }
  guild.channel = client.channels.find(c => c.id === guild.config.channel);

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
