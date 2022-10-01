const serversService = require("../../../services/servers");
const settingsService = require("../../../services/settings");
const subscriptionService = require("../../../services/subscriptions");
const trackService = require("../../../services/track");
const usersService = require("../../../services/users");

async function getServers(req, res) {
  try {
    const { accessToken } = req.session.discord;

    const userServers = await usersService.getCurrentUserServers(accessToken);

    return res.send(userServers);
  } catch (error) {
    return res.sendStatus(403);
  }
}

async function getServer(req, res) {
  const { serverId } = req.params;
  const server = await serversService.getServer(serverId);

  const settings = await settingsService.getSettings(serverId);
  server.settings = settings;

  const subscription = await subscriptionService.getSubscriptionByServerId(serverId);
  server.subscription = subscription;

  const limits = await trackService.getLimitsByServerId(serverId);
  server.limits = limits;

  const track = await trackService.getTrack(serverId);
  server.track = track;

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
  // TODO: Validate schema

  const newTrack = await trackService.setTrack(serverId, track);
  return res.send(newTrack);
}

module.exports = {
  getServer,
  getServers,
  setServerSettings,
  setServerTrack,
};
