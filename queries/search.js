const axios = require("axios");

const SEARCH_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/search";

exports.search = async q => {
  try {
    console.log(`Searching entities in Albion Online for: ${q}`);
    const res = await axios.get(SEARCH_ENDPOINT, { params: { q } });
    return res.data;
  } catch (e) {
    console.log(`Failed to search entities in API: ${e}`);
    return {
      players: [],
      guilds: [],
      alliances: []
    };
  }
};
