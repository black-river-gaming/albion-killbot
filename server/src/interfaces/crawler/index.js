const axios = require("axios");
const logger = require("../../helpers/logger");
const { runInterval } = require("../../helpers/utils");
const { fetchEvents, fetchBattles } = require("./controllers/events");

// Setup timeouts for crawler axios client
// FIXME: Move this to the correspondent adapter
axios.interceptors.request.use((config) => {
  const source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel("Client timeout");
  }, 60000);
  config.cancelToken = source.token;
  return config;
});

async function run() {
  logger.info("Starting Crawler...");
  runInterval("Fetch events", fetchEvents, { interval: 30 });
  runInterval("Fetch battles", fetchBattles, { interval: 120 });
}

module.exports = {
  run,
};
