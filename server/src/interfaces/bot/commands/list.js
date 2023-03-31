const { SlashCommandBuilder } = require("discord.js");
const { getLocale } = require("../../../helpers/locale");
const { embedTrackList } = require("../../../helpers/embeds");
const { getLimits } = require("../../../services/limits");

const command = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription(getLocale().t("HELP.LIST"))
    .setDefaultMemberPermissions("0"),
  handle: async (interaction, { settings, track }) => {
    const limits = await getLimits(interaction.guild.id);

    await interaction.reply({
      ...embedTrackList(track, limits, { locale: settings.general.locale }),
      ephemeral: true,
    });
  },
};

module.exports = command;
