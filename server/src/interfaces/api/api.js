const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const logger = require("../../helpers/logger");
const { disableCache } = require("./middlewares/cache");
const { refreshDiscordToken } = require("./middlewares/auth");
const { session } = require("./middlewares/session");
const { swaggerSpecs, swaggerUI } = require("./middlewares/swagger");
const routes = require("./routes");
const webhooks = require("./webhooks");
const app = express();

const { NODE_ENV, RATE_LIMIT_WINDOW = 60000, RATE_LIMIT_REQUESTS = 0 } = process.env;

// Rate limiter
app.use(
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_REQUESTS,
  }),
);

// Logs
const logFormat = NODE_ENV == "development" ? "dev" : "tiny";
app.use(morgan(logFormat, { stream: logger.stream }));

// Webhooks
webhooks.init(app);

// Body parser
app.use(
  express.json({
    limit: "1mb",
  }),
);

if (NODE_ENV == "development") {
  app.use(cors());
}

// Trust proxy in production
if (NODE_ENV == "production") {
  app.set("trust proxy", 1);
}

// Session
app.use(session);
app.use(refreshDiscordToken);

// Routes
app.get("/openapi.json", disableCache, (req, res) => res.send(swaggerSpecs));
app.use("/docs", disableCache, swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
routes.init(app);

module.exports = app;
