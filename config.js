const logger = require("./logger")("config");
const database = require("./database");
const { hasSubscription, getConfigBySubscription } = require("./subscriptions");

exports.categories = ["general", "events", "battles", "rankings"];

const SERVER_CONFIG_COLLECTION = "guildConfig";
const DEFAULT_CONFIG = {
  trackedPlayers: [],
  trackedGuilds: [],
  trackedAlliances: [],
  dailyRanking: "daily",
  categories: {
    general: true,
    events: true,
    battles: true,
    rankings: true,
  },
  mode: "image",
  lang: "en",
};

exports.getConfig = async (guild) => {
  const collection = database.collection(SERVER_CONFIG_COLLECTION);
  if (!collection) {
    return DEFAULT_CONFIG;
  }
  try {
    return await collection.findOne({ guild: guild.id });
  } catch (e) {
    logger.error(`Unable to find guildConfig for guild ${guild}: ${e}`);
    return null;
  }
};

exports.getConfigBySubscription = async (userId) => {
  const collection = database.collection(SERVER_CONFIG_COLLECTION);
  if (!collection) {
    return null;
  }
  try {
    return await collection.findOne({ "subscription.owner": userId });
  } catch (e) {
    logger.error(`Unable to find guildConfig for guild ${guild}: ${e}`);
    return null;
  }
};

exports.getConfigByGuild = async (guildList) => {
  const configByGuild = {};
  guildList.forEach((guild) => {
    configByGuild[guild.id] = DEFAULT_CONFIG;
  });

  const collection = database.collection(SERVER_CONFIG_COLLECTION);
  if (!collection) return configByGuild;
  try {
    const results = await collection.find({}).toArray();
    results.forEach((config) => {
      if (!hasSubscription(config)) return;
      if (configByGuild[config.guild]) {
        configByGuild[config.guild] = config;
      }
    });
    return configByGuild;
  } catch (e) {
    logger.error(
      `Unable to find guildConfig for ${guildList.length} guilds: ${e}`
    );
    return configByGuild;
  }
};

exports.setConfig = async (guild) => {
  const collection = database.collection(SERVER_CONFIG_COLLECTION);
  if (!collection) {
    return false;
  }
  try {
    guild.config.name = guild.name;
    const guildConfig = await collection.updateOne(
      { guild: guild.id },
      { $set: guild.config },
      { upsert: true }
    );
    return guildConfig;
  } catch (e) {
    logger.error(`Unable to write guildConfig for guild ${guild}: ${e}`);
    return false;
  }
};

exports.deleteConfig = async (guild) => {
  const collection = database.collection(SERVER_CONFIG_COLLECTION);
  if (!collection) {
    return false;
  }
  try {
    return await collection.deleteOne({ guild: guild.id });
  } catch (e) {
    logger.error(`Unable to delete guildConfig for guild ${guild}: ${e}`);
  }
};
