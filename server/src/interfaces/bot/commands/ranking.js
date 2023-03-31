const { SlashCommandBuilder } = require("discord.js");
const { getLocale } = require("../../../helpers/locale");
const { getRanking } = require("../../../services/rankings");
const { getGuildByTrackGuild } = require("../../../services/guilds");
const { embedPvpRanking, embedGuildRanking } = require("../../../helpers/embeds");

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
        .addChoices(
          {
            name: t("SETTINGS.PVP_RANKING"),
            value: "pvpRanking",
          },
          {
            name: t("SETTINGS.GUILD_RANKING"),
            value: "guildRanking",
          },
        ),
    ),
  handle: async (interaction, { settings, track, t }) => {
    const rankingType = interaction.options.getString("ranking");

    const rankings = {
      pvpRanking: async () => {
        await interaction.deferReply({ ephemeral: false });
        const pvpRanking = await getRanking(interaction.guild.id);
        return await interaction.editReply(embedPvpRanking(pvpRanking, { locale: settings.general.locale }));
      },
      guildRanking: async () => {
        await interaction.deferReply({ ephemeral: false });
        if (!track.guilds || track.guilds.length === 0)
          return await interaction.editReply({ content: "No tracked guilds to display rankings.", ephemeral: true });
        for (const trackGuild of track.guilds) {
          const albionGuild = await getGuildByTrackGuild(trackGuild);
          if (!albionGuild) await interaction.followUp(t("RANKING.NO_DATA", { guild: trackGuild.name }));
          else await interaction.followUp(embedGuildRanking(albionGuild, { locale: settings.general.locale }));
        }
      },
    };

    const showRanking = rankings[rankingType];
    if (showRanking) return await showRanking();
    return await interaction.reply({ content: "Please specify a valid option for the ranking.", ephemeral: true });
  },
};

module.exports = command;
