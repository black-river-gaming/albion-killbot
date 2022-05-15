const axios = require("axios");
const moment = require("moment");
const logger = require("../logger")("queries.battles");
const queue = require("../queue");
const { sleep, timeout } = require("../utils");
const { getConfigByGuild } = require("../config");
const { embedBattle } = require("../messages");

const BATTLES_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/battles";
const BATTLES_LIMIT = 51;
const BATTLES_SORT = "recent";
const EXCHANGE = "battles";
const PREFETCH_COUNT = Number(process.env.AMQP_PREFETCH_COUNT) || 5;

const getTrackedBattle = (battle, { trackedPlayers, trackedGuilds, trackedAlliances }) => {
  if (trackedPlayers.length === 0 && trackedGuilds.length === 0 && trackedAlliances.length === 0) {
    return null;
  }

  const playerIds = trackedPlayers.map((t) => t.id);
  const guildIds = trackedGuilds.map((t) => t.id);
  const allianceIds = trackedAlliances.map((t) => t.id);

  // Ignore battles without fame
  if (battle.totalFame <= 0) {
    return;
  }

  // Check for tracked ids in players, guilds and alliances
  // Since we are parsing from newer to older events we need to use a FILO array
  const hasTrackedPlayer = Object.keys(battle.players || {}).some((id) => playerIds.indexOf(id) >= 0);
  const hasTrackedGuild = Object.keys(battle.guilds || {}).some((id) => guildIds.indexOf(id) >= 0);
  const hasTrackedAlliance = Object.keys(battle.alliances || {}).some((id) => allianceIds.indexOf(id) >= 0);
  if (hasTrackedPlayer || hasTrackedGuild || hasTrackedAlliance) {
    return battle;
  }
  return null;
};

exports.subscribe = async ({ client, sendGuildMessage }) => {
  // Set consume callback
  const cb = async (msg) => {
    const btl = JSON.parse(msg.content.toString());
    if (!btl) {
      return;
    }

    try {
      const allGuildConfigs = await getConfigByGuild(client.guilds.cache.array());
      for (const guild of client.guilds.cache.array()) {
        guild.config = allGuildConfigs[guild.id];
        if (!guild.config) continue;
        const battle = getTrackedBattle(btl, guild.config);
        if (!battle) continue;

        logger.info(`[Shard #${client.shardId}] Sending battle ${battle.id} to guild "${guild.name}".`);

        try {
          await timeout(sendGuildMessage(guild, embedBattle(battle, guild.config.lang), "battles"), 7000);
        } catch (e) {
          logger.error(`[Shard #${client.shardId}] Error while sending battle ${battle.id} [${e}]`);
        }
      }
    } catch (e) {
      logger.error(`[Shard #${client.shardId}] Error while processing battle ${btl.id} [${e}]`);
    }

    return true;
  };

  await queue.subscribe(EXCHANGE, `${EXCHANGE}-${client.shardId}`, cb, {
    prefetch: PREFETCH_COUNT,
  });
  logger.info(`[#${client.shardId}] Subscribed to battles queue.`);
};
