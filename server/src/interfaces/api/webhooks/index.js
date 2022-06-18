const { readdirSync } = require("fs");
const path = require("node:path");
const logger = require("../../../helpers/logger");

const webhooks = [];

const files = readdirSync(__dirname);
for (const file of files) {
  if (file === "index.js") continue;

  try {
    const webhook = require(path.join(__dirname, file));
    logger.debug(`Webhook loaded: ${file}`);
    webhooks.push(webhook);
  } catch (e) {
    logger.error(`Error loading webhook ${file}:`, e);
  }
}

function init(app) {
  webhooks.forEach(({ path, router }) => app.use(path, router));
}

module.exports = {
  init,
};
