const { InteractionType } = require("discord-api-types/v10");
const { getLocale } = require("../../../helpers/locale");

const command = {
  name: "version",
  description: getLocale().t("HELP.VERSION"),
  type: InteractionType.Ping,
  default_permission: true,
  handle: async (interaction, { t }) => {
    let response = "```\n";
    if (process.env.npm_package_version) {
      response += t("VERSION.PACKAGE_VERSION", {
        version: process.env.npm_package_version,
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
