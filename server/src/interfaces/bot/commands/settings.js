const { SlashCommandBuilder } = require("discord.js");
const { getLocale } = require("../../../helpers/locale");
const { setSettings } = require("../../../services/settings");

const locale = getLocale();
const localeList = locale.getLocales();
const t = locale.t;

const kills = (subcommand) =>
  subcommand
    .setName("kills")
    .setDescription(t("SETTINGS.KILLS"))
    .addBooleanOption((option) => option.setName("enabled").setDescription(t("SETTINGS.ENABLED")))
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.CHANNEL")))
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription(t("SETTINGS.KILLS"))
        .addChoices(
          {
            name: t("SETTINGS.MODE.IMAGE"),
            value: "image",
          },
          {
            name: t("SETTINGS.MODE.TEXT"),
            value: "text",
          },
        ),
    );

const deaths = (subcommand) =>
  subcommand
    .setName("deaths")
    .setDescription(t("SETTINGS.DEATHS"))
    .addBooleanOption((option) => option.setName("enabled").setDescription(t("SETTINGS.ENABLED")))
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.CHANNEL")))
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription(t("SETTINGS.DEATHS"))
        .addChoices(
          {
            name: t("SETTINGS.MODE.IMAGE"),
            value: "image",
          },
          {
            name: t("SETTINGS.MODE.TEXT"),
            value: "text",
          },
        ),
    );

const battles = (subcommand) =>
  subcommand
    .setName("battles")
    .setDescription(t("SETTINGS.BATTLES"))
    .addBooleanOption((option) => option.setName("enabled").setDescription(t("SETTINGS.ENABLED")))
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.CHANNEL")));

const rankingFrequencies = [
  {
    name: t("SETTINGS.FREQUENCIES.OFF"),
    value: "off",
  },
  {
    name: t("SETTINGS.FREQUENCIES.HOURLY"),
    value: "hourly",
  },
  {
    name: t("SETTINGS.FREQUENCIES.DAILY"),
    value: "daily",
  },
];

const rankings = (subcommand) =>
  subcommand
    .setName("rankings")
    .setDescription(t("SETTINGS.RANKINGS"))
    .addBooleanOption((option) => option.setName("enabled").setDescription(t("SETTINGS.ENABLED")))
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.CHANNEL")))
    .addStringOption((option) =>
      option
        .setName("pvp-ranking")
        .setDescription(t("SETTINGS.PVP_RANKING"))
        .addChoices(...rankingFrequencies),
    )
    .addStringOption((option) =>
      option
        .setName("guild-ranking")
        .setDescription(t("SETTINGS.GUILD_RANKING"))
        .addChoices(...rankingFrequencies),
    );

const lang = (subcommand) =>
  subcommand
    .setName("lang")
    .setDescription(t("SETTINGS.LANG"))
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription(t("SETTINGS.LANG"))
        .setRequired(true)
        .addChoices(
          ...localeList.map((locale) => ({
            name: locale,
            value: locale,
          })),
        ),
    );

function getCommonOptions(settings, category, interaction) {
  const enabled = interaction.options.getBoolean("enabled");
  const channel = interaction.options.getChannel("channel");

  if (enabled != null) settings[category].enabled = enabled;
  if (channel != null) settings[category].channel = channel.id;

  return settings;
}

function printCommonOptions(settings, category, interaction, t) {
  let reply = "";

  const option = settings[category].enabled ? t("GENERAL.ENABLED") : t("GENERAL.DISABLED");
  const channel = interaction.guild.channels.cache.get(settings[category].channel);
  reply += t("SETTINGS.SET", { category, option }) + "\n";
  if (channel) reply += t("CHANNEL.SET_CHANNEL", { category, channel: channel.toString() }) + "\n";
  else reply += t("CHANNEL.NO_CHANNEL") + "\n";

  return reply;
}

const command = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription(t("HELP.SETTINGS"))
    .setDefaultMemberPermissions("0")
    .addSubcommand(kills)
    .addSubcommand(deaths)
    .addSubcommand(battles)
    .addSubcommand(rankings)
    .addSubcommand(lang),
  handle: async (interaction, { settings, t }) => {
    const reply = async (content, ephemeral = true) => await interaction.reply({ content, ephemeral });
    const editReply = async (content, ephemeral = true) => await interaction.editReply({ content, ephemeral });

    const subcommands = {
      kills: async () => {
        const category = "kills";
        settings = getCommonOptions(settings, category, interaction);

        const mode = interaction.options.getString("mode");
        if (mode != null) settings[category].mode = mode;

        await interaction.deferReply({ ephemeral: true });
        await setSettings(interaction.guild.id, settings);

        let reply = printCommonOptions(settings, category, interaction, t);
        reply += t("MODE.SET", { mode: settings[category].mode }) + "\n";
        return await editReply(reply);
      },
      deaths: async () => {
        const category = "deaths";
        settings = getCommonOptions(settings, category, interaction);

        const mode = interaction.options.getString("mode");
        if (mode != null) settings[category].mode = mode;

        await interaction.deferReply({ ephemeral: true });
        await setSettings(interaction.guild.id, settings);

        let reply = printCommonOptions(settings, category, interaction, t);
        reply += t("MODE.SET", { mode: settings[category].mode }) + "\n";
        return await editReply(reply);
      },
      battles: async () => {
        const category = "battles";
        settings = getCommonOptions(settings, category, interaction);

        await interaction.deferReply({ ephemeral: true });
        await setSettings(interaction.guild.id, settings);

        const reply = printCommonOptions(settings, category, interaction, t);
        return await editReply(reply);
      },
      rankings: async () => {
        const category = "rankings";
        settings = getCommonOptions(settings, category, interaction);

        const pvpRanking = interaction.options.getString("pvp-ranking");
        const guildRanking = interaction.options.getString("guild-ranking");
        if (pvpRanking != null) settings[category].pvpRanking = pvpRanking;
        if (guildRanking != null) settings[category].guildRanking = guildRanking;

        await interaction.deferReply({ ephemeral: true });
        await setSettings(interaction.guild.id, settings);

        let reply = printCommonOptions(settings, category, interaction, t);
        reply += t("RANKING.PVP_RANKING_SET", { pvpRanking: settings[category].pvpRanking }) + "\n";
        reply += t("RANKING.GUILD_RANKING_SET", { guildRanking: settings[category].guildRanking }) + "\n";
        return await editReply(reply);
      },
      lang: async () => {
        const lang = interaction.options.getString("language");
        if (localeList.indexOf(lang) < 0) return await reply(t("LANGUAGE.NOT_SUPPORTED"));
        await interaction.deferReply({ ephemeral: true });
        await setSettings(interaction.guild.id, { ...settings, lang });
        return await editReply(getLocale(lang).t("LANGUAGE.SET_LANGUAGE", { lang }));
      },
    };

    return await subcommands[interaction.options.getSubcommand()]();
  },
};

module.exports = command;
