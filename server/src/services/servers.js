const discord = require("../ports/discord");
const logger = require("../helpers/logger");

async function getBotServers() {
  try {
    const servers = await discord.getBotGuilds();
    return servers;
  } catch (error) {
    logger.error(`Error while retrieving bot servers: ${error.message}`, { error });
    throw error;
  }
}

async function getServers(accessToken) {
  try {
    const botServerIds = (await discord.getBotGuilds()).map((s) => s.id);
    const servers = await discord.getUserGuilds(accessToken);

    return servers
      .filter((server) => server.owner || server.admin)
      .map((server) => {
        server.bot = botServerIds.indexOf(server.id) >= 0;
        return server;
      });
  } catch (e) {
    logger.error(`Error while retrieving user guilds:`, e);
    throw e;
  }
}

async function getServer(serverId) {
  try {
    return await discord.getGuild(serverId);
  } catch (error) {
    logger.error(`Error while retrieving discord server: ${error.message}`, { error });
    throw error;
  }
}

async function getServerChannels(serverId) {
  try {
    return await discord.getGuildChannels(serverId);
  } catch (error) {
    logger.error(`Error while retrieving discord channels: ${error.message}`, { error });
    throw error;
  }
}

async function leaveServer(serverId) {
  try {
    return await discord.leaveGuild(serverId);
  } catch (error) {
    logger.error(`Error while leaving discord server: ${error.message}`, { error });
    throw error;
  }
}

module.exports = {
  getBotServers,
  getServer,
  getServerChannels,
  getServers,
  leaveServer,
};
