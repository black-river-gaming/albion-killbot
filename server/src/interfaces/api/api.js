const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const logger = require("../../helpers/logger");
const { disableCache } = require("./middlewares/cache");
const { discordSession } = require("./middlewares/auth");
const { session } = require("./middlewares/session");
const { swaggerSpecs, swaggerUI } = require("./middlewares/swagger");
const routes = require("./routes");
const webhooks = require("./webhooks");
const app = express();

const { NODE_ENV, RATE_LIMIT_WINDOW = 60000, RATE_LIMIT_REQUESTS = 0 } = process.env;

app.get("/healthz", (req, res) => {
  return res.send("healthy");
});

// This is supposed to run behind an nginx reverse proxy so trust it
app.enable("trust proxy");

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

app.use(cors());

// Session
app.use(session);
app.use(discordSession);

// Routes
app.get("/openapi.json", disableCache, (req, res) => res.send(swaggerSpecs));
app.use("/docs", disableCache, swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
routes.init(app);

// Uhandled errors
app.use((error, req, res, next) => {
  if (error) {
    logger.error("An unhandled exception ocurred:", error);
  }
  next();
});

module.exports = app;
