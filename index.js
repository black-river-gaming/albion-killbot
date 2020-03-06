require("dotenv").config();

const Discord = require("discord.js");
const moment = require("moment");
const config = require("./config");
const messages = require("./messages");
const events = require("./queries/events");
const guilds = require("./queries/guilds");

let serverConfig = {};

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const token = process.env.TOKEN;
if (!token) {
  console.log(
    "Please define TOKEN environment variable with the discord token."
  );
  process.exit(0);
}
const client = new Discord.Client();

// TODO: replace serverConfig[guild.id] calls for config.getConfig(guild.id)
const scanEvents = async () => {
  const newEvents = await events.getEvents(serverConfig);

  for (let guild of client.guilds.array()) {
    if (!serverConfig[guild.id] || !newEvents[guild.id]) continue;

    // TODO: Configure channel in serverConfig
    const channel = client.channels.find(
      c => c.name === "geral" && c.guild.id === guild.id
    );

    if (!channel) {
      console.log(`WARNING: Channel not configured for guild ${guild.name}`);
      continue;
    }

    newEvents[guild.id].forEach(event => {
      channel.send(messages.embedEvent(event));
    });
  }
};

const scanRanking = async () => {
  for (let guild of client.guilds.array()) {
    // TODO: Configure channel in serverConfig
    const channel = client.channels.find(
      c => c.name === "geral" && c.guild.id === guild.id
    );

    serverConfig[guild.id].guildIds.forEach(async guildId => {
      const rankings = await guilds.getGuildRankings(guildId);
      channel.send(messages.embedRankings(rankings));
    });
  }
};

// TODO: Handle when the bot joins/leaves guilds
// See more: https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildCreate
client.on("ready", async () => {
  // Connect to mongo to enable persist config
  await config.connect();

  console.log(`Connected successfully as ${client.user.tag}`);

  // Update config for all guilds
  for (let guild of client.guilds.array()) {
    serverConfig[guild.id] = await config.getConfig(guild.id);
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
    scanEvents();
    await sleep(30000);
  }
});

client.on("message", msg => {
  if (msg.content === "test") {
    scanRanking();
    return;
  }
});

client.login(token);
