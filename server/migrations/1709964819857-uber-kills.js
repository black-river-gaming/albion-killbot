const { REPORT_MODES } = require("../src/helpers/constants");
const logger = require("../src/helpers/logger");
const database = require("../src/ports/database");

async function run() {
  const collection = database.getCollection("settings");
  const settings = await collection.find({});

  while (await settings.hasNext()) {
    const setting = await settings.next();

    if (
      setting.juicy &&
      setting.juicy.enabled.west &&
      setting.juicy.enabled.east &&
      setting.juicy.good &&
      setting.juicy.insane
    ) {
      logger.debug(`Skipped server: ${setting.server}`, { setting });
      continue;
    }

    try {
      await collection.updateOne(
        { _id: setting._id },
        {
          $set: {
            juicy: {
              enabled: {
                americas: setting.juicy.enabled || false,
                asia: setting.juicy.enabled || false,
              },
              mode: REPORT_MODES.IMAGE,
              good: {
                channel: setting.juicy.channel || null,
              },
              insane: {
                channel: null,
              },
            },
          },
        },
      );
      logger.debug(`Updated server ${setting.server}`, { setting });
    } catch (error) {
      logger.error(`Unable to update server ${setting.server}: ${error.message}. Skipping.`, {
        setting,
      });
    }
  }
}

module.exports = {
  run,
};
