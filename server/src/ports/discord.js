const discordApiClient = require("./adapters/discordApiClient");
const discordHelper = require("../helpers/discord");
const { memoize } = require("../helpers/cache");
const { DAY } = require("../helpers/constants");

const { DISCORD_TOKEN } = process.env;

async function getToken(code) {
  return await discordApiClient.exchangeCode(code);
}

async function refreshToken(refreshToken) {
  return await discordApiClient.refreshToken(refreshToken);
}

async function getUser(accessToken) {
  return memoize(
    `discord.users.${accessToken}`,
    async () => {
      const user = await discordApiClient.getCurrentUser(`Bearer ${accessToken}`);
      return discordHelper.transformUser(user);
    },
    {
      timeout: DAY,
    },
  );
}

async function getUserGuilds(accessToken, params) {
  return memoize(
    `discord.users.${accessToken}.guilds`,
    async () => {
      const guilds = await discordApiClient.getCurrentUserGuilds(`Bearer ${accessToken}`, params);
      return guilds.map(discordHelper.transformGuild);
    },
    {
      timeout: 60000,
    },
  );
}

async function getBotGuilds() {
  return memoize(
    `discord.botGuilds`,
    async () => {
      let foundAll = false;
      let after;
      const guilds = [];

      // Iterate over all pages of guilds because bot can join more than the default 200 servers limit
      while (!foundAll) {
        const guildList = await discordApiClient.getCurrentUserGuilds(`Bot ${DISCORD_TOKEN}`, { limit: 200, after });
        guilds.push(...guildList);

        after = guilds[guilds.length - 1].id;
        if (guildList.length < 200) foundAll = true;
      }

      return guilds.map(discordHelper.transformGuild);
    },
    {
      timeout: 60000,
    },
  );
}

async function getGuild(guildId) {
  return memoize(`discord.guilds.${guildId}`, async () => {
    const guild = await discordApiClient.getGuild(`Bot ${DISCORD_TOKEN}`, guildId);
    return discordHelper.transformGuild(guild);
  });
}

async function getGuildChannels(guildId) {
  return memoize(
    `discord.guilds.${guildId}.channels`,
    async () => {
      const channels = await discordApiClient.getGuildChannels(`Bot ${DISCORD_TOKEN}`, guildId);
      return channels.map(discordHelper.transformChannel);
    },
    {
      timeout: 30000,
    },
  );
}

async function leaveGuild(guildId) {
  await discordApiClient.leaveGuild(`Bot ${DISCORD_TOKEN}`, guildId);
  return true;
}

const addMemberRole = (guildId, memberId, roleId, reason) => {
  return discordApiClient.addGuildMemberRole(`Bot ${DISCORD_TOKEN}`, {
    guildId,
    memberId,
    roleId,
    reason,
  });
};

const removeMemberRole = (guildId, memberId, roleId, reason) => {
  return discordApiClient.removeGuildMemberRole(`Bot ${DISCORD_TOKEN}`, {
    guildId,
    memberId,
    roleId,
    reason,
  });
};

module.exports = {
  addMemberRole,
  getBotGuilds,
  getGuild,
  getGuildChannels,
  getToken,
  getUser,
  getUserGuilds,
  leaveGuild,
  refreshToken,
  removeMemberRole,
};
