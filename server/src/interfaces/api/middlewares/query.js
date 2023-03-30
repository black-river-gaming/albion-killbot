const { SERVERS, SERVER_LIST } = require("../../../helpers/constants");

function validateServer(req, res, next) {
  if (!req.query.server) req.query.server = SERVERS.WEST;
  if (SERVER_LIST.indexOf(req.query.server) === -1) return res.sendStatus(400);

  next();
}

module.exports = {
  validateServer,
};
