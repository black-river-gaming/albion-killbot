const config = require("config");

const { SERVERS, MINUTE } = require("../../../helpers/constants");
const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/scheduler");

const battlesService = require("../../../services/battles");

const serverData = {
  [SERVERS.WEST]: {
    latestBattleId: null,
  },
  [SERVERS.EAST]: {
    latestBattleId: null,
  },
};

async function fetchBattles(server) {
  const { latestBattleId } = serverData[server];

  if (!latestBattleId) {
    logger.info(`[${server}] Retrieving first batch of battles.`, { server });
  } else {
    logger.info(`[${server}] Fetching Albion Online battles from API up to battle ${latestBattleId}.`, {
      server,
      latestBattleId,
    });
  }

  const battles = await battlesService.fetchBattlesTo(latestBattleId, { server });
  if (battles.length === 0) return logger.verbose(`[${server}] No new battles.`, { server });

  const battlesToPublish = [];
  for (const batl of battles.sort((a, b) => a.id - b.id)) {
    if (latestBattleId && batl.id <= latestBattleId) {
      logger.warn(`[${server}] The published id is lower than latestBattle! Skipping.`, {
        battleId: batl.id,
        latestBattleId,
        server,
      });
      continue;
    }

    if (!config.get("amqp.battles.batch")) await battlesService.publishBattle(batl);

    battlesToPublish.push(batl);
    serverData[server].latestBattleId = batl.id;
  }

  if (battlesToPublish.length > 0) {
    if (config.get("amqp.battles.batch")) await battlesService.publishBattle(battlesToPublish);

    logger.verbose(`[${server}] Published ${battlesToPublish.length} battles.`, {
      server,
      length: battlesToPublish.length,
      battleIds: battlesToPublish.map((battle) => battle.id),
    });
  }
}

const init = async () => {
  if (config.get("crawler.battles.west")) {
    runInterval("Fetch battles for west server", fetchBattles, {
      interval: 2 * MINUTE,
      runOnStart: true,
      fnOpts: [SERVERS.WEST],
    });
  }
  if (config.get("crawler.battles.east")) {
    runInterval("Fetch battles for east server", fetchBattles, {
      interval: 2 * MINUTE,
      runOnStart: true,
      fnOpts: [SERVERS.EAST],
    });
  }
};

module.exports = {
  name: "battles",
  init,
};
