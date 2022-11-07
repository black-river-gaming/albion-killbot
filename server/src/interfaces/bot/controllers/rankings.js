const logger = require("../../../helpers/logger");
const { getRanking, deleteRankings } = require("../../../services/rankings");
const { getSettings } = require("../../../services/settings");

const { HOUR } = require("../../../helpers/constants");
const { embedPvpRanking } = require("../../../helpers/embeds");
const { runDaily, runInterval } = require("../../../helpers/utils");

const { sendNotification } = require("./notifications");

async function init(client) {
  try {
    runDaily(`Display pvp ranking for daily setting`, displayRankings, {
      fnOpts: [client, "daily"],
      hour: 0,
      minute: 0,
    });
    runInterval(`Display pvp ranking for hourly setting`, displayRankings, {
      fnOpts: [client, "hourly"],
      interval: HOUR,
    });

    // Only the first shard needs to run this
    if (process.env.SHARD === 0) {
      runDaily(`Clear rankings data`, clearRankings, {
        hour: 0,
        minute: 5,
      });
    }
  } catch (error) {
    logger.error(`Error in init pvp rankings: ${error.message}`, { error });
  }
}

async function displayRankings(client, rankingType) {
  logger.info(`Sending pvp ranking on '${rankingType}' setting to all servers.`);

  for (const guild of client.guilds.cache.values()) {
    const settings = await getSettings(guild.id);
    if (!settings) continue;

    const { enabled, channel, pvpRanking } = settings.rankings;
    if (!enabled || !channel) continue;
    if (pvpRanking != rankingType) continue;

    const ranking = await getRanking(guild.id);
    if (ranking.killRanking.length === 0 && ranking.deathRanking.length === 0) continue;

    await sendNotification(
      client,
      channel,
      embedPvpRanking(ranking, {
        locale: settings.lang,
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
  clearRankings,
  displayRankings,
  init,
};
