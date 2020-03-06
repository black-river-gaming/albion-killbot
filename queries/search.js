const axios = require("axios");

const SEARCH_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/search";

exports.search = async q => {
  try {
    const res = await axios.get(SEARCH_ENDPOINT, { params: { q } });
    return res.data;
  } catch (e) {
    return {
      players: [],
      guilds: [],
      alliances: []
    };
  }
};
