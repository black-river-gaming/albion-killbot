const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { readdirSync } = require("fs");
const path = require("node:path");

const logger = require("../../../helpers/logger");
const { getSettings } = require("../../../services/settings");

const rest = new REST({ version: "10" });
let commands = [];

async function init(clientId) {
  const { DISCORD_TOKEN } = process.env;
  if (!DISCORD_TOKEN) {
    throw new Error(`Please define DISCORD_TOKEN environment variable with the discord token.`);
  }
  rest.setToken(DISCORD_TOKEN);
  return await reload(clientId);
}

async function reload(clientId) {
  commands = [];

  try {
    const commandFiles = readdirSync(__dirname);
    for (const commandFile of commandFiles) {
      if (commandFile === "index.js") continue;
      if (commandFile != "help.js") continue;

      try {
        const command = require(path.join(__dirname, commandFile));
        logger.debug(`Command loaded: ${commandFile}`);
        commands.push(command);
      } catch (e) {
        logger.error(`Error loading command ${commandFile}: ${e}`);
      }
    }

    logger.info(`Refreshing application slash commands...`);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    logger.verbose(`Successfully reloaded slash commands.`);
  } catch (e) {
    logger.error(`An error ocurred while reloading slash commands:`, e);
  }
}

function hasCommand(name) {
  return commands.some((c) => c.name == name);
}

function getCommands() {
  return commands;
}

async function handle(interaction) {
  const settings = await getSettings(interaction.guild.id);
  const command = commands.find((c) => c.name == interaction.commandName);
  return await command.handle(interaction, settings);
}

module.exports = {
  getCommands,
  hasCommand,
  init,
  reload,
  handle,
};
