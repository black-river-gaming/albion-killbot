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
    // TODO: Trim track list if subscription is expired
    // Better to do when Track list gets refactored
    settingsByGuild[settings.guild] = settings;
  });

  return settingsByGuild;
}

async function getAllSettings() {
  const collection = getCollection(SETTINGS_COLLECTION);
  return await collection.find({}).toArray();
}

async function setSettings(guild, settings) {
  for (const key in settings) {
    if (!(key in DEFAULT_SETTINGS)) delete settings[key];
  }

  // TODO: Validate track list size is below limits for subscribers
  // Better to do when Track list gets refactored
  const collection = getCollection(SETTINGS_COLLECTION);
  await collection.updateOne(
    { guild },
    {
      $set: settings,
    },
    { upsert: true },
  );
  return await getSettings(guild);
}

async function deleteSettings(guild) {
  const collection = getCollection(SETTINGS_COLLECTION);
  return await collection.deleteOne({ guild });
}

module.exports = {
  REPORT_MODES,
  DEFAULT_SETTINGS,
  getSettings,
  getSettingsByGuild,
  getAllSettings,
  setSettings,
  deleteSettings,
};
