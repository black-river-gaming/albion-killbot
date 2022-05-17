const logger = require("../../../helpers/logger");
const { fetchBattlesTo, publishBattle } = require("../../../services/battles");

let latestBattle;

async function fetchBattles() {
  if (!latestBattle) {
    logger.info("Retrieving first batch of battles.");
  } else {
    logger.info(`Fetching Albion Online battles from API up to battle ${latestBattle.id}.`);
  }

  const battles = await fetchBattlesTo(latestBattle);
  if (battles.length === 0) return logger.verbose("No new battles.");

  // Publish new battles, from oldest to newest
  logger.verbose(`Publishing ${battles.length} new battles to exchange...`);
  for (const batl of battles) {
    if (latestBattle && batl.id <= latestBattle.id) {
      logger.warn(`The published id is lower than latestBattle! Skipping.`);
      continue;
    }
    logger.debug(`Publishing battle ${batl.id}`);
    await publishBattle(batl);
    latestBattle = batl;
  }
  logger.info("Publish battles complete.");
}

module.exports = {
  fetchBattles,
};
