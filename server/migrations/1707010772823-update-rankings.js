const logger = require("../src/helpers/logger");
const database = require("../src/ports/database");

async function run() {
  const collection = database.getCollection("settings");
  const settings = await collection.find({});

  while (await settings.hasNext()) {
    const setting = await settings.next();

    if (setting.rankings && setting.rankings.daily && setting.rankings.weekly && setting.rankings.monthly) {
      logger.debug(`Skipped server: ${setting.server}`, { setting });
      continue;
    }

    if (!setting.rankings) setting.rankings = {};
    setting.rankings.daily = "off";
    setting.rankings.weekly = "off";
    setting.rankings.monthly = "off";

    const convertRanking = (old) =>
      ({
        off: "off",
        hourly: "1hour",
        daily: "1day",
      }[old] || old);
    if (setting.rankings.pvpRanking) {
      setting.rankings.daily = convertRanking(setting.rankings.pvpRanking);
      delete setting.rankings.pvpRanking;
    }
    delete setting.rankings.guildRanking;

    try {
      await collection.updateOne(
        { _id: setting._id },
        {
          $set: {
            rankings: setting.rankings,
          },
        },
      );
      logger.debug(`Updated server ${setting.server}`, { setting });
    } catch (error) {
      logger.error(`Unable to update srver ${setting.server}: ${error.message}. Skipping.`, { setting });
    }
  }
}

module.exports = {
  run,
};
