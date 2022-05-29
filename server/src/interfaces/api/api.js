const express = require("express");
const morgan = require("morgan");
const logger = require("../../helpers/logger");
const { disableCache } = require("./middlewares/cache");
const { session } = require("./middlewares/session");
const { swaggerSpecs, swaggerUI } = require("./middlewares/swagger");
const routes = require("./routes");
const app = express();

const { NODE_ENV } = process.env;

// Middlewares
if (NODE_ENV == "development") {
  app.use(morgan("dev", { stream: logger.stream }));
} else {
  app.use(morgan("tiny", { stream: logger.stream }));
}
app.use(
  express.json({
    limit: "1mb",
  }),
);
app.get("/openapi.json", disableCache, (req, res) => res.send(swaggerSpecs));
app.use("/docs", disableCache, swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
app.use(session);

// Routes
routes.init(app);

module.exports = app;
