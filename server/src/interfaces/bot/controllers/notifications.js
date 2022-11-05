const logger = require("../../../helpers/logger");
const { timeout } = require("../../../helpers/utils");

const NOTIFICATION_TIMEOUT = 10000;

async function sendNotification(client, channelId, message) {
  const channel = client.channels.cache.find((c) => c.id === channelId);
  if (!channel || !channel.send) return;
  if (!channel.guild) channel.guild = { name: "Unknown Guild" };

  try {
    await timeout(channel.send(message), NOTIFICATION_TIMEOUT);

    logger.debug(`Sent notification to ${channel.guild.name}/#${channel.name}.`, {
      metadata: {
        server: channel.guild,
        message,
      },
    });
  } catch (error) {
    logger.warn(`Unable to send notification to ${channel.guild.name}/#${channel.name}: ${error.message}.`, {
      error,
    });
  }
}

module.exports = {
  sendNotification,
};
