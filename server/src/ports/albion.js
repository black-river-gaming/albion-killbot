const albionApiClient = require("../adapters/albionApiClient");
const itemCDNClient = require("../adapters/itemCDNClient");
const awsSdkClient = require("../adapters/awsSdkClient");
const cache = require("../adapters/fsCache");

const { sleep } = require("../helpers/utils");
const logger = require("../helpers/logger");

const ITEMS_DIR = "items";

async function getEvents(queryParams = {}) {
  return await albionApiClient.getEvents(queryParams);
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

async function getGuild(guildId) {
  const guild = await albionApiClient.getGuild(guildId);

  guild.rankings = {};
  logger.verbose(`[${guild.Name}] Fetching PvE rankings...`);
  guild.rankings.pve = await albionApiClient.getStatistics(guildId, albionApiClient.STATISTICS_TYPES.PVE);
  logger.verbose(`[${guild.Name}] Fetching PvP rankings...`);
  guild.rankings.pvp = await albionApiClient.getPlayerFame(guildId, albionApiClient.STATISTICS_TYPES.PVE);
  logger.verbose(`[${guild.Name}] Fetching Gathering rankings...`);
  guild.rankings.gathering = await albionApiClient.getPlayerFame(guildId, albionApiClient.STATISTICS_TYPES.GATHERING);
  logger.verbose(`[${guild.Name}] Fetching Crafting rankings...`);
  guild.rankings.crafting = await albionApiClient.getPlayerFame(guildId, albionApiClient.STATISTICS_TYPES.CRAFTING);

  return guild;
}

module.exports = {
  getBattles,
  getEvents,
  getGuild,
  getItemFile,
};
