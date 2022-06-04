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
  // TODO: Add authorization guard for Server Owner and Administrators

  const { guildId } = req.params;
  const newSettings = req.body;

  // Remove non-modifiable fields
  delete newSettings.guild;
  delete newSettings.subscription;
  delete newSettings.track;

  const settings = await settingsService.setSettings(guildId, newSettings);
  return res.send(settings);
}

module.exports = {
  getServer,
  setServerSettings,
};
