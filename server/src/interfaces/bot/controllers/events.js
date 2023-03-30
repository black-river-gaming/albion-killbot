const logger = require("../../../helpers/logger");
const { getTrackedEvent } = require("../../../helpers/tracking");
const { embedEvent, embedEventImage, embedEventInventoryImage } = require("../../../helpers/embeds");
const { transformGuild } = require("../../../helpers/discord");
const { transformEvent } = require("../../../helpers/albion");

const { subscribeEvents, getEventVictimLootValue } = require("../../../services/events");
const { generateEventImage, generateInventoryImage } = require("../../../services/images");
const { REPORT_MODES, getSettings } = require("../../../services/settings");
const { addRankingKill } = require("../../../services/rankings");
const { getTrack } = require("../../../services/track");
const { getLimits } = require("../../../services/limits");

const { sendNotification } = require("./notifications");

const { AMQP_QUEUE_EVENTS_BATCH } = process.env;

async function subscribe(client) {
  const cb = async (event) => {
    const { server } = event;

    logger.debug(`[${server}] Received event: ${event.EventId}`);

    try {
      for (const guild of client.guilds.cache.values()) {
        const settings = await getSettings(guild.id);
        const track = await getTrack(guild.id);
        const limits = await getLimits(guild.id);
        if (!settings || !track || !limits) continue;

        const guildEvent = getTrackedEvent(event, track, limits);
        if (!guildEvent) continue;
        guildEvent.TotalVictimLootValue = await getEventVictimLootValue(event, { server });

        const { enabled, channel, mode } = guildEvent.good ? settings.kills : settings.deaths;
        if (!enabled || !channel) continue;

        addRankingKill(guild.id, guildEvent);

        logger.info(
          `[${server}] Sending ${guildEvent.good ? "kill" : "death"} event ${event.EventId} to "${guild.name}".`,
          {
            guild: transformGuild(guild),
            event: transformEvent(guildEvent),
            settings,
            track,
            limits,
          },
        );
        const locale = settings.lang;

        if (mode === REPORT_MODES.IMAGE) {
          const inventory = guildEvent.Victim.Inventory.filter((i) => i != null);
          const hasInventory = inventory.length > 0;
          const eventImage = await generateEventImage(guildEvent, settings.lang);
          await sendNotification(
            client,
            channel,
            embedEventImage(guildEvent, eventImage, {
              locale,
              addFooter: !hasInventory,
            }),
          );
          if (hasInventory) {
            const inventoryImage = await generateInventoryImage(inventory, settings.lang);
            await sendNotification(
              client,
              channel,
              embedEventInventoryImage(guildEvent, inventoryImage, {
                locale,
              }),
            );
          }
        } else if (mode === REPORT_MODES.TEXT) {
          await sendNotification(client, channel, embedEvent(guildEvent, { locale: settings.lang }));
        }
      }
    } catch (error) {
      logger.error(`[${server}] Error processing event ${event.EventId}: ${error.message}\n${error.stack}`, {
        error,
      });
    }

    return true;
  };

  const batchCb = async (events) => {
    if (!Array.isArray(events) || events.length === 0) return true;
    const server = events[0].server;

    logger.verbose(`[${server}] Processing ${events.length} events.`);
    for (const event of events) {
      await cb(event);
    }

    logger.debug(`[${server}] Process events complete.`);
    return true;
  };

  const queue_suffix = process.env.SHARD;

  if (AMQP_QUEUE_EVENTS_BATCH) return subscribeEvents(batchCb, { queue_suffix });
  return await subscribeEvents(cb, { queue_suffix });
}

async function init(client) {
  try {
    await subscribe(client);
    logger.info(`Subscribed to events queue.`);
  } catch (error) {
    logger.error(`Error in subscription to events queue: ${error.message}`, { error });
  }
}

module.exports = {
  name: "events",
  init,
  subscribe,
};
