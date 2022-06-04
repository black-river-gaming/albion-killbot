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
  const guilds = await discordApiClient.getMeGuilds(`Bearer ${accessToken}`);
  return guilds.map((guild) => ({
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    owner: guild.owner,
  }));
}

async function getBotGuilds() {
  return await discordApiClient.getMeGuilds(`Bot ${DISCORD_TOKEN}`);
}

async function getGuild(guildId) {
  const guild = await discordApiClient.getGuild(`Bot ${DISCORD_TOKEN}`, guildId);
  return {
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
  };
}

async function getGuildChannels(guildId) {
  const channels = await discordApiClient.getGuildChannels(`Bot ${DISCORD_TOKEN}`, guildId);
  return channels.map((channel) => ({
    id: channel.id,
    name: channel.name,
    type: channel.type,
    parentId: channel.parent_id,
  }));
}

module.exports = {
  getBotGuilds,
  getGuild,
  getGuildChannels,
  getMe,
  getMeGuilds,
  getToken,
  refreshToken,
};
