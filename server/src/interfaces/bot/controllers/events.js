const config = require("config");

const logger = require("../../../helpers/logger");
const { REPORT_MODES } = require("../../../helpers/constants");
const { getTrackedEvent } = require("../../../helpers/tracking");
const { embedEvent, embedEventImage, embedEventInventoryImage } = require("../../../helpers/embeds");
const { transformGuild } = require("../../../helpers/discord");
const { getServerById, transformEvent } = require("../../../helpers/albion");

const { subscribeEvents, getEventVictimLootValue } = require("../../../services/events");
const { generateEventImage, generateInventoryImage } = require("../../../services/images");
const { getSettings } = require("../../../services/settings");
const { getTrack } = require("../../../services/track");
const { getLimits } = require("../../../services/limits");
const { hasSubscriptionByServerId } = require("../../../services/subscriptions");

const { sendNotification } = require("./notifications");

const sendEvent = async ({ client, server, guild, event, settings, track, limits, type, premium = false } = {}) => {
  const { good, juicy, tracked } = event;
  if (!event.lootValue) event.lootValue = await getEventVictimLootValue(event, { server });
  const logMeta = {
    server,
    guild: transformGuild(guild),
    event: transformEvent(event),
    settings,
    track,
    limits,
    type,
  };
  let killType = "unknown";
  if (type === "kills" || type === "deaths") killType = good ? "kill" : "death";
  else if (type === "juicy") killType = juicy;

  if (premium && !(await hasSubscriptionByServerId(guild.id))) return;

  const setting = settings[type];
  if (!setting) {
    logger.debug(
      `[${server.name}] Skipping event ${event.EventId} to "${guild.name}" because lack of settings.`,
      logMeta,
    );
    return;
  }

  const { enabled, mode, provider: providerId } = setting;
  const { locale, showAttunement, guildTags, splitLootValue } = settings.general;

  // Simple enabled on/off
  if (typeof enabled === "boolean" && !enabled) {
    return logger.debug(
      `[${server.name}] Skipping ${killType} event ${event.EventId} to "${guild.name}" because disabled.`,
      logMeta,
    );
  }

  // Enabled per server
  if (typeof enabled === "object" && !enabled[event.server]) {
    return logger.debug(
      `[${server.name}] Skipping ${killType} event ${event.EventId} to "${guild.name}" because disabled.`,
      logMeta,
    );
  }

  let channel = setting.channel;
  if (type === "kills" || type === "deaths") {
    if (good) channel = (tracked.kills && tracked.kills.channel) || channel;
    else channel = (tracked.deaths && tracked.deaths.channel) || channel;
  } else if (type === "juicy") {
    channel = setting[juicy].channel;
  }

  if (!channel) {
    return logger.debug(
      `[${server.name}] Skipping ${killType} event ${event.EventId} to "${guild.name}" because channel not set.`,
      logMeta,
    );
  }

  logger.info(`[${server.name}] Sending ${killType} event ${event.EventId} to "${guild.name}".`, logMeta);

  if (mode === REPORT_MODES.IMAGE) {
    const inventory = event.Victim.Inventory.filter((i) => i != null);
    const hasInventory = inventory.length > 0;
    const eventImage = await generateEventImage(event, { showAttunement, splitLootValue });
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
      const inventoryImage = await generateInventoryImage(event, { splitLootValue });
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
    await sendNotification(client, channel, embedEvent(event, { locale, guildTags, providerId }));
  }
};

async function subscribe(client) {
  const cb = async (event) => {
    const server = getServerById(event.server);
    if (!server) throw new Error(`Albion Server not found: ${event.server}`);

    logger.debug(`[${server.name}] Processing event: ${event.EventId}`, {
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
            `[${server.name}] Skipping event ${event.EventId} to "${guild.name}" because settings/track/limits not found.`,
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
        if (event.juicy && settings.juicy.enabled[event.server]) {
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
      logger.error(`[${server.name}] Error processing event ${event.EventId}: ${error.message}\n${error.stack}`, {
        error,
      });
    }

    return true;
  };

  const batchCb = async (events) => {
    if (!Array.isArray(events) || events.length === 0) return true;
    const server = getServerById(events[0].server);
    if (!server) throw new Error(`Albion Server not found: ${events[0].server}`);

    logger.verbose(`[${server.name}] Processing ${events.length} events.`, {
      server,
      events: events.length,
      guilds: client.guilds.cache.size,
    });

    for (const event of events) {
      await cb(event);
    }

    logger.debug(`[${server.name}] Process events complete.`);
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
