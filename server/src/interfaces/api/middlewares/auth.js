const moment = require("moment");
const authService = require("../../../services/auth");
const usersService = require("../../../services/users");
const serversService = require("../../../services/servers");
const logger = require("../../../helpers/logger");

const discordSession = async (req, _res, next) => {
  const { discord } = req.session;
  if (!discord) return next();

  try {
    const willExpire = moment(discord.expires).diff(moment(), "days") <= 3;

    if (willExpire) {
      const token = await authService.refresh(discord.refreshToken);

      req.session.discord = {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expires: moment().add(token.expires_in, "seconds"),
        user: await usersService.getCurrentUser(discord.accessToken),
      };

      return next();
    } else {
      req.session.discord.user = await usersService.getCurrentUser(discord.accessToken);
      return next();
    }
  } catch (e) {
    if (e.response.status === 400) {
      delete req.session.discord;
    }

    return next();
  }
};

const authenticated = async (req, res, next) => {
  try {
    if (!req.session.discord || !req.session.discord.user) throw new Error("Not authenticated");

    return next();
  } catch (error) {
    logger.warn(`Failed to authenticate user: ${error.message}`, { error });
    return res.sendStatus(403);
  }
};

const serverAdmin = async (req, res, next) => {
  try {
    if (!req.session.discord) throw new Error("Not authenticated");

    const { serverId } = req.params;
    const { user } = req.session.discord;

    if (!user) throw new Error("Not authenticated");
    if (!serverId) throw new Error("Missing parameter serverId");
    if (user.admin) return next();

    const servers = await serversService.getServers(req.session.discord.accessToken);
    const server = servers.find((s) => s.id === serverId);
    if (!server) throw new Error("User not on Server");
    if (!server.admin && !server.owner) throw new Error("Unauthorized");

    return next();
  } catch (error) {
    logger.warn(`Failed to authenticate server admin: ${error.message}`, { error });
    return res.sendStatus(403);
  }
};

const admin = async (req, res, next) => {
  try {
    if (!req.session.discord) throw new Error("Not authenticated");

    const { user } = req.session.discord;

    if (!user) throw new Error("Not authenticated");
    if (!user.admin) throw new Error("Unauthorized");

    return next();
  } catch (error) {
    logger.warn(`Failed to validate admin: ${error.message}`, { error });
    return res.sendStatus(403);
  }
};

module.exports = {
  admin,
  authenticated,
  discordSession,
  serverAdmin,
};
