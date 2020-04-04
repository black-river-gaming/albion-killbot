const axios = require("axios");
const logger = require("../logger");

// TODO: Export this to a const file
const GUILDS_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/guilds";
const STATISTICS_ENDPOINT =
  "https://gameinfo.albiononline.com/api/gameinfo/players/statistics";
const FAME_ENDPOINT =
  "https://gameinfo.albiononline.com/api/gameinfo/events/playerfame";

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

exports.getGuild = async guildId => {
  logger.debug(`Fetching guild ${guildId}...`);
  try {
    const res = await axios.get(`${GUILDS_ENDPOINT}/${guildId}`);
    return res.data;
  } catch (err) {
    logger.error(`Unable to fetch data from API: ${err}`);
    return [];
  }
};

exports.getGuildRankings = async guildId => {
  logger.debug(`Fetching guild ${guildId} rankings...`);
  const rankings = {
    pve: null,
    pvp: null,
    gathering: null,
    crafting: null
  };
  try {
    const params = {
      range: "month",
      limit: 11,
      offset: 0,
      reigon: "Total",
      guildId
    };

    while (!rankings.pve) {
      logger.debug("Fetching PvE rankings...");
      params.type = "PvE";
      try {
        const pveRes = await axios.get(STATISTICS_ENDPOINT, { params });
        rankings.pve = pveRes.data;
      } catch (e) {
        logger.error(`Failed to fetch PvE rankings: ${e}. Trying again...`);
      }
      await sleep(5000);
    }

    while (!rankings.pvp) {
      logger.debug("Fetching PvP rankings...");
      params.type = "PvP";
      try {
        const pvpRes = await axios.get(FAME_ENDPOINT, { params });
        rankings.pvp = pvpRes.data;
      } catch (e) {
        logger.error(`Failed to fetch PvP rankings: ${e}. Trying again...`);
      }
      await sleep(5000);
    }

    while (!rankings.gathering) {
      logger.debug("Fetching Gathering rankings...");
      params.type = "Gathering";
      params.subtype = "All";
      try {
        const gatherRes = await axios.get(STATISTICS_ENDPOINT, { params });
        rankings.gathering = gatherRes.data;
      } catch (e) {
        logger.error(
          `Failed to fetch Gathering rankings: ${e}. Trying again...`
        );
      }
      await sleep(5000);
    }

    while (!rankings.crafting) {
      logger.debug("Fetching Crafting rankings...");
      params.type = "Crafting";
      delete params.subtype;
      try {
        const craftRes = await axios.get(STATISTICS_ENDPOINT, { params });
        rankings.crafting = craftRes.data;
      } catch (e) {
        logger.error(
          `Failed to fetch Crafting rankings: ${e}. Trying again...`
        );
      }
      await sleep(5000);
    }

    logger.debug("Fetch success! Displaying rankgs.");
    return rankings;
  } catch (err) {
    logger.error(`Unable to fetch data from API: ${err}`);
    return rankings;
  }
};
