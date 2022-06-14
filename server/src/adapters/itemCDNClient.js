const axios = require("axios");
const logger = require("../helpers/logger");

const CDNS = [
  {
    url: "https://render.albiononline.com/v1/item/{type}.png?quality={quality}",
    qualitySupport: true,
    trash: true,
  },
  {
    url: "https://gameinfo.albiononline.com/api/gameinfo/items/{type}",
    qualitySupport: true,
    trash: true,
  },
];

async function downloadFromCDNs(item, writer) {
  logger.verbose(`Searching item "${item.Type}_Q${item.Quality}" in CDNs...`);

  for (const cdn of CDNS) {
    // If the CDN does not support quality and item has Quality, skip this cdn
    if (!cdn.qualitySupport && item.Quality > 0) continue;
    // If trash item is outdated, skip
    if (!cdn.trash && item.Type.includes("_TRASH")) continue;

    const url = cdn.url.replace("{type}", item.Type).replace("{quality}", item.Quality);

    try {
      const response = await axios.get(url, {
        timeout: 30000,
        responseType: "stream",
      });

      response.data.pipe(writer);
      logger.debug(`Downloading "${url}"`);

      return new Promise((resolve) => {
        writer.on("finish", () => resolve(true));
        writer.on("error", () => resolve(false));
      });
    } catch (e) {
      logger.debug(`Unable to download ${url}:`, e);
      return false;
    }
  }

  return false;
}

module.exports = {
  downloadFromCDNs,
};
