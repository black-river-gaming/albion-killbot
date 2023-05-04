const logger = require("./logger");
const moment = require("moment");

// Flag to keep infinite loops until program is closed
let running = true;
const timeoutIds = new Set();

const clean = () => {
  running = false;

  for (const timeoutId of timeoutIds) {
    logger.debug(`Cleaning timeout: ${timeoutId}`);
    clearTimeout(timeoutId);
    timeoutIds.delete(timeoutId);
  }
};

//catches ctrl+c event
process.once("SIGINT", clean);
// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", clean);
process.on("SIGUSR2", clean);

function sleep(milliseconds) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      timeoutIds.delete(timeoutId);
      return running ? resolve() : reject(new Error("Sleep trigger after program exited."));
    }, milliseconds);
    timeoutIds.add(timeoutId);
  });
}

function timeout(fn, milliseconds) {
  const timeout = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error(`Operation timeout (${milliseconds} ms)`));
    }, milliseconds);
    timeoutIds.add(timeoutId);
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
  if (!fn) return;
  if (runOnStart) {
    runInterval(name, fn, { fnOpts, hour, minute, runOnStart: false });
    return await execFn(name, fn, ...fnOpts);
  }

  logger.debug(`Scheduling daily function: ${name}`, {
    name,
    hour,
    minute,
    runOnStart,
  });
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
  if (!fn) return;
  if (runOnStart) {
    runInterval(name, fn, { fnOpts, interval, runOnStart: false });
    return await execFn(name, fn, ...fnOpts);
  }

  logger.debug(`Scheduling interval function: ${name}`, {
    name,
    interval,
    runOnStart,
  });
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
