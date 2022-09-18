const moment = require("moment");

const { sendNotification } = require("./notifications");

const { embedGuildRanking } = require("../../../helpers/embeds");
const logger = require("../../../helpers/logger");

const { getAllGuilds, updateGuild } = require("../../../services/guilds");
const { getSettingsByGuild } = require("../../../services/settings");
const { getTrackForServer } = require("../../../services/track");

async function updateGuilds(client) {
  const { shardId } = client;

  logger.verbose(`[#${shardId}] Updating albion guild data`);

  const trackForServer = await getTrackForServer(client.guilds.cache);
  const albionGuilds = await getAllGuilds();

  for (const guild of client.guilds.cache.values()) {
    if (!trackForServer[guild.id]) continue;
    const track = trackForServer[guild.id];

    for (const trackedGuild of track.guilds) {
      const albionGuild = albionGuilds[trackedGuild.id];
      if (!!albionGuild && moment().diff(moment(albionGuild.updatedAt), "days") < 1) continue;

      logger.verbose(`[#${shardId}] Updating guild "${trackedGuild.name}" data`);
      await updateGuild(trackedGuild.id);
    }
  }

  logger.verbose(`[#${shardId}] Update albion guild data complete`);
}

async function displayRankings(client, { setting }) {
  const { shardId } = client;

  logger.info(`[#${shardId}] Sending guild ranking on '${setting}' setting to all servers.`);

  const settingsByGuild = await getSettingsByGuild(client.guilds.cache);
  const trackForServer = await getTrackForServer(client.guilds.cache);
  const albionGuilds = await getAllGuilds();

  for (const guild of client.guilds.cache.values()) {
    if (!trackForServer[guild.id] || !settingsByGuild[guild.id]) continue;
    const settings = settingsByGuild[guild.id];
    const track = trackForServer[guild.id];

    const { enabled, channel, guildRanking } = settings.rankings;
    if (!enabled || !channel) continue;
    if (guildRanking != setting) continue;

    for (const trackedGuild of track.guilds) {
      const trackedGuildData = albionGuilds[trackedGuild.id];
      if (!trackedGuildData || !trackedGuildData.rankings) {
        logger.verbose(`[#${shardId}] No data available for guild "${trackedGuild.name}"`);
        continue;
      }

      await sendNotification(client, channel, embedGuildRanking(trackedGuildData, { locale: settings.lang }));
    }
  }

  logger.verbose(`[#${shardId}] Displaying guild rankings to all servers complete`);
}

module.exports = {
  displayRankings,
  updateGuilds,
};
