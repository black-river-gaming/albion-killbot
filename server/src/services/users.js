const discord = require("../ports/discord");
const logger = require("../helpers/logger");

async function getCurrentUser(accessToken) {
  try {
    return await discord.getUser(accessToken);
  } catch (e) {
    logger.error(`Error while retrieving user profile:`, e);
    throw e;
  }
}

module.exports = {
  getCurrentUser,
};
