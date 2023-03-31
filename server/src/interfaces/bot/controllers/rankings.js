const { HOUR } = require("../../../helpers/constants");
const logger = require("../../../helpers/logger");
const { embedPvpRanking } = require("../../../helpers/embeds");
const { runDaily, runInterval } = require("../../../helpers/scheduler");

const { getRanking, deleteRankings } = require("../../../services/rankings");
const { getSettings } = require("../../../services/settings");

const { sendNotification } = require("./notifications");

async function init(client) {
  try {
    runDaily(`Display pvp ranking for daily setting and clear after`, displayRankings, {
      fnOpts: [client, "daily", { clearAfterDisplay: true }],
      hour: 0,
      minute: 0,
    });
    runInterval(`Display pvp ranking for hourly setting`, displayRankings, {
      fnOpts: [client, "hourly", {}],
      interval: HOUR,
    });
  } catch (error) {
    logger.error(`Error in init pvp rankings: ${error.message}`, { error });
  }
}

async function displayRankings(client, rankingType, { clearAfterDisplay = false }) {
  logger.info(`PvP Ranking on '${rankingType}' setting: start.`);

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
        locale: settings.general.locale,
      }),
    );
  }

  if (clearAfterDisplay) await clearRankings(client);

  logger.verbose(`PvP Ranking on '${rankingType}' setting: complete.`);
}

async function clearRankings(client) {
  for (const guild of client.guilds.cache.values()) {
    logger.verbose(`Clearing rankings for ${guild.name}.`, {
      metadata: {
        servers: client.guilds.cache.size,
        guild,
      },
    });
    await deleteRankings(guild.id);
  }
}

module.exports = {
  clearRankings,
  displayRankings,
  init,
};
