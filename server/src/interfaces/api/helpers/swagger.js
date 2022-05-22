const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const path = require("node:path");
const logger = require("../../../helpers/logger");

const package = require(path.join(__dirname, "..", "..", "..", "..", "package.json"));

let swaggerSpecs = {};

try {
  swaggerSpecs = swaggerJsDoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: package.name,
        version: package.version,
        description: package.description,
      },
      servers: [
        {
          url: "http://localhost/api",
          description: "Development server",
        },
        {
          url: "https://www.albionkillbot.com/api",
          description: "Production server",
        },
      ],
      tags: [
        { name: "settings", description: "Server settings" },
        { name: "kills", description: "Kill data" },
        { name: "battles", description: "Battle data" },
        { name: "rankings", description: "Ranking data" },
      ],
    },
    apis: [path.join(__dirname, "..", "routes", "**.js")],
  });
} catch (e) {
  logger.warn(`Unable to generate swagger specification:`, e);
}

module.exports = {
  swaggerSpecs,
  swaggerUI,
};
