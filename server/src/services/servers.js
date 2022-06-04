const discord = require("../ports/discord");
const logger = require("../helpers/logger");

async function getServer(guildId) {
  try {
    const guild = await discord.getGuild(guildId);
    const channels = await discord.getGuildChannels(guildId);

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
