const axios = require("axios");
const moment = require("moment");
const logger = require("../helpers/logger");
const { sleep } = require("../helpers/utils");

const ALLIANCES_ENDPOINT = "alliances";
const BATTLES_ENDPOINT = "battles";
const EVENTS_ENDPOINT = "events";
const GUILDS_ENDPOINT = "guilds";
const PLAYERS_ENDPOINT = "players";
const PLAYER_FAME_ENDPOINT = "events/playerfame";
const SEARCH_ENDPOINT = "search";
const STATISTICS_ENDPOINT = "players/statistics";

const STATISTICS_TYPES = {
  PVE: "PvE",
  GATHERING: "Gathering",
  CRAFTING: "Crafting",
};

const BATTLES_SORT = "recent";
const DEFAULT_LIMIT = 51;

const albionApiClient = axios.create({
  baseURL: "https://gameinfo.albiononline.com/api/gameinfo/",
});

// Setup timeouts for crawler axios client because sometimes server just hangs indefinetly
albionApiClient.interceptors.request.use((config) => {
  const source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel("Client timeout");
  }, 60000);
  config.cancelToken = source.token;
  return config;
});

// Also, setup an automatic retry mechanism since API throws a lot of 504 errors
albionApiClient.interceptors.response.use(null, async (error) => {
  const { config, response } = error;

  if (config && response && response.status == 504) {
    logger.warn(`Albion API request to ${config.url} returned ${response.status}. Retrying...`);
    await sleep(5000);
    return albionApiClient.request(config);
  }

  return Promise.reject(error);
});

async function getEvent(eventId) {
  const res = await albionApiClient.get(`${EVENTS_ENDPOINT}/${eventId}`);
  return res.data;
}

async function getEvents({ limit = DEFAULT_LIMIT, offset = 0 }) {
  const params = {
    offset,
    limit,
    timestamp: moment().unix(),
  };

  const res = await albionApiClient.get(EVENTS_ENDPOINT, { params });
  return res.data;
}

async function getBattle(battleId) {
  const res = await albionApiClient.get(`${BATTLES_ENDPOINT}/${battleId}`);
  return res.data;
}

async function getBattles({ limit = DEFAULT_LIMIT, offset = 0 }) {
  const params = {
    offset,
    limit,
    sort: BATTLES_SORT,
    timestamp: moment().unix(),
  };

  const res = await albionApiClient.get(BATTLES_ENDPOINT, { params });
  return res.data;
}

async function getPlayer(playerId) {
  const res = await albionApiClient.get(`${PLAYERS_ENDPOINT}/${playerId}`);
  return res.data;
}

async function getGuild(guildId) {
  const res = await albionApiClient.get(`${GUILDS_ENDPOINT}/${guildId}`);
  return res.data;
}

async function getAlliance(allianceId) {
  const res = await albionApiClient.get(`${ALLIANCES_ENDPOINT}/${allianceId}`);
  return res.data;
}

async function getStatistics(guildId, type) {
  const params = {
    guildId,
    type,
    range: "month",
    limit: 11,
    offset: 0,
    region: "Total",
    timestamp: moment().unix(),
  };

  const res = await albionApiClient.get(STATISTICS_ENDPOINT, { params });
  return res.data;
}

async function getPlayerFame(guildId) {
  const params = {
    guildId,
    range: "month",
    limit: 11,
    offset: 0,
    timestamp: moment().unix(),
  };

  const res = await albionApiClient.get(PLAYER_FAME_ENDPOINT, { params });
  return res.data;
}

async function search(q) {
  const params = { q };
  const res = await albionApiClient.get(SEARCH_ENDPOINT, { params });
  return res.data;
}

module.exports = {
  STATISTICS_TYPES,
  getAlliance,
  getBattle,
  getBattles,
  getEvent,
  getEvents,
  getGuild,
  getPlayer,
  getPlayerFame,
  getStatistics,
  search,
};
