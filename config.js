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
    "Please define MONGODB_URL environment variable with the MongoDB location. Guild config is disabled."
  );
}

const client = new MongoClient(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
let db;
const guildConfigs = {};

exports.connect = async () => {
  try {
    await client.connect();
    console.log("Connected to database.");
    db = client.db();
  } catch (e) {
    console.log(
      `Unable to connect to database: ${e}. Guild config is disabled.`
    );
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
  if (guild.config) guildConfig[guild.id] = guild.config;
  if (!db) {
    return false;
  }
  const collection = db.collection(SERVER_CONFIG_COLLECTION);
  try {
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
