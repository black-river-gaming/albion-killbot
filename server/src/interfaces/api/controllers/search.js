const searchService = require("../../../services/search");
const { isAlbionId } = require("../../../helpers/albion");
const logger = require("../../../helpers/logger");
const { SERVERS } = require("../../../helpers/constants");

async function search(req, res) {
  const { query } = req.params;
  const { server = SERVERS.WEST } = req.query;

  try {
    if (isAlbionId(query)) {
      const [player, guild, alliance] = await Promise.all([
        searchService.getPlayer(server, query),
        searchService.getGuild(server, query),
        searchService.getAlliance(server, query),
      ]);

      if (player || guild || alliance) {
        return res.send({
          players: player ? [player] : [],
          guilds: guild ? [guild] : [],
          alliances: alliance ? [alliance] : [],
        });
      }
    }

    return res.send(await searchService.search(server, query));
  } catch (error) {
    logger.warn(`Failed to search in Albion Online: ${error.message}`, { server, query, error });
    return res.sendStatus(500);
  }
}

module.exports = {
  search,
};
