const express = require("express");
const morgan = require("morgan");
const logger = require("../../helpers/logger");
const app = express();

const { NODE_ENV } = process.env;

if (NODE_ENV == "development") {
  app.use(morgan("dev", { stream: logger.stream }));
} else {
  app.use(morgan("tiny", { stream: logger.stream }));
}

module.exports = app;
