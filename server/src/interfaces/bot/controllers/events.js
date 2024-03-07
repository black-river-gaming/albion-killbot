const config = require("config");

const logger = require("../../../helpers/logger");
const { REPORT_MODES } = require("../../../helpers/constants");
const { getTrackedEvent } = require("../../../helpers/tracking");
const { embedEvent, embedEventImage, embedEventInventoryImage } = require("../../../helpers/embeds");
const { transformGuild } = require("../../../helpers/discord");
const { transformEvent } = require("../../../helpers/albion");

const { subscribeEvents, getEventVictimLootValue } = require("../../../services/events");
const { generateEventImage, generateInventoryImage } = require("../../../services/images");
const { getSettings } = require("../../../services/settings");
const { getTrack } = require("../../../services/track");
const { getLimits } = require("../../../services/limits");
const { hasSubscriptionByServerId } = require("../../../services/subscriptions");

const { sendNotification } = require("./notifications");

const sendEvent = async ({ client, server, guild, event, settings, track, limits, type, premium = false } = {}) => {
  const { good, juicy, tracked } = event;
  const lootValue = event.lootValue || (await getEventVictimLootValue(event, { server }));
  const logMeta = {
    server,
    guild: transformGuild(guild),
    event: transformEvent(event),
    settings,
    track,
    limits,
    type,
  };

  if (premium && !(await hasSubscriptionByServerId(guild.id))) {
    logger.debug(`[${server}] Skipping event ${event.EventId} to "${guild.name}" because lack of premium.`, logMeta);
    return;
  }

  const setting = settings[type];
  if (!setting) {
    logger.debug(`[${server}] Skipping event ${event.EventId} to "${guild.name}" because lack of settings.`, logMeta);
    return;
  }

  const { enabled, mode, provider: providerId } = setting;
  const { locale, showAttunement, guildTags, splitLootValue } = settings.general;

  let channel = setting.channel;
  if (tracked) {
    if (good) channel = (tracked.kills && tracked.kills.channel) || channel;
    else channel = (tracked.deaths && tracked.deaths.channel) || channel;
  }

  if (!enabled || !channel) {
    logger.debug(
      `[${server}] Skipping event ${event.EventId} to "${guild.name}" because disabled/channel not set.`,
      logMeta,
    );
    return;
  }

  logger.info(
    `[${server}] Sending ${good ? "kill" : juicy ? "juicy" : "death"} event ${event.EventId} to "${guild.name}".`,
    logMeta,
  );

  if (mode === REPORT_MODES.IMAGE) {
    const inventory = event.Victim.Inventory.filter((i) => i != null);
    const hasInventory = inventory.length > 0;
    const eventImage = await generateEventImage(event, { lootValue, showAttunement, splitLootValue });
    await sendNotification(
      client,
      channel,
      embedEventImage(event, eventImage, {
        locale,
        guildTags,
        addFooter: !hasInventory,
        providerId,
      }),
    );
    if (hasInventory) {
      const inventoryImage = await generateInventoryImage(inventory, { lootValue, splitLootValue });
      await sendNotification(
        client,
        channel,
        embedEventInventoryImage(event, inventoryImage, {
          locale,
          providerId,
        }),
      );
    }
  } else if (mode === REPORT_MODES.TEXT) {
    await sendNotification(client, channel, embedEvent(event, { lootValue, locale, guildTags, providerId }));
  }
};

async function subscribe(client) {
  const cb = async (event) => {
    const { server } = event;

    logger.verbose(`[${server}] Processing event: ${event.EventId}`, {
      server,
      guilds: client.guilds.cache.size,
      eventId: event.EventId,
    });

    try {
      for (const guild of client.guilds.cache.values()) {
        const settings = await getSettings(guild.id);
        const track = await getTrack(guild.id);
        const limits = await getLimits(guild.id);

        // This should never happen
        if (!settings || !track || !limits) {
          logger.warn(
            `[${server}] Skipping event ${event.EventId} to "${guild.name}" because settings/track/limits not found.`,
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

        const guildEvent = getTrackedEvent(event, track, limits);
        if (guildEvent) {
          await sendEvent({
            client,
            server,
            guild,
            event: guildEvent,
            settings,
            track,
            limits,
            type: guildEvent.good ? "kills" : "deaths",
          });
        }
        if (event.juicy) {
          await sendEvent({
            client,
            server,
            guild,
            event,
            settings,
            track,
            limits,
            type: "juicy",
            premium: true,
          });
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

  if (config.get("amqp.events.batch")) return subscribeEvents(batchCb, { queue_suffix });
  return await subscribeEvents(cb, { queue_suffix });
}

async function init({ client }) {
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
