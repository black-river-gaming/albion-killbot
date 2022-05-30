const usersService = require("../../../services/users");

async function getUser(req, res) {
  try {
    const { accessToken } = req.session.discord;
    return res.send(await usersService.getCurrentUser(accessToken));
  } catch (error) {
    return res.sendStatus(403);
  }
}

async function getUserServers(req, res) {
  try {
    const { accessToken } = req.session.discord;
    return res.send(await usersService.getCurrentUserServers(accessToken));
  } catch (error) {
    return res.sendStatus(403);
  }
}

module.exports = {
  getUser,
  getUserServers,
};
