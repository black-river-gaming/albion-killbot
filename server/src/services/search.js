const albion = require("../ports/albion");
const { toTrackEntity, getServerById } = require("../helpers/albion");

async function getPlayer(serverId, playerId) {
  const player = await albion.getPlayer(playerId, { server: getServerById(serverId), silent: true });
  return toTrackEntity(player, serverId);
}

async function getGuild(serverId, guildId) {
  const guild = await albion.getGuild(guildId, {
    server: getServerById(serverId),
    rankings: false,
    silent: true,
  });
  return toTrackEntity(guild, serverId);
}

async function getAlliance(serverId, allianceId) {
  const alliance = await albion.getAlliance(allianceId, { server: getServerById(serverId), silent: true });
  return toTrackEntity(alliance, serverId);
}

async function search(serverId, q) {
  const search = await albion.search(q, { server: getServerById(serverId) });
  return {
    players: search.players.map((player) => toTrackEntity(player, serverId)),
    guilds: search.guilds.map((guild) => toTrackEntity(guild, serverId)),
    alliances: [],
  };
}

module.exports = {
  getAlliance,
  getGuild,
  getPlayer,
  search,
};
