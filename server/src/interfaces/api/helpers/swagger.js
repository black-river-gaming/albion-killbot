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
          url: "https://albion-killbot.com/api",
          description: "Production server",
        },
      ],
      tags: [
        { name: "Settings", description: "Server settings" },
        { name: "Kills", description: "Kill data" },
        { name: "Battles", description: "Battle data" },
        { name: "Rankings", description: "Ranking data" },
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
