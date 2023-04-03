const moment = require("moment");
const logger = require("../../../helpers/logger");
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
    logger.warn(`Unable to authenticate with discord: ${error.message}`, { error });
    return res.sendStatus(403);
  }
}

async function logout(req, res) {
  req.session.destroy((error) => {
    if (error) {
      logger.error(`Unable to unset user session.`, { error, session: req.session });
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
  });
}

module.exports = {
  auth,
  logout,
};
