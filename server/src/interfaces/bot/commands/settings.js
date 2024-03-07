const config = require("config");
const { SlashCommandBuilder } = require("discord.js");

const { REPORT_PROVIDERS, RANKING_MODES } = require("../../../helpers/constants");
const { getLocale } = require("../../../helpers/locale");
const { setSettings } = require("../../../services/settings");
const subscriptionsService = require("../../../services/subscriptions");

const locale = getLocale();
const localeList = locale.getLocales();
const t = locale.t;

const kills = (subcommand) =>
  subcommand
    .setName("kills")
    .setDescription(t("SETTINGS.DESCRIPTION.KILLS"))
    .addBooleanOption((option) => option.setName("enabled").setDescription(t("SETTINGS.CATEGORY.ENABLED")))
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.DESCRIPTION.CHANNEL")))
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription(t("SETTINGS.DESCRIPTION.MODE"))
        .setChoices(
          {
            name: t("SETTINGS.MODE.IMAGE"),
            value: "image",
          },
          {
            name: t("SETTINGS.MODE.TEXT"),
            value: "text",
          },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("provider")
        .setDescription(t("SETTINGS.DESCRIPTION.PROVIDER"))
        .setChoices(
          ...REPORT_PROVIDERS.filter((provider) => provider.events).map((provider) => ({
            name: provider.name,
            value: provider.id,
          })),
        ),
    );

const deaths = (subcommand) =>
  subcommand
    .setName("deaths")
    .setDescription(t("SETTINGS.DESCRIPTION.DEATHS"))
    .addBooleanOption((option) => option.setName("enabled").setDescription(t("SETTINGS.CATEGORY.ENABLED")))
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.DESCRIPTION.CHANNEL")))
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription(t("SETTINGS.DESCRIPTION.MODE"))
        .setChoices(
          {
            name: t("SETTINGS.MODE.IMAGE"),
            value: "image",
          },
          {
            name: t("SETTINGS.MODE.TEXT"),
            value: "text",
          },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("provider")
        .setDescription(t("SETTINGS.DESCRIPTION.PROVIDER"))
        .setChoices(
          ...REPORT_PROVIDERS.filter((provider) => provider.events).map((provider) => ({
            name: provider.name,
            value: provider.id,
          })),
        ),
    );

const juicy = (subcommand) =>
  subcommand
    .setName("juicy")
    .setDescription(t("SETTINGS.DESCRIPTION.JUICY"))
    .addBooleanOption((option) => option.setName("enabled").setDescription(t("SETTINGS.CATEGORY.ENABLED")))
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.DESCRIPTION.CHANNEL")))
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription(t("SETTINGS.DESCRIPTION.MODE"))
        .setChoices(
          {
            name: t("SETTINGS.MODE.IMAGE"),
            value: "image",
          },
          {
            name: t("SETTINGS.MODE.TEXT"),
            value: "text",
          },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("provider")
        .setDescription(t("SETTINGS.DESCRIPTION.PROVIDER"))
        .setChoices(
          ...REPORT_PROVIDERS.filter((provider) => provider.events).map((provider) => ({
            name: provider.name,
            value: provider.id,
          })),
        ),
    );

const battles = (subcommand) =>
  subcommand
    .setName("battles")
    .setDescription(t("SETTINGS.DESCRIPTION.BATTLES"))
    .addBooleanOption((option) => option.setName("enabled").setDescription(t("SETTINGS.CATEGORY.ENABLED")))
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.DESCRIPTION.CHANNEL")))
    .addStringOption((option) =>
      option
        .setName("provider")
        .setDescription(t("SETTINGS.DESCRIPTION.PROVIDER"))
        .setChoices(
          ...REPORT_PROVIDERS.filter((provider) => provider.battles).map((provider) => ({
            name: provider.name,
            value: provider.id,
          })),
        ),
    );

const rankingFrequencies = RANKING_MODES.map((mode) => ({
  name: t(`SETTINGS.FREQUENCIES.${mode.toUpperCase()}`),
  value: mode,
}));

const rankings = (subcommand) =>
  subcommand
    .setName("rankings")
    .setDescription(t("SETTINGS.DESCRIPTION.RANKINGS"))
    .addBooleanOption((option) => option.setName("enabled").setDescription(t("SETTINGS.CATEGORY.ENABLED")))
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.DESCRIPTION.CHANNEL")))
    .addStringOption((option) =>
      option
        .setName("daily")
        .setDescription(t("SETTINGS.DESCRIPTION.RANKING_DAILY"))
        .setChoices(...rankingFrequencies),
    )
    .addStringOption((option) =>
      option
        .setName("weekly")
        .setDescription(t("SETTINGS.DESCRIPTION.RANKING_WEEKLY"))
        .setChoices(...rankingFrequencies),
    )
    .addStringOption((option) =>
      option
        .setName("monthly")
        .setDescription(t("SETTINGS.DESCRIPTION.RANKING_MONTHLY"))
        .setChoices(...rankingFrequencies),
    );

const general = (subcommand) =>
  subcommand
    .setName("general")
    .setDescription(t("SETTINGS.DESCRIPTION.GENERAL"))
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription(t("SETTINGS.DESCRIPTION.LANG"))
        .setChoices(
          ...localeList.map((locale) => ({
            name: locale,
            value: locale,
          })),
        ),
    )
    .addBooleanOption((option) =>
      option.setName("show_attunement").setDescription(t("SETTINGS.DESCRIPTION.SHOW_ATTUNEMENT")),
    )
    .addBooleanOption((option) => option.setName("guild_tags").setDescription(t("SETTINGS.DESCRIPTION.GUILD_TAGS")))
    .addBooleanOption((option) =>
      option.setName("split_loot_value").setDescription(t("SETTINGS.DESCRIPTION.SPLIT_LOOT_VALUE")),
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

  const option = settings[category].enabled ? t("SETTINGS.CATEGORY.ENABLED") : t("SETTINGS.CATEGORY.DISABLED");
  const channel = interaction.guild.channels.cache.get(settings[category].channel);
  reply += t("SETTINGS.CATEGORY.SET", { category, option }) + "\n";
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
    .addSubcommand(juicy)
    .addSubcommand(battles)
    .addSubcommand(rankings)
    .addSubcommand(general),
  handle: async (interaction, { settings, t }) => {
    const editReply = async (content, ephemeral = true) => await interaction.editReply({ content, ephemeral });

    const subcommands = {
      general: async () => {
        const locale = interaction.options.getString("language");
        if (locale) {
          if (localeList.indexOf(locale) < 0) return await reply(t("SETTINGS.LANG.NOT_SUPPORTED"));
          settings.general.locale = locale;
          t = getLocale(settings.general.locale).t;
        }

        const showAttunement = interaction.options.getBoolean("show_attunement");
        if (typeof showAttunement === "boolean") {
          settings.general.showAttunement = showAttunement;
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
          t("SETTINGS.SHOW_ATTUNEMENT.SET", {
            enabled: settings.general.showAttunement ? t("SETTINGS.CATEGORY.ENABLED") : t("SETTINGS.CATEGORY.DISABLED"),
          }) + "\n";
        reply +=
          t("SETTINGS.GUILD_TAGS.SET", {
            enabled: settings.general.guildTags ? t("SETTINGS.CATEGORY.ENABLED") : t("SETTINGS.CATEGORY.DISABLED"),
          }) + "\n";
        reply +=
          t("SETTINGS.SPLIT_LOOT_VALUE.SET", {
            enabled: settings.general.splitLootValue ? t("SETTINGS.CATEGORY.ENABLED") : t("SETTINGS.CATEGORY.DISABLED"),
          }) + "\n";

        return await editReply(reply);
      },
      kills: async () => {
        const category = "kills";
        settings = getCommonOptions(settings, category, interaction);

        const mode = interaction.options.getString("mode");
        if (mode != null) settings[category].mode = mode;

        let provider = interaction.options.getString("provider");
        if (provider != null) settings[category].provider = provider;

        await interaction.deferReply({ ephemeral: true });
        await setSettings(interaction.guild.id, settings);

        let reply = printCommonOptions(settings, category, interaction, t);
        reply += t("SETTINGS.MODE.SET", { mode: settings[category].mode }) + "\n";

        provider = REPORT_PROVIDERS.find((p) => p.id === settings[category].provider);
        if (provider) reply += t("SETTINGS.PROVIDER.SET", { provider: provider.name }) + "\n";

        return await editReply(reply);
      },
      deaths: async () => {
        const category = "deaths";
        settings = getCommonOptions(settings, category, interaction);

        const mode = interaction.options.getString("mode");
        if (mode != null) settings[category].mode = mode;

        let provider = interaction.options.getString("provider");
        if (provider != null) settings[category].provider = provider;

        await interaction.deferReply({ ephemeral: true });
        await setSettings(interaction.guild.id, settings);

        let reply = printCommonOptions(settings, category, interaction, t);
        reply += t("SETTINGS.MODE.SET", { mode: settings[category].mode }) + "\n";

        provider = REPORT_PROVIDERS.find((p) => p.id === settings[category].provider);
        if (provider) reply += t("SETTINGS.PROVIDER.SET", { provider: provider.name }) + "\n";

        return await editReply(reply);
      },
      juicy: async () => {
        await interaction.deferReply({ ephemeral: true });

        if (!(await subscriptionsService.hasSubscriptionByServerId(interaction.guild.id))) {
          return await editReply(
            t("SUBSCRIPTION.REQUIRED", {
              link: `${config.get("dashboard.url")}/premium`,
            }),
          );
        }

        const category = "juicy";
        settings = getCommonOptions(settings, category, interaction);

        const mode = interaction.options.getString("mode");
        if (mode != null) settings[category].mode = mode;

        let provider = interaction.options.getString("provider");
        if (provider != null) settings[category].provider = provider;

        await setSettings(interaction.guild.id, settings);

        let reply = printCommonOptions(settings, category, interaction, t);
        reply += t("SETTINGS.MODE.SET", { mode: settings[category].mode }) + "\n";

        provider = REPORT_PROVIDERS.find((p) => p.id === settings[category].provider);
        if (provider) reply += t("SETTINGS.PROVIDER.SET", { provider: provider.name }) + "\n";

        return await editReply(reply);
      },
      battles: async () => {
        const category = "battles";
        settings = getCommonOptions(settings, category, interaction);

        let provider = interaction.options.getString("provider");
        if (provider != null) settings[category].provider = provider;

        await interaction.deferReply({ ephemeral: true });
        await setSettings(interaction.guild.id, settings);

        let reply = printCommonOptions(settings, category, interaction, t);

        provider = REPORT_PROVIDERS.find((p) => p.id === settings[category].provider);
        if (provider) reply += t("SETTINGS.PROVIDER.SET", { provider: provider.name }) + "\n";

        return await editReply(reply);
      },
      rankings: async () => {
        const category = "rankings";
        settings = getCommonOptions(settings, category, interaction);

        ["daily", "weekly", "monthly"].forEach((type) => {
          const setting = interaction.options.getString(type);
          if (setting != null) settings[category][type] = setting;
        });

        await interaction.deferReply({ ephemeral: true });
        await setSettings(interaction.guild.id, settings);

        let reply = printCommonOptions(settings, category, interaction, t);
        ["daily", "weekly", "monthly"].forEach((type) => {
          if (!settings[category][type]) return;
          reply +=
            t(`SETTINGS.RANKING.SET.${type.toUpperCase()}`, {
              frequency: t(`SETTINGS.FREQUENCIES.${settings[category][type].toUpperCase()}`),
            }) + "\n";
        });
        return await editReply(reply);
      },
    };

    const subcommand = subcommands[interaction.options.getSubcommand()];
    if (!subcommand) throw new Error("Option not found");
    return await subcommand();
  },
};

module.exports = command;
