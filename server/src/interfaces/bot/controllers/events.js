const logger = require("../../../helpers/logger");
const { getTrackedEvent } = require("../../../helpers/tracking");

const { subscribeEvents } = require("../../../services/events");
const { generateEventImage, generateInventoryImage } = require("../../../services/images");
const { getSettingsForServer, REPORT_MODES } = require("../../../services/settings");
const { addRankingKill } = require("../../../services/rankings");
const { getTrackForServer } = require("../../../services/track");

const { embedEvent, embedEventImage, embedEventInventoryImage } = require("../../../helpers/embeds");

const { sendNotification } = require("./notifications");

async function subscribe(client) {
  const cb = async (event) => {
    logger.debug(`Received event: ${event.EventId}`);

    try {
      // TODO: This chunk repeat a lot. Find a way to componentize
      const settingsByGuild = await getSettingsForServer(client.guilds.cache);
      const trackByGuild = await getTrackForServer(client.guilds.cache);

      for (const guild of client.guilds.cache.values()) {
        if (!settingsByGuild[guild.id]) continue;
        guild.settings = settingsByGuild[guild.id];

        const guildEvent = getTrackedEvent(event, trackByGuild[guild.id]);
        if (!guildEvent) continue;

        const { enabled, channel, mode } = guildEvent.good ? guild.settings.kills : guild.settings.deaths;
        if (!enabled || !channel) {
          logger.verbose(
            `Skipping sending ${guildEvent.good ? "kill" : "death"} event ${event.EventId} to "${
              guild.name
            }" (disabled or no channel).`,
          );
          continue;
        }

        addRankingKill(guild.id, guildEvent, trackByGuild[guild.id]);

        logger.info(`Sending  ${guildEvent.good ? "kill" : "death"} event ${event.EventId} to "${guild.name}".`);
        const locale = guild.settings.lang;

        if (mode === REPORT_MODES.IMAGE) {
          const inventory = guildEvent.Victim.Inventory.filter((i) => i != null);
          const eventImage = await generateEventImage(guildEvent, guild.settings.lang);
          await sendNotification(
            client,
            channel,
            embedEventImage(guildEvent, eventImage, {
              locale,
            }),
          );
          if (inventory.length > 0) {
            const inventoryImage = await generateInventoryImage(inventory, guild.settings.lang);
            await sendNotification(
              client,
              channel,
              embedEventInventoryImage(guildEvent, inventoryImage, {
                locale,
              }),
            );
          }
        } else if (mode === REPORT_MODES.TEXT) {
          await sendNotification(client, channel, embedEvent(guildEvent, { locale: guild.settings.lang }));
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
