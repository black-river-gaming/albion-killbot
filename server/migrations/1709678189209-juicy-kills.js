const { REPORT_MODES } = require("../src/helpers/constants");
const logger = require("../src/helpers/logger");
const database = require("../src/ports/database");

async function run() {
  const collection = database.getCollection("settings");
  const settings = await collection.find({
    juicy: undefined,
  });

  while (await settings.hasNext()) {
    const setting = await settings.next();

    if (setting.juicy && setting.juicy.enabled && setting.juicy.channel) {
      logger.debug(`Skipped server: ${setting.server}`, { setting });
      continue;
    }

    try {
      await collection.updateOne(
        { _id: setting._id },
        {
          $set: {
            juicy: {
              enabled: false,
              channel: null,
              mode: REPORT_MODES.IMAGE,
            },
          },
        },
      );
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
