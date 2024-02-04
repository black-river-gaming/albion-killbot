const { find, findOne, updateOne, deleteOne } = require("../ports/database");

const { memoize, set, remove } = require("../helpers/cache");
const { REPORT_MODES, MINUTE } = require("../helpers/constants");
const { clone, mergeObjects } = require("../helpers/utils");

const SETTINGS_COLLECTION = "settings";

const DEFAULT_SETTINGS = Object.freeze({
  general: {
    locale: "en",
    showAttunement: true,
    guildTags: false,
    splitLootValue: false,
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
    threshold: {
      players: 0,
      guilds: 0,
      alliances: 0,
    },
  },
  rankings: {
    enabled: true,
    channel: null,
    daily: "off",
    weekly: "off",
    monthly: "off",
  },
});

const generateSettings = (settings) => mergeObjects(clone(DEFAULT_SETTINGS), settings);

async function getSettings(serverId) {
  return await memoize(
    `settings-${serverId}`,
    async () => {
      const settings = await findOne(SETTINGS_COLLECTION, { server: serverId });
      return generateSettings(settings);
    },
    {
      timeout: MINUTE,
    },
  );
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

async function updateSettingsCache(serverIds, { timeout, debug } = {}) {
  const settings = await find(SETTINGS_COLLECTION, {});

  serverIds.forEach((serverId) => {
    const setting = settings.find((setting) => setting.server === serverId);
    set(`settings-${serverId}`, generateSettings(setting), { timeout, debug });
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
