const logger = require("./logger");
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

function sleep(milliseconds) {
  return new Promise((resolve, reject) =>
    setTimeout(() => (running ? resolve() : reject(new Error("Sleep trigger after program exited."))), milliseconds),
  );
}

function timeout(fn, milliseconds) {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Operation timeout (${milliseconds} ms)`));
    }, milliseconds);
  });

  return Promise.race([fn, timeout]);
}

async function execFn(name, fn, ...fnOpts) {
  try {
    return await fn(...fnOpts);
  } catch (e) {
    logger.error(`An error ocurred in routine "${name}":`, e);
  }
}

// Functions that fires daily (Default: 12:00 pm) until process stops
async function runDaily(name, fn, { fnOpts = [], hour = 12, minute = 0, runOnStart = false }) {
  logger.debug(`Scheduling daily function: ${name}`, {
    metadata: {
      name,
      fnOpts,
      hour,
      minute,
      runOnStart,
    },
  });
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
async function runInterval(name, fn, { fnOpts = [], interval = 30000, runOnStart = false }) {
  logger.debug(`Scheduling interval function: ${name}`, {
    metadata: {
      name,
      fnOpts,
      interval,
      runOnStart,
    },
  });
  if (!fn) return;
  if (runOnStart) await execFn(name, fn, ...fnOpts);
  while (running) {
    await sleep(interval);
    await execFn(name, fn, ...fnOpts);
  }
}

function clearAllIntervals() {
  running = false;
}

module.exports = {
  clearAllIntervals,
  runDaily,
  runInterval,
  sleep,
  timeout,
};
