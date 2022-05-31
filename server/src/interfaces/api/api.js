const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const logger = require("../../helpers/logger");
const { disableCache } = require("./middlewares/cache");
const { refreshDiscordToken } = require("./middlewares/auth");
const { session } = require("./middlewares/session");
const { swaggerSpecs, swaggerUI } = require("./middlewares/swagger");
const routes = require("./routes");
const app = express();

const { NODE_ENV } = process.env;

// Logs
const logFormat = NODE_ENV == "development" ? "dev" : "tiny";
app.use(morgan(logFormat, { stream: logger.stream }));

// Body parser
app.use(
  express.json({
    limit: "1mb",
  }),
);

if (NODE_ENV == "development") {
  app.use(cors());
}

// Session
app.use(session);
app.use(refreshDiscordToken);

// Routes
app.get("/openapi.json", disableCache, (req, res) => res.send(swaggerSpecs));
app.use("/docs", disableCache, swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
routes.init(app);

module.exports = app;
