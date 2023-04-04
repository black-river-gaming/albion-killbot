const logger = require("../../../helpers/logger");

const limitsService = require("../../../services/limits");
const serversService = require("../../../services/servers");
const settingsService = require("../../../services/settings");
const subscriptionService = require("../../../services/subscriptions");
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
    server.subscription = await subscriptionService.getSubscriptionByServerId(serverId);
    if (server.subscription && server.subscription.stripe) {
      server.subscription.stripe = await subscriptionService.getStripeSubscription(server.subscription.stripe);
    }
    server.limits = await limitsService.getLimits(serverId);
    server.track = await trackService.getTrack(serverId);

    return res.send(server);
  } catch (error) {
    logger.error(`Error while retrieving server data: ${error.message}`, { error });
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

module.exports = {
  getServer,
  getServers,
  setServerSettings,
  setServerTrack,
};
