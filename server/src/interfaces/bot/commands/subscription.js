const { SlashCommandBuilder } = require("discord.js");
const moment = require("moment");
const { getLocale } = require("../../../helpers/locale");
const { isSubscriptionsEnabled, getSubscriptionByServerId } = require("../../../services/subscriptions");

const { t } = getLocale();

const command = {
  data: new SlashCommandBuilder()
    .setName("subscription")
    .setDescription(t("HELP.SUBSCRIPTION"))
    .setDefaultMemberPermissions("0"),
  handle: async (interaction, { t }) => {
    const ephemeral = true;

    if (!isSubscriptionsEnabled())
      return interaction.reply({
        content: t("SUBSCRIPTION.FAILED", { reason: t("SETTINGS.DISABLED") }),
        ephemeral,
      });

    const subscription = await getSubscriptionByServerId(interaction.guild.id);
    if (!subscription || !subscription.expires)
      return await interaction.reply({
        content: t("SUBSCRIPTION.STATUS.INACTIVE"),
        ephemeral,
      });

    if (subscription.expires === "never") {
      return await interaction.reply({
        content: t("SUBSCRIPTION.STATUS.ACTIVE"),
        ephemeral,
      });
    }

    const days = moment(subscription.expires).diff(moment(), "days");
    return await interaction.reply({
      content: days <= 0 ? t("SUBSCRIPTION.STATUS.EXPIRED") : t("SUBSCRIPTION.STATUS.DAYS_REMAINING", { days }),
      ephemeral,
    });
  },
};

module.exports = command;
