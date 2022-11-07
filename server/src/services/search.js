const albion = require("../ports/albion");
const { toTrackEntity } = require("../helpers/albion");

async function getPlayer(playerId) {
  const player = await albion.getPlayer(playerId, { silent: true });
  return toTrackEntity(player);
}

async function getGuild(guildId) {
  const guild = await albion.getGuild(guildId, {
    rankings: false,
    silent: true,
  });
  return toTrackEntity(guild);
}

async function getAlliance(allianceId) {
  const alliance = await albion.getAlliance(allianceId, { silent: true });
  return toTrackEntity(alliance);
}

async function search(q) {
  const search = await albion.search(q);
  return {
    players: search.players.map(toTrackEntity),
    guilds: search.guilds.map(toTrackEntity),
    alliances: [],
  };
}

module.exports = {
  getAlliance,
  getGuild,
  getPlayer,
  search,
};
