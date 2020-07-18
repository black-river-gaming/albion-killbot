const { readdirSync } = require("fs");
const logger = require("../logger")("commands");

const commands = {};
const cmdFiles = readdirSync(__dirname);
cmdFiles.forEach(cmdFile => {
  if (cmdFile === "index.js") return;
  try {
    logger.info(`Loading command: ${cmdFile}`);
    const command = require(`./${cmdFile}`);
    commands[command.aliases[0]] = command;
  } catch (e) {
    console.log(logger());
    logger.error(`Error loading command ${cmdFile}: ${e}`);
  }
});

module.exports = commands;
