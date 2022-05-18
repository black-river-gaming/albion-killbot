const { isPlayerTracked } = require("../helpers/tracking");
const { getCollection } = require("../ports/database");
const { getSettings } = require("./settings");

const KILLS_COLLECTION = "kills";

async function addRankingKill(guildId, event, settings) {
  const collection = getCollection(KILLS_COLLECTION);
  if (!collection) throw new Error("Not connected to the database");

  if (!settings) settings = await getSettings(guildId);

  if (event.good) {
    // Player kill
    for (const player of event.GroupMembers) {
      if (!isPlayerTracked(player, settings)) continue;
      const killFame = Math.max(0, player.KillFame);
      await collection.updateOne(
        {
          guild: guildId,
          player: player.Id,
        },
        {
          $setOnInsert: {
            guild: guildId,
            player: player.Id,
            name: player.Name,
          },
          $inc: { killFame },
        },
        {
          upsert: true,
        },
      );
    }
  } else {
    // Player death
    const player = event.Victim;
    if (!isPlayerTracked(player, settings)) return; // Should never happen

    const deathFame = Math.max(0, event.TotalVictimKillFame);
    await collection.updateOne(
      {
        guild: guildId,
        player: player.Id,
      },
      {
        $setOnInsert: {
          guild: guildId,
          player: player.Id,
          name: player.Name,
        },
        $inc: { deathFame },
      },
      {
        upsert: true,
      },
    );
  }
}

async function getRanking(guildId, limit = 5) {
  const collection = getCollection(KILLS_COLLECTION);
  if (!collection) throw new Error("Not connected to the database");

  let killRanking = await collection
    .find({
      guild: guildId,
      killFame: { $gte: 0 },
    })
    .sort({ killFame: -1 })
    .toArray();

  const totalKillFame = killRanking.reduce((sum, player) => {
    return sum + Math.max(0, player.killFame);
  }, 0);

  killRanking = killRanking.splice(0, limit);

  let deathRanking = await collection
    .find({
      guild: guildId,
      deathFame: { $gte: 0 },
    })
    .sort({ deathFame: -1 })
    .limit(limit)
    .toArray();

  const totalDeathFame = deathRanking.reduce((sum, player) => {
    return sum + Math.max(0, player.deathFame);
  }, 0);

  deathRanking = deathRanking.splice(0, limit);

  return {
    killRanking,
    totalKillFame,
    deathRanking,
    totalDeathFame,
  };
}

async function deleteRankings() {
  const collection = getCollection(KILLS_COLLECTION);
  await collection.deleteMany({});
}

module.exports = {
  addRankingKill,
  getRanking,
  deleteRankings,
};
