const { readdirSync } = require("fs");
const path = require("node:path");

const logger = require("../../../helpers/logger");

const controllers = new Map();

const init = async () => {
  const controllerFiles = readdirSync(__dirname);

  for (const controllerFile of controllerFiles) {
    if (controllerFile === "index.js") continue;

    try {
      const controller = require(path.join(__dirname, controllerFile));
      const name = controller.name || controllerFile.replace(/\.[^.]*$/, "");
      logger.debug(`Controller loaded: ${name}`);

      if (controller.init) await controller.init();

      controllers.set(name, controller);
    } catch (error) {
      logger.error(`Error loading controller ${controllerFile}: ${error.message}`, error);
    }
  }
};

const getController = (controllerName) => controllers.get(controllerName);

module.exports = {
  init,
  getController,
};
