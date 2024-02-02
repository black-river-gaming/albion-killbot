const config = require("config");
const { PermissionFlagsBits } = require("discord.js");

const { DAY, MINUTE } = require("../../../helpers/constants");
const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/scheduler");
const {
  isSubscriptionsEnabled,
  isActiveSubscription,
  fetchAllSubscriptions,
  subscriptionEvents,
  getSubscriptionByServerId,
  getSubscriptionExpires,
} = require("../../../services/subscriptions");
const { transformGuild } = require("../../../helpers/discord");
const { sendPrivateMessage } = require("./notifications");
const { getLocale } = require("../../../helpers/locale");
const { getSettings } = require("../../../services/settings");

let guild;

const checkPremiumRole = async (subscription) => {
  logger.debug(`Checking Premium Role for subscription: ${subscription.id}`, {
    guild,
    subscription,
  });

  const role = guild.roles.resolve(config.get("discord.community.premiumRole"));
  if (!role) throw new Error("Cannot find Premium Role.");

  try {
    if (!subscription.owner) return;
    const member = await guild.members.fetch(subscription.owner);
    if (!member) return;

    if (isActiveSubscription(subscription) && !member.roles.cache.has(role.id)) {
      logger.verbose(`Adding premium role to ${member.user.username}.`, {
        member,
        role,
      });
      await member.roles.add(role, "Premium Subscription");
    } else if (!isActiveSubscription(subscription) && member.roles.cache.has(role.id)) {
      logger.verbose(`Removing premium role from ${member.user.username}.`, {
        member,
        role,
      });
      await member.roles.remove(role, "Premium Subscription Expired");
    }
  } catch (error) {
    if (error.message.startsWith("Unknown")) return;
    logger.warn(`An error ocurred when fetching subscription owner: ${error.message}`, { error });
  }
};

const checkPremiumRoles = async (guild) => {
  const role = guild.roles.resolve(config.get("discord.community.premiumRole"));
  if (!role) throw new Error("Cannot find Premium Role.");

  logger.info("Checking for Premium Users on Discord Community Server.");

  // Since we need privileged intents for guild.members, we'll iterate our subscriptions instead
  const subscriptions = await fetchAllSubscriptions();
  subscriptions.filter((subscription) => subscription.owner).forEach(checkPremiumRole);

  logger.debug("Check for Premium Users on Discord Community Server finished.");
};

const initPremiumRoles = (client) => {
  if (!config.has("discord.community.server") || !config.has("discord.community.premiumRole")) return;

  guild = client.guilds.resolve(config.get("discord.community.server"));
  if (!guild) {
    logger.warn(
      "Community Server not found. Please make sure the bot has joined the server specified in DISCORD_COMMUNITY_SERVER.",
      {
        serverId: config.get("discord.community.server"),
        guilds: client.guilds.cache.keys,
      },
    );
    return;
  }

  const hasManageRoles = guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles, true);
  if (!hasManageRoles) {
    logger.warn(
      "Bot has no permission to change user roles on the Community Server. Please ensure the correct permissions.",
      {
        guild,
        hasManageRoles,
      },
    );
    return;
  }

  if (!guild.roles.cache.has(config.get("discord.community.premiumRole"))) {
    logger.warn("Cannot find Premium Role. Please ensure the correct role id", {
      guild,
      roleId: config.get("discord.community.premiumRole"),
    });
    return;
  }

  runInterval("Check for Premium Users", checkPremiumRoles, { interval: DAY, fnOpts: [guild] });
  subscriptionEvents.on("add", checkPremiumRole);
  subscriptionEvents.on("update", checkPremiumRole);
  subscriptionEvents.on("remove", checkPremiumRole);
};

const checkExpireNotice = async (client) => {
  for (const guild of client.guilds.cache.values()) {
    const subscription = await getSubscriptionByServerId(guild.id);
    if (!subscription || isActiveSubscription(subscription)) continue;

    // The check occurs every minute so this is expected to run only once
    if (getSubscriptionExpires(subscription, "minutes") === 0) {
      logger.verbose(`[${guild.name}] Subscription has expired. Notifying subscription owner.`, {
        guild: transformGuild(guild),
        subscription,
      });

      const settings = await getSettings(guild.id);
      const { t } = getLocale(settings.general.locale);
      sendPrivateMessage(
        client,
        subscription.owner,
        `${t("SUBSCRIPTION.STATUS.EXPIRED")} ${t("SUBSCRIPTION.RENEW", {
          link: `${config.get("dashboard.url")}/premium`,
        })}`,
      );
    }
  }
};

const initExpirationNotice = (client) => {
  runInterval("Send subscription expire notice", checkExpireNotice, {
    interval: MINUTE,
    fnOpts: [client],
    runOnStart: process.env.NODE_ENV === "development",
  });
};

module.exports = {
  name: "subscriptions",
  init: (client) => {
    if (!isSubscriptionsEnabled()) return;
    initPremiumRoles(client);
    initExpirationNotice(client);
  },
};
