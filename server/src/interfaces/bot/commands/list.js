const { InteractionType } = require("discord-api-types/v10");
const { getLocale } = require("../../../helpers/locale");
const { embedTrackList } = require("../../../helpers/embeds");

const command = {
  name: "list",
  description: getLocale().t("HELP.LIST"),
  type: InteractionType.Ping,
  default_member_permissions: "0",
  handle: async (interaction, { track, lang }) => {
    await interaction.reply({
      ...embedTrackList(track, { locale: lang }),
      ephemeral: true,
    });
  },
};

module.exports = command;
