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
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.CHANNEL.DESCRIPTION")))
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
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.CHANNEL.DESCRIPTION")))
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
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.CHANNEL.DESCRIPTION")));

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
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.CHANNEL.DESCRIPTION")))
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

const general = (subcommand) =>
  subcommand
    .setName("general")
    .setDescription(t("SETTINGS.GENERAL"))
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription(t("SETTINGS.LANG.DESCRIPTION"))
        .addChoices(
          ...localeList.map((locale) => ({
            name: locale,
            value: locale,
          })),
        ),
    )
    .addBooleanOption((option) => option.setName("guild_tags").setDescription(t("SETTINGS.GUILD_TAGS.DESCRIPTION")))
    .addBooleanOption((option) =>
      option.setName("split_loot_value").setDescription(t("SETTINGS.SPLIT_LOOT_VALUE.DESCRIPTION")),
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

  const option = settings[category].enabled ? t("SETTINGS.ENABLED") : t("SETTINGS.DISABLED");
  const channel = interaction.guild.channels.cache.get(settings[category].channel);
  reply += t("SETTINGS.SET", { category, option }) + "\n";
  if (channel) reply += t("SETTINGS.CHANNEL.SET", { category, channel: channel.toString() }) + "\n";
  else reply += t("SETTINGS.CHANNEL.NULL") + "\n";

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
    .addSubcommand(general),
  handle: async (interaction, { settings, t }) => {
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
        reply += t("SETTINGS.MODE.SET", { mode: settings[category].mode }) + "\n";
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
        reply += t("SETTINGS.MODE.SET", { mode: settings[category].mode }) + "\n";
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
      general: async () => {
        const locale = interaction.options.getString("language");
        if (locale) {
          if (localeList.indexOf(locale) < 0) return await reply(t("SETTINGS.LANG.NOT_SUPPORTED"));
          settings.general.locale = locale;
          t = getLocale(settings.general.locale).t;
        }

        const guildTags = interaction.options.getBoolean("guild_tags");
        if (typeof guildTags === "boolean") {
          settings.general.guildTags = guildTags;
        }

        const splitLootValue = interaction.options.getBoolean("split_loot_value");
        if (typeof splitLootValue === "boolean") {
          settings.general.splitLootValue = splitLootValue;
        }

        await interaction.deferReply({ ephemeral: true });
        await setSettings(interaction.guild.id, settings);

        let reply = "";
        reply += t("SETTINGS.LANG.SET", { lang: settings.general.locale }) + "\n";
        reply +=
          t("SETTINGS.GUILD_TAGS.SET", {
            enabled: settings.general.guildTags ? t("SETTINGS.ENABLED") : t("SETTINGS.DISABLED"),
          }) + "\n";
        reply +=
          t("SETTINGS.SPLIT_LOOT_VALUE.SET", {
            enabled: settings.general.splitLootValue ? t("SETTINGS.ENABLED") : t("SETTINGS.DISABLED"),
          }) + "\n";

        return await editReply(reply);
      },
    };

    const subcommand = subcommands[interaction.options.getSubcommand()];
    if (!subcommand) throw new Error("Option not found");
    return await subcommand();
  },
};

module.exports = command;
