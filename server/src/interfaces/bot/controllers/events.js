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

    logger.debug(`[${server}] Processing event: ${event.EventId}`, {
      server,
      guilds: client.guilds.cache.size,
      eventId: event.EventId,
    });

    try {
      for (const guild of client.guilds.cache.values()) {
        const settings = await getSettings(guild.id);
        const track = await getTrack(guild.id);
        const limits = await getLimits(guild.id);
        if (!settings || !track || !limits) continue;

        const guildEvent = getTrackedEvent(event, track, limits);
        if (!guildEvent) continue;
        const lootValue = await getEventVictimLootValue(event, { server });

        const { good, tracked } = guildEvent;
        const { enabled, mode } = good ? settings.kills : settings.deaths;
        const channel = tracked.channel || (good ? settings.kills.channel : settings.deaths.channel);
        if (!enabled || !channel) continue;

        addRankingKill(guild.id, guildEvent);

        logger.info(`[${server}] Sending ${good ? "kill" : "death"} event ${event.EventId} to "${guild.name}".`, {
          guild: transformGuild(guild),
          event: transformEvent(guildEvent),
          settings,
          track,
          limits,
        });
        const { locale, guildTags, splitLootValue } = settings.general;

        if (mode === REPORT_MODES.IMAGE) {
          const inventory = guildEvent.Victim.Inventory.filter((i) => i != null);
          const hasInventory = inventory.length > 0;
          const eventImage = await generateEventImage(guildEvent, { lootValue, splitLootValue });
          await sendNotification(
            client,
            channel,
            embedEventImage(guildEvent, eventImage, {
              locale,
              guildTags,
              addFooter: !hasInventory,
            }),
          );
          if (hasInventory) {
            const inventoryImage = await generateInventoryImage(inventory, { lootValue, splitLootValue });
            await sendNotification(
              client,
              channel,
              embedEventInventoryImage(guildEvent, inventoryImage, {
                locale,
              }),
            );
          }
        } else if (mode === REPORT_MODES.TEXT) {
          await sendNotification(client, channel, embedEvent(guildEvent, { lootValue, locale, guildTags }));
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

    logger.verbose(`[${server}] Processing ${events.length} events.`, {
      server,
      events: events.length,
      guilds: client.guilds.cache.size,
    });

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
