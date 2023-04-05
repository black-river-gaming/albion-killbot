const { SlashCommandBuilder } = require("discord.js");
const { SERVERS } = require("../../../helpers/constants");
const { getLocale } = require("../../../helpers/locale");
const { getAlliance, search } = require("../../../services/search");
const { getLimits, getPremiumLimits } = require("../../../services/limits");
const { TRACK_TYPE, addTrack } = require("../../../services/track");
const { isTracked } = require("../../../helpers/tracking");
const { equalsCaseInsensitive } = require("../../../helpers/utils");
const {
  isActiveSubscription,
  isSubscriptionsEnabled,
  getSubscriptionByServerId,
} = require("../../../services/subscriptions");

const { t } = getLocale();
const { DASHBOARD_URL } = process.env;

const player = (subcommand) =>
  subcommand
    .setName("player")
    .setDescription(t("HELP.TRACK"))
    .addStringOption((option) =>
      option.setName("server").setDescription(t("TRACK.SERVER.DESCRIPTION")).setRequired(true).setChoices(
        {
          name: SERVERS.WEST,
          value: SERVERS.WEST,
        },
        {
          name: SERVERS.EAST,
          value: SERVERS.EAST,
        },
      ),
    )
    .addStringOption((option) =>
      option.setName("player").setDescription(t("TRACK.PLAYERS.DESCRIPTION")).setRequired(true),
    )
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.CHANNEL.DESCRIPTION")));

const guild = (subcommand) =>
  subcommand
    .setName("guild")
    .setDescription(t("HELP.TRACK"))
    .addStringOption((option) =>
      option.setName("server").setDescription(t("TRACK.SERVER.DESCRIPTION")).setRequired(true).setChoices(
        {
          name: SERVERS.WEST,
          value: SERVERS.WEST,
        },
        {
          name: SERVERS.EAST,
          value: SERVERS.EAST,
        },
      ),
    )
    .addStringOption((option) =>
      option.setName("guild").setDescription(t("TRACK.GUILDS.DESCRIPTION")).setRequired(true),
    )
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.CHANNEL.DESCRIPTION")));

const alliance = (subcommand) =>
  subcommand
    .setName("alliance")
    .setDescription(t("HELP.TRACK"))
    .addStringOption((option) =>
      option.setName("server").setDescription(t("TRACK.SERVER.DESCRIPTION")).setRequired(true).setChoices(
        {
          name: SERVERS.WEST,
          value: SERVERS.WEST,
        },
        {
          name: SERVERS.EAST,
          value: SERVERS.EAST,
        },
      ),
    )
    .addStringOption((option) =>
      option.setName("alliance").setDescription(t("TRACK.ALLIANCE.DESCRIPTION")).setRequired(true),
    )
    .addChannelOption((option) => option.setName("channel").setDescription(t("SETTINGS.CHANNEL.DESCRIPTION")));

const command = {
  data: new SlashCommandBuilder()
    .setName("track")
    .setDescription(t("HELP.TRACK"))
    .setDefaultMemberPermissions("0")
    .addSubcommand(player)
    .addSubcommand(guild)
    .addSubcommand(alliance),
  handle: async (interaction, { settings, track, t }) => {
    if (!track) throw new Error(t("TRACK.ERRORS.FETCH_FAILED"));

    const limits = await getLimits(interaction.guild.id);
    const premiumLimits = getPremiumLimits();
    const subscription = await getSubscriptionByServerId(interaction.guild.id);

    const server = interaction.options.getString("server");
    const playerName = interaction.options.getString("player");
    const guildName = interaction.options.getString("guild");
    const allianceId = interaction.options.getString("alliance");
    const channel = interaction.options.getChannel("channel");

    if (!server || (!playerName && !guildName && !allianceId)) {
      return await interaction.reply({
        content: t("TRACK.MISSING_PARAMETERS"),
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    let content = ``;
    const addContent = (msg) => {
      content += msg + "\n";
    };

    const searchAndAdd = async (type, value, { limit = 5, premiumLimit = 0 }) => {
      const tType = t(`TRACK.${type.toUpperCase()}.TYPE`).toLowerCase();
      const url = `${DASHBOARD_URL}/premium`;
      const shouldBuyPremium = isSubscriptionsEnabled() && !isActiveSubscription(subscription) && premiumLimit > limit;

      if (limit == 0) {
        if (shouldBuyPremium)
          return addContent(t("TRACK.FREE_LIMIT_REACHED", { type: tType, limit, premiumLimit, url }));
        return addContent(t("TRACK.TRACKING_DISABLED", { type: tType }));
      }

      if (track[type].length >= limit) {
        if (shouldBuyPremium)
          return addContent(t("TRACK.FREE_LIMIT_REACHED", { type: tType, limit, premiumLimit, url }));
        return addContent(t("TRACK.LIMIT_REACHED", { limit }));
      }

      let trackItem;

      if (type == "alliances") {
        if (isTracked({ id: value, server }, track[type])) return addContent(t("TRACK.ALREADY_TRACKED"));

        trackItem = await getAlliance(server, value);
      } else {
        if (isTracked({ name: value, server }, track[type])) return addContent(t("TRACK.ALREADY_TRACKED"));

        const searchResults = await search(server, value);
        if (!searchResults) return addContent(t("TRACK.SEARCH_FAILED"));

        trackItem = searchResults[type].find((searchEntity) => equalsCaseInsensitive(searchEntity.name, value));
      }

      if (!trackItem) return addContent(t("TRACK.NOT_FOUND"));
      trackItem.server = server;
      if (channel) trackItem.channel = channel.id;

      await addTrack(interaction.guild.id, type, trackItem);

      let response = t(`TRACK.${type.toUpperCase()}.TRACKED`, { name: trackItem.name }) + " ";
      if (channel) response += t("TRACK.CHANNEL.CUSTOM", { channel: channel.toString() });
      else response += t("TRACK.CHANNEL.DEFAULT");

      return addContent(response);
    };

    if (allianceId)
      await searchAndAdd(TRACK_TYPE.ALLIANCES, allianceId, {
        limit: limits.alliances,
        premiumLimit: premiumLimits.alliances,
      });
    if (playerName)
      await searchAndAdd(TRACK_TYPE.PLAYERS, playerName, {
        limit: limits.players,
        premiumLimit: premiumLimits.players,
      });
    if (guildName)
      await searchAndAdd(TRACK_TYPE.GUILDS, guildName, {
        limit: limits.guilds,
        premiumLimit: premiumLimits.guilds,
      });

    await interaction.editReply({ content, ephemeral: true });

    if (!settings.kills.channel && !settings.deaths.channel) {
      await interaction.followUp(t("SETTINGS.CHANNEL.NOT_SET"));
    }
  },
};

module.exports = command;
