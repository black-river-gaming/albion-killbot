const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const logger = require("../../helpers/logger");
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
  bodyParser.json({
    limit: "1mb",
  }),
);

// Routes
routes.init(app);

module.exports = app;
