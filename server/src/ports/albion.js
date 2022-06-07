const albionApiClient = require("../adapters/albionApiClient");
const itemCDNClient = require("../adapters/itemCDNClient");
const awsSdkClient = require("../adapters/awsSdkClient");
const cache = require("../adapters/fsCache");

const { sleep } = require("../helpers/utils");
const logger = require("../helpers/logger");

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

async function getGuild(guildId, { rankings = true, silent = false }) {
  try {
    logger.verbose(`Fetch Albion Online guild: ${guildId}`);
    const guild = await albionApiClient.getGuild(guildId);

    if (rankings) {
      guild.rankings = {};
      logger.verbose(`[${guild.Name}] Fetching PvE rankings...`);
      guild.rankings.pve = await albionApiClient.getStatistics(guildId, albionApiClient.STATISTICS_TYPES.PVE);
      logger.verbose(`[${guild.Name}] Fetching PvP rankings...`);
      guild.rankings.pvp = await albionApiClient.getPlayerFame(guildId, albionApiClient.STATISTICS_TYPES.PVE);
      logger.verbose(`[${guild.Name}] Fetching Gathering rankings...`);
      guild.rankings.gathering = await albionApiClient.getPlayerFame(
        guildId,
        albionApiClient.STATISTICS_TYPES.GATHERING,
      );
      logger.verbose(`[${guild.Name}] Fetching Crafting rankings...`);
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

module.exports = {
  getAlliance,
  getBattle,
  getBattles,
  getEvent,
  getEvents,
  getGuild,
  getItemFile,
  getPlayer,
  search,
};
