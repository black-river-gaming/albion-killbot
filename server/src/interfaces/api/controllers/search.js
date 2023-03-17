const searchService = require("../../../services/search");
const { isAlbionId } = require("../../../helpers/albion");
const logger = require("../../../helpers/logger");

async function search(req, res) {
  try {
    const { query } = req.params;

    if (isAlbionId(query)) {
      const [player, guild, alliance] = await Promise.all([
        searchService.getPlayer(query),
        searchService.getGuild(query),
        searchService.getAlliance(query),
      ]);

      if (player || guild || alliance) {
        return res.send({
          players: player ? [player] : [],
          guilds: guild ? [guild] : [],
          alliances: alliance ? [alliance] : [],
        });
      }
    }

    const results = await searchService.search(query);

    return res.send(results);
  } catch (error) {
    logger.error(`Failed to search entities in Albion Online: ${error.message}`, { error });
    return res.sendStatus(500);
  }
}

module.exports = {
  search,
};
