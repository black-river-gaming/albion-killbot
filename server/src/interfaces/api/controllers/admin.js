const logger = require("../../../helpers/logger");
const serversService = require("../../../services/servers");

async function getServers(req, res) {
  try {
    const { limit, after, before } = req.query;
    const servers = await serversService.getBotServers({ limit, after, before });

    return res.send(servers);
  } catch (error) {
    logger.error(`Unknown error:`, error);
    return res.sendStatus(500);
  }
}

module.exports = {
  getServers,
};
