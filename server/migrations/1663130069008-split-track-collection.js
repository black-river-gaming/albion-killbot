const logger = require("../src/helpers/logger");
const database = require("../src/ports/database");

async function splitTrackingFromSettings() {
  const settingsCollection = database.getCollection("settings");
  const trackingCollection = database.getCollection("track");

  const settings = await settingsCollection.find({});
  let setting = await settings.next();
  while (setting) {
    if (setting.track) {
      const { track, guild } = setting;
      logger.verbose(
        `Moving server ${guild} track containing ${track.players.length} players, ${track.guilds.length} guilds and ${track.alliances.length} alliances.`,
      );

      await trackingCollection.insertOne({ server: guild, ...track });
      await settingsCollection.updateOne(
        { _id: setting._id },
        {
          $unset: { track: "" },
        },
      );
    }

    setting = await settings.next();
  }
}

async function run() {
  await splitTrackingFromSettings();
}

module.exports = {
  run,
};
