const { getServerById, SERVER_DEFAULT } = require("../../../helpers/albion");

function validateServer(req, res, next) {
  if (!req.query.server) req.query.server = SERVER_DEFAULT.id;
  if (!getServerById(req.query.server)) return res.sendStatus(400);

  next();
}

module.exports = {
  validateServer,
};
