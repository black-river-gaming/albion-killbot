const config = require("config");
const moment = require("moment");

const { find, updateOne, deleteMany, findOne } = require("../ports/database");
const { getTrack } = require("./track");
const logger = require("../helpers/logger");

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

async function getRanking(serverId, type = "daily", { limit = 5 } = {}) {
  const track = await getTrack(serverId);
  if (!track) return null;

  // Filter for each type
  const date = {
    daily: {
      start: moment().startOf("day").unix(),
      end: moment().endOf("day").unix(),
    },
    weekly: {
      start: moment().startOf("week").unix(),
      end: moment().endOf("week").unix(),
    },
    monthly: {
      start: moment().startOf("month").unix(),
      end: moment().endOf("month").unix(),
    },
  }[type];

  if (!date) {
    logger.warn(`Undefined ranking type: ${type}. Aborting display ranking.`, {
      serverId,
      type,
    });
    return null;
  }

  const ranking = await find(RANKINGS_COLLECTION, {
    $or: [
      ...track.players.map((track) => ({
        server: track.server,
        player: track.id,
      })),
      ...track.guilds.map((track) => ({
        server: track.server,
        guild: track.id,
      })),
      ...track.alliances.map((track) => ({
        server: track.server,
        alliance: track.id,
      })),
    ],
  });

  // Merge scores
  ranking.forEach((player) => {
    player.totalScore = player.scores
      .filter((score) => score.date >= date.start && score.date <= date.end)
      .reduce(
        (totalScore, score) => {
          totalScore.killFame += Math.max(0, score.killFame);
          totalScore.deathFame += Math.max(0, score.deathFame);
          return totalScore;
        },
        {
          killFame: 0,
          deathFame: 0,
        },
      );
    delete player.scores;
  });

  const killFameRanking = ranking.sort((a, b) => b.totalScore.killFame - a.totalScore.killFame).slice(0, limit);
  const killFameTotal = killFameRanking.reduce((sum, player) => {
    return sum + Math.max(0, player.totalScore.killFame);
  }, 0);

  const deathFameRanking = ranking.sort((a, b) => b.totalScore.deathFame - a.totalScore.deathFame).slice(0, limit);
  const deathFameTotal = deathFameRanking.reduce((sum, player) => {
    return sum + Math.max(0, player.totalScore.deathFame);
  }, 0);

  return {
    server: serverId,
    type,
    killFameRanking,
    killFameTotal,
    deathFameRanking,
    deathFameTotal,
  };
}

async function deleteRankingsEmpty() {
  await deleteMany(RANKINGS_COLLECTION, { scores: [] });
}

module.exports = {
  addRankingEvent,
  getRanking,
  deleteRankingsEmpty,
};
