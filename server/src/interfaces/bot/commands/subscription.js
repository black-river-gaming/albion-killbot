const { InteractionType } = require("discord-api-types/v10");
const moment = require("moment");
const { getLocale } = require("../../../helpers/locale");
const { isSubscriptionsEnabled, getSubscriptionByServerId } = require("../../../services/subscriptions");

const t = getLocale().t;

const command = {
  name: "subscription",
  description: t("HELP.SUBSCRIPTION"),
  type: InteractionType.Ping,
  default_member_permissions: "0",
  handle: async (interaction, settings) => {
    const { guild, lang } = settings;
    const t = getLocale(lang).t;
    const ephemeral = true;

    if (!isSubscriptionsEnabled())
      return interaction.reply({
        content: t("SUBSCRIPTION.FAILED", { reason: t("GENERAL.DISABLED") }),
        ephemeral,
      });

    const subscription = await getSubscriptionByServerId(guild);
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
