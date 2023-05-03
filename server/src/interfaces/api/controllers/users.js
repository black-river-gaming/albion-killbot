const logger = require("../../../helpers/logger");
const usersService = require("../../../services/users");

async function getUser(req, res) {
  try {
    if (!req.session.discord) return res.sendStatus(401);

    const { accessToken } = req.session.discord;
    return res.send(await usersService.getCurrentUser(accessToken));
  } catch (error) {
    logger.warn(`Unable to retrieve user: ${error.message}`, {
      error,
    });
    return res.sendStatus(401);
  }
}

module.exports = {
  getUser,
};
