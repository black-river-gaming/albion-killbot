const axios = require("axios");
const moment = require("moment");

const EVENTS_ENDPOINT = "events";
const EVENTS_LIMIT = 51;

const albionApiClient = axios.create({
  baseURL: "https://gameinfo.albiononline.com/api/gameinfo/",
});

// Setup timeouts for crawler axios client beucase sometimes server just hangs indefinetly
albionApiClient.interceptors.request.use((config) => {
  const source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel("Client timeout");
  }, 60000);
  config.cancelToken = source.token;
  return config;
});

async function getEvents({ limit = EVENTS_LIMIT, offset = 0 }) {
  const res = await albionApiClient.get(EVENTS_ENDPOINT, {
    params: {
      offset,
      limit,
      timestamp: moment().unix(),
    },
    timeout: 60000,
  });

  return res.data;
}

module.exports = {
  getEvents,
};
