const discordApiClient = require("../adapters/discordApiClient");
const discordHelper = require("../helpers/discord");

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

async function getUserServers(accessToken) {
  const guilds = await discordApiClient.getCurrentUserGuilds(`Bearer ${accessToken}`);
  return guilds.map(discordHelper.transformGuild);
}

async function getBotGuilds() {
  return await discordApiClient.getCurrentUserGuilds(`Bot ${DISCORD_TOKEN}`);
}

async function getGuild(guildId) {
  const guild = await discordApiClient.getGuild(`Bot ${DISCORD_TOKEN}`, guildId);
  return discordHelper.transformGuild(guild);
}

async function getGuildChannels(guildId) {
  const channels = await discordApiClient.getGuildChannels(`Bot ${DISCORD_TOKEN}`, guildId);
  return channels.map(discordHelper.transformChannel);
}

module.exports = {
  getBotGuilds,
  getGuild,
  getGuildChannels,
  getMe,
  getToken,
  getUserServers,
  refreshToken,
};
