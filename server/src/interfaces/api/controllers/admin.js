const serversService = require("../../../services/servers");

async function getServers(req, res) {
  try {
    const servers = await serversService.getBotServers();

    return res.send(servers);
  } catch (error) {
    return res.sendStatus(500);
  }
}

async function leaveServer(req, res) {
  try {
    const { serverId } = req.params;
    await serversService.leaveServer(serverId);

    return res.send({});
  } catch (error) {
    return res.sendStatus(500);
  }
}

module.exports = {
  getServers,
  leaveServer,
};
