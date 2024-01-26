const config = require("config");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const { mongodb } = require("../../../ports/database");

const session = () =>
  expressSession({
    cookie: {
      domain: config.get("api.session.domain"),
      maxAge: config.get("api.session.maxAge"),
      secure: "auto",
    },
    name: config.get("api.session.cookieName"),
    resave: false,
    saveUninitialized: false,
    secret: config.get("api.session.secret"),
    store: MongoStore.create({
      client: mongodb.getClient(),
      stringify: false,
      touchAfter: 24 * 60 * 60, // 1 day
    }),
    unset: "destroy",
  });

module.exports = {
  session,
};
