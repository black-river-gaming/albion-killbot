const logger = require("../src/helpers/logger");
const database = require("../src/ports/database");

async function splitKillsDeathsSettings() {
  const settingsCollection = database.getCollection("settings");

  const settings = await settingsCollection.find({});
  let setting = await settings.next();
  while (setting) {
    const { guild, kills, deaths } = setting;

    if (kills && !deaths) {
      logger.verbose(`Cloning server ${guild} kills settings as it does not contain death settings.`);

      await settingsCollection.updateOne(
        { _id: setting._id },
        {
          $set: { deaths: kills },
        },
      );
    }

    setting = await settings.next();
  }
}

async function run() {
  await splitKillsDeathsSettings();
}

module.exports = {
  run,
};
