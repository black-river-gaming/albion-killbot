const crypto = require("crypto");
const albion = require("../ports/albion");
const { publish, subscribe } = require("../ports/queue");
const logger = require("../helpers/logger");
const { sleep } = require("../helpers/scheduler");

const BATTLES_EXCHANGE = "battles";
const BATTLES_QUEUE_PREFIX = "battles";

async function fetchBattlesTo(latestBattle, { server, offset = 0 } = {}, battles = []) {
  // Maximum offset reached, just return what we have
  if (offset >= 1000) return battles;

  try {
    // If not latestBattle, just fetch a single one to create a reference
    if (!latestBattle) {
      return await albion.getBattles({
        server,
        limit: 1,
      });
    }

    logger.verbose(`[${server}] Fetching battles with offset: ${offset}`);
    const albionBattles = await albion.getBattles({
      server,
      offset,
    });

    const foundLatest = !albionBattles.every((batl) => {
      if (batl.id <= latestBattle.id) return false;
      // Ignore items already on the queue
      if (battles.findIndex((e) => e.id === batl.id) >= 0) return true;
      // Set battle server for later
      batl.server = server;
      battles.push(batl);
      return true;
    });

    return foundLatest
      ? battles.sort((a, b) => a.id - b.id)
      : fetchBattlesTo(latestBattle, { server, offset: offset + albionBattles.length }, battles);
  } catch (err) {
    logger.warn(`[${server}] Unable to fetch battle data from API [${err}]. Retrying...`);
    await sleep(5000);
    return fetchBattlesTo(latestBattle, { server, offset }, battles);
  }
}

async function publishBattle(battle) {
  return await publish(BATTLES_EXCHANGE, battle);
}

async function subscribeBattles(callback, { queue_suffix } = {}) {
  const queue = `${BATTLES_QUEUE_PREFIX}-${queue_suffix || crypto.randomUUID()}`;
  return await subscribe(BATTLES_EXCHANGE, queue, callback);
}

async function getBattle(battleId, { server }) {
  return await albion.getBattle(battleId, { server });
}

module.exports = {
  fetchBattlesTo,
  publishBattle,
  subscribeBattles,
  getBattle,
};
