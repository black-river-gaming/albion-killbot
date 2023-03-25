const axios = require("axios");
const moment = require("moment");
const { SERVERS } = require("../../helpers/constants");
const logger = require("../../helpers/logger");
const { sleep } = require("../../helpers/scheduler");

const ALLIANCES_ENDPOINT = "alliances";
const BATTLES_ENDPOINT = "battles";
const EVENTS_ENDPOINT = "events";
const GUILDS_ENDPOINT = "guilds";
const PLAYERS_ENDPOINT = "players";
const PLAYER_FAME_ENDPOINT = "events/playerfame";
const SEARCH_ENDPOINT = "search";

const STATISTICS_TYPES = {
  PVE: "PvE",
  GATHERING: "Gathering",
  CRAFTING: "Crafting",
};

const BATTLES_SORT = "recent";
const DEFAULT_LIMIT = 51;

const ALBION_SERVERS = [
  {
    name: SERVERS.WEST,
    url: "https://gameinfo.albiononline.com/api/gameinfo/",
  },
  {
    name: SERVERS.EAST,
    url: "https://gameinfo-sgp.albiononline.com/api/gameinfo/",
  },
];

const albionApiClient = axios.create({
  baseURL: ALBION_SERVERS[0].url,
});

// Setup timeouts for crawler axios client because sometimes server just hangs indefinetly
albionApiClient.interceptors.request.use((config) => {
  if (config.server) {
    const server = ALBION_SERVERS.find((server) => server.name === config.server);
    if (server) config.baseURL = server.url;
  }

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

async function getEvent(eventId, { server }) {
  const res = await albionApiClient.get(`${EVENTS_ENDPOINT}/${eventId}`, {
    server,
  });
  return res.data;
}

async function getEvents({ server, limit = DEFAULT_LIMIT, offset = 0 }) {
  const params = {
    offset,
    limit,
    timestamp: moment().unix(),
  };

  const res = await albionApiClient.get(EVENTS_ENDPOINT, { server, params });
  return res.data;
}

async function getBattle(battleId, { server }) {
  const res = await albionApiClient.get(`${BATTLES_ENDPOINT}/${battleId}`, { server });
  return res.data;
}

async function getBattles({ server, limit = DEFAULT_LIMIT, offset = 0 }) {
  const params = {
    offset,
    limit,
    sort: BATTLES_SORT,
    timestamp: moment().unix(),
  };

  const res = await albionApiClient.get(BATTLES_ENDPOINT, { server, params });
  return res.data;
}

async function getPlayer(playerId, { server }) {
  const res = await albionApiClient.get(`${PLAYERS_ENDPOINT}/${playerId}`, { server });
  return res.data;
}

async function getGuild(guildId, { server }) {
  const res = await albionApiClient.get(`${GUILDS_ENDPOINT}/${guildId}`, { server });
  return res.data;
}

async function getAlliance(allianceId, { server }) {
  const res = await albionApiClient.get(`${ALLIANCES_ENDPOINT}/${allianceId}`, { server });
  return res.data;
}

async function getStatistics(guildId, type, { server }) {
  const params = {
    guildId,
    type,
    subtype: type === STATISTICS_TYPES.GATHERING ? "All" : null,
    range: "month",
    limit: 11,
    offset: 0,
    region: "Total",
    timestamp: moment().unix(),
  };

  const res = await albionApiClient.get("players/statistics", { server, params });
  return res.data;
}

async function getPlayerFame(guildId, { server }) {
  const params = {
    guildId,
    range: "month",
    limit: 11,
    offset: 0,
    timestamp: moment().unix(),
  };

  const res = await albionApiClient.get(PLAYER_FAME_ENDPOINT, { server, params });
  return res.data;
}

async function search(q, { server }) {
  const params = { q };
  const res = await albionApiClient.get(SEARCH_ENDPOINT, { server, params });
  return res.data;
}

module.exports = {
  ALBION_SERVERS,
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
