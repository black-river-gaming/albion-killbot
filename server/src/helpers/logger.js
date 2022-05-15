const { createLogger, format, transports } = require("winston");
const path = require("path");

const { MODE } = process.env;

const isProd = process.env.NODE_ENV === "production";

const logger = createLogger({
  level: "debug",
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  defaultMeta: { service: MODE },
  transports: [
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
  ],
});

if (!isProd) {
  const consoleFormat = format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]\t: ${message}`;
  });

  logger.add(
    new transports.Console({
      format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.colorize(), consoleFormat),
    }),
  );
}

module.exports = logger;
