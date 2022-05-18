const albion = require("../ports/albion");
const logger = require("../helpers/logger");

async function getAlliance(allianceId) {
  try {
    logger.verbose(`Searching alliance: ${allianceId}`);
    return await albion.getAlliance(allianceId);
  } catch (e) {
    logger.error(`Failed to search entities in API:`, e);
    return null;
  }
}

async function search(q) {
  try {
    logger.verbose(`Searching entities in Albion Online for: ${q}`);
    return await albion.search(q);
  } catch (e) {
    logger.error(`Failed to search entities in API:`, e);
    return null;
  }
}

module.exports = {
  getAlliance,
  search,
};
