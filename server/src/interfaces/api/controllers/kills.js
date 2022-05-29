const eventsService = require("../../../services/events");

async function getKill(req, res) {
  const { killId } = req.params;

  const kill = await eventsService.getEvent(killId);
  if (!kill) return res.sendStatus(404);

  return res.send(kill);
}

module.exports = {
  getKill,
};
