const albionApiClient = require("../adapters/albionApiClient");
const itemCDNClient = require("../adapters/itemCDNClient");
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
  // if (S3) {
  //   try {
  //     const data = await S3.getObject({
  //       Bucket: process.env.AWS_BUCKET || "albion-killbot",
  //       Key: itemFileName,
  //     }).promise();
  //     return new Promise((resolve, reject) => {
  //       writer.on("finish", () => resolve(itemFile));
  //       writer.on("error", (e) => reject(e));
  //       writer.end(data.Body);
  //     });
  //   } catch (e) {
  //     logger.error(`[images] Unable to download file from S3 (${e})`);
  //   }
  // }

  logger.verbose(`Searching item "${filename}" in CDNs...`);
  if (await itemCDNClient.downloadFromCDNs(item, writer)) {
    // If S3 is set, upload to bucket before returning
    //   if (S3 && !forceResult) {
    //     logger.verbose(`[images] Uploading new file to S3: ${itemFileName}`);
    //     try {
    //       S3.putObject({
    //         Body: fs.createReadStream(itemFile),
    //         Bucket: process.env.AWS_BUCKET || "albion-killbot",
    //         Key: itemFileName,
    //       }).promise();
    //     } catch (e) {
    //       logger.error(`[images] Unable to upload file to S3 (${e})`);
    //     }
    //   }

    return cache.getFile(ITEMS_DIR, filename);
  }

  await sleep(5000);
  return getItemFile(item, tries + 1);
};

module.exports = {
  getEvents,
  getBattles,
  getItemFile,
};
