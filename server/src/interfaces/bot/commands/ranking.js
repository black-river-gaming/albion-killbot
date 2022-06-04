const { InteractionType } = require("discord-api-types/v10");
const { String } = require("discord-api-types/v10").ApplicationCommandOptionType;
const { getLocale } = require("../../../helpers/locale");
const { getRanking } = require("../../../services/rankings");
const { getGuild } = require("../../../services/guilds");
const { embedPvpRanking, embedGuildRanking } = require("../../../helpers/embeds");

const t = getLocale().t;

const options = [
  {
    name: "ranking",
    description: t("HELP.RANKING"),
    type: String,
    required: true,
    choices: [
      {
        name: t("SETTINGS.PVP_RANKING"),
        value: "pvpRanking",
      },
      {
        name: t("SETTINGS.GUILD_RANKING"),
        value: "guildRanking",
      },
    ],
  },
];

const command = {
  name: "ranking",
  description: t("HELP.RANKING"),
  type: InteractionType.Ping,
  default_permission: true,
  options,
  handle: async (interaction, settings) => {
    const rankingType = interaction.options.getString("ranking");

    const rankings = {
      pvpRanking: async () => {
        await interaction.deferReply({ ephemeral: false });
        const pvpRanking = await getRanking(interaction.guild.id);
        return await interaction.editReply(embedPvpRanking(pvpRanking, { locale: settings.lang }));
      },
      guildRanking: async () => {
        await interaction.deferReply({ ephemeral: false });
        for (const trackGuild of settings.track.guilds) {
          const albionGuild = await getGuild(trackGuild.id);
          if (!albionGuild) await interaction.followUp(t("RANKING.NO_DATA", { guild: trackGuild.name }));
          else await interaction.followUp(embedGuildRanking(albionGuild, { locale: settings.lang }));
        }
      },
    };

    const showRanking = rankings[rankingType];
    if (showRanking) return await showRanking();
    return await interaction.reply({ content: "Please specify a valid option for the ranking.", ephemeral: true });
  },
};

module.exports = command;
