const usersService = require("../../../services/users");

async function getUser(req, res) {
  try {
    const { accessToken } = req.session.discord;
    if (!accessToken) return res.sendStatus(404);
    return res.send(await usersService.getCurrentUser(accessToken));
  } catch (error) {
    return res.sendStatus(403);
  }
}

module.exports = {
  getUser,
};
