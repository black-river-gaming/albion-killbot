const logger = require("../../../helpers/logger");
const { getTrackedEvent } = require("../../../helpers/tracking");
const { embedEvent, embedEventImage, embedEventInventoryImage } = require("../../../helpers/embeds");

const { subscribeEvents } = require("../../../services/events");
const { generateEventImage, generateInventoryImage } = require("../../../services/images");
const { REPORT_MODES, getSettings } = require("../../../services/settings");
const { addRankingKill } = require("../../../services/rankings");
const { getTrack } = require("../../../services/track");
const { getLimits } = require("../../../services/limits");

const { sendNotification } = require("./notifications");

async function subscribe(client) {
  const cb = async (event) => {
    logger.debug(`Received event: ${event.EventId}`);

    try {
      for (const guild of client.guilds.cache.values()) {
        const settings = await getSettings(guild.id);
        const track = await getTrack(guild.id);
        const limits = await getLimits(guild.id);
        if (!settings || !track || !limits) continue;

        const guildEvent = getTrackedEvent(event, track, limits);
        if (!guildEvent) continue;

        const { enabled, channel, mode } = guildEvent.good ? settings.kills : settings.deaths;
        if (!enabled || !channel) {
          logger.verbose(
            `Skipping sending ${guildEvent.good ? "kill" : "death"} event ${event.EventId} to "${
              guild.name
            }" (disabled or no channel).`,
            { settings, track },
          );
          continue;
        }

        addRankingKill(guild.id, guildEvent);

        logger.info(`Sending ${guildEvent.good ? "kill" : "death"} event ${event.EventId} to "${guild.name}".`, {
          metadata: {
            settings,
            track,
            limits,
          },
        });
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
      logger.error(`Error processing event ${event.EventId}: ${error.message}`, { error });
      logger.error(error);
    }

    return true;
  };

  return await subscribeEvents(cb);
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
