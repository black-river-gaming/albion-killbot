const searchService = require("../../../services/search");
const { isAlbionId } = require("../../../helpers/albion");

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
  } catch (e) {
    return res.sendStatus(500);
  }
}

module.exports = {
  search,
};
