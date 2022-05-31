const discordApiClient = require("../adapters/discordApiClient");

const { DISCORD_TOKEN } = process.env;

async function getToken(code) {
  return await discordApiClient.exchangeCode(code);
}

async function refreshToken(refreshToken) {
  return await discordApiClient.refreshToken(refreshToken);
}

async function getMe(accessToken) {
  return await discordApiClient.getMe(`Bearer ${accessToken}`);
}

async function getMeGuilds(accessToken) {
  return await discordApiClient.getMeGuilds(`Bearer ${accessToken}`);
}

async function getBotGuilds() {
  return await discordApiClient.getMeGuilds(`Bot ${DISCORD_TOKEN}`);
}

module.exports = {
  getBotGuilds,
  getMe,
  getMeGuilds,
  getToken,
  refreshToken,
};
