const database = require("../src/ports/database");

// Update 'guildConfig' to 'settings' new format

const OLD_SETTINGS_COLLECTION = "guildConfig";
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

function convertGuildConfigToSettings(guildConfig) {
  const settings = Object.assign({}, DEFAULT_SETTINGS);

  settings.guild = guildConfig.guild;
  if (guildConfig.categories) {
    const categories = guildConfig.categories;
    settings.kills.enabled = categories.events || settings.kills.enabled;
    settings.battles.enabled = categories.battles || settings.battles.enabled;
    settings.rankings.enabled = categories.rankings || settings.rankings.enabled;
  }
  if (guildConfig.channel) {
    const channel = guildConfig.channel;
    settings.kills.channel = channel.events || channel.general || settings.kills.channel;
    settings.battles.channel = channel.battles || channel.general || settings.battles.channel;
    settings.rankings.channel = channel.rankings || channel.general || settings.rankings.channel;
  }
  settings.rankings.pvpRanking = guildConfig.dailyRanking || settings.rankings.pvpRanking;
  settings.lang = guildConfig.lang || settings.lang;
  settings.track.alliances = guildConfig.trackedAlliances || settings.track.alliances;
  settings.track.guilds = guildConfig.trackedGuilds || settings.track.guilds;
  settings.track.players = guildConfig.trackPlayers || settings.track.players;
  settings.subscription = guildConfig.subscription || settings.subscription;

  return settings;
}

async function changeGuildConfigToSettings() {
  const guildConfigCollection = database.getCollection(OLD_SETTINGS_COLLECTION);
  const settingsCollection = database.getCollection(SETTINGS_COLLECTION);

  for (const guildConfig of await guildConfigCollection.find({}).toArray()) {
    const settings = convertGuildConfigToSettings(guildConfig);
    await settingsCollection.updateOne(
      { guild: settings.guild },
      {
        $set: settings,
      },
      { upsert: true },
    );
  }

  await database.dropColection(OLD_SETTINGS_COLLECTION);
}

// Remove 'dailyRanking' collection

const OLD_DAILY_RANKING_COLLECTION = "dailyRanking";

async function removeDailyRankingCollection() {
  await database.dropColection(OLD_DAILY_RANKING_COLLECTION);
}

// Migration tasks

async function run() {
  await changeGuildConfigToSettings();
  await removeDailyRankingCollection();
}

module.exports = {
  run,
};
