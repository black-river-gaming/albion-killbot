const axios = require("axios");
const logger = require("../../helpers/logger");
const { runInterval } = require("../../helpers/utils");

// Setup timeouts for crawler axios client
axios.interceptors.request.use((config) => {
  const source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel("Client timeout");
  }, 60000);
  config.cancelToken = source.token;
  return config;
});

const noop = () => {
  logger.debug("noop");
  logger.debug(process.env.NODE_ENV);
};

async function run() {
  logger.info("Starting Crawler...");
  runInterval("Fetch events from Albion API", noop, { interval: 10, runOnStart: true });
  //runInterval("Fetch battles from Albion API", noop, { interval: 60 });
}

module.exports = {
  run,
};
