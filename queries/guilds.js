const axios = require("axios");

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
  console.log(`Fetching guild ${guildId}...`);
  try {
    const res = await axios.get(`${GUILDS_ENDPOINT}/${guildId}`);
    return getNewEvents(res.data);
  } catch (err) {
    console.error(`Unable to fetch data from API: ${err}`);
    return [];
  }
};

exports.getGuildRankings = async guildId => {
  console.log(`Fetching guild ${guildId} rankings...`);
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
      console.log("Fetching PvE rankings...");
      params.type = "PvE";
      try {
        const pveRes = await axios.get(STATISTICS_ENDPOINT, { params });
        rankings.pve = pveRes.data;
      } catch (e) {
        console.log(`Failed to fetch PvE rankings: ${e}. Trying again...`);
      }
      await sleep(5000);
    }

    while (!rankings.pvp) {
      console.log("Fetching PvP rankings...");
      params.type = "PvP";
      try {
        const pvpRes = await axios.get(FAME_ENDPOINT, { params });
        rankings.pvp = pvpRes.data;
      } catch (e) {
        console.log(`Failed to fetch PvP rankings: ${e}. Trying again...`);
      }
      await sleep(5000);
    }

    while (!rankings.gathering) {
      console.log("Fetching Gathering rankings...");
      params.type = "Gathering";
      params.subtype = "All";
      try {
        const gatherRes = await axios.get(STATISTICS_ENDPOINT, { params });
        rankings.gathering = gatherRes.data;
      } catch (e) {
        console.log(
          `Failed to fetch Gathering rankings: ${e}. Trying again...`
        );
      }
      await sleep(5000);
    }

    while (!rankings.crafting) {
      console.log("Fetching Crafting rankings...");
      params.type = "Crafting";
      delete params.subtype;
      try {
        const craftRes = await axios.get(STATISTICS_ENDPOINT, { params });
        rankings.crafting = craftRes.data;
      } catch (e) {
        console.log(`Failed to fetch Crafting rankings: ${e}. Trying again...`);
      }
      await sleep(5000);
    }

    console.log("Fetch success! Displaying rankgs.");
    return rankings;
  } catch (err) {
    console.error(`Unable to fetch data from API: ${err}`);
    return rankings;
  }
};
