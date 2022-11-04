const logger = require("../../../helpers/logger");

const { subscribeEvents } = require("../../../services/events");
const { generateEventImage, generateInventoryImage } = require("../../../services/images");
const { REPORT_MODES, getSettings } = require("../../../services/settings");
const { addRankingKill } = require("../../../services/rankings");
const { getTrack } = require("../../../services/track");

const { getTrackedEvent } = require("../../../helpers/tracking");
const { embedEvent, embedEventImage, embedEventInventoryImage } = require("../../../helpers/embeds");

const { sendNotification } = require("./notifications");

async function subscribe(client) {
  const cb = async (event) => {
    logger.debug(`Received event: ${event.EventId}`);

    try {
      for (const guild of client.guilds.cache.values()) {
        const settings = await getSettings(guild.id);
        const track = await getTrack(guild.id);
        if (!settings || !track) continue;

        const guildEvent = getTrackedEvent(event, track);
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

        addRankingKill(guild.id, guildEvent, track.guilds[guild.id]);

        logger.info(`Sending  ${guildEvent.good ? "kill" : "death"} event ${event.EventId} to "${guild.name}".`, {
          settings,
          track,
        });
        const locale = settings.lang;

        if (mode === REPORT_MODES.IMAGE) {
          const inventory = guildEvent.Victim.Inventory.filter((i) => i != null);
          const eventImage = await generateEventImage(guildEvent, settings.lang);
          await sendNotification(
            client,
            channel,
            embedEventImage(guildEvent, eventImage, {
              locale,
            }),
          );
          if (inventory.length > 0) {
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
    } catch (e) {
      logger.error(`Error processing event ${event.EventId}:`, e);
    }

    return true;
  };

  return await subscribeEvents(process.env.SHARD, cb);
}

module.exports = {
  subscribe,
};
