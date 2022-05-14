const moment = require("moment");
const { getI18n } = require("../messages");
const { getSubscription, cancelSubscription, setSubscription } = require("../subscriptions");
const { setConfig, getConfigBySubscription } = require("../config");

module.exports = {
  aliases: ["subscription"],
  args: ["activate/deactivate"],
  requirements: process.env.SUBSCRIPTIONS_ONLY,
  public: true,
  description: "HELP.SUBSCRIPTION",
  run: async (_client, guild, message, args) => {
    const l = getI18n(guild.config.lang);

    //check current subscription
    if (!args[0]) {
      const subscription = getSubscription(guild.config);
      if (!subscription) {
        return message.channel.send(l.__("SUBSCRIPTION.STATUS.INACTIVE"));
      }

      const days = moment(subscription.expires).diff(moment(), "days");
      const status =
        days <= 0 ? l.__("SUBSCRIPTION.STATUS.EXPIRED") : l.__("SUBSCRIPTION.STATUS.DAYS_REMAINING", { days });
      return message.channel.send(status);
    }

    const action = args[0].toLowerCase();
    // 'deactivate' will deactivate the current subscription
    switch (action) {
      case "deactivate":
        guild.config = cancelSubscription(guild.config);
        if (!(await setConfig(guild))) {
          return message.channel.send(l.__("CONFIG_NOT_SET"));
        }
        return message.channel.send(l.__("SUBSCRIPTION.CANCELLED"));
      case "activate":
        try {
          const c = await getConfigBySubscription(message.author.id);
          if (c && c.guild !== message.guild.id) {
            return message.channel.send(l.__("SUBSCRIPTION.ALREADY_SUBSCRIBED"));
          }

          guild.config = await setSubscription(guild.config, message.author.id);
          if (!(await setConfig(guild))) {
            return message.channel.send(l.__("CONFIG_NOT_SET"));
          }
          return message.channel.send(l.__("SUBSCRIPTION.CONFIRMED"));
        } catch (e) {
          const reason = l.__(`SUBSCRIPTION.ERROR.${e.message.toUpperCase()}`);
          return message.channel.send(l.__("SUBSCRIPTION.FAILED", { reason }));
        }
      default:
        return message.channel.send(
          l.__("SUBSCRIPTION.ACTIONS", {
            actions: ["activate", "deactivate"].join(" ,"),
          }),
        );
    }
  },
};
