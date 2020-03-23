const axios = require("axios");
const { getConfig } = require("../config");

const BATTLES_ENDPOINT =
  "https://gameinfo.albiononline.com/api/gameinfo/battles?offset=0&limit=20&sort=recent";

let lastBattleId = null;

function getNewBattles(battles, config) {
  if (!config) {
    return [];
  }

  const playerIds = (config.trackedPlayers || []).map(t => t.id);
  const guildIds = (config.trackedGuilds || []).map(t => t.id);
  const allianceIds = (config.trackedAlliances || []).map(t => t.id);

  const newBattles = [];
  battles.every(battle => {
    if (battle.id <= lastBattleId) {
      return false;
    }
    // Ignore battles without fame
    if (battle.totalFame <= 0) {
      return true;
    }

    // Check for tracked ids in players, guilds and alliances
    // Since we are parsing from newer to older events we need to use a FILO array
    const hasTrackedPlayer = Object.keys(battle.players || {}).some(
      id => playerIds.indexOf(id) >= 0
    );
    const hasTrackedGuild = Object.keys(battle.guilds || {}).some(
      id => guildIds.indexOf(id) >= 0
    );
    const hasTrackedAlliance = Object.keys(battle.alliances || {}).some(
      id => allianceIds.indexOf(id) >= 0
    );
    if (hasTrackedPlayer || hasTrackedGuild || hasTrackedAlliance) {
      newBattles.unshift(battle);
    }

    return true;
  });

  return newBattles;
}

exports.getBattles = async guilds => {
  console.log("Fetching Albion Online battles...");
  const battlesByGuild = {};
  try {
    const res = await axios.get(BATTLES_ENDPOINT);
    // We only want unread battles
    const battles = res.data.filter(bat => bat.id > lastBattleId);

    for (let guild of guilds) {
      const config = await getConfig(guild);
      if (!config) continue;
      battlesByGuild[guild.id] = getNewBattles(battles, config);
    }

    // Sometimes the API return old values, se we just want increasing values
    if (battles.length > 0 && battles[0].id > lastBattleId) {
      lastBattleId = battles[0].id;
    }

    return {
      battlesByGuild,
      rate: Math.round((battles.length / 20) * 100)
    };
  } catch (err) {
    console.error(`Unable to fetch battles from API: ${err}`);
    return {
      battlesByGuild: {},
      rate: 100
    };
  }
};
