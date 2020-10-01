const axios = require("axios");
const logger = require("../logger")("queries.search");

const SEARCH_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/search";

exports.search = async q => {
  try {
    logger.debug(`Searching entities in Albion Online for: ${q}`);
    const res = await axios.get(SEARCH_ENDPOINT, {
      params: { q },
    });
    return res.data;
  } catch (e) {
    logger.error(`Failed to search entities in API: ${e}`);
    return null;
  }
};

// TODO: Move this to a queries.alliances once it exists
const ALLIANCE_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/alliances";

exports.getAllianceById = async id => {
  try {
    logger.debug(`Getting alliance info in Albion Online server: ${id}`);
    const res = await axios.get(`${ALLIANCE_ENDPOINT}/${id}`);
    return res.data;
  } catch (e) {
    logger.error(`Failed to fetch Alliance in API: ${e}`);
    return null;
  }
};
