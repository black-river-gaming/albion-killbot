const { InteractionType } = require("discord-api-types/v10");
const { String } = require("discord-api-types/v10").ApplicationCommandOptionType;
const moment = require("moment");
const { getLocale } = require("../../../helpers/locale");
const { activateSubscription } = require("../../../ports/subscriptions");
const { getSettingsBySubscriptionOwner } = require("../../../services/settings");
const { cancelSubscription } = require("../../../services/subscriptions");

const t = getLocale().t;

const options = [
  {
    name: "action",
    description: t("HELP.SUBSCRIPTION"),
    type: String,
    required: false,
    choices: [
      {
        name: t("GENERAL.ACTIVATE"),
        value: "activate",
      },
      {
        name: t("GENERAL.DEACTIVATE"),
        value: "deactivate",
      },
    ],
  },
];

const command = {
  name: "subscription",
  description: t("HELP.SUBSCRIPTION"),
  type: InteractionType.Ping,
  default_member_permissions: "0",
  options,
  handle: async (interaction, settings) => {
    const { subscription, lang } = settings;
    const t = getLocale(lang).t;
    const ephemeral = true;

    const action = interaction.options.getString("action");
    if (!action) {
      if (!subscription.expires)
        return await interaction.reply({
          content: t("SUBSCRIPTION.STATUS.INACTIVE"),
          ephemeral,
        });

      const days = moment(subscription.expires).diff(moment(), "days");
      return await interaction.reply({
        content: days <= 0 ? t("SUBSCRIPTION.STATUS.EXPIRED") : t("SUBSCRIPTION.STATUS.DAYS_REMAINING", { days }),
        ephemeral,
      });
    }

    if (action == "activate") {
      await interaction.deferReply({ ephemeral });
      // If the user is already owner of a subscription in another server
      const anotherServerSettings = await getSettingsBySubscriptionOwner(interaction.user.id);
      if (anotherServerSettings.guild && anotherServerSettings.guild !== interaction.guild.id) {
        return interaction.editReply(t("SUBSCRIPTION.ALREADY_SUBSCRIBED"));
      }

      try {
        await activateSubscription(settings, interaction.user.id);
        return interaction.editReply(t("SUBSCRIPTION.CONFIRMED"));
      } catch (e) {
        const reason = t(`SUBSCRIPTION.ERROR.${e.message.toUpperCase()}`);
        return await interaction.editReply(t("SUBSCRIPTION.FAILED", { reason }));
      }
    }

    if (action == "deactivate") {
      await interaction.deferReply({ ephemeral });
      await cancelSubscription(settings);
      return await interaction.editReply(t("SUBSCRIPTION.CANCELLED"));
    }

    return await interaction.reply({ content: "Please specify a valid option.", ephemeral });
  },
};

module.exports = command;
