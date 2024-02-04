const logger = require("../../../helpers/logger");
const { embedRanking } = require("../../../helpers/embeds");
const { runCronjob } = require("../../../helpers/scheduler");
const { transformGuild } = require("../../../helpers/discord");

const { getRanking } = require("../../../services/rankings");
const { getSettings } = require("../../../services/settings");

const { sendNotification } = require("./notifications");

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

  for (const guild of client.guilds.cache.values()) {
    const settings = await getSettings(guild.id);
    if (!settings) continue;

    const { enabled, channel } = settings.rankings;
    if (!enabled || !channel) continue;

    for (const type of ["daily", "weekly", "monthly"]) {
      if (settings.rankings[type] !== rankingType) continue;

      const rankings = await getRanking(guild.id, type);
      if (!rankings) continue;
      if (rankings.killFameRanking.length === 0 && rankings.deathFameRanking.length === 0) continue;

      logger.verbose(`Sending ${type} ranking to ${guild.name}`, {
        guild: transformGuild(guild),
        type,
        rankings,
      });
      await sendNotification(
        client,
        channel,
        embedRanking(rankings, {
          locale: settings.general.locale,
        }),
      );
    }
  }

  logger.info(`Display Rankings on '${rankingType}' setting completed.`);
}

module.exports = {
  name: "rankings",
  init,
};
