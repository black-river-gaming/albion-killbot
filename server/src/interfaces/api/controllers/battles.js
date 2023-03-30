const battlesService = require("../../../services/battles");

async function getBattle(req, res) {
  const { battleId } = req.params;
  const { server } = req.query;

  const battle = await battlesService.getBattle(battleId, { server });
  if (!battle) return res.sendStatus(404);

  return res.send(battle);
}

module.exports = {
  getBattle,
};
