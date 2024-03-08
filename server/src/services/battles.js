const crypto = require("crypto");
const albion = require("../ports/albion");
const { publish, subscribe } = require("../ports/queue");
const logger = require("../helpers/logger");
const { sleep } = require("../helpers/scheduler");

const BATTLES_EXCHANGE = "battles";
const BATTLES_QUEUE_PREFIX = "battles";

async function fetchBattlesTo(latestBattleId, { server, offset = 0, silent = false } = {}, battles = []) {
  // Maximum offset reached, just return what we have
  if (offset >= 1000) return battles;

  try {
    // If not latestBattle, just fetch a single one to create a reference
    if (!latestBattleId) {
      return await albion.getBattles({
        server,
        limit: 1,
      });
    }

    if (!silent) {
      logger.verbose(
        `[${server.name}] Fetching battles [offset: ${String(offset).padStart(
          3,
          "0",
        )}, latestBattleId: ${latestBattleId}]`,
        {
          server,
          offset,
          latestBattleId,
        },
      );
    }
    const albionBattles = await albion.getBattles({
      server,
      offset,
    });

    const foundLatest = !albionBattles.every((batl) => {
      if (batl.id <= latestBattleId) return false;
      // Ignore items already on the queue
      if (battles.findIndex((e) => e.id === batl.id) >= 0) return true;
      // Set battle server for later
      batl.server = server.id;
      battles.push(batl);
      return true;
    });

    return foundLatest
      ? battles
      : fetchBattlesTo(latestBattleId, { server, offset: offset + albionBattles.length, silent }, battles);
  } catch (error) {
    if (!silent) {
      logger.warn(`[${server.name}] Unable to fetch battle data from API [${error.message}]. Retrying...`, {
        server,
        error,
      });
    }
    await sleep(5000);
    return fetchBattlesTo(latestBattleId, { server, offset, silent }, battles);
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
