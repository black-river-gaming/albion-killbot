const { ShardingManager } = require("discord.js");
const path = require("node:path");
const logger = require("../../helpers/logger");

let manager;

async function run() {
  const { DISCORD_TOKEN, TOTAL_SHARDS } = process.env;
  if (!DISCORD_TOKEN) {
    throw new Error("Please define DISCORD_TOKEN environment variable with the discord token.");
  }

  logger.info(`Starting Albion-Killbot.`);

  const botFile = path.join(__dirname, "bot.js");
  require(botFile); // This can throw errors before spawning, preventing inconsistencies

  manager = new ShardingManager(botFile, {
    token: DISCORD_TOKEN,
    totalShards: TOTAL_SHARDS || "auto",
    respawn: true,
  });

  manager.spawn();
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
