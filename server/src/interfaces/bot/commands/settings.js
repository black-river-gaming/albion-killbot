const { InteractionType } = require("discord-api-types/v10");
const { Boolean, Channel, String, Subcommand } = require("discord-api-types/v10").ApplicationCommandOptionType;
const { getLocale } = require("../../../helpers/locale");
const { setSettings } = require("../../../services/settings");

const locale = getLocale();
const localeList = locale.getLocales();
const t = locale.t;

const kills = {
  name: "kills",
  description: t("SETTINGS.KILLS"),
  type: Subcommand,
  options: [
    {
      name: "enabled",
      description: t("SETTINGS.ENABLED"),
      type: Boolean,
    },
    {
      name: "channel",
      description: t("SETTINGS.CHANNEL"),
      type: Channel,
    },
    {
      name: "mode",
      description: t("SETTINGS.CHANNEL"),
      type: String,
      choices: [
        {
          name: t("SETTINGS.MODE.IMAGE"),
          value: "image",
        },
        {
          name: t("SETTINGS.MODE.TEXT"),
          value: "text",
        },
      ],
    },
  ],
};

const battles = {
  name: "battles",
  description: t("SETTINGS.BATTLES"),
  type: Subcommand,
  options: [
    {
      name: "enabled",
      description: t("SETTINGS.ENABLED"),
      type: Boolean,
    },
    {
      name: "channel",
      description: t("SETTINGS.CHANNEL"),
      type: Channel,
    },
  ],
};

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

const rankings = {
  name: "rankings",
  description: t("SETTINGS.RANKINGS"),
  type: Subcommand,
  options: [
    {
      name: "enabled",
      description: t("SETTINGS.ENABLED"),
      type: Boolean,
    },
    {
      name: "channel",
      description: t("SETTINGS.CHANNEL"),
      type: Channel,
    },
    {
      name: "pvp-ranking",
      description: t("SETTINGS.PVP_RANKING"),
      type: String,
      choices: rankingFrequencies,
    },
    {
      name: "guild-ranking",
      description: t("SETTINGS.GUILD_RANKING"),
      type: String,
      choices: rankingFrequencies,
    },
  ],
};

const lang = {
  name: "lang",
  description: t("SETTINGS.LANG"),
  type: Subcommand,
  options: [
    {
      name: "language",
      description: t("SETTINGS.LANG"),
      type: String,
      required: true,
      choices: localeList.map((locale) => ({
        name: locale,
        value: locale,
      })),
    },
  ],
};

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
  reply += t("CATEGORY.SET", { category, option }) + "\n";
  if (channel) reply += t("CHANNEL.SET_CHANNEL", { category, channel: channel.toString() }) + "\n";
  else reply += t("CHANNEL.NO_CHANNEL") + "\n";

  return reply;
}

const command = {
  name: "settings",
  description: t("HELP.SETTINGS"),
  type: InteractionType.Ping,
  default_member_permissions: "0",
  options: [kills, battles, rankings, lang],
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
