const moment = require("moment");
const authService = require("../../../services/auth");

const refreshDiscordToken = async (req, _res, next) => {
  const { discord } = req.session;
  if (!discord) return next();
  if (moment(discord.expires).diff(moment(), "days") > 3) return next();

  try {
    const token = await authService.refresh(discord.refreshToken);

    req.session.discord = {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expires: moment().add(token.expires_in, "seconds"),
    };

    return next();
  } catch (e) {
    if (e.response.status === 400) {
      delete req.session.discord;
    }

    return next();
  }
};

module.exports = {
  refreshDiscordToken,
};
