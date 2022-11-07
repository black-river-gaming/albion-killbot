const { find, findOne, updateOne, deleteOne } = require("../ports/database");

const { memoize, set, remove } = require("../helpers/cache");
const { clone } = require("../helpers/utils");

const SETTINGS_COLLECTION = "settings";

const REPORT_MODES = Object.freeze({
  IMAGE: "image",
  TEXT: "text",
});

const DEFAULT_SETTINGS = Object.freeze({
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
});

async function getSettings(serverId) {
  return await memoize(`settings-${serverId}`, async () => {
    const settings = await findOne(SETTINGS_COLLECTION, { guild: serverId });
    return Object.assign(clone(DEFAULT_SETTINGS), settings);
  });
}

async function fetchAllSettings() {
  return await find(SETTINGS_COLLECTION, {});
}

async function setSettings(serverId, settings) {
  await updateOne(SETTINGS_COLLECTION, { guild: serverId }, { $set: settings }, { upsert: true });
  remove(`track-${serverId}`);
  return await getSettings(serverId);
}

async function deleteSettings(guild) {
  return await deleteOne(SETTINGS_COLLECTION, { guild });
}

async function updateSettingsCache(timeout) {
  const settings = await find(SETTINGS_COLLECTION, {});
  settings.forEach((settings) => {
    if (!settings.guild) return;

    const serverId = settings.guild;
    set(`settings-${serverId}`, settings, { timeout });
  });
}

module.exports = {
  REPORT_MODES,
  deleteSettings,
  fetchAllSettings,
  getSettings,
  setSettings,
  updateSettingsCache,
};
