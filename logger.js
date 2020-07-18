const { createLogger, format, transports } = require("winston");
const colors = require("colors/safe");
const path = require("path");

const levelColors = {
  emerg: "red",
  alert: "red",
  crit: "red",
  error: "red",
  warning: "yellow",
  info: "green",
  debug: "cyan",
  silly: "rainbow",
};

const isDev = process.env.NODE_ENV === "development";

const tagged = format.printf(log => {
  if (!isDev) return `${log.level}: ${log.message}`;
  if (!log.tag) return log.message;
  let colorizer = colors[levelColors[log.level]];
  if (!colorizer) colorizer = colors.grey;
  return `[${colorizer(log.tag)}] ${log.message}`;
});

const logger = createLogger({
  level: "debug",
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        tagged,
        isDev ? tagged : format.simple(),
      ),
    }),
  ],
});

if (isDev) {
  logger.add(
    new transports.File({
      filename: path.join("logs", "error.log"),
      format: format.combine(format.timestamp(), format.json()),
      level: "error",
    }),
  );
  logger.add(
    new transports.File({
      filename: path.join("logs", "all.log"),
      format: format.combine(format.timestamp(), format.json()),
    }),
  );
}

if (process.env.LOGDNA_KEY) {
  const logdna = require("logdna-winston");
  logger.add(
    new logdna({
      key: process.env.LOGDNA_KEY,
      app: "Albion Killbot",
      env: process.env.NODE_ENV || "unset",
      index_meta: true,
    }),
  );
}

if (process.env.LOGGLY_KEY) {
  const { Loggly } = require("winston-loggly-bulk");
  logger.add(
    new Loggly({
      token: process.env.LOGGLY_KEY,
      subdomain: "albion-killbot",
      json: true,
    }),
  );
}

module.exports = tag => {
  return logger.child({ tag });
};
