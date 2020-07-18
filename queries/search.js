const axios = require("axios");
const logger = require("../logger")("queries.search");

const SEARCH_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/search";

exports.search = async q => {
  try {
    logger.debug(`Searching entities in Albion Online for: ${q}`);
    const res = await axios.get(SEARCH_ENDPOINT, {
      params: { q },
      timeout: 60000,
    });
    return res.data;
  } catch (e) {
    logger.error(`Failed to search entities in API: ${e}`);
    return {
      players: [],
      guilds: [],
      alliances: [],
    };
  }
};
