const { find, findOne, updateOne, deleteOne } = require("../ports/database");

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
  deaths: {
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
};

async function getSettings(guild) {
  const settings = await findOne(SETTINGS_COLLECTION, { guild });
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
  };
}

async function getSettingsForServer(servers) {
  const settingsForServer = {};
  servers.forEach((server) => {
    settingsForServer[server.id] = { ...DEFAULT_SETTINGS };
  });

  (await find(SETTINGS_COLLECTION, {})).forEach((settings) => {
    // TODO: Trim track list if subscription is expired
    // Better to do when Track list gets refactored
    settingsForServer[settings.guild] = settings;
  });

  return settingsForServer;
}

async function getAllSettings() {
  return await find(SETTINGS_COLLECTION, {}).toArray();
}

async function setSettings(guild, settings) {
  for (const key in settings) {
    if (!(key in DEFAULT_SETTINGS)) delete settings[key];
  }

  // TODO: Validate track list size is below limits for subscribers
  // Better to do when Track list gets refactored
  await updateOne(SETTINGS_COLLECTION, { guild }, { $set: settings }, { upsert: true });
  return await getSettings(guild);
}

async function deleteSettings(guild) {
  return await deleteOne(SETTINGS_COLLECTION, { guild });
}

module.exports = {
  REPORT_MODES,
  DEFAULT_SETTINGS,
  getSettings,
  getSettingsForServer,
  getAllSettings,
  setSettings,
  deleteSettings,
};
