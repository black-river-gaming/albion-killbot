const discordApiClient = require("../adapters/discordApiClient");

async function getToken(code) {
  return await discordApiClient.exchangeCode(code);
}

async function refreshToken(refreshToken) {
  return await discordApiClient.refreshToken(refreshToken);
}

module.exports = {
  getToken,
  refreshToken,
};
