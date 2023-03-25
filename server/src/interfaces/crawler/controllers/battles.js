const { SECOND, SERVERS } = require("../../../helpers/constants");
const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/scheduler");

const { fetchBattlesTo, publishBattle } = require("../../../services/battles");

const { AMQP_QUEUE_BATTLES_BATCH } = process.env;

const latestBattle = {
  [SERVERS.WEST]: null,
  [SERVERS.EAST]: null,
};

async function fetchBattles(server) {
  if (!latestBattle[server]) {
    logger.info(`[${server}] Retrieving first batch of battles.`);
  } else {
    logger.info(`[${server}] Fetching Albion Online battles from API up to battle ${latestBattle[server].id}.`);
  }

  const battles = await fetchBattlesTo(latestBattle[server], { server });
  if (battles.length === 0) return logger.verbose(`[${server}] No new battles.`);

  // Publish new battles, from oldest to newest
  const battlesToPublish = [];
  logger.verbose(`[${server}] Publishing ${battles.length} new battles to exchange...`);
  for (const batl of battles) {
    if (latestBattle[server] && batl.id <= latestBattle[server].id) {
      logger.warn(`[${server}] The published id is lower than latestBattle! Skipping.`, {
        latestBattleId: latestBattle[server].id,
        battleId: batl.id,
        server,
      });
      continue;
    }

    if (!AMQP_QUEUE_BATTLES_BATCH) {
      logger.debug(`[${server}] Publishing battle ${batl.id}`);
      await publishBattle(batl);
    } else {
      battlesToPublish.push(batl);
    }

    latestBattle[server] = batl;
  }

  // Batch publish
  if (AMQP_QUEUE_BATTLES_BATCH) {
    await publishBattle(battlesToPublish);
  }

  logger.info(`[${server}] Publish battles complete.`);
}

const init = async () => {
  runInterval("Fetch battles for west server", fetchBattles, {
    interval: 61 * SECOND,
    runOnStart: true,
    fnOpts: [SERVERS.WEST],
  });
  runInterval("Fetch battles for east server", fetchBattles, {
    interval: 61 * SECOND,
    runOnStart: true,
    fnOpts: [SERVERS.EAST],
  });
};

module.exports = {
  name: "battles",
  init,
};
