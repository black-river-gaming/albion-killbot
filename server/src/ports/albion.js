const albionApiClient = require("./adapters/albionApiClient");
const albionDataApiClient = require("./adapters/albionDataApiClient");
const itemCDNClient = require("./adapters/itemCDNClient");
const awsSdkClient = require("./adapters/awsSdkClient");
const cache = require("./adapters/fsCache");

const { sleep } = require("../helpers/scheduler");
const logger = require("../helpers/logger");
const { getVictimItems } = require("../helpers/albion");
const { memoize } = require("../helpers/cache");
const { average } = require("../helpers/utils");

const ITEMS_DIR = "items";

async function getEvent(eventId) {
  try {
    return await albionApiClient.getEvent(eventId);
  } catch (e) {
    return null;
  }
}

async function getEvents(queryParams = {}) {
  return await albionApiClient.getEvents(queryParams);
}

async function getBattle(battleId) {
  try {
    return await albionApiClient.getBattle(battleId);
  } catch (e) {
    return null;
  }
}

async function getBattles(queryParams = {}) {
  return await albionApiClient.getBattles(queryParams);
}

const missingItems = {};
// Download items from CDN, cache them and return path to cached image
const getItemFile = async (item, tries = 0) => {
  // If we already tried 2 times and failed, try without parameters (and don't save to s3)
  const forceResult = tries > 3;
  const filename = `${item.Type}_Q${item.Quality}`;
  if (forceResult) missingItems[filename] = true; // Mark item as missing
  if (missingItems[filename]) return null; // So it can fail on all subsequent tries

  if (cache.hasFile(ITEMS_DIR, filename)) {
    return cache.getFile(ITEMS_DIR, filename);
  }

  if (cache.isBusy(ITEMS_DIR, filename)) {
    logger.warn(`${filename} is busy. Retrying...`);
    await sleep(5000);
    return getItemFile(item, tries);
  }

  let writer;
  try {
    writer = cache.createWriteStream(ITEMS_DIR, filename);
  } catch (e) {
    logger.error(`Failed to create writestream for ${filename}:`, e);
    await sleep(5000);
    return getItemFile(item, tries + 1);
  }

  // Check if file is available on S3 bucket
  if (awsSdkClient.isEnabled && (await awsSdkClient.downloadFromS3(filename, writer))) {
    return cache.getFile(ITEMS_DIR, filename);
  }

  if (await itemCDNClient.downloadFromCDNs(item, writer)) {
    if (awsSdkClient.isEnabled) {
      awsSdkClient.uploadToS3(filename, cache.createReadStream(ITEMS_DIR, filename));
    }
    return cache.getFile(ITEMS_DIR, filename);
  }

  if (!writer.closed) writer.close();
  await sleep(5000);
  return getItemFile(item, tries + 1);
};

async function getPlayer(playerId, { silent = false }) {
  try {
    logger.verbose(`Fetch Albion Online player: ${playerId}`);
    return await albionApiClient.getPlayer(playerId);
  } catch (e) {
    if (!silent) logger.error(`Failed to fetch Albion Online player [${playerId}]:`, e);
    return null;
  }
}

async function getGuild(guildId, { rankings = false, silent = false }) {
  try {
    logger.verbose(`Fetch Albion Online guild: ${guildId}`);
    const guild = await albionApiClient.getGuild(guildId);

    if (rankings) {
      guild.rankings = {};
      logger.debug(`[${guild.Name}] Fetching PvE rankings...`);
      guild.rankings.pve = await albionApiClient.getStatistics(guildId, albionApiClient.STATISTICS_TYPES.PVE);
      logger.debug(`[${guild.Name}] Fetching PvP rankings...`);
      guild.rankings.pvp = await albionApiClient.getPlayerFame(guildId, albionApiClient.STATISTICS_TYPES.PVE);
      logger.debug(`[${guild.Name}] Fetching Gathering rankings...`);
      guild.rankings.gathering = await albionApiClient.getPlayerFame(
        guildId,
        albionApiClient.STATISTICS_TYPES.GATHERING,
      );
      logger.debug(`[${guild.Name}] Fetching Crafting rankings...`);
      guild.rankings.crafting = await albionApiClient.getPlayerFame(guildId, albionApiClient.STATISTICS_TYPES.CRAFTING);
    }

    return guild;
  } catch (e) {
    if (!silent) logger.error(`Failed to fetch Albion Online guild [${guildId}]:`, e);
    return null;
  }
}

async function getAlliance(allianceId, { silent = false }) {
  try {
    logger.verbose(`Fetch Albion Online alliance: ${allianceId}`);
    return await albionApiClient.getAlliance(allianceId);
  } catch (e) {
    if (!silent) logger.error(`Failed to fetch Albion Online alliance [${allianceId}]:`, e);
    return null;
  }
}

async function search(query) {
  try {
    logger.verbose(`Searching entities in Albion Online for: ${query}`);
    return await albionApiClient.search(query);
  } catch (e) {
    logger.error(`Failed to search entities in API:`, e);
    return null;
  }
}

async function getLootValue(event) {
  return memoize(
    `albion.events.${event.EventId}.lootValue`,
    async () => {
      try {
        const victimItems = getVictimItems(event);
        if (victimItems.length === 0) return 0;

        const itemList = victimItems.map((item) => item.Type);
        const qualities = victimItems
          .map((item) => Math.max(item.Quality, 1))
          .filter((item, i, items) => items.indexOf(item) === i)
          .sort();

        const itemPriceData = await albionDataApiClient.getPrices(itemList.join(), {
          locations: ["Thetford", "Fort Sterling", "Martlock", "Bridgewatch", "Lymhurst"].join(),
          qualities,
        });
        if (!itemPriceData && itemPriceData.length === 0) return 0;

        return victimItems.reduce((lootValue, item) => {
          let prices = itemPriceData
            .filter(
              (priceData) =>
                priceData.item_id === item.Type &&
                priceData.quality === Math.max(item.Quality, 1) &&
                priceData.sell_price_min > 0,
            )
            .map((priceData) => priceData.sell_price_min);
          if (prices.length === 0) return lootValue;
          // Remove values that are too unrealistic (150% diff tolerance to min value)
          if (prices.length >= 2) {
            const minPrice = prices.reduce((min, price) => Math.min(min, price), prices[0]);
            prices = prices.filter((price) => Math.abs(price - minPrice) < minPrice * 1.5);
          }

          return Math.round(lootValue + average(...prices));
        }, 0);
      } catch (error) {
        logger.error(`Failed to fetch kill loot value for event ${event.EventId}: ${error.message}`, {
          error,
          event,
        });
        return null;
      }
    },
    {
      timeout: 30000,
      ignore: null,
    },
  );
}

module.exports = {
  getAlliance,
  getBattle,
  getBattles,
  getEvent,
  getEvents,
  getGuild,
  getItemFile,
  getLootValue,
  getPlayer,
  search,
};
