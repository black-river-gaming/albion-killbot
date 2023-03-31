const { find, findOne, updateOne, deleteOne } = require("../ports/database");

const { memoize, set, remove } = require("../helpers/cache");
const { clone } = require("../helpers/utils");

const SETTINGS_COLLECTION = "settings";

const REPORT_MODES = Object.freeze({
  IMAGE: "image",
  TEXT: "text",
});

const DEFAULT_SETTINGS = Object.freeze({
  general: {
    lang: "en",
    guildTags: false,
  },
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
    const settings = await findOne(SETTINGS_COLLECTION, { server: serverId });
    return Object.assign(clone(DEFAULT_SETTINGS), settings);
  });
}

async function fetchAllSettings() {
  return await find(SETTINGS_COLLECTION, {});
}

async function setSettings(serverId, data) {
  // TODO: Schema validation
  const { general, kills, deaths, battles, rankings } = data;

  await updateOne(
    SETTINGS_COLLECTION,
    { server: serverId },
    { $set: { server: serverId, general, kills, deaths, battles, rankings } },
    { upsert: true },
  );
  remove(`settings-${serverId}`);
  return await getSettings(serverId);
}

async function deleteSettings(serverId) {
  return await deleteOne(SETTINGS_COLLECTION, { server: serverId });
}

async function updateSettingsCache(timeout) {
  const settings = await find(SETTINGS_COLLECTION, {});
  settings.forEach((settings) => {
    if (!settings.server) return;

    const serverId = settings.server;
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
