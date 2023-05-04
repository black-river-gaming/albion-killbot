const axios = require("axios");
const { SERVERS } = require("../../helpers/constants");

const ALBION_SERVERS = [
  {
    name: SERVERS.WEST,
    url: "https://www.albion-online-data.com/api/v2/stats/",
  },
  {
    name: SERVERS.EAST,
    url: "https://east.albion-online-data.com/api/v2/stats/",
  },
];

const albionDataApiClient = axios.create({
  baseURL: ALBION_SERVERS[0].url,
});

albionDataApiClient.interceptors.request.use((config) => {
  if (config.server) {
    const server = ALBION_SERVERS.find((server) => server.name === config.server);
    if (server) config.baseURL = server.url;
  }

  const source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel("Client timeout");
  }, 10000);
  config.cancelToken = source.token;

  return config;
});

async function getPrices(itemList, { server, locations, qualities }) {
  const res = await albionDataApiClient.get(`Prices/${itemList}.json`, {
    server,
    params: {
      locations,
      qualities,
    },
  });
  return res.data;
}

module.exports = {
  getPrices,
};
