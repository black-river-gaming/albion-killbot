const expressSession = require("express-session");
const MongoStore = require("connect-mongo");

const { NODE_ENV, SESSION_SECRET, MONGODB_URL } = process.env;
const secure = NODE_ENV == "production";

const session = expressSession({
  cookie: {
    maxAge: 604800000, // 7 days
    secure,
  },
  name: "albion-killbot",
  proxy: true,
  resave: false,
  saveUninitialized: false,
  secret: SESSION_SECRET || "defaultSecret",
  store: MongoStore.create({
    mongoUrl: MONGODB_URL,
    touchAfter: 24 * 3600,
  }),
});

const refreshToken = async (req, res, next) => {
  // if token is about to expire
  //  discord .refreshToken(req.session.discord.refresh_token);

  // if refresh fails, unset cookie and throw 403
  // throw error 403

  return next();
};

module.exports = {
  session,
  refreshToken,
};
