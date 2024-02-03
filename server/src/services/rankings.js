const config = require("config");
const moment = require("moment");

const { find, updateOne, deleteMany, findOne } = require("../ports/database");

const RANKINGS_COLLECTION = "rankings";

async function addRankingEvent(event) {
  if (!config.get("features.rankings.enabled")) return;
  const { server } = event;

  const today = moment().startOf("day").unix();
  const minDate = moment().subtract(31, "days").unix();

  for (const player of [event.Victim, ...event.GroupMembers]) {
    const killFame = Math.max(0, player.KillFame);
    const deathFame = Math.max(0, player.DeathFame);

    const entry = (await findOne(RANKINGS_COLLECTION, { player: player.Id })) || { player: player.Id, scores: [] };
    entry.server = server;
    entry.name = player.Name;
    entry.guild = player.GuildId;
    entry.alliance = player.AllianceId;

    // Add scores for today
    const i = entry.scores.findIndex((score) => score.date === today);
    if (i === -1) entry.scores.push({ date: today, killFame, deathFame });
    else {
      entry.scores[i].killFame += killFame;
      entry.scores[i].deathFame += deathFame;
    }

    // Remove old scores
    entry.scores = entry.scores.filter((score) => score.date >= minDate);

    // Update player information
    await updateOne(RANKINGS_COLLECTION, { player: player.Id }, { $set: entry }, { upsert: true });
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
  addRankingEvent,
  getRanking,
  deleteRankings,
};
