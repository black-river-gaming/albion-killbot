const { Collection, REST, Routes } = require("discord.js");
const { readdirSync } = require("fs");
const path = require("node:path");
const { getLocale } = require("../../../helpers/locale");

const logger = require("../../../helpers/logger");
const { getSettings } = require("../../../services/settings");
const { getTrack } = require("../../../services/track");

const { DISCORD_TOKEN } = process.env;
const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

async function init(client) {
  client.commands = new Collection();

  const commandFiles = readdirSync(__dirname);
  for (const commandFile of commandFiles) {
    if (commandFile === "index.js") continue;

    try {
      const command = require(path.join(__dirname, commandFile));
      logger.debug(`Command loaded: ${commandFile}`);
      client.commands.set(command.data.name, command);
    } catch (error) {
      logger.error(`Error loading command ${commandFile}: ${error.message}`, { error });
    }
  }

  return reload(client);
}

async function reload(client) {
  try {
    const commands = client.commands.map((command) => command.data.toJSON());
    logger.info(`Started refreshing ${commands.length} application slash commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationCommands(client.application.id), { body: commands });

    logger.verbose(`Successfully reloaded ${data.length} application slash commands.`);
  } catch (error) {
    logger.error(`An error ocurred while reloading slash commands: ${error.message}`, { error });
    console.error(error);
  }
}

async function handle(interaction) {
  if (!interaction.isChatInputCommand() || !interaction.guild) return;
  if (interaction.guild.partial) await interaction.guild.fetch();

  const settings = await getSettings(interaction.guild.id);
  const track = await getTrack(interaction.guild.id);
  const t = getLocale(settings.general.locale).t;

  try {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) throw new Error("COMMAND_NOT_FOUND");
    // TODO: Find a place for this
    // This is needed because interaction uses BigInt and toJSON() fails
    BigInt.prototype.toJSON = function () {
      return this.toString();
    };

    logger.debug(`Interaction received`, {
      interaction: interaction.toJSON(),
    });

    return await command.handle(interaction, { settings, track, t });
  } catch (error) {
    logger.error(`Error in interaction: ${error.message}`, { error });
    const reply = (!interaction.deferred && !interaction.replied ? interaction.reply : interaction.followUp).bind(
      interaction,
    );
    return await reply({
      content: t("COMMAND_ERROR"),
    });
  }
}

module.exports = {
  init,
  handle,
};
