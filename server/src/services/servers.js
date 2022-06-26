const discord = require("../ports/discord");
const logger = require("../helpers/logger");

async function getServer(serverId) {
  try {
    const guild = await discord.getGuild(serverId);
    const channels = await discord.getGuildChannels(serverId);

    guild.bot = true;
    guild.channels = channels;

    return guild;
  } catch (e) {
    logger.error(`Error while retrieving discord server:`, e);
    throw e;
  }
}

module.exports = {
  getServer,
};
