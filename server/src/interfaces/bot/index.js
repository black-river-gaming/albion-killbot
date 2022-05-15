const { ShardingManager } = require("discord.js");
const logger = require("../../helpers/logger");
const { runDaily } = require("../../helpers/utils");

async function init() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    logger.error("Please define DISCORD_TOKEN environment variable with the discord token.");
    process.exit(1);
  }

  const manager = new ShardingManager("./bot.js", {
    token,
    totalShards: Number(process.env.TOTAL_SHARDS) || "auto",
  });

  manager.on("shardCreate", (shard) => {
    logger.info(`Launched bot shard #${shard.id}`);
  });

  manager.spawn();
}

async function run() {
  logger.info("Starting Bot...");
  await init();
  runDaily("Clear daily ranking", () => {}, { hour: 0, minute: 10 });
}

module.exports = {
  run,
};
