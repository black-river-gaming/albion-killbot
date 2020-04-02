const MongoClient = require("mongodb").MongoClient;

const MONGODB_URL = process.env.MONGODB_URL;
const SERVER_CONFIG_COLLECTION = "guildConfig";
const DEFAULT_CONFIG = {
  trackedPlayers: [],
  trackedGuilds: [],
  trackedAlliances: [],
  lang: "en"
};

if (!MONGODB_URL) {
  console.log(
    "Please define MONGODB_URL environment variable with the MongoDB location. Server config persistence is disabled."
  );
}

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const client = new MongoClient(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
function isConnected() {
  return !!client && !!client.topology && client.topology.isConnected();
}
let db;
const guildConfigs = {};

exports.connect = async () => {
  const exit = false;
  while (!exit) {
    try {
      if (!isConnected()) {
        console.log("Connecting to database...");
        await client.connect();
        console.log("Connection to database stabilished.");
        db = client.db();
      }
      await sleep(60000);
    } catch (e) {
      console.log(`Unable to connect to database: ${e}`);
    }
  }
};

// TODO: Implement bulk get/write guild config
exports.getConfig = async guild => {
  if (guildConfigs[guild.id]) return guildConfigs[guild.id];
  if (!db) {
    return DEFAULT_CONFIG;
  }
  const collection = db.collection(SERVER_CONFIG_COLLECTION);
  try {
    const guildConfig =
      (await collection.findOne({ guild: guild.id })) || DEFAULT_CONFIG;
    guildConfigs[guild.id] = guildConfig;
    return guildConfig;
  } catch (e) {
    console.log(`Unable to find guildConfig for guild ${guild}: ${e}`);
    return DEFAULT_CONFIG;
  }
};

exports.setConfig = async guild => {
  if (guild.config) guildConfigs[guild.id] = guild.config;
  if (!db) {
    return false;
  }
  const collection = db.collection(SERVER_CONFIG_COLLECTION);
  try {
    guild.config.name = guild.name;
    const guildConfig = await collection.updateOne(
      { guild: guild.id },
      { $set: guild.config },
      { upsert: true }
    );
    return guildConfig;
  } catch (e) {
    console.log(`Unable to write guildConfig for guild ${guild}: ${e}`);
    return false;
  }
};

exports.deleteConfig = async guild => {
  if (guildConfigs[guild.id]) delete guildConfigs[guild.id];
  const collection = db.collection(SERVER_CONFIG_COLLECTION);
  try {
    return await collection.remove({ guild: guild.id }, true);
  } catch (e) {
    console.log(`Unable to delete guildConfig for guild ${guild}: ${e}`);
  }
};
