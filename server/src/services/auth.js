const discord = require("../ports/discord");
const logger = require("../helpers/logger");

async function auth(code) {
  try {
    return await discord.getToken(code);
  } catch (e) {
    logger.error(`Error while retrieving discord token:`, e);
    throw e;
  }
}

async function refresh(refreshToken) {
  try {
    return await discord.refreshToken(refreshToken);
  } catch (e) {
    logger.error(`Error while refreshing discord token:`, e);
    throw e;
  }
}

module.exports = {
  auth,
  refresh,
};
