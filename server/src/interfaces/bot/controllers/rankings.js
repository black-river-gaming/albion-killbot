const logger = require("../../../helpers/logger");
const { embedPvpRanking } = require("../../../helpers/embeds");

const { getRanking } = require("../../../services/rankings");
const { getSettings } = require("../../../services/settings");

const { sendNotification } = require("./notifications");
const { runCronjob } = require("../../../helpers/scheduler");

async function init({ client }) {
  try {
    runCronjob("Display 1hour rankings", "@hourly", displayRankings, {
      fnOpts: [client, "1hour"],
      runOnStart: true,
    });
    runCronjob("Display 6hour rankings", "0 */6 * * *", displayRankings, {
      fnOpts: [client, "6hour"],
    });
    runCronjob("Display 12hour rankings", "0 */12 * * *", displayRankings, {
      fnOpts: [client, "12hour"],
    });
    runCronjob("Display 1day rankings", "@daily", displayRankings, {
      fnOpts: [client, "1day"],
    });
    runCronjob("Display 7day rankings", "@weekly", displayRankings, {
      fnOpts: [client, "7day"],
    });
    runCronjob("Display 15day rankings", "0 0 */15 * *", displayRankings, {
      fnOpts: [client, "15day"],
    });
    runCronjob("Display 1month rankings", "@monthly", displayRankings, {
      fnOpts: [client, "1month"],
    });
  } catch (error) {
    logger.error(`Error in init rankings: ${error.message}`, { error });
  }
}

async function displayRankings(client, rankingType) {
  logger.info(`Display Rankings on '${rankingType}' setting.`);
  if (rankingType) return;

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

  logger.info(`Display Rankings on '${rankingType}' setting completed.`);
}

module.exports = {
  name: "rankings",
  init,
};
