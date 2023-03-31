const logger = require("../../../helpers/logger");

const { sendNotification } = require("./notifications");

const { HOUR } = require("../../../helpers/constants");
const { embedGuildRanking } = require("../../../helpers/embeds");
const { runDaily, runInterval } = require("../../../helpers/scheduler");

const { getGuildByTrackGuild } = require("../../../services/guilds");
const { getSettings } = require("../../../services/settings");
const { getTrack } = require("../../../services/track");

const { GUILD_RANKINGS } = process.env;

async function displayRankings(client, rankingType) {
  if (!GUILD_RANKINGS) return;
  logger.info(`Guild Ranking on '${rankingType}' setting: start.`, { rankingType });

  for (const guild of client.guilds.cache.values()) {
    const settings = await getSettings(guild.id);
    const track = await getTrack(guild.id);
    if (!settings || !track) continue;

    const { enabled, channel, guildRanking } = settings.rankings;
    if (!enabled || !channel) continue;
    if (guildRanking != rankingType) continue;

    for (const trackGuild of track.guilds) {
      const trackGuildData = await getGuildByTrackGuild(trackGuild);
      if (!trackGuildData || !trackGuildData.rankings) {
        logger.verbose(`No data available for guild "${trackGuild.name}"`);
        continue;
      }

      await sendNotification(client, channel, embedGuildRanking(trackGuildData, { locale: settings.general.locale }));
    }
  }

  logger.verbose(`Guild Ranking on '${rankingType}' setting: complete.`, { rankingType });
}

async function init(client) {
  try {
    runDaily(`Display guild rankings for daily setting`, displayRankings, {
      fnOpts: [client, "daily"],
    });
    runInterval(`Display guild rankings for hourly setting`, displayRankings, {
      fnOpts: [client, "hourly"],
      interval: HOUR,
    });
  } catch (error) {
    logger.error(`Error in init guild controller: ${error.message}`, { error });
  }
}

module.exports = {
  name: "guilds",
  init,
};
