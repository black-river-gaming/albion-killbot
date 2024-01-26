const config = require("config");
const { findOne, replaceOne } = require("../ports/database");
const albion = require("../ports/albion");

const GUILDS_COLLECTION = "guilds";

async function getGuildByTrackGuild(trackGuild) {
  return findOne(GUILDS_COLLECTION, { server: trackGuild.server, Id: trackGuild.id });
}

async function updateGuildDataByTrackGuild(trackGuild) {
  const guild = await albion.getGuild(trackGuild.id, {
    server: trackGuild.server,
    rankings: config.get("features.guildRankings"),
  });

  if (!guild) return;
  guild.server = trackGuild.server;
  guild.updatedAt = new Date();

  return replaceOne(GUILDS_COLLECTION, { server: guild.server, Id: guild.Id }, guild, { upsert: true });
}

module.exports = {
  getGuildByTrackGuild,
  updateGuildDataByTrackGuild,
};
