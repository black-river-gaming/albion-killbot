const logger = require("../../../helpers/logger");
const { fetchBattlesTo, publishBattle } = require("../../../services/battles");

const { AMQP_QUEUE_BATTLES_BATCH } = process.env;

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
  const battlesToPublish = [];
  logger.verbose(`Publishing ${battles.length} new battles to exchange...`);
  for (const batl of battles) {
    if (latestBattle && batl.id <= latestBattle.id) {
      logger.warn(`The published id is lower than latestBattle! Skipping.`);
      continue;
    }

    if (!AMQP_QUEUE_BATTLES_BATCH) {
      logger.debug(`Publishing battle ${batl.id}`);
      await publishBattle(batl);
    } else {
      battlesToPublish.push(batl);
    }

    latestBattle = batl;
  }

  // Batch publish
  if (AMQP_QUEUE_BATTLES_BATCH) {
    await publishBattle(battlesToPublish);
  }

  logger.info("Publish battles complete.");
}

module.exports = {
  fetchBattles,
};
