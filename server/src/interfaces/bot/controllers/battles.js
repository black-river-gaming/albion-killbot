const logger = require("../../../helpers/logger");
const { getTrackedBattle } = require("../../../helpers/tracking");
const { embedBattle } = require("../../../helpers/embeds");
const { transformGuild } = require("../../../helpers/discord");

const { subscribeBattles } = require("../../../services/battles");
const { getSettings } = require("../../../services/settings");
const { getTrack } = require("../../../services/track");
const { getLimits } = require("../../../services/limits");

const { sendNotification } = require("./notifications");

const { AMQP_QUEUE_BATTLES_BATCH } = process.env;

async function subscribe(client) {
  const cb = async (battle) => {
    const { server } = battle;

    logger.debug(`[${server}] Received battle: ${battle.id}`, {
      server,
      guilds: client.guilds.cache.size,
      battleId: battle.id,
    });

    try {
      for (const guild of client.guilds.cache.values()) {
        const settings = await getSettings(guild.id);
        const track = await getTrack(guild.id);
        const limits = await getLimits(guild.id);
        if (!settings || !track || !limits) continue;

        const guildBattle = getTrackedBattle(battle, track, limits);
        if (!guildBattle) continue;

        const { enabled, channel } = settings.battles;
        if (!enabled || !channel) continue;

        logger.info(`[${server}] Sending battle ${battle.id} to "${guild.name}".`, {
          guild: transformGuild(guild),
          battle,
          settings,
          track,
          limits,
        });
        await sendNotification(client, channel, embedBattle(battle, settings.general.locale));
      }
    } catch (error) {
      logger.error(`[${server}] Error processing battle ${battle.id}: ${error.message}`, { error });
    }

    return true;
  };

  const batchCb = async (battles) => {
    if (!Array.isArray(battles) || battles.length === 0) return true;
    const server = battles[0].server;

    logger.verbose(`[${server}] Processing ${battles.length} battles.`, {
      server,
      events: battles.length,
      guilds: client.guilds.cache.size,
    });

    for (const battle of battles) {
      await cb(battle);
    }

    logger.debug(`[${server}] Process battles complete.`);
    return true;
  };

  const queue_suffix = process.env.SHARD;

  if (AMQP_QUEUE_BATTLES_BATCH) return subscribeBattles(batchCb, { queue_suffix });
  return subscribeBattles(cb, { queue_suffix });
}

async function init(client) {
  try {
    await subscribe(client);
    logger.info(`Subscribed to battles queue.`);
  } catch (error) {
    logger.error(`Error in subscription to battles queue: ${error.message}`, { error });
  }
}

module.exports = {
  name: "battles",
  init,
  subscribe,
};
