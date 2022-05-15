const logger = require("../helpers/logger");
const queue = require("../queue");
const { timeout } = require("../../helpers/utils");
const { getConfigByGuild } = require("../config");
const { embedEvent, embedEventAsImage, embedInventoryAsImage } = require("../messages");
const dailyRanking = require("./dailyRanking");

const EXCHANGE = "events";
const PREFETCH_COUNT = 1;

const getTrackedEvent = (event, { trackedPlayers, trackedGuilds, trackedAlliances }) => {
  if (trackedPlayers.length === 0 && trackedGuilds.length === 0 && trackedAlliances.length === 0) {
    return null;
  }

  const playerIds = trackedPlayers.map((t) => t.id);
  const guildIds = trackedGuilds.map((t) => t.id);
  const allianceIds = trackedAlliances.map((t) => t.id);

  // Ignore Arena kills or Duel kills
  if (event.TotalVictimKillFame <= 0) {
    return;
  }

  // Check for kill in event.Killer / event.Victim for anything tracked
  // Since we are parsing from newer to older events
  // we need to use FILO array
  const goodEvent =
    allianceIds.indexOf(event.Killer.AllianceId) >= 0 ||
    guildIds.indexOf(event.Killer.GuildId) >= 0 ||
    playerIds.indexOf(event.Killer.Id) >= 0;
  const badEvent =
    allianceIds.indexOf(event.Victim.AllianceId) >= 0 ||
    guildIds.indexOf(event.Victim.GuildId) >= 0 ||
    playerIds.indexOf(event.Victim.Id) >= 0;
  if (goodEvent || badEvent) {
    // We need to create a new object here for every guild
    return Object.assign({}, event, { good: goodEvent });
  }
  return null;
};

exports.subscribe = async ({ client, sendGuildMessage }) => {
  // Set consume callback
  const cb = async (msg) => {
    const evt = JSON.parse(msg.content.toString());
    if (!evt) {
      return;
    }

    try {
      const allGuildConfigs = await getConfigByGuild(client.guilds.cache.array());
      for (const guild of client.guilds.cache.array()) {
        guild.config = allGuildConfigs[guild.id];
        if (!guild.config) continue;
        const event = getTrackedEvent(evt, guild.config);
        if (!event) continue;

        logger.info(`[Shard #${client.shardId}] Sending event ${event.EventId} to guild "${guild.name}".`);
        dailyRanking.add(guild, event, guild.config);
        const mode = guild.config.mode;
        const hasInventory = event.Victim.Inventory.filter((i) => i != null).length > 0;

        try {
          if (mode === "image") {
            const killImage = await embedEventAsImage(event, guild.config.lang);
            await timeout(sendGuildMessage(guild, killImage, "events"), 10000);
            if (hasInventory) {
              const inventoryImage = await embedInventoryAsImage(event, guild.config.lang);
              await timeout(sendGuildMessage(guild, inventoryImage, "events"), 10000);
            }
          } else {
            await timeout(sendGuildMessage(guild, embedEvent(event, guild.config.lang), "events"), 10000);
          }
        } catch (e) {
          logger.error(`[Shard #${client.shardId}] Error while sending event ${event.EventId} [${e}]`);
        }
      }
    } catch (e) {
      logger.error(`[Shard #${client.shardId}] Error processing event ${evt.EventId} [${e}]`);
    }

    return true;
  };

  await queue.subscribe(EXCHANGE, `${EXCHANGE}-${client.shardId}`, cb, {
    prefetch: PREFETCH_COUNT,
  });
  logger.info(`[#${client.shardId}] Subscribed to events queue.`);
};
