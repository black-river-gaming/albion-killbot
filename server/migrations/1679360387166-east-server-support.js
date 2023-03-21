const logger = require("../src/helpers/logger");
const database = require("../src/ports/database");

async function run() {
  const collection = database.getCollection("track");
  const tracks = await collection.find({});

  while (await tracks.hasNext()) {
    const track = await tracks.next();

    if (
      track.players.every((player) => player.server) &&
      track.guilds.every((guild) => guild.server) &&
      track.alliances.every((alliance) => alliance.server)
    ) {
      logger.debug(`Skipped track ${track._id}.`, { track });
      continue;
    }

    try {
      await collection.updateOne(
        { _id: track._id },
        {
          $set: {
            "players.$[].server": "Albion West",
            "guilds.$[].server": "Albion West",
            "alliances.$[].server": "Albion West",
          },
        },
      );
    } catch (error) {
      logger.error(`Unable to update track ${track._id}: ${error.message}. Skipping.`, { error });
    }
  }
}

module.exports = {
  run,
};
