const albion = require("../ports/albion");
const { toTrackEntity } = require("../helpers/albion");

async function getPlayer(server, playerId) {
  const player = await albion.getPlayer(playerId, { server, silent: true });
  return toTrackEntity(player, server);
}

async function getGuild(server, guildId) {
  const guild = await albion.getGuild(guildId, {
    server,
    rankings: false,
    silent: true,
  });
  return toTrackEntity(guild, server);
}

async function getAlliance(server, allianceId) {
  const alliance = await albion.getAlliance(allianceId, { server, silent: true });
  return toTrackEntity(alliance, server);
}

async function search(server, q) {
  const search = await albion.search(q, { server });
  return {
    players: search.players.map((player) => toTrackEntity(player, server)),
    guilds: search.guilds.map((guild) => toTrackEntity(guild, server)),
    alliances: [],
  };
}

module.exports = {
  getAlliance,
  getGuild,
  getPlayer,
  search,
};
