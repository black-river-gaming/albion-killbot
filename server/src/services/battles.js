const { getBattles } = require("../adapters/albionApiClient");
const logger = require("../helpers/logger");
const { publishBattle } = require("../helpers/queue");
const { sleep } = require("../helpers/utils");

async function fetchBattlesTo(latestBattle, { offset = 0 } = {}, battles = []) {
  // Maximum offset reached, just return what we have
  if (offset >= 1000) return battles;

  try {
    // If not latestBattle, just fetch a single one to create a reference
    if (!latestBattle) {
      return await getBattles({
        limit: 1,
      });
    }

    logger.debug(`Fetching battles with offset: ${offset}`);
    const albionBattles = await getBattles({
      offset,
    });

    const foundLatest = !albionBattles.every((batl) => {
      if (batl.id <= latestBattle.id) return false;
      // Ignore items already on the queue
      if (battles.findIndex((e) => e.EventId === batl.EventId) >= 0) return true;
      battles.push(batl);
      return true;
    });

    return foundLatest
      ? battles.sort((a, b) => a.id - b.id)
      : fetchBattlesTo(latestBattle, { offset: offset + albionBattles.length }, battles);
  } catch (err) {
    logger.error(`Unable to fetch battle data from API [${err}]. Retrying...`);
    await sleep(5000);
    return fetchBattlesTo(latestBattle, { offset }, battles);
  }
}

async function publishBattleToExchange(event) {
  return await publishBattle(event);
}

module.exports = {
  fetchBattlesTo,
  publishBattleToExchange,
};
