const serversService = require("../../../services/servers");
const settingsService = require("../../../services/settings");

async function getServer(req, res) {
  const { guildId } = req.params;
  const server = await serversService.getServer(guildId);
  const settings = await settingsService.getSettings(guildId);

  server.settings = settings;

  return res.send(server);
}

async function setServerSettings(req, res) {
  const { guildId } = req.params;
  const { user } = req.session.discord;
  const server = await serversService.getServer(guildId);

  const isOwner = server.owner === user.id;
  // TODO: Get roles for user.id, then check if any of them is & (1 << 3) [Administrator]
  if (!isOwner) return res.sendStatus(403);

  const newSettings = req.body;

  // Remove non-modifiable fields
  delete newSettings.guild;
  delete newSettings.subscription;
  delete newSettings.track;

  const settings = await settingsService.setSettings(guildId, newSettings);
  return res.send(settings);
}

async function setServerTrack(req, res) {
  const { guildId } = req.params;
  const { user } = req.session.discord;
  const server = await serversService.getServer(guildId);

  const isOwner = server.owner === user.id;
  // TODO: Get roles for user.id, then check if any of them is & (1 << 3) [Administrator]
  if (!isOwner) return res.sendStatus(403);

  const track = req.body;

  const settings = await settingsService.setSettings(guildId, { track });
  return res.send(settings.track);
}

module.exports = {
  getServer,
  setServerSettings,
  setServerTrack,
};
