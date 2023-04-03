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

const command = {
  data: new SlashCommandBuilder()
    .setName("track")
    .setDescription(t("HELP.TRACK"))
    .setDefaultMemberPermissions("0")
    .addStringOption((option) =>
      option.setName("server").setDescription(t("TRACK.ALLIANCES.DESCRIPTION")).setRequired(true).setChoices(
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
    .addStringOption((option) => option.setName("player").setDescription(t("TRACK.PLAYERS.DESCRIPTION")))
    .addStringOption((option) => option.setName("guild").setDescription(t("TRACK.GUILDS.DESCRIPTION")))
    .addStringOption((option) => option.setName("alliance").setDescription(t("TRACK.ALLIANCES.DESCRIPTION"))),
  handle: async (interaction, { settings, track, t }) => {
    if (!track) throw new Error(t("TRACK.ERRORS.FETCH_FAILED"));

    const limits = await getLimits(interaction.guild.id);
    const premiumLimits = getPremiumLimits();
    const subscription = await getSubscriptionByServerId(interaction.guild.id);

    const server = interaction.options.getString("server");
    const playerName = interaction.options.getString("player");
    const guildName = interaction.options.getString("guild");
    const allianceId = interaction.options.getString("alliance");

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

      await addTrack(interaction.guild.id, type, trackItem);
      return addContent(t(`TRACK.${type.toUpperCase()}.TRACKED`, { name: trackItem.name }));
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
      await interaction.followUp(t("CHANNEL.NOT_SET"));
    }
  },
};

module.exports = command;
