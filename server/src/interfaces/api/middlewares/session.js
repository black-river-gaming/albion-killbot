const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const { client } = require("../../../ports/database");

const {
  SESSION_COOKIE_NAME = "albion-killbot",
  SESSION_DOMAIN,
  SESSION_SECRET = "defaultSecret",
  MONGODB_URL,
} = process.env;

const session = expressSession({
  cookie: {
    domain: SESSION_DOMAIN,
    maxAge: 604800000, // 7 days
    secure: "auto",
  },
  name: SESSION_COOKIE_NAME,
  resave: false,
  saveUninitialized: false,
  secret: SESSION_SECRET,
  store: MongoStore.create({
    client,
    mongoUrl: MONGODB_URL,
    stringify: false,
    touchAfter: 24 * 60 * 60, // 1 day
  }),
  unset: "destroy",
});

module.exports = {
  session,
};
