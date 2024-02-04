const { readdirSync } = require("fs");
const path = require("node:path");

const logger = require("./logger");

const controllers = new Map();

const loadControllers = async (controllersPath, ctx) => {
  const controllerFiles = readdirSync(controllersPath);

  for (const controllerFile of controllerFiles) {
    if (controllerFile === "index.js") continue;

    try {
      const controller = require(path.join(controllersPath, controllerFile));
      controller.name = controller.name || controllerFile.replace(/\.[^.]*$/, "");
      logger.debug(`Controller loaded: ${controller.name}`);

      if (controller.preinit) await controller.preinit(ctx);

      controllers.set(controller.name, controller);
    } catch (error) {
      logger.error(`Error loading controller ${controllerFile}: ${error.message}`, error);
    }
  }

  for (const controller of controllers.values()) {
    try {
      if (controller.init) await controller.init(ctx);
    } catch (error) {
      logger.error(`Error in init controller ${controller.name}: ${error.message}`, error);
    }
  }
};

const getController = (controllerName) => controllers.get(controllerName);

module.exports = {
  loadControllers,
  getController,
};
