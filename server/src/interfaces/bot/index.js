const config = require("config");
const { ShardingManager } = require("discord.js");
const path = require("node:path");
const logger = require("../../helpers/logger");

let manager;

async function run() {
  if (!config.has("discord.token")) {
    throw new Error("Please define DISCORD_TOKEN environment variable with the discord token.");
  }

  logger.info(`Starting Albion-Killbot.`);

  const botFile = path.join(__dirname, "bot.js");
  require(botFile); // This can throw errors before spawning, preventing inconsistencies

  const SHARDS_TOTAL = config.get("bot.shards.total");
  const totalShards = SHARDS_TOTAL !== "auto" ? Number.parseInt(SHARDS_TOTAL) : "auto";
  const SHARDS_TO_SPAWN = config.get("bot.shards.spawn");
  const shardList = SHARDS_TO_SPAWN !== "auto" ? SHARDS_TO_SPAWN.split(",").map((i) => Number.parseInt(i)) : "auto";

  manager = new ShardingManager(botFile, {
    token: config.get("discord.token"),
    totalShards,
    shardList,
    respawn: true,
  });

  await manager.spawn();
}

async function cleanup(reason) {
  logger.info(`Shutting down Albion-Killbot. Reason: ${reason}`);

  for (const shard of manager.shards.values()) {
    logger.verbose(`Killing shard #${shard.id}`);
    await shard.kill();
  }
}

module.exports = {
  run,
  cleanup,
};
