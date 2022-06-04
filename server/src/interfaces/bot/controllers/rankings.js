const logger = require("../../../helpers/logger");
const { getRanking, deleteRankings } = require("../../../services/rankings");
const { getSettingsByGuild } = require("../../../services/settings");

const { embedPvpRanking } = require("../../../helpers/embeds");

const { sendNotification } = require("./notifications");

async function displayRankings(client, { setting }) {
  const { shardId } = client;

  logger.info(`[#${shardId}] Sending pvp ranking on '${setting}' setting to all servers.`);

  const settingsByGuild = await getSettingsByGuild(client.guilds.cache);

  for (const guild of client.guilds.cache.values()) {
    if (!settingsByGuild[guild.id]) continue;

    guild.settings = settingsByGuild[guild.id];

    const { enabled, channel, pvpRanking } = guild.settings.rankings;
    if (!enabled || !channel) continue;
    if (pvpRanking != setting) continue;

    const ranking = await getRanking(guild.id);
    if (ranking.killRanking.length === 0 && ranking.deathRanking.length === 0) continue;

    await sendNotification(
      client,
      channel,
      embedPvpRanking(ranking, {
        locale: guild.settings.lang,
      }),
    );
  }
}

async function clearRankings(client) {
  const { shardId } = client;

  logger.info(`[#${shardId}] Clearing rankings.`);
  await deleteRankings();
  logger.verbose(`[#${shardId}] Ranking cleared!`);
}

module.exports = {
  displayRankings,
  clearRankings,
};
