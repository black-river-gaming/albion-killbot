require("dotenv").config();
const logger = require("./logger")("system");
const axios = require("axios");
const { ShardingManager } = require("discord.js");
const { runDaily, runInterval, fileSizeFormatter } = require("./utils");
const events = require("./queries/events");
const battles = require("./queries/battles");
const dailyRanking = require("./queries/dailyRanking");
const database = require("./database");
const queue = require("./queue");

axios.interceptors.request.use((config) => {
  const source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel("Client timeout");
  }, 60000);
  config.cancelToken = source.token;
  return config;
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  logger.error(
    "Please define DISCORD_TOKEN environment variable with the discord token."
  );
  process.exit(1);
}

const manager = new ShardingManager("./bot.js", {
  token,
  totalShards: Number(process.env.TOTAL_SHARDS) || "auto",
});

manager.on("shardCreate", (shard) => {
  logger.info(`Launched shard #${shard.id}`);
});

database.connect();
queue.connect();
manager.spawn();

runDaily(dailyRanking.clear, "Clear PvP Ranking", 0, 10);
runInterval(events.get, "Fetch events from Albion API", {}, 10000);
runInterval(battles.get, "Fetch battles from Albion API", {}, 60000);
runInterval(
  () => {
    logger.debug(
      `Memory usage (approx): ${fileSizeFormatter(
        process.memoryUsage().heapUsed
      )}`
    );
  },
  {},
  60000
);
