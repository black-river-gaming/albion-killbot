const { transformGuild, transformChannel, transformUser } = require("../../../helpers/discord");
const logger = require("../../../helpers/logger");
const { timeout } = require("../../../helpers/scheduler");

const NOTIFICATION_TIMEOUT = 10000;

async function sendNotification(client, channelId, notification) {
  const channel = client.channels.cache.find((c) => c.id === channelId);
  if (!channel || !channel.send) return;
  if (!channel.guild) channel.guild = { name: "Unknown Guild" };

  try {
    await timeout(channel.send(notification), NOTIFICATION_TIMEOUT);

    logger.debug(`Sent notification to ${channel.guild.name}/#${channel.name}.`, {
      server: transformGuild(channel.guild),
      channel: transformChannel(channel),
      notification,
    });
  } catch (error) {
    logger.warn(`Unable to send notification to ${channel.guild.name}/#${channel.name}: ${error.message}.`, {
      error,
    });
  }
}

async function sendPrivateMessage(client, userId, message) {
  const user = await client.users.fetch(userId);
  if (!user || !user.send) return;

  try {
    await timeout(user.send(message), NOTIFICATION_TIMEOUT);

    logger.debug(`[${userId}] send private message.`, {
      user: transformUser(user),
      message,
    });
  } catch (error) {
    logger.warn(`Unable to send message to ${user.name}: ${error.message}.`, {
      user: userId,
      error,
    });
  }
}

module.exports = {
  sendNotification,
  sendPrivateMessage,
};
