const logger = require("../src/helpers/logger");
const database = require("../src/ports/database");

async function updateRankings() {
  const collection = database.getCollection("rankings");

  try {
    await collection.updateMany(
      { server: "Albion West" },
      {
        $set: { server: "americas" },
      },
    );
    await collection.updateMany(
      { server: "Albion East" },
      {
        $set: { server: "asia" },
      },
    );
  } catch (error) {
    logger.error(`[updateRankings] Migration failed: ${error.message}`, {
      error,
    });
    throw error;
  }
}

async function updateTrack() {
  const collection = database.getCollection("track");

  try {
    await collection.updateMany(
      {},
      {
        $set: {
          "alliances.$[track].server": "americas",
          "guilds.$[track].server": "americas",
          "players.$[track].server": "americas",
        },
      },
      {
        arrayFilters: [{ "track.server": "Albion West" }],
      },
    );
    await collection.updateMany(
      {},
      {
        $set: {
          "alliances.$[track].server": "asia",
          "guilds.$[track].server": "asia",
          "players.$[track].server": "asia",
        },
      },
      {
        arrayFilters: [{ "track.server": "Albion East" }],
      },
    );
  } catch (error) {
    logger.error(`[updateTrack] Migration failed: ${error.message}`, {
      error,
    });
    throw error;
  }
}

async function run() {
  await updateRankings();
  await updateTrack();
}

module.exports = {
  run,
};
