const moment = require("moment");

// Flag to keep infinite loops until program is closed
let running = true;
const clean = () => {
  running = false;
};

//catches ctrl+c event
process.once("SIGINT", clean);
// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", clean);
process.on("SIGUSR2", clean);
//catches uncaught exceptions
process.on("uncaughtException", clean);

function sleep(milliseconds) {
  return new Promise((resolve) =>
    setTimeout(() => {
      if (!running) return;
      resolve();
    }, milliseconds),
  );
}

function timeout(fn, milliseconds) {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(`Operation timeout (${milliseconds} ms)`);
    }, milliseconds);
  });

  return Promise.race([fn, timeout]);
}

function digitsFormatter(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || 0;
}

function humanFormatter(num, digits) {
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
}

function fileSizeFormatter(size) {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ["B", "KB", "MB", "GB", "TB"][i];
}

function parseFileSize(sizeStr) {
  const m = sizeStr.match(/(\d+)(B|KB?|MB?|GB?|TB?)/i);
  if (!m) return sizeStr;
  const unit = `${m[2]}${!m[2].endsWith("B") ? "B" : ""}`;
  return m[1] * Math.pow(1024, ["B", "KB", "MB", "GB", "TB"].indexOf(unit));
}

function getNumber(v, def) {
  const n = Number(v);
  return isNaN(n) ? def : n;
}

async function execFn(name, fn, ...fnOpts) {
  return await fn(...fnOpts);
}

// Functions that fires daily (Default: 12:00 pm) until process stops
async function runDaily(name, fn, { fnOpts = [], hour = 12, minute = 0, runOnStart = false }) {
  if (!fn) return;
  if (runOnStart) execFn(name, fn, ...fnOpts);
  while (running) {
    await sleep(60000); // Wait 1 minute to eval time
    const now = moment();
    if (now.hour() === hour && now.minute() === minute) {
      execFn(name, fn, ...fnOpts);
    }
  }
}

// Functions that run on an interval after execFn completes,
// then waits (Default: 30 seconds) and repeat until process stops
async function runInterval(name, fn, { fnOpts = [], interval = 30, runOnStart = false }) {
  if (!fn) return;
  if (runOnStart) await execFn(name, fn, ...fnOpts);
  while (running) {
    await sleep(interval * 1000);
    await execFn(name, fn, ...fnOpts);
  }
}

module.exports = {
  digitsFormatter,
  fileSizeFormatter,
  parseFileSize,
  humanFormatter,
  getNumber,
  runDaily,
  runInterval,
  sleep,
  timeout,
};
