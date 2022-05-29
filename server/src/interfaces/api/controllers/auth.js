const moment = require("moment");
const discord = require("../../../ports/discord");

async function auth(req, res) {
  try {
    const { code } = req.body;

    const token = await discord.getToken(code);

    req.session.discord = {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expires: moment().add(token.expires_in, "seconds"),
    };

    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(403);
  }
}

async function getUserProfile(req, res) {
  try {
    const { accessToken } = req.session.discord;
    console.log(req.session.discord);
    const user = await discord.getMe(accessToken);
    return res.send(user);
  } catch (error) {
    return res.sendStatus(403);
  }
}

module.exports = {
  auth,
  getUserProfile,
};
