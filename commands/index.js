const { readdirSync } = require("fs");
const logger = require("../logger")("commands");

const commands = {};
const cmdFiles = readdirSync(__dirname);
cmdFiles.forEach((cmdFile) => {
  if (cmdFile === "index.js") return;
  try {
    const command = require(`./${cmdFile}`);
    if (command.requirements != null && !command.requirements) return;
    commands[command.aliases[0]] = command;
    logger.debug(`Command loaded: ${cmdFile}`);
  } catch (e) {
    logger.error(`Error loading command ${cmdFile}: ${e}`);
  }
});

module.exports = commands;
