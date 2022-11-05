const moment = require("moment");

const { sendNotification } = require("./notifications");

const { embedGuildRanking } = require("../../../helpers/embeds");
const logger = require("../../../helpers/logger");

const { getAllGuilds, updateGuild } = require("../../../services/guilds");
const { getSettings } = require("../../../services/settings");
const { getTrack } = require("../../../services/track");

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

async function displayRankings(client, { setting }) {
  logger.info(`Sending guild ranking on '${setting}' setting to all servers.`);

  const albionGuilds = await getAllGuilds();

  for (const guild of client.guilds.cache.values()) {
    const settings = await getSettings(guild.id);
    const track = await getTrack(guild.id);
    if (!settings || !track) continue;

    const { enabled, channel, guildRanking } = settings.rankings;
    if (!enabled || !channel) continue;
    if (guildRanking != setting) continue;

    for (const trackedGuild of track.guilds) {
      const trackedGuildData = albionGuilds[trackedGuild.id];
      if (!trackedGuildData || !trackedGuildData.rankings) {
        logger.verbose(`No data available for guild "${trackedGuild.name}"`);
        continue;
      }

      await sendNotification(client, channel, embedGuildRanking(trackedGuildData, { locale: settings.lang }));
    }
  }

  logger.verbose(`Displaying guild rankings to all servers complete`);
}

module.exports = {
  displayRankings,
  updateGuilds,
};
