const usersService = require("../../../services/users");

async function getUser(req, res) {
  try {
    if (!req.session.discord) return res.sendStatus(401);

    const { accessToken } = req.session.discord;
    return res.send(await usersService.getCurrentUser(accessToken));
  } catch (error) {
    return res.sendStatus(401);
  }
}

module.exports = {
  getUser,
};
