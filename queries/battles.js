const axios = require("axios");
const moment = require("moment");
const logger = require("../logger")("queries.battles");
const database = require("../database");
const { sleep } = require("../utils");

const BATTLES_ENDPOINT =
  "https://gameinfo.albiononline.com/api/gameinfo/battles";
const BATTLES_LIMIT = 51;
const BATTLES_SORT = "recent";
const BATTLES_COLLECTION = "battles";
const BATTLES_KEEP_HOURS = 4;

function getNewBattles(battles, config) {
  if (!config) {
    return [];
  }

  const playerIds = (config.trackedPlayers || []).map(t => t.id);
  const guildIds = (config.trackedGuilds || []).map(t => t.id);
  const allianceIds = (config.trackedAlliances || []).map(t => t.id);

  const newBattles = [];
  battles.forEach(battle => {
    // Ignore battles without fame
    if (battle.totalFame <= 0) {
      return;
    }

    // Check for tracked ids in players, guilds and alliances
    // Since we are parsing from newer to older events we need to use a FILO array
    const hasTrackedPlayer = Object.keys(battle.players || {}).some(
      id => playerIds.indexOf(id) >= 0,
    );
    const hasTrackedGuild = Object.keys(battle.guilds || {}).some(
      id => guildIds.indexOf(id) >= 0,
    );
    const hasTrackedAlliance = Object.keys(battle.alliances || {}).some(
      id => allianceIds.indexOf(id) >= 0,
    );
    if (hasTrackedPlayer || hasTrackedGuild || hasTrackedAlliance) {
      newBattles.unshift(battle);
    }
  });
  return newBattles;
}

exports.getBattles = async () => {
  const collection = database.collection(BATTLES_COLLECTION);
  if (!collection) {
    return logger.warn("Not connected to database. Skipping get battles.");
  }

  // Find latest event
  let latestBattle = await collection
    .find({})
    .sort({ id: -1 })
    .limit(1)
    .next();

  const fetchBattlesTo = async (latestBattle, offset = 0, battles = []) => {
    // Maximum offset reached, just return what we have
    if (offset >= 1000) return battles;

    try {
      logger.debug(`[getBattles] Fetching battles with offset: ${offset}`);
      const res = await axios.get(BATTLES_ENDPOINT, {
        params: {
          offset,
          limit: BATTLES_LIMIT,
          sort: BATTLES_SORT,
          timestamp: moment().unix(),
        },
        timeout: 60000,
      });
      const foundLatest = !res.data.every(battle => {
        if (battle.id <= latestBattle.id) return false;
        battles.push(battle);
        return true;
      });
      return foundLatest
        ? battles
        : fetchBattlesTo(latestBattle, offset + BATTLES_LIMIT, battles);
    } catch (err) {
      logger.error(
        `[getBattles] Unable to fetch battle data from API [${err}].`,
      );
      await sleep(5000);
      return fetchBattlesTo(latestBattle, offset, battles);
    }
  };

  if (!latestBattle) {
    logger.info(
      "[getBattles] No latest battle found. Retrieving first battles.",
    );
    latestBattle = { id: 0 };
  }
  logger.info(
    `[getBattles] Fetching Albion Online battles from API up to battle ${latestBattle.id}.`,
  );
  const battles = await fetchBattlesTo(latestBattle);
  if (battles.length === 0) return logger.debug("[getBattles] No new battles.");

  // Insert battles that aren't in the database yet
  let ops = [];
  battles.forEach(async battle => {
    ops.push({
      updateOne: {
        filter: { id: battle.id },
        update: {
          $setOnInsert: { ...battle, read: false },
        },
        upsert: true,
        writeConcern: {
          wtimeout: 60000,
        },
      },
    });
  });

  // Delete older events to free cache space
  logger.debug("[getBattles] Deleting old events from database.");
  const deleteResult = await collection.deleteMany({
    startTime: {
      $lte: moment()
        .subtract(BATTLES_KEEP_HOURS, "hours")
        .toISOString(),
    },
  });

  logger.debug(
    `[getBattles] Performing ${ops.length} write operations in database.`,
  );
  const writeResult = await collection.bulkWrite(ops, { ordered: false });

  logger.info(
    `[getBattles] Fetch success. (New battles inserted: ${writeResult.upsertedCount}, old battles removed: ${deleteResult.deletedCount}).`,
  );
};

exports.getBattlesByGuild = async guildConfigs => {
  const collection = database.collection(BATTLES_COLLECTION);
  if (!collection) {
    return logger.warn(
      "[scanBattles] Not connected to database. Skipping notify battles.",
    );
  }

  // Get unread battles
  const battles = await collection
    .find({ read: false })
    .sort({ id: 1 })
    .limit(1000)
    .toArray();
  if (battles.length === 0) {
    return logger.debug("[scanBattles] No new battles to notify.");
  }

  // Set battles as read before sending to ensure no double battle notification
  let ops = [];
  battles.forEach(async battle => {
    ops.push({
      updateOne: {
        filter: { id: battle.id },
        update: {
          $set: { read: true },
        },
      },
    });
  });
  const writeResult = await collection.bulkWrite(ops, { ordered: false });
  logger.info(
    `[scanBattles] Notify success. (Battles read: ${writeResult.modifiedCount}).`,
  );

  const battlesByGuild = {};
  for (let guild of Object.keys(guildConfigs)) {
    const config = guildConfigs[guild];
    if (!config) {
      continue;
    }
    battlesByGuild[guild] = getNewBattles(battles, config);
  }

  return battlesByGuild;
};
