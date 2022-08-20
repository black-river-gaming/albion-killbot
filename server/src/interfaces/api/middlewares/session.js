const expressSession = require("express-session");
const MongoStore = require("connect-mongo");

const { SESSION_SECRET, MONGODB_URL } = process.env;

const session = expressSession({
  cookie: {
    maxAge: 604800000, // 7 days
    secure: "auto",
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

module.exports = {
  session,
};
