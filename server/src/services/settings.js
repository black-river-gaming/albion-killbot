const { getCollection } = require("../ports/database");

const SETTINGS_COLLECTION = "settings";
const DEFAULT_SETTINGS = {
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

async function getSettings(guild) {
  const collection = getCollection(SETTINGS_COLLECTION);
  return (await collection.findOne({ guild })) || DEFAULT_SETTINGS;
}

async function getSettingsByGuild(guilds) {
  const collection = getCollection(SETTINGS_COLLECTION);

  const settingsByGuild = {};
  guilds.forEach((guild) => {
    settingsByGuild[guild] = DEFAULT_SETTINGS;
  });

  await collection.find({}).forEach((settings) => {
    // if (!hasSubscription(config)) return;
    settingsByGuild[settings.guild] = settings;
  });

  return settingsByGuild;
}

async function setSettings(guild, settings = DEFAULT_SETTINGS) {
  const collection = getCollection(SETTINGS_COLLECTION);
  return await collection.updateOne({ guild }, { $set: settings }, { upsert: true });
}

async function deleteSettings(guild) {
  const collection = getCollection(SETTINGS_COLLECTION);
  return await collection.deleteOne({ guild });
}

module.exports = {
  getSettings,
  getSettingsByGuild,
  setSettings,
  deleteSettings,
};
