const { deleteRankingsEmpty } = require("../../../services/rankings");
const { runInterval } = require("../../../helpers/scheduler");
const { HOUR } = require("../../../helpers/constants");

async function init() {
  runInterval("Clear rankings", clearRankings, { interval: HOUR, runOnStart: true });
}

async function clearRankings() {
  await deleteRankingsEmpty();
}

module.exports = {
  name: "rankings",
  init,
};
