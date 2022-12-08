const moment = require("moment");
const logger = require("../../../helpers/logger");

const { sendNotification } = require("./notifications");

const { HOUR, DAY } = require("../../../helpers/constants");
const { embedGuildRanking } = require("../../../helpers/embeds");
const { runDaily, runInterval } = require("../../../helpers/utils");

const { getAllGuilds, updateGuild } = require("../../../services/guilds");
const { getSettings } = require("../../../services/settings");
const { getTrack } = require("../../../services/track");

const { GUILD_RANKINGS } = process.env;

async function init(client) {
  try {
    runInterval(`Collect Guild data`, updateGuilds, {
      fnOpts: [client],
      interval: DAY / 4,
    });
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

async function updateGuilds(client) {
  logger.verbose(`Updating albion guild data`);

  const albionGuilds = await getAllGuilds();

  for (const guild of client.guilds.cache.values()) {
    const track = await getTrack(guild.id);
    if (!track) continue;

    for (const trackedGuild of track.guilds) {
      const albionGuild = albionGuilds[trackedGuild.id];
      if (!!albionGuild && moment().diff(moment(albionGuild.updatedAt), "days") < 1) continue;

      logger.verbose(`Updating guild "${trackedGuild.name}" data`);
      await updateGuild(trackedGuild.id);
    }
  }

  logger.verbose(`Update albion guild data complete`);
}

async function displayRankings(client, rankingType) {
  if (!GUILD_RANKINGS) return;
  logger.info(`Guild Ranking on '${rankingType}' setting: start.`);

  const albionGuilds = await getAllGuilds();

  for (const guild of client.guilds.cache.values()) {
    const settings = await getSettings(guild.id);
    const track = await getTrack(guild.id);
    if (!settings || !track) continue;

    const { enabled, channel, guildRanking } = settings.rankings;
    if (!enabled || !channel) continue;
    if (guildRanking != rankingType) continue;

    for (const trackedGuild of track.guilds) {
      const trackedGuildData = albionGuilds[trackedGuild.id];
      if (!trackedGuildData || !trackedGuildData.rankings) {
        logger.verbose(`No data available for guild "${trackedGuild.name}"`);
        continue;
      }

      await sendNotification(client, channel, embedGuildRanking(trackedGuildData, { locale: settings.lang }));
    }
  }

  logger.verbose(`Guild Ranking on '${rankingType}' setting: complete.`);
}

module.exports = {
  displayRankings,
  init,
  updateGuilds,
};
