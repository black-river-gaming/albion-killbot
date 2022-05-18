const { createLogger, format, transports } = require("winston");
const path = require("path");

const { MODE, DEBUG_LEVEL } = process.env;

const isProd = process.env.NODE_ENV === "production";
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

if (!isProd) {
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
}

module.exports = logger;
