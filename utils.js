const logger = require("./logger")("bot.utils");
const moment = require("moment");

exports.sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

exports.timeout = (fn, milliseconds) => {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(`Operation timeout (${milliseconds} ms)`);
    }, milliseconds);
  });

  return Promise.race([fn, timeout]);
};

exports.digitsFormatter = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || 0;
};

exports.humanFormatter = (num, digits) => {
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "m" },
    { value: 1e9, symbol: "b" },
    { value: 1e12, symbol: "t" },
    { value: 1e15, symbol: "q" },
    { value: 1e18, symbol: "Q" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
};

exports.fileSizeFormatter = (size) => {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ["B", "kB", "MB", "GB", "TB"][i];
};

exports.getNumber = (v, def) => {
  const n = Number(v);
  return isNaN(n) ? def : n;
};

// Events that fires daily (Default: 12:00 pm) until process stops
exports.runDaily = async (func, name, options = {}, hour = 12, minute = 0) => {
  if (!func) return logger.warn("There is an undefined function. Please check your settings.");
  const exit = false;
  while (!exit) {
    await exports.sleep(60000);
    const now = moment();
    if (now.hour() === hour && now.minute() === minute) {
      try {
        await func(options);
      } catch (e) {
        logger.error(`Error in function ${name}: ${e}`);
      }
    }
  }
};

// Events that run on an interval (Default: 30 seconds) until process stops
exports.runInterval = async (func, name, options = {}, interval = 30000, runOnStart = false) => {
  if (!func) return logger.warn("There is an undefined function. Please check your settings.");
  if (runOnStart) {
    await func(options);
  }
  const exit = false;
  while (!exit) {
    await exports.sleep(interval);
    try {
      await func(options);
    } catch (e) {
      logger.error(`Error in function ${name}: ${e}`);
    }
  }
};
