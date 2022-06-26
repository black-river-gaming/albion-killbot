const serversService = require("../../../services/servers");
const settingsService = require("../../../services/settings");
const subscriptionService = require("../../../services/subscriptions");

async function getServer(req, res) {
  const { serverId } = req.params;
  const server = await serversService.getServer(serverId);

  const settings = await settingsService.getSettings(serverId);
  server.settings = settings;

  const subscription = await subscriptionService.getSubscriptionByServerId(serverId);
  server.subscription = subscription;

  const limits = await subscriptionService.getLimitsByServerId(serverId);
  server.limits = limits;

  return res.send(server);
}

async function setServerSettings(req, res) {
  const { serverId } = req.params;
  const { user } = req.session.discord;
  const server = await serversService.getServer(serverId);

  const isOwner = server.owner === user.id;
  // TODO: Get roles for user.id, then check if any of them is & (1 << 3) [Administrator]
  if (!isOwner) return res.sendStatus(403);

  const newSettings = req.body;

  const settings = await settingsService.setSettings(serverId, newSettings);
  return res.send(settings);
}

async function setServerTrack(req, res) {
  const { serverId } = req.params;
  const { user } = req.session.discord;
  const server = await serversService.getServer(serverId);

  const isOwner = server.owner === user.id;
  // TODO: Get roles for user.id, then check if any of them is & (1 << 3) [Administrator]
  if (!isOwner) return res.sendStatus(403);

  const track = req.body;

  const settings = await settingsService.setSettings(serverId, { track });
  return res.send(settings.track);
}

module.exports = {
  getServer,
  setServerSettings,
  setServerTrack,
};
