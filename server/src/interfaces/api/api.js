const express = require("express");
const morgan = require("morgan");
const logger = require("../../helpers/logger");
const { swaggerSpecs, swaggerUI } = require("./helpers/swagger");
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
app.get("/openapi.json", (req, res) => res.send(swaggerSpecs));
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

// Routes
routes.init(app);

module.exports = app;
