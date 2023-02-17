const axios = require("axios");
const logger = require("../../helpers/logger");

const CDNS = [
  {
    url: "https://render.albiononline.com/v1/item/{type}.png?quality={quality}",
    quality: true,
    trash: true,
  },
  {
    url: "https://gameinfo.albiononline.com/api/gameinfo/items/{type}",
    quality: false,
    trash: true,
  },
];

async function downloadFromCDNs(item, writer) {
  logger.verbose(`Searching item "${item.Type}_Q${item.Quality}" in CDNs...`, { item });

  for (const cdn of CDNS) {
    // If the CDN does not support quality and item has Quality, skip this cdn
    if (!cdn.quality && item.Quality > 0) continue;
    // If trash item is outdated, skip
    if (!cdn.trash && item.Type.includes("_TRASH")) continue;

    const url = cdn.url.replace("{type}", item.Type).replace("{quality}", item.Quality);

    try {
      const response = await axios.get(url, {
        timeout: 30000,
        responseType: "stream",
      });

      return new Promise((resolve) => {
        logger.debug(`Downloading "${url}"...`, { item, cdn });
        response.data.pipe(writer);
        writer.on("finish", () => resolve(true));
        writer.on("error", () => resolve(false));
        // Emergency timeout
        setTimeout(() => resolve(false), 30000);
      });
    } catch (error) {
      logger.debug(`Unable to download ${url}: ${error.message}`, { error });
    }
  }

  return false;
}

module.exports = {
  downloadFromCDNs,
};
