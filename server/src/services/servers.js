const discord = require("../ports/discord");
const logger = require("../helpers/logger");
const settingsService = require("./settings");
const { fetchEventsTo } = require("./events");
const channel = require("sharp/lib/channel");
const { embedEvent, embedEventImage } = require("../helpers/embeds");
const { generateEventImage } = require("./images");
const { FAKE_EVENT } = require("../helpers/albion");

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
    if (error.status === 404) return null;

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
  const event = { ...FAKE_EVENT, good: type === "kills" };

  try {
    if (!channelId) {
      const settings = await settingsService.getSettings(serverId);
      channelId = settings[type].channel;
    }

    switch (mode) {
      case "text":
        return await discord.sendMessage(channelId, embedEvent(event, { test: true }));
      case "image":
        // eslint-disable-next-line no-case-declarations
        const image = await generateEventImage(event);
        return await discord.sendMessage(channelId, embedEventImage(event, image, { test: true }));
      default:
        throw new Error(`Unknown mode ${mode}`);
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
