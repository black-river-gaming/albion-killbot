const { createLogger, format, transports } = require("winston");
const { Loggly } = require("winston-loggly-bulk");
const path = require("path");

const { MODE, DEBUG_LEVEL, LOGGLY_TOKEN, LOGGLY_SUBDOMAIN } = process.env;
const level = DEBUG_LEVEL || "info";

const logger = createLogger({
  level: "debug",
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  defaultMeta: { service: MODE },
  transports: [
    new transports.File({
      filename: path.join("logs", "debug.log"),
      level: "debug",
      maxsize: 10 * Math.pow(1024, 2), // 10 MB
      maxFiles: 1,
      tailable: true,
    }),
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      maxsize: 1 * Math.pow(1024, 1), // 1 MB
      maxFiles: 1,
      tailable: true,
    }),
  ],
});

const consoleFormat = format.printf(({ level, message, timestamp, metadata, [Symbol.for("level")]: logLevel }) => {
  const metadataStr = metadata ? JSON.stringify(metadata) : "";
  const maxLen = "verbose".length;
  const spacing = " ".repeat(Math.max(0, maxLen - logLevel.length));
  return `${timestamp} [${level}] ${spacing}: ${message} ${metadataStr}`;
});

logger.add(
  new transports.Console({
    format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.colorize(), consoleFormat),
    level,
  }),
);

if (LOGGLY_TOKEN && LOGGLY_SUBDOMAIN) {
  logger.add(
    new Loggly({
      token: LOGGLY_TOKEN,
      subdomain: LOGGLY_SUBDOMAIN,
      tags: [`albion-killbot`, MODE],
      json: true,
    }),
  );
}

logger.stream = {
  write: (message) => {
    logger.info(message);
  },
};

module.exports = logger;
