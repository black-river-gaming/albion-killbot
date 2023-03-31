const logger = require("../src/helpers/logger");
const database = require("../src/ports/database");

async function run() {
  const collection = database.getCollection("settings");
  const settings = await collection.find({});

  while (await settings.hasNext()) {
    const setting = await settings.next();

    if (setting.server && setting.general) {
      logger.debug(`Skipping setting ${setting._id}`, { setting });
      continue;
    }

    try {
      await collection.updateOne(
        { _id: setting._id },
        {
          $set: {
            server: setting.guild,
            general: {
              locale: setting.lang || "en",
              guildTags: false,
              splitLootValue: false,
            },
          },
          $unset: {
            guild: "",
            lang: "",
          },
        },
      );
    } catch (error) {
      logger.error(`Unable to update setting ${setting._id}: ${error.message}. Skipping.`, { setting, error });
    }
  }
}

module.exports = {
  run,
};
