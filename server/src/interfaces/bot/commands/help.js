const { InteractionType } = require("discord-api-types/v10");
const { getCommands } = require(".");
const { getLocale } = require("../../../helpers/locale");

const LINE_LENGTH = 15;

const command = {
  name: "help",
  description: getLocale().t("HELP.HELP"),
  type: InteractionType.Ping,
  default_member_permissions: "0",
  handle: async (interaction, { t }) => {
    let response = "```\n";
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
