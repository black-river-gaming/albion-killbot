const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { readdirSync } = require("fs");
const path = require("node:path");
const { getLocale } = require("../../../helpers/locale");

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
  const prefix = `[#${interaction.id}/${interaction.commandName}]`;
  const settings = await getSettings(interaction.guild.id);
  const t = getLocale().t;

  try {
    if (!hasCommand(interaction.commandName)) throw new Error("COMMAND_NOT_FOUND");
    // TODO: Find a place for this
    // This is needed because interaction uses BigInt and toJSON() fails
    BigInt.prototype.toJSON = function () {
      return this.toString();
    };

    logger.debug(`${prefix} Interaction received`, {
      metadata: interaction.toJSON(),
    });

    const command = commands.find((c) => c.name == interaction.commandName);
    return await command.handle(interaction, settings);
  } catch (e) {
    logger.error(`${prefix} Error in interaction:`, e);
    const reply = (!interaction.deferred && !interaction.replied ? interaction.reply : interaction.editReply).bind(
      interaction,
    );
    return await reply({
      content: t("COMMAND_ERROR"),
    });
  }
}

module.exports = {
  getCommands,
  hasCommand,
  init,
  reload,
  handle,
};
