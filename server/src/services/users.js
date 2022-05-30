const discord = require("../ports/discord");
const logger = require("../helpers/logger");

async function getCurrentUser(accessToken) {
  try {
    return await discord.getMe(accessToken);
  } catch (e) {
    logger.error(`Error while retrieving user profile:`, e);
    throw e;
  }
}

async function getCurrentUserServers(accessToken) {
  try {
    const botServerIds = (await discord.getBotGuilds()).map((s) => s.id);
    // TODO: Show servers where the user has Administrator permission
    const servers = (await discord.getMeGuilds(accessToken))
      .filter((server) => server.owner)
      .map((server) => {
        return {
          ...server,
          bot: botServerIds.indexOf(server.id) >= 0,
        };
      });
    return servers;
  } catch (e) {
    logger.error(`Error while retrieving user guilds:`, e);
    throw e;
  }
}

module.exports = {
  getCurrentUser,
  getCurrentUserServers,
};
