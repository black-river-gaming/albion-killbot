const logger = require("../../../helpers/logger");
const { subscribeBattles } = require("../../../services/battles");
const { getSettingsByGuild, REPORT_MODES } = require("../../../services/settings");
// const { timeout } = require("../utils");
// const { getConfigByGuild } = require("../config");
// const { embedBattle } = require("../../../modules/messages");

// This method checks if a battle is tracked by a discord server
// and returns the battle or null if the event is not tracked at all
function checkTrackedBattle (battle, { players, guilds, alliances }) {
  if (players.length === 0 && guilds.length === 0 && alliances.length === 0) {
    return null;
  }

  const playerIds = players.map((t) => t.id);
  const guildIds = guilds.map((t) => t.id);
  const allianceIds = alliances.map((t) => t.id);

  // Ignore battles without fame
  if (battle.totalFame <= 0) {
    return null;
  }

  // Check for tracked ids in players, guilds and alliances
  const hasTrackedPlayer = Object.keys(battle.players || {}).some((id) => playerIds.indexOf(id) >= 0);
  const hasTrackedGuild = Object.keys(battle.guilds || {}).some((id) => guildIds.indexOf(id) >= 0);
  const hasTrackedAlliance = Object.keys(battle.alliances || {}).some((id) => allianceIds.indexOf(id) >= 0);
  if (hasTrackedPlayer || hasTrackedGuild || hasTrackedAlliance) {
    return battle;
  }

  return null;
};

async function subscribe(client) {
  const { shardId } = client;

  // Set consume callback
  const cb = async (battle) => {
    logger.debug(`Received battle: ${battle.id}`);

    try {
      const settingsByGuild = await getSettingsByGuild(client.guilds.cache);

      for (const guild of client.guilds.cache.values()) {
        if (!settingsByGuild[guild.id]) continue;

        guild.settings = settingsByGuild[guild.id];

        const guildBattle = checkTrackedBattle(battle, guild.settings.track);
        if (!guildBattle) continue;

        const { enabled, channel } = guild.settings.battles;
        if (!enabled || !channel) continue;

        logger.info(`[#${shardId}] Sending battle ${battle.id} to server "${guild.name}".`);
        // await timeout(sendGuildMessage(guild, embedBattle(battle, guild.config.lang), "battles"), 7000);
      }
    } catch (e) {
      logger.error(`[#${shardId}] Error while processing battle ${battle.id} [${e}]`);
    }

    return true;
  };

  return await subscribeBattles(shardId, cb);
}

module.exports = {
  checkTrackedBattle,
  subscribe,
};
