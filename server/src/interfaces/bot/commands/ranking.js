const { SlashCommandBuilder } = require("discord.js");
const { getLocale } = require("../../../helpers/locale");
const { getRanking } = require("../../../services/rankings");
const { embedRanking } = require("../../../helpers/embeds");

const { t } = getLocale();

const command = {
  data: new SlashCommandBuilder()
    .setName("ranking")
    .setDescription(t("HELP.RANKING"))
    .setDefaultMemberPermissions("0")
    .addStringOption((option) =>
      option
        .setName("ranking")
        .setDescription(t("HELP.RANKING"))
        .setRequired(true)
        .addChoices({
          name: t("SETTINGS.DESCRIPTION.PVP_RANKING"),
          value: "pvpRanking",
        }),
    ),
  handle: async (interaction, { settings }) => {
    const rankingType = interaction.options.getString("ranking");

    const rankings = {
      pvpRanking: async () => {
        await interaction.deferReply({ ephemeral: false });
        const ranking = await getRanking(interaction.guild.id);
        return await interaction.editReply(embedRanking(ranking, { locale: settings.general.locale }));
      },
    };

    const showRanking = rankings[rankingType];
    if (showRanking) return await showRanking();
    return await interaction.reply({ content: "Please specify a valid option for the ranking.", ephemeral: true });
  },
};

module.exports = command;
