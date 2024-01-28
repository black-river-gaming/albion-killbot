/* eslint-disable no-case-declarations */
const discord = require("../ports/discord");
const logger = require("../helpers/logger");
const settingsService = require("./settings");
const { embedEvent, embedEventImage, embedBattle, embedPvpRanking } = require("../helpers/embeds");
const { generateEventImage } = require("./images");
const FAKE_EVENT = require("../assets/mocks/event_934270718.json");
const FAKE_BATTLE = require("../assets/mocks/battle_934264285.json");
const FAKE_PVP_RANKING = require("../assets/mocks/pvp_ranking.json");

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
  } catch (error) {
    logger.error(`Error while retrieving user guilds: ${error.message}`, { error });
    throw error;
  }
}

async function getServer(serverId) {
  try {
    return await discord.getGuild(serverId);
  } catch (error) {
    if (error.response.status === 404) return null;

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

async function addMemberRole(serverId, userId, roleId, reason) {
  try {
    return await discord.addMemberRole(serverId, userId, roleId, reason);
  } catch (error) {
    logger.error(`Error while adding user role: ${error.message}`, {
      serverId,
      userId,
      roleId,
      error,
    });
    return null;
  }
}

async function removeMemberRole(serverId, userId, roleId, reason) {
  try {
    return await discord.removeMemberRole(serverId, userId, roleId, reason);
  } catch (error) {
    logger.error(`Error while removing user role: ${error.message}`, {
      serverId,
      userId,
      roleId,
      error,
    });
    return null;
  }
}

async function testNotification(serverId, { channelId, type = "kills", mode = "image" } = {}) {
  try {
    if (!channelId) {
      const settings = await settingsService.getSettings(serverId);
      channelId = settings[type].channel;
    }

    switch (type) {
      case "kills":
      case "deaths":
        const event = { ...FAKE_EVENT, good: type === "kills" };
        const actions = new Map();
        actions.set("text", async () => {
          return await discord.sendMessage(channelId, embedEvent(event, { test: true }));
        });
        actions.set("image", async () => {
          const image = await generateEventImage(event);
          return await discord.sendMessage(channelId, embedEventImage(event, image, { test: true }));
        });

        if (!actions.has(mode) || typeof actions.get(mode) !== "function") throw new Error(`Unknown mode ${mode}`);
        return await actions.get(mode)();
      case "battles":
        return await discord.sendMessage(channelId, embedBattle(FAKE_BATTLE, { test: true }));
      case "rankings":
        return await discord.sendMessage(channelId, embedPvpRanking(FAKE_PVP_RANKING, { test: true }));
      default:
        throw new Error(`Unkown type ${type}`);
    }
  } catch (error) {
    logger.error(`Error while sending test to server: ${error.message}`, {
      error,
      serverId,
      type,
    });
    throw error;
  }
}

module.exports = {
  addMemberRole,
  getBotServers,
  getServer,
  getServerChannels,
  getServers,
  leaveServer,
  removeMemberRole,
  testNotification,
};
