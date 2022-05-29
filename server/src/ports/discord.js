const discordApiClient = require("../adapters/discordApiClient");
const logger = require("../helpers/logger");

async function getToken(code) {
  try {
    return await discordApiClient.exchangeCode(code);
  } catch (e) {
    logger.error(`Error while retrieving discord token:`, e);
    throw e;
  }
}

async function refreshToken(refreshToken) {
  try {
    return await discordApiClient.refreshToken(refreshToken);
  } catch (e) {
    logger.error(`Error while refreshing discord token:`, e);
    throw e;
  }
}

async function getMe(accessToken) {
  try {
    return await discordApiClient.getMe(accessToken);
  } catch (e) {
    logger.error(`Error while getting user profile:`, e);
    console.log(e.config);
    throw e;
  }
}

module.exports = {
  getMe,
  getToken,
  refreshToken,
};
