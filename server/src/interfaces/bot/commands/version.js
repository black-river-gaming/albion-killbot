const { SlashCommandBuilder } = require("discord.js");
const { getLocale } = require("../../../helpers/locale");

const version = process.env.npm_package_version;
const t = getLocale().t;

const command = {
  data: new SlashCommandBuilder().setName("version").setDescription(t("HELP.VERSION")),
  handle: async (interaction, { t }) => {
    let response = "```\n";
    if (version) {
      response += t("VERSION.PACKAGE_VERSION", {
        version,
      });
    } else {
      response += t("VERSION.NOT_FOUND");
    }
    response += "```";

    return interaction.reply({
      content: response,
      ephemeral: true,
    });
  },
};

module.exports = command;
