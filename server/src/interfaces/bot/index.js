const { ShardingManager } = require("discord.js");
const path = require("node:path");
const logger = require("../../helpers/logger");

let manager;

async function run() {
  const { DISCORD_TOKEN, SHARDS_TOTAL = "auto", SHARDS_TO_SPAWN = "auto" } = process.env;
  if (!DISCORD_TOKEN) {
    throw new Error("Please define DISCORD_TOKEN environment variable with the discord token.");
  }

  logger.info(`Starting Albion-Killbot.`);

  const botFile = path.join(__dirname, "bot.js");
  require(botFile); // This can throw errors before spawning, preventing inconsistencies

  const totalShards = SHARDS_TOTAL !== "auto" ? Number.parseInt(SHARDS_TOTAL) : "auto";
  const shardList = SHARDS_TO_SPAWN !== "auto" ? SHARDS_TO_SPAWN.split(",").map((i) => Number.parseInt(i)) : "auto";

  manager = new ShardingManager(botFile, {
    token: DISCORD_TOKEN,
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
