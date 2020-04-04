const { createLogger, format, transports } = require("winston");
const path = require("path");

const logger = createLogger({
  level: "debug",
  transports: [
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error"
    }),
    new transports.File({
      filename: path.join("logs", "all.log"),
      format: format.combine(format.timestamp(), format.json())
    }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  ]
});

module.exports = logger;
