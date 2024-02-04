const logger = require("../../../helpers/logger");
const { deleteRankingsEmpty } = require("../../../services/rankings");
const { runInterval } = require("../../../helpers/scheduler");
const { HOUR } = require("../../../helpers/constants");

async function init() {
  runInterval("Clear rankings", clearRankings, { interval: HOUR, runOnStart: true });
}

async function clearRankings() {
  logger.verbose(`Clearing rankings with empty scores.`);
  await deleteRankingsEmpty();
}

module.exports = {
  name: "rankings",
  init,
};
