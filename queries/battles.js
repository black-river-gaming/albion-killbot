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
const PREFETCH_COUNT = Number(process.env.PREFETCH_COUNT) || 5;
const QUEUE_MAX_LENGTH  = Number(process.env.AMQP_QUEUE_MAX_LENGTH) || 10000;

let latestBattle;

exports.get = async () => {
  const logger = require("../logger")("queries.battles.get");

  const isFirstBattle = !latestBattle;
  const fetchBattlesTo = async (latestBattle, offset = 0, battles = []) => {
    // First time loading, fast return so we start recording from now
    if (isFirstBattle && battles.length > 0) return battles;
    // Maximum offset reached, just return what we have
    if (offset >= 1000) return battles;

    try {
      logger.debug(`Fetching battles with offset: ${offset}`);
      const res = await axios.get(BATTLES_ENDPOINT, {
        params: {
          offset,
          limit: isFirstBattle ? 1 : BATTLES_LIMIT,
          sort: BATTLES_SORT,
          timestamp: moment().unix(),
        },
        timeout: 60000,
      });
      const foundLatest = !res.data.every(battle => {
        if (battle.id <= latestBattle.id) return false;
        battles.push(battle);
        return true;
      });
      return foundLatest ? battles : fetchBattlesTo(latestBattle, offset + BATTLES_LIMIT, battles);
    } catch (err) {
      logger.error(`Unable to fetch battle data from API [${err}].`);
      await sleep(5000);
      return fetchBattlesTo(latestBattle, offset, battles);
    }
  };

  if (!latestBattle) {
    logger.info("No latest battle found. Retrieving first battles.");
    latestBattle = { id: 0 };
  } else {
    logger.info(`Fetching Albion Online battles from API up to battle ${latestBattle.id}.`);
  }

  // Fetch new battles
  const battles = await fetchBattlesTo(latestBattle);
  if (battles.length === 0) return logger.debug("No new battles.");

  for (const battle of battles.reverse()) {
    await queue.publish(EXCHANGE, "", battle);
    latestBattle = battle;
  }
};

const getTrackedBattle = (battle, { trackedPlayers, trackedGuilds, trackedAlliances }) => {
  if (trackedPlayers.length === 0 && trackedGuilds.length === 0 && trackedAlliances.length === 0) {
    return null;
  }

  const playerIds = trackedPlayers.map(t => t.id);
  const guildIds = trackedGuilds.map(t => t.id);
  const allianceIds = trackedAlliances.map(t => t.id);

  // Ignore battles without fame
  if (battle.totalFame <= 0) {
    return;
  }

  // Check for tracked ids in players, guilds and alliances
  // Since we are parsing from newer to older events we need to use a FILO array
  const hasTrackedPlayer = Object.keys(battle.players || {}).some(id => playerIds.indexOf(id) >= 0);
  const hasTrackedGuild = Object.keys(battle.guilds || {}).some(id => guildIds.indexOf(id) >= 0);
  const hasTrackedAlliance = Object.keys(battle.alliances || {}).some(id => allianceIds.indexOf(id) >= 0);
  if (hasTrackedPlayer || hasTrackedGuild || hasTrackedAlliance) {
    return battle;
  }
  return null;
};

exports.subscribe = async ({ client, sendGuildMessage }) => {
  const subChannel = await queue.assertChannel("subscribe", PREFETCH_COUNT);

  // Set consume callback
  const cb = async (msg) => {
    const btl = JSON.parse(msg.content.toString());
    if (!btl) { return; }

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

    subChannel.ack(msg);
  };

  // Assert exchange
  await subChannel.assertExchange(EXCHANGE, "fanout", {
    durable: false,
  });

  // Consume battles as they come
  const q = await subChannel.assertQueue(`${EXCHANGE}-${client.shardId}`, {
    exclusive: true,
    durable: false,
    "x-queue-type": "classic",
    maxLength: QUEUE_MAX_LENGTH,
  });
  await subChannel.bindQueue(q.queue, EXCHANGE, "");
  logger.info(`[#${client.shardId}] Subscribed to battle queue.`);
  await subChannel.consume(q.queue, cb);
};
