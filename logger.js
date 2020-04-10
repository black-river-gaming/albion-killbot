const { createLogger, format, transports } = require("winston");
const logdna = require("logdna-winston");
const path = require("path");

const logger = createLogger({
  level: "debug",
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  ]
});

if (process.env.NODE_ENV === "development") {
  logger.add(
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error"
    })
  );
  logger.add(
    new transports.File({
      filename: path.join("logs", "all.log"),
      format: format.combine(format.timestamp(), format.json())
    })
  );
}

if (process.env.LOGDNA_KEY) {
  logger.add(
    new logdna({
      key: process.env.LOGDNA_KEY,
      app: "Albion Killbot",
      env: process.env.NODE_ENV || "unset",
      index_meta: true
    })
  );
}

module.exports = logger;
