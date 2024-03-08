const config = require("config");

const { SERVER_LIST } = require("../../../helpers/albion");
const { MINUTE } = require("../../../helpers/constants");
const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/scheduler");

const battlesService = require("../../../services/battles");

const serverData = {};
for (const server of SERVER_LIST) {
  serverData[server.id] = {
    latestBattleId: null,
  };
}

async function fetchBattles(server) {
  const { latestBattleId } = serverData[server.id];

  if (!latestBattleId) {
    logger.info(`[${server.name}] Retrieving first batch of battles.`, { server });
  } else {
    logger.info(`[${server.name}] Fetching Albion Online battles from API up to battle ${latestBattleId}.`, {
      server,
      latestBattleId,
    });
  }

  const battles = await battlesService.fetchBattlesTo(latestBattleId, { server });
  if (battles.length === 0) return logger.verbose(`[${server.name}] No new battles.`, { server });

  const battlesToPublish = [];
  for (const batl of battles.sort((a, b) => a.id - b.id)) {
    if (latestBattleId && batl.id <= latestBattleId) {
      logger.warn(`[${server.name}] The published id is lower than latestBattle! Skipping.`, {
        battleId: batl.id,
        latestBattleId,
        server,
      });
      continue;
    }

    if (!config.get("amqp.battles.batch")) await battlesService.publishBattle(batl);

    battlesToPublish.push(batl);
    serverData[server.id].latestBattleId = batl.id;
  }

  if (battlesToPublish.length > 0) {
    if (config.get("amqp.battles.batch")) await battlesService.publishBattle(battlesToPublish);

    logger.verbose(`[${server.name}] Published ${battlesToPublish.length} battles.`, {
      server,
      length: battlesToPublish.length,
      battleIds: battlesToPublish.map((battle) => battle.id),
    });
  }
}

const init = async () => {
  for (const server of SERVER_LIST) {
    const configKey = `crawler.battles.${server.id}`;
    if (config.has(configKey) && config.get(configKey)) {
      runInterval(`[${server.name}] Fetch battles`, fetchBattles, {
        interval: 2 * MINUTE,
        runOnStart: true,
        fnOpts: [server],
      });
    }
  }
};

module.exports = {
  name: "battles",
  init,
};
