const config = require("config");

const albionApiClient = require("./adapters/albionApiClient");
const albionDataApiClient = require("./adapters/albionDataApiClient");
const itemCDNClient = require("./adapters/itemCDNClient");
const awsSdkClient = require("./adapters/awsSdkClient");
const cache = require("./adapters/fsCache");

const { sleep } = require("../helpers/scheduler");
const logger = require("../helpers/logger");
const { getVictimItems, SERVER_DEFAULT } = require("../helpers/albion");
const { memoize } = require("../helpers/cache");
const { average } = require("../helpers/utils");
const { SECOND } = require("../helpers/constants");

const ITEMS_DIR = "items";

async function getEvent(eventId, { server = SERVER_DEFAULT }) {
  try {
    const event = await albionApiClient.getEvent(eventId, { server });
    event.server = server;
    return event;
  } catch (e) {
    return null;
  }
}

async function getEvents({ server = SERVER_DEFAULT, limit, offset }) {
  const events = await albionApiClient.getEvents({ server, limit, offset });
  return events.map((event) => ({ server, ...event }));
}

async function getBattle(battleId, { server }) {
  try {
    const battle = await albionApiClient.getBattle(battleId, { server });
    battle.server = server;
    return battle;
  } catch (e) {
    return null;
  }
}

async function getBattles({ server = SERVER_DEFAULT, limit, offset }) {
  const battles = await albionApiClient.getBattles({ server, limit, offset });
  return battles.map((battle) => ({ server, ...battle }));
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

async function getPlayer(playerId, { server = SERVER_DEFAULT, silent = false }) {
  try {
    logger.verbose(`Fetch ${server.name} player: ${playerId}`);
    const player = await albionApiClient.getPlayer(playerId, { server });
    player.server = server;
    return player;
  } catch (error) {
    if (!silent)
      logger.error(`Failed to fetch ${server.name} player [${playerId}]: ${error.message}`, {
        error,
        server,
        silent,
        playerId,
      });
    return null;
  }
}

async function getGuild(guildId, { server = SERVER_DEFAULT, rankings = false, silent = false }) {
  try {
    logger.verbose(`Fetch ${server.name} guild: ${guildId}`, { server, rankings, silent });
    const guild = await albionApiClient.getGuild(guildId, { server });
    guild.server = server;

    if (rankings) {
      guild.rankings = {};
      logger.verbose(`[${guild.Name}/${server.name}] Fetching PvE rankings...`);
      guild.rankings.pve = await albionApiClient.getStatistics(guildId, albionApiClient.STATISTICS_TYPES.PVE, {
        server,
      });
      logger.verbose(`[${guild.Name}/${server.name}] Fetching PvP rankings...`);
      guild.rankings.pvp = await albionApiClient.getPlayerFame(guildId, {
        server,
      });
      logger.verbose(`[${guild.Name}/${server.name}] Fetching Gathering rankings...`);
      guild.rankings.gathering = await albionApiClient.getStatistics(
        guildId,
        albionApiClient.STATISTICS_TYPES.GATHERING,
        { server },
      );
      logger.verbose(`[${guild.Name}/${server.name}] Fetching Crafting rankings...`);
      guild.rankings.crafting = await albionApiClient.getStatistics(
        guildId,
        albionApiClient.STATISTICS_TYPES.CRAFTING,
        { server },
      );
    }

    return guild;
  } catch (error) {
    if (!silent)
      logger.error(`[${server.name}] Failed to fetch guild [${guildId}]: ${error.message}`, {
        error,
        server,
        silent,
        guildId,
      });
    return null;
  }
}

async function getAlliance(allianceId, { server = SERVER_DEFAULT, silent = false }) {
  try {
    logger.verbose(`Fetch ${server.name} alliance: ${allianceId}`, { allianceId, server, silent });
    const alliance = await albionApiClient.getAlliance(allianceId, { server });
    alliance.server = server;
    return alliance;
  } catch (error) {
    if (!silent)
      logger.error(`[${server.name}] Failed to fetch alliance [${allianceId}]: ${error.message}`, {
        error,
        server,
        silent,
        allianceId,
      });
    return null;
  }
}

async function search(query, { server = SERVER_DEFAULT }) {
  try {
    logger.verbose(`Searching entities in ${server.name} for: ${query}`, { query, server });
    return await albionApiClient.search(query, { server });
  } catch (error) {
    logger.error(`[${server.name}] Failed to search query [${query}] in API: ${error.message}`, {
      error,
      query,
      server,
    });
    return null;
  }
}

const useCurrentLootValue = async (server, itemList, qualities) => {
  const itemPriceData = await albionDataApiClient.getCurrentPrices(itemList.join(), {
    server,
    locations: ["Thetford", "Fort Sterling", "Martlock", "Bridgewatch", "Lymhurst"].join(),
    qualities,
  });
  if (!itemPriceData && itemPriceData.length === 0) return { itemPriceData: null };

  const calculateLootValue = (items) =>
    items.reduce((lootValue, item) => {
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

      return Math.round(lootValue + average(...prices) * item.Count);
    }, 0);

  return {
    calculateLootValue,
    itemPriceData,
  };
};

const useHistoryLootValue = async (server, itemList, qualities) => {
  const history = await albionDataApiClient.getHistoryPrices(itemList, {
    server,
    locations: ["Thetford", "Fort Sterling", "Martlock", "Bridgewatch", "Lymhurst"].join(),
    qualities,
  });
  if (!history && history.length === 0) return { itemPriceData: null };
  // We are only interested in the last item of data
  history.forEach((item) => {
    item.lastData =
      item.data.length > 0
        ? item.data.pop()
        : {
            item_count: 0,
            avg_price: 0,
            timestamp: null,
          };
    delete item.data;
  });

  const calculateLootValue = (items) =>
    items.reduce((lootValue, item) => {
      const prices = history
        .filter(
          (priceData) =>
            priceData.item_id === item.Type &&
            priceData.quality === Math.max(item.Quality, 1) &&
            priceData.lastData.avg_price > 0,
        )
        .map((priceData) => priceData.lastData.avg_price);
      if (prices.length === 0) return lootValue;

      return Math.round(lootValue + average(...prices) * item.Count);
    }, 0);

  return {
    calculateLootValue,
    itemPriceData: history,
  };
};

async function getLootValue(event, { server = SERVER_DEFAULT }) {
  return memoize(
    `albion.events.${server.id}.${event.EventId}.lootValue`,
    async () => {
      try {
        const victimItems = getVictimItems(event);
        if (victimItems.equipment.length === 0 && victimItems.inventory.length === 0) return null;

        const itemList = []
          .concat(victimItems.equipment)
          .concat(victimItems.inventory)
          .map((item) => item.Type)
          .filter((item, i, items) => items.indexOf(item) === i);
        const qualities = []
          .concat(victimItems.equipment)
          .concat(victimItems.inventory)
          .map((item) => Math.max(item.Quality, 1))
          .filter((item, i, items) => items.indexOf(item) === i)
          .sort();

        const { itemPriceData, calculateLootValue } = config.get("features.events.useHistoryPrices")
          ? await useHistoryLootValue(server, itemList.join(), qualities)
          : await useCurrentLootValue(server, itemList.join(), qualities);

        if (!itemPriceData || !calculateLootValue) return null;
        return {
          equipment: calculateLootValue(victimItems.equipment),
          inventory: calculateLootValue(victimItems.inventory),
          itemPriceData,
        };
      } catch (error) {
        logger.warn(`[${server.name}] Failed to fetch kill loot value for event ${event.EventId}: ${error.message}`, {
          error,
          server,
          event,
        });
        return null;
      }
    },
    {
      timeout: 30 * SECOND,
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
