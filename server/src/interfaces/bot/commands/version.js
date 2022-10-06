const { InteractionType } = require("discord-api-types/v10");
const { getLocale } = require("../../../helpers/locale");

const version = process.env.npm_package_version;

const command = {
  name: "version",
  description: getLocale().t("HELP.VERSION"),
  type: InteractionType.Ping,
  default_permission: true,
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
