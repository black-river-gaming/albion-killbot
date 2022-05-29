const moment = require("moment");
const discord = require("../../../ports/discord");

async function getDiscordToken(req, res) {
  try {
    const { code } = req.body;

    const token = await discord.getToken(code);

    req.session.discord = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires: moment().add(token.expires_in, "seconds"),
    };

    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(403);
  }
}

module.exports = {
  getDiscordToken,
};
