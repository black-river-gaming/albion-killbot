const axios = require("axios");
const moment = require("moment");
const logger = require("../logger");
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
      id => playerIds.indexOf(id) >= 0
    );
    const hasTrackedGuild = Object.keys(battle.guilds || {}).some(
      id => guildIds.indexOf(id) >= 0
    );
    const hasTrackedAlliance = Object.keys(battle.alliances || {}).some(
      id => allianceIds.indexOf(id) >= 0
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
      logger.debug(`Fetching battles with offset: ${offset}`);
      const res = await axios.get(BATTLES_ENDPOINT, {
        params: {
          offset,
          limit: BATTLES_LIMIT,
          sort: BATTLES_SORT,
          timestamp: moment().unix()
        }
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
      logger.error(`Unable to fetch battle data from API [${err}].`);
      await sleep(5000);
      return fetchBattlesTo(latestBattle, offset, battles);
    }
  };

  if (!latestBattle) {
    logger.info("No latest battle found. Retrieving first battles.");
    latestBattle = { id: 0 };
  }
  logger.info(
    `Fetching Albion Online battles from API up to battle ${latestBattle.id}.`
  );
  const battles = await fetchBattlesTo(latestBattle);
  if (battles.length === 0) return logger.debug("No new battles.");

  // Insert battles that aren't in the database yet
  let ops = [];
  battles.forEach(async battle => {
    ops.push({
      updateOne: {
        filter: { id: battle.id },
        update: {
          $setOnInsert: { ...battle, read: false }
        },
        upsert: true
      }
    });
  });
  const writeResult = await collection.bulkWrite(ops, { ordered: false });

  // Delete older events to free cache space
  const deleteResult = await collection.deleteMany({
    TimeStamp: {
      $lte: moment()
        .subtract(BATTLES_KEEP_HOURS, "hours")
        .toISOString()
    }
  });
  logger.info(
    `Fetch success. (New battles inserted: ${writeResult.upsertedCount}, old battles removed: ${deleteResult.deletedCount}).`
  );
};

exports.getBattlesByGuild = async guildConfigs => {
  const collection = database.collection(BATTLES_COLLECTION);
  if (!collection) {
    return logger.warn("Not connected to database. Skipping notify battles.");
  }

  // Get unread battles
  const battles = await collection.find({ read: false }).toArray();
  if (battles.length === 0) {
    return logger.debug("No new battles to notify.");
  }

  // Set battles as read before sending to ensure no double battle notification
  const updateResult = await collection.updateMany(
    {
      id: {
        $in: battles.map(battle => battle.id)
      }
    },
    {
      $set: { read: true }
    }
  );
  logger.info(`Notify success. (Battles read: ${updateResult.modifiedCount}).`);

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
