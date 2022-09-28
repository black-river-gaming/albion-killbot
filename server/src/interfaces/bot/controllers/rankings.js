const logger = require("../../../helpers/logger");
const { getRanking, deleteRankings } = require("../../../services/rankings");
const { getSettingsForServer } = require("../../../services/settings");

const { embedPvpRanking } = require("../../../helpers/embeds");

const { sendNotification } = require("./notifications");

async function displayRankings(client, { setting }) {
  logger.info(`Sending pvp ranking on '${setting}' setting to all servers.`);

  const settingsByGuild = await getSettingsForServer(client.guilds.cache);

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

async function clearRankings() {
  logger.info(`Clearing rankings.`);
  await deleteRankings();
  logger.verbose(`Ranking cleared!`);
}

module.exports = {
  displayRankings,
  clearRankings,
};
