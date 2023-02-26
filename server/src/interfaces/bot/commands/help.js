const { SlashCommandBuilder } = require("discord.js");
const { getLocale } = require("../../../helpers/locale");
const { printSpace } = require("../../../helpers/utils");

const LINE_LENGTH = 15;

const command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(getLocale().t("HELP.HELP"))
    .setDefaultMemberPermissions("0"),
  handle: async (interaction, { t }) => {
    let response = "```\n";
    const commands = interaction.client.commands.values();
    for (const command of commands) {
      const commandKey = `/${command.data.name}`;
      const description = t(`HELP.${command.data.name.toUpperCase()}`);
      const count = LINE_LENGTH - commandKey.length;
      response += commandKey + printSpace(count) + description + "\n";
    }
    response += "```";

    return interaction.reply({
      content: response,
      ephemeral: true,
    });
  },
};

module.exports = command;
