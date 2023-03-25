const { isPlayerTracked } = require("../helpers/tracking");
const { find, updateOne, deleteMany } = require("../ports/database");
const { getTrack } = require("../services/track");

const RANKINGS_COLLECTION = "rankings";

async function addRankingKill(serverId, event) {
  const { server } = event;
  const track = await getTrack(serverId);

  if (event.good) {
    // Player kill
    for (const player of event.GroupMembers) {
      if (!isPlayerTracked(player, track, { server })) continue;
      const killFame = Math.max(0, player.KillFame);
      await updateOne(
        RANKINGS_COLLECTION,
        {
          server: serverId,
          player: player.Id,
        },
        {
          $setOnInsert: {
            server: serverId,
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
    if (!isPlayerTracked(player, track, { server })) throw new Error("Bad event but victim is not tracked."); // Should never happen

    const deathFame = Math.max(0, event.TotalVictimKillFame);
    await updateOne(
      RANKINGS_COLLECTION,
      {
        server: serverId,
        player: player.Id,
      },
      {
        $setOnInsert: {
          server: serverId,
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

async function getRanking(serverId, limit = 5) {
  const killRanking = await find(
    RANKINGS_COLLECTION,
    {
      server: serverId,
      killFame: { $gte: 0 },
    },
    {
      sort: { killFame: -1 },
      limit,
    },
  );
  const totalKillFame = killRanking.reduce((sum, player) => {
    return sum + Math.max(0, player.killFame);
  }, 0);

  const deathRanking = await find(
    RANKINGS_COLLECTION,
    {
      server: serverId,
      deathFame: { $gte: 0 },
    },
    {
      sort: { deathFame: -1 },
      limit,
    },
  );
  const totalDeathFame = deathRanking.reduce((sum, player) => {
    return sum + Math.max(0, player.deathFame);
  }, 0);

  return {
    killRanking,
    totalKillFame,
    deathRanking,
    totalDeathFame,
  };
}

async function deleteRankings(serverId) {
  await deleteMany(RANKINGS_COLLECTION, { server: serverId });
}

module.exports = {
  addRankingKill,
  getRanking,
  deleteRankings,
};
