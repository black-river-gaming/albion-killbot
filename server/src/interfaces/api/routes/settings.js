const router = require("express").Router();
const settingsController = require("../controllers/settings");

const basePath = "/settings";

router.get("/", settingsController.getAllSettings);
router.get("/:guildId", settingsController.getSettings);
router.put("/:guildId", settingsController.setSettings);
router.delete("/:guildId", settingsController.deleteSettings);

module.exports = {
  basePath,
  router,
};
