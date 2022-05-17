const { getCollection } = require("../ports/database");

const SETTINGS_COLLECTION = "settings";
const REPORT_MODES = {
  IMAGE: "image",
  TEXT: "text",
};

const DEFAULT_SETTINGS = {
  lang: "en",
  kills: {
    enabled: true,
    channel: null,
    mode: REPORT_MODES.IMAGE,
  },
  battles: {
    enabled: true,
    channel: null,
  },
  rankings: {
    enabled: true,
    channel: null,
    pvpRanking: "daily",
    guildRanking: "daily",
  },
  track: {
    players: [],
    guilds: [],
    alliances: [],
  },
  subscription: {
    expires: null,
  },
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

async function setSettings(guild, settings) {
  const collection = getCollection(SETTINGS_COLLECTION);
  return await collection.updateOne({ guild }, { $set: settings }, { upsert: true });
}

async function resetSettings(guild) {
  const collection = getCollection(SETTINGS_COLLECTION);
  return await collection.updateOne({ guild }, { $set: DEFAULT_SETTINGS }, { upsert: true });
}

async function deleteSettings(guild) {
  const collection = getCollection(SETTINGS_COLLECTION);
  return await collection.deleteOne({ guild });
}

module.exports = {
  REPORT_MODES,
  getSettings,
  getSettingsByGuild,
  setSettings,
  resetSettings,
  deleteSettings,
};
