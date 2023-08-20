const logger = require("../src/helpers/logger");
const database = require("../src/ports/database");

async function run() {
  const collection = database.getCollection("track");
  const tracks = await collection.find({});

  while (await tracks.hasNext()) {
    const track = await tracks.next();

    if (
      track.players.every((player) => !player.channel) &&
      track.guilds.every((guild) => !guild.channel) &&
      track.alliances.every((alliance) => !alliance.channel)
    ) {
      logger.debug(`Skipped track ${track._id}.`, { track });
      continue;
    }

    const { players, guilds, alliances } = track;

    const updateChannel = (trackItem) => {
      if (!trackItem.channel) return;

      trackItem.kills = { channel: trackItem.channel };
      trackItem.deaths = { channel: trackItem.channel };
      delete trackItem.channel;
    };

    players.forEach(updateChannel);
    guilds.forEach(updateChannel);
    alliances.forEach(updateChannel);

    try {
      await collection.updateOne(
        { _id: track._id },
        {
          $set: {
            players,
            guilds,
            alliances,
          },
        },
      );
      logger.debug(`Updated track ${track._id}`, { track });
    } catch (error) {
      logger.error(`Unable to update track ${track._id}: ${error.message}. Skipping.`, { error });
    }
  }
}

module.exports = {
  run,
};
