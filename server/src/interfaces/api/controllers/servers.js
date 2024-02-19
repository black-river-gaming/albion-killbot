const logger = require("../../../helpers/logger");

const limitsService = require("../../../services/limits");
const serversService = require("../../../services/servers");
const settingsService = require("../../../services/settings");
const subscriptionsService = require("../../../services/subscriptions");
const trackService = require("../../../services/track");

async function getServers(req, res) {
  try {
    const { accessToken } = req.session.discord;
    if (!accessToken) return res.sendStatus(403);

    const userServers = await serversService.getServers(accessToken);

    return res.send(userServers);
  } catch (error) {
    logger.error(`Unknown error:`, error);
    return res.sendStatus(500);
  }
}

async function getServer(req, res) {
  try {
    const { accessToken } = req.session.discord;
    if (!accessToken) return res.sendStatus(403);

    const { serverId } = req.params;

    const server = await serversService.getServer(serverId);
    if (!server) return res.sendStatus(404);

    server.channels = await serversService.getServerChannels(serverId);
    server.settings = await settingsService.getSettings(serverId);
    server.limits = await limitsService.getLimits(serverId);
    server.track = await trackService.getTrack(serverId);

    return res.send(server);
  } catch (error) {
    logger.error(`Error while retrieving server data: ${error.message}`, { error });
    return res.sendStatus(500);
  }
}

async function getServerSubscription(req, res) {
  const { serverId } = req.params;
  if (!serverId) return res.sendStatus(422);

  try {
    const { accessToken } = req.session.discord;
    if (!accessToken) return res.sendStatus(403);

    const subscription = await subscriptionsService.getSubscriptionByServerId(serverId);
    if (!subscription) return res.sendStatus(404);

    if (subscription.stripe)
      subscription.stripe = await subscriptionsService.getStripeSubscription(subscription.stripe);
    if (subscription.server) subscription.server = await serversService.getServer(subscription.server);

    return res.send(subscription);
  } catch (error) {
    logger.error(`Error while retrieving server subscription: ${error.message}`, { error });
    return res.sendStatus(500);
  }
}

async function setServerSettings(req, res) {
  const { serverId } = req.params;
  const settings = req.body;
  return res.send(await settingsService.setSettings(serverId, settings));
}

async function setServerTrack(req, res) {
  const { serverId } = req.params;
  const track = req.body;
  return res.send(await trackService.setTrack(serverId, track));
}

async function testServerSettings(req, res) {
  const { serverId } = req.params;
  try {
    const result = await serversService.testNotification(serverId, req.body);
    if (!result) return res.sendStatus(403);

    return res.send({});
  } catch {
    return res.sendStatus(500);
  }
}

module.exports = {
  getServers,
  getServer,
  getServerSubscription,
  setServerSettings,
  setServerTrack,
  testServerSettings,
};
