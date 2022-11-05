const { InteractionType } = require("discord-api-types/v10");
const { getLocale } = require("../../../helpers/locale");
const { embedTrackList } = require("../../../helpers/embeds");
const { getLimits } = require("../../../services/limits");

const command = {
  name: "list",
  description: getLocale().t("HELP.LIST"),
  type: InteractionType.Ping,
  default_member_permissions: "0",
  handle: async (interaction, { settings, track }) => {
    const limits = await getLimits(interaction.guild.id);

    await interaction.reply({
      ...embedTrackList(track, limits, { locale: settings.lang }),
      ephemeral: true,
    });
  },
};

module.exports = command;
