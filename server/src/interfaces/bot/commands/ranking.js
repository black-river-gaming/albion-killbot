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
          name: t("SETTINGS.DESCRIPTION.RANKING_DAILY"),
          value: "daily",
        })
        .addChoices({
          name: t("SETTINGS.DESCRIPTION.RANKING_WEEKLY"),
          value: "weekly",
        })
        .addChoices({
          name: t("SETTINGS.DESCRIPTION.RANKING_MONTHLY"),
          value: "monthly",
        }),
    ),
  handle: async (interaction, { settings }) => {
    const type = interaction.options.getString("ranking");
    await interaction.deferReply({ ephemeral: false });

    const ranking = await getRanking(interaction.guild.id, type);
    return await interaction.editReply(embedRanking(ranking, { locale: settings.general.locale }));
  },
};

module.exports = command;
