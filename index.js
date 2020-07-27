require("dotenv").config();
const bot = require("./bot");
const logger = require("./logger")("system");
const axios = require("axios");

axios.interceptors.request.use(config => {
  const source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel("Client timeout");
  }, 60000);
  config.cancelToken = source.token;
  return config;
});

const token = process.env.TOKEN;
if (!token) {
  logger.error(
    "Please define TOKEN environment variable with the discord token.",
  );
  process.exit(1);
}

bot.run(token);
