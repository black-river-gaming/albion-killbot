const moment = require("moment");
const authService = require("../../../services/auth");

async function auth(req, res) {
  try {
    const { code } = req.body;

    const token = await authService.auth(code);

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

module.exports = {
  auth,
};
