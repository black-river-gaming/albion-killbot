const config = require("config");

const logger = require("../../../helpers/logger");
const { getTrackedBattle, hasMinimumTreshold } = require("../../../helpers/tracking");
const { embedBattle } = require("../../../helpers/embeds");
const { transformGuild } = require("../../../helpers/discord");
const { getServerById } = require("../../../helpers/albion");

const { subscribeBattles } = require("../../../services/battles");
const { getSettings } = require("../../../services/settings");
const { getTrack } = require("../../../services/track");
const { getLimits } = require("../../../services/limits");

const { sendNotification } = require("./notifications");

async function subscribe(client) {
  const cb = async (battle) => {
    const server = getServerById(battle.server);
    if (!server) throw new Error(`Albion Server not found: ${battle.server}`);

    logger.verbose(`[${server.name}] Received battle: ${battle.id}`, {
      server,
      guilds: client.guilds.cache.size,
      battleId: battle.id,
    });

    try {
      for (const guild of client.guilds.cache.values()) {
        const settings = await getSettings(guild.id);
        const track = await getTrack(guild.id);
        const limits = await getLimits(guild.id);

        // This should never happen
        if (!settings || !track || !limits) {
          logger.warn(
            `[${server.name}] Skipping battle ${battle.id} to "${guild.name}" because settings/track/limits not found.`,
            {
              server,
              guild: transformGuild(guild),
              settings,
              track,
              limits,
            },
          );
          continue;
        }

        if (!getTrackedBattle(battle, track, limits)) continue;

        const { enabled, channel, threshold, provider: providerId } = settings.battles;
        const { locale } = settings.general;

        if (!enabled || !channel) {
          logger.debug(
            `[${server.name}] Skipping battle ${battle.id} to "${guild.name}" because disabled/channel not set.`,
            {
              server,
              guild: transformGuild(guild),
              battle,
              settings,
            },
          );
          continue;
        }
        if (!hasMinimumTreshold(battle, threshold)) {
          logger.debug(`[${server.name}] Skipping battle ${battle.id} to ${guild.name} because of threshold.`, {
            guild: transformGuild(guild),
            battle,
            settings,
          });
          continue;
        }

        logger.info(`[${server.name}] Sending battle ${battle.id} to "${guild.name}".`, {
          guild: transformGuild(guild),
          battle,
          settings,
          track,
          limits,
        });
        await sendNotification(client, channel, embedBattle(battle, { locale, providerId }));
      }
    } catch (error) {
      logger.error(`[${server.name}] Error processing battle ${battle.id}: ${error.message}`, { error });
    }

    return true;
  };

  const batchCb = async (battles) => {
    if (!Array.isArray(battles) || battles.length === 0) return true;
    const server = getServerById(battles[0].server);
    if (!server) throw new Error(`Albion Server not found: ${battles[0].server}`);

    logger.verbose(`[${server.name}] Processing ${battles.length} battles.`, {
      server,
      events: battles.length,
      guilds: client.guilds.cache.size,
    });

    for (const battle of battles) {
      await cb(battle);
    }

    logger.debug(`[${server.name}] Process battles complete.`);
    return true;
  };

  const queue_suffix = process.env.SHARD;

  if (config.get("amqp.battles.batch")) return subscribeBattles(batchCb, { queue_suffix });
  return subscribeBattles(cb, { queue_suffix });
}

async function init({ client }) {
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
