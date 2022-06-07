const albion = require("../ports/albion");
const { toSearchResult } = require("../helpers/albion");

async function getPlayer(playerId) {
  const player = await albion.getPlayer(playerId, { silent: true });
  return toSearchResult(player);
}

async function getGuild(guildId) {
  const guild = await albion.getGuild(guildId, {
    rankings: false,
    silent: true,
  });
  return toSearchResult(guild);
}

async function getAlliance(allianceId) {
  const alliance = await albion.getAlliance(allianceId, { silent: true });
  return toSearchResult(alliance);
}

async function search(q) {
  const search = await albion.search(q);
  return {
    players: search.players.map(toSearchResult),
    guilds: search.guilds.map(toSearchResult),
    alliances: [],
  };
}

module.exports = {
  getAlliance,
  getGuild,
  getPlayer,
  search,
};
