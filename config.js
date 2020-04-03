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

exports.getConfig = async guild => {
  if (!db) { return DEFAULT_CONFIG; }
  const collection = db.collection(SERVER_CONFIG_COLLECTION);
  try {
    const guildConfig =
      (await collection.findOne({ guild: guild.id })) || DEFAULT_CONFIG;
    return guildConfig;
  } catch (e) {
    console.log(`Unable to find guildConfig for guild ${guild}: ${e}`);
    return DEFAULT_CONFIG;
  }
};

exports.getConfigByGuild = async guildList => {
  const configByGuild = {};
  guildList.forEach(guild => {
    configByGuild[guild.id] = DEFAULT_CONFIG;
  });

  if (!db) return configByGuild;
  const collection = db.collection(SERVER_CONFIG_COLLECTION);
  try {
    const results = await collection.find({ guild: { $in: guildList.map(g => g.id) } }).toArray();
    results.forEach(result => {
      configByGuild[result.guild] = result;
    });
    return configByGuild;
  } catch (e) {
    console.log(`Unable to find guildConfig for ${guildList.length} guilds: ${e}`);
    return configByGuild;
  }
};

exports.setConfig = async guild => {
  if (!db) { return false; }
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
  if (!db) { return false; }
  const collection = db.collection(SERVER_CONFIG_COLLECTION);
  try {
    return await collection.remove({ guild: guild.id }, true);
  } catch (e) {
    console.log(`Unable to delete guildConfig for guild ${guild}: ${e}`);
  }
};
