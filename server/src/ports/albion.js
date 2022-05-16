const albionApiClient = require("../adapters/albionApiClient");

async function getEvents(queryParams = {}) {
  return await albionApiClient.getEvents(queryParams);
}

async function getBattles(queryParams = {}) {
  return await albionApiClient.getBattles(queryParams);
}

module.exports = {
  getEvents,
  getBattles,
};
