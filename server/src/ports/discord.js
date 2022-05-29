const discordApiClient = require("../adapters/discordApiClient");

async function getToken(code) {
  return await discordApiClient.exchangeCode(code);
}

module.exports = {
  getToken,
};
