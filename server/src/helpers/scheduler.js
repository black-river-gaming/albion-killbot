const { CronJob } = require("cron");
const crypto = require("crypto");

const logger = require("./logger");

// Flag to keep infinite loops until program is closed
let running = true;
const timeoutIds = new Set();
const cronjobs = new Set();

const clean = () => {
  running = false;

  for (const timeoutId of timeoutIds) {
    logger.debug(`Cleaning timeout: ${timeoutId}`);
    clearTimeout(timeoutId);
    timeoutIds.delete(timeoutId);
  }

  for (const cronjob of cronjobs) {
    logger.debug(`Halting cronjob: ${cronjob.id}`);
    cronjob.stop();
    cronjobs.delete(cronjob.id);
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

// Wrapper around cron which saves the jobs for halting
function runCronjob(name, cronTime, fn, { fnOpts = [], runOnStart = false }) {
  if (!fn) return;

  logger.debug(`Scheduling cronjob function: ${name}`, {
    name,
    cronTime,
    runOnStart,
  });
  const onTick = async () => {
    await execFn(name, fn, ...fnOpts);
  };
  const cronjob = new CronJob(cronTime, onTick, null, true, "utc", null, runOnStart);
  cronjob.id = crypto.randomUUID();

  cronjobs.add(cronjob.id, cronjob);
}

function clearAllIntervals() {
  running = false;
}

module.exports = {
  clearAllIntervals,
  runInterval,
  runCronjob,
  sleep,
  timeout,
};
