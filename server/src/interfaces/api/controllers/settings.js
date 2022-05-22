const settingsService = require("../../../services/settings");

async function getAllSettings(req, res) {
  const allSettings = await settingsService.getAllSettings();
  return res.send(allSettings);
}

async function getSettings(req, res) {
  const { guildId } = req.params;
  const settings = await settingsService.getSettings(guildId);
  return res.send(settings);
}

async function setSettings(req, res) {
  const { guildId } = req.params;
  const newSettings = req.body;

  // Remove non-modifiable fields
  delete newSettings.guild;
  delete newSettings.subscription;
  delete newSettings.track;

  const settings = await settingsService.setSettings(guildId, newSettings);
  return res.send(settings);
}

async function deleteSettings(req, res) {
  const { guildId } = req.params;
  await settingsService.deleteSettings(guildId);
  return res.send(200);
}

module.exports = {
  getAllSettings,
  getSettings,
  setSettings,
  deleteSettings,
};
