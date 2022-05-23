const battlesService = require("../../../services/battles");

async function getBattle(req, res) {
  const { battleId } = req.params;
  const battle = await battlesService.getBattle(battleId);
  return res.send(battle);
}

module.exports = {
  getBattle,
};
