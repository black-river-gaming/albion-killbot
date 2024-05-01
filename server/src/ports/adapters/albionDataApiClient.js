const axios = require("axios");
const { SERVERS } = require("../../helpers/albion");

const ALBION_SERVERS = [
  {
    id: SERVERS.AMERICAS.id,
    url: "https://www.albion-online-data.com/api/v2/stats/",
  },
  {
    id: SERVERS.ASIA.id,
    url: "https://east.albion-online-data.com/api/v2/stats/",
  },
  {
    id: SERVERS.EUROPE.id,
    url: "https://europe.albion-online-data.com/api/v2/stats/",
  },
];

const albionDataApiClient = axios.create({
  baseURL: ALBION_SERVERS[0].url,
});

albionDataApiClient.interceptors.request.use((config) => {
  if (config.server) {
    const server = ALBION_SERVERS.find((server) => server.id === config.server.id);
    if (server) config.baseURL = server.url;
  }

  const source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel("Client timeout");
  }, 10000);
  config.cancelToken = source.token;

  return config;
});

async function getCurrentPrices(itemList, { server, locations, qualities }) {
  const res = await albionDataApiClient.get(`Prices/${itemList}.json`, {
    server,
    params: {
      locations,
      qualities,
    },
  });
  return res.data;
}

async function getHistoryPrices(itemList, { server, locations, qualities, timeScale = 24 }) {
  const res = await albionDataApiClient.get(`history/${itemList}.json`, {
    server,
    params: {
      locations,
      qualities,
      "time-scale": timeScale,
    },
  });
  return res.data;
}

module.exports = {
  getCurrentPrices,
  getHistoryPrices,
};
