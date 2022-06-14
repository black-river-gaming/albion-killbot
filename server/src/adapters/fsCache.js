const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const logger = require("../helpers/logger");

const TMPDIR = path.join(os.tmpdir(), "albion-killbot-cache");
const locks = {};

// Return absolute path to the file in cache
function getFile(...file) {
  return path.join(TMPDIR, ...file);
}

function hasFile(...file) {
  const absFilePath = getFile(...file);

  try {
    const stat = fs.statSync(absFilePath);
    return stat.size > 0;
  } catch (e) {
    logger.debug(`${absFilePath} stat failed:`, e);
    return false;
  }
}

function isBusy(...file) {
  return locks[getFile(...file)];
}

function createWriteStream(...file) {
  const absFilePath = getFile(...file);
  if (isBusy(...file)) {
    throw new Error(`${absFilePath} is busy. Cannot open it for write.`);
  }

  locks[absFilePath] = true;

  // Ensure cache directory exists
  fs.mkdirSync(path.dirname(absFilePath), {
    recursive: true,
  });

  const writer = fs.createWriteStream(absFilePath);

  // A lock can be release both by completion, error or timeout
  writer.on("close", () => {
    logger.debug(`${absFilePath}: close event received. Unlocking...`);
    locks[absFilePath] = false;
  });

  setTimeout(() => {
    locks[absFilePath] = false;
  }, 60000);

  return writer;
}

function createReadStream(...file) {
  const absFilePath = getFile(...file);
  return fs.createReadStream(absFilePath);
}

module.exports = {
  getFile,
  hasFile,
  isBusy,
  createWriteStream,
  createReadStream,
};
