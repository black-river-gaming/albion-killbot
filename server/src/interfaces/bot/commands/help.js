const { InteractionType } = require("discord-api-types/v10");
const { getCommands } = require(".");
const { getLocale } = require("../../../helpers/locale");

const LINE_LENGTH = 15;

const command = {
  name: "help",
  description: getLocale().t("HELP.HELP"),
  type: InteractionType.Ping,
  default_permission: true,
  handle: async (interaction, { lang }) => {
    const t = getLocale(lang).t;

    let response = "```\n";
    if (process.env.npm_package_version) {
      response += t("HELP.VERSION", {
        version: process.env.npm_package_version,
      });
      response += "\n\n";
    }

    const commands = getCommands();
    for (const command of commands) {
      const commandKey = `/${command.name}`;
      const description = t(`HELP.${command.name.toUpperCase()}`);
      response += commandKey + " ".repeat(LINE_LENGTH - commandKey.length) + description + "\n";
    }
    response += "```";

    return interaction.reply({
      content: response,
      ephemeral: true,
    });
  },
};

module.exports = command;
