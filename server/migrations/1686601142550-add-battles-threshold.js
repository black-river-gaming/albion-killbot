const logger = require("../src/helpers/logger");
const database = require("../src/ports/database");

async function run() {
  const collection = database.getCollection("settings");
  const settings = await collection.find({});

  while (await settings.hasNext()) {
    const setting = await settings.next();

    if (setting.battle && setting.battles.threshold) {
      logger.debug(`Skipping setting ${setting._id}`, { setting });
      continue;
    }

    try {
      await collection.updateOne(
        { _id: setting._id },
        {
          $set: {
            battles: {
              ...setting.battles,
              threshold: {
                players: 0,
                guilds: 0,
                alliances: 0,
              },
            },
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
