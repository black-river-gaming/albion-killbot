const discord = require("../ports/discord");
const logger = require("../helpers/logger");

async function getBotServers({ limit = 200, after, before }) {
  try {
    const servers = await discord.getBotGuilds({ limit, after, before });
    return servers;
  } catch (error) {
    logger.error(`Error while retrieving bot servers: ${error.message}`, { error });
    throw error;
  }
}

async function getServers(accessToken) {
  try {
    // FIXME: This will not account for all bot servers once we get past 200+ servers
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
    const guild = await discord.getGuild(serverId);
    const channels = await discord.getGuildChannels(serverId);

    guild.channels = channels;

    return guild;
  } catch (e) {
    logger.error(`Error while retrieving discord server:`, e);
    throw e;
  }
}

module.exports = {
  getBotServers,
  getServer,
  getServers,
};
