const logger = require("../logger")("dailyRanking");
const database = require("../database");
const { getConfig } = require("../config");

const RANKING_COLLECTION = "dailyRanking";

const isTracked = (player, config) => {
  return (
    config.trackedPlayers.some(t => t.id === player.Id) ||
    config.trackedGuilds.some(t => t.id === player.GuildId) ||
    config.trackedAlliances.some(t => t.id === player.AllianceId)
  );
};

exports.add = async (guild, event, config) => {
  const collection = database.collection(RANKING_COLLECTION);
  if (!collection) return logger.warn("Not connected to database. Skipping add events.");
  if (!config) config = await getConfig(guild);

  if (event.good) {
    // Player kill
    for (const player of event.GroupMembers) {
      if (!isTracked(player, config)) continue;
      try {
        const killFame = Math.max(0, player.KillFame);
        await collection.updateOne(
          {
            guild: guild.id,
            player: player.Id,
          },
          {
            $setOnInsert: {
              guild: guild.id,
              player: player.Id,
              name: player.Name,
            },
            $inc: { killFame },
          },
          {
            upsert: true,
          },
        );
      } catch (e) {
        return logger.error(`Failed to add player "${player.Name}" in ranking for guild "${guild.name}". (${e})"`);
      }
    }
  } else {
    // Player death
    const player = event.Victim;
    if (!isTracked(player, config)) return;
    try {
      const deathFame = Math.max(0, event.TotalVictimKillFame);
      await collection.updateOne(
        {
          guild: guild.id,
          player: player.Id,
        },
        {
          $setOnInsert: {
            guild: guild.id,
            player: player.Id,
            name: player.Name,
          },
          $inc: { deathFame },
        },
        {
          upsert: true,
        },
      );
    } catch (e) {
      return logger.error(`Failed to add player "${player.Name}" in ranking for guild "${guild.name}". (${e})"`);
    }
  }
};

exports.getRanking = async (guild, limit = 5) => {
  const collection = database.collection(RANKING_COLLECTION);
  if (!collection) return logger.warn("Not connected to database. Skipping get ranking.");

  try {
    const killRanking = await collection
      .find({
        guild: guild.id,
        killFame: { $gte: 0 },
      })
      .sort({ killFame: -1 })
      .limit(limit)
      .toArray();
    const deathRanking = await collection
      .find({
        guild: guild.id,
        deathFame: { $gte: 0 },
      })
      .sort({ deathFame: -1 })
      .limit(limit)
      .toArray();
    return {
      killRanking,
      deathRanking,
    };
  } catch (e) {
    logger.error(`Failed to fetch ranking for guild "${guild.name}" (${e})`);
  }
};

exports.clear = async () => {
  const collection = database.collection(RANKING_COLLECTION);
  await collection.remove({});
  logger.info("Daily pvp ranking cleared!");
};
