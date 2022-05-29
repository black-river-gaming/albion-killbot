const discord = require("../../../ports/discord");

async function getUserProfile(req, res) {
  try {
    const { accessToken } = req.session.discord;
    const user = await discord.getMe(accessToken);
    return res.send(user);
  } catch (error) {
    return res.sendStatus(403);
  }
}

module.exports = {
  getUserProfile,
};
