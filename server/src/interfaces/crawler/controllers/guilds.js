const moment = require("moment");

const { DAY } = require("../../../helpers/constants");
const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/scheduler");
const { getGuildByTrackGuild, updateGuildDataByTrackGuild } = require("../../../services/guilds");
const { fetchTracks } = require("../../../services/track");

async function fetchGuildData() {
  logger.info(`Updating albion guild data.`);

  const tracks = await fetchTracks();
  for (const track of tracks) {
    if (!track.guilds || !Array.isArray(track.guilds)) continue;

    for (const trackGuild of track.guilds) {
      const guild = await getGuildByTrackGuild(trackGuild);
      if (!!guild && moment().diff(moment(guild.updatedAt), "days") < 1) continue;

      try {
        logger.debug(`[${trackGuild.server}] Updating guild "${trackGuild.name}" data.`, { trackGuild });
        await updateGuildDataByTrackGuild(trackGuild);
      } catch (error) {
        logger.warn(`[${trackGuild.server}] Unable to update guild "${trackGuild.name}" data: ${error.message}`, {
          error,
          trackGuild,
        });
      }
    }
  }

  logger.verbose(`Update albion guild data complete.`);
}

const init = async () => {
  runInterval(`Update Albion Guild data`, fetchGuildData, {
    interval: DAY / 4,
    runOnStart: true,
  });
};

module.exports = {
  name: "guilds",
  init,
};
