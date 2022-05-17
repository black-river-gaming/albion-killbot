const logger = require("../../../helpers/logger");
const { subscribeEvents } = require("../../../services/events");
const { generateEventImage, generateInventoryImage } = require("../../../services/images");
const { getSettingsByGuild, REPORT_MODES } = require("../../../services/settings");

const { embedEvent, embedEventImage, embedEventInventoryImage } = require("../helpers/messages");

const { sendNotification } = require("./notifications");
// const dailyRanking = require("./dailyRanking");

// This method checks if an event is tracked by a discord server
// and flags it as a good event (killed is tracked) or bad event (victim is tracker)
// and returns a copy of it or null if the event is not tracked at all
function checkTrackedEvent(event, { players, guilds, alliances }) {
  if (players.length === 0 && guilds.length === 0 && alliances.length === 0) {
    return null;
  }

  const playerIds = players.map((t) => t.id);
  const guildIds = guilds.map((t) => t.id);
  const allianceIds = alliances.map((t) => t.id);

  // Ignore Arena kills or Duel kills
  if (event.TotalVictimKillFame <= 0) {
    return null;
  }

  // Check for kill in event.Killer / event.Victim for anything tracked
  const goodEvent =
    allianceIds.indexOf(event.Killer.AllianceId) >= 0 ||
    guildIds.indexOf(event.Killer.GuildId) >= 0 ||
    playerIds.indexOf(event.Killer.Id) >= 0;
  const badEvent =
    allianceIds.indexOf(event.Victim.AllianceId) >= 0 ||
    guildIds.indexOf(event.Victim.GuildId) >= 0 ||
    playerIds.indexOf(event.Victim.Id) >= 0;
  if (goodEvent || badEvent) {
    // We need to create a new object here so we don't change the original event
    return Object.assign({}, event, { good: goodEvent });
  }

  return null;
}

async function subscribe(client) {
  const { shardId } = client;

  const cb = async (event) => {
    logger.debug(`Received event: ${event.EventId}`);

    try {
      const settingsByGuild = await getSettingsByGuild(client.guilds.cache);

      for (const guild of client.guilds.cache.values()) {
        if (!settingsByGuild[guild.id]) continue;

        guild.settings = settingsByGuild[guild.id];

        const guildEvent = checkTrackedEvent(event, guild.settings.track);
        if (!guildEvent) continue;
        //     dailyRanking.add(guild, event, guild.config);

        const { enabled, channel, mode } = guild.settings.kills;
        if (!enabled || !channel) continue;

        logger.info(`[#${shardId}] Sending event ${event.EventId} to "${guild.name}".`);
        const locale = guild.settings.lang;

        if (mode === REPORT_MODES.IMAGE) {
          const hasInventory = event.Victim.Inventory.filter((i) => i != null).length > 0;
          const eventImage = await generateEventImage(event, guild.settings.lang);
          await sendNotification(
            client,
            channel,
            embedEventImage(event, eventImage, {
              locale,
            }),
          );
          if (hasInventory) {
            const inventoryImage = await generateInventoryImage(event.Victim.Inventory, guild.settings.lang);
            await sendNotification(
              client,
              channel,
              embedEventInventoryImage(event, inventoryImage, {
                locale,
              }),
            );
          }
        } else if (mode === REPORT_MODES.TEXT) {
          await sendNotification(client, channel, embedEvent(event, { locale: guild.settings.lang }));
        }
      }
    } catch (e) {
      logger.error(`[#${shardId}] Error processing event ${event.EventId}:`, e);
    }

    return true;
  };

  return await subscribeEvents(shardId, cb);
}

module.exports = {
  checkTrackedEvent,
  subscribe,
};
