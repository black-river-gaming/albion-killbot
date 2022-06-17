const { readdirSync } = require("fs");
const path = require("node:path");
const logger = require("../../../helpers/logger");

const routes = [];

const files = readdirSync(__dirname);
for (const file of files) {
  if (file === "index.js") continue;

  try {
    const route = require(path.join(__dirname, file));
    logger.debug(`Router loaded: ${file}`);
    routes.push(route);
  } catch (e) {
    logger.error(`Error loading router ${file}:`, e);
  }
}

function init(app) {
  routes.forEach(({ path, router }) => app.use(path, router));
}

module.exports = {
  init,
};
