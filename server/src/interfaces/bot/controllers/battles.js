const logger = require("../../../helpers/logger");

const { subscribeBattles } = require("../../../services/battles");
const { getSettings } = require("../../../services/settings");
const { getTrack } = require("../../../services/track");

const { getTrackedBattle } = require("../../../helpers/tracking");
const { embedBattle } = require("../../../helpers/embeds");

const { sendNotification } = require("./notifications");

async function subscribe(client) {
  const cb = async (battle) => {
    logger.debug(`Received battle: ${battle.id}`);

    try {
      for (const guild of client.guilds.cache.values()) {
        const settings = await getSettings(guild.id);
        const track = await getTrack(guild.id);
        if (!settings || !track) continue;

        const guildBattle = getTrackedBattle(battle, track);
        if (!guildBattle) continue;

        const { enabled, channel } = settings.battles;
        if (!enabled || !channel) continue;

        logger.info(`Sending battle ${battle.id} to "${guild.name}".`);
        await sendNotification(client, channel, embedBattle(battle, guild.settings.lang));
      }
    } catch (e) {
      logger.error(`Error while processing battle ${battle.id}:`, e);
    }

    return true;
  };

  return await subscribeBattles(process.env.SHARD, cb);
}

module.exports = {
  subscribe,
};
