const logger = require("../logger")("queries.dailyRanking");
const database = require("../database");
const { getConfig, getConfigByGuild } = require("../config");
const { embedDailyRanking } = require("../messages");

const RANKING_COLLECTION = "dailyRanking";

const isTracked = (player, config) => {
  return (
    config.trackedPlayers.some((t) => t.id === player.Id) ||
    config.trackedGuilds.some((t) => t.id === player.GuildId) ||
    config.trackedAlliances.some((t) => t.id === player.AllianceId)
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
    let killRanking = await collection
      .find({
        guild: guild.id,
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
        guild: guild.id,
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
  } catch (e) {
    logger.error(`Failed to fetch ranking for guild "${guild.name}" (${e})`);
  }
};

exports.clear = async () => {
  const collection = database.collection(RANKING_COLLECTION);
  await collection.remove({});
  logger.info("Daily pvp ranking cleared!");
};

exports.scan = async ({ client, sendGuildMessage }, mode) => {
  logger.info(`Sending ${mode === "daily" ? "daily" : "hourly"} guild rankings to all servers.`);
  const allGuildConfigs = await getConfigByGuild(client.guilds.cache.array());
  for (const guild of client.guilds.cache.array()) {
    guild.config = allGuildConfigs[guild.id];
    if (mode === "daily") {
      if (guild.config.dailyRanking !== "daily") continue;
    } else {
      if (!guild.config.dailyRanking || guild.config.dailyRanking !== "on") continue;
    }
    const ranking = await exports.getRanking(guild);
    if (ranking.killRanking.length === 0 && ranking.deathRanking.length === 0) continue;
    await sendGuildMessage(guild, embedDailyRanking(ranking, guild.config.lang), "rankings");
  }
};

exports.scanDaily = async (bot) => exports.scan(bot, "daily");
