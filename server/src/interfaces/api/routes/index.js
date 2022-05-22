const { readdirSync } = require("fs");
const path = require("node:path");
const logger = require("../../../helpers/logger");

const routers = [];

const files = readdirSync(__dirname);
for (const file of files) {
  if (file === "index.js") continue;

  try {
    const router = require(path.join(__dirname, file));
    logger.debug(`Router loaded: ${file}`);
    routers.push(router);
  } catch (e) {
    logger.error(`Error loading router ${file}:`, e);
  }
}

function init(app) {
  routers.forEach((router) => app.use(router));
}

module.exports = {
  init,
};
