const { PermissionFlagsBits } = require("discord.js");
const { DAY } = require("../../../helpers/constants");
const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/scheduler");
const {
  isSubscriptionsEnabled,
  isActiveSubscription,
  fetchAllSubscriptions,
  subscriptionEvents,
} = require("../../../services/subscriptions");

const { DISCORD_COMMUNITY_SERVER, DISCORD_COMMUNITY_PREMIUM_ROLE } = process.env;

let guild;

const checkPremiumRole = async (subscription) => {
  logger.debug(`Checking Premium Role for subscription: ${subscription.id}`, {
    guild,
    subscription,
  });

  const role = guild.roles.resolve(DISCORD_COMMUNITY_PREMIUM_ROLE);
  if (!role) throw new Error("Cannot find Premium Role.");

  try {
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
  const role = guild.roles.resolve(DISCORD_COMMUNITY_PREMIUM_ROLE);
  if (!role) throw new Error("Cannot find Premium Role.");

  logger.info("Checking for Premium Users on Discord Community Server.");

  // Since we need privileged intents for guild.members, we'll iterate our subscriptions instead
  const subscriptions = await fetchAllSubscriptions();
  subscriptions.filter((subscription) => subscription.owner).forEach(checkPremiumRole);

  logger.debug("Check for Premium Users on Discord Community Server finished.");
};

const init = (client) => {
  if (!isSubscriptionsEnabled()) return;
  if (!DISCORD_COMMUNITY_SERVER || !DISCORD_COMMUNITY_PREMIUM_ROLE) return;

  guild = client.guilds.resolve(DISCORD_COMMUNITY_SERVER);
  if (!guild) {
    logger.warn(
      "Community Server not found. Please make sure the bot has joined the server specified in DISCORD_COMMUNITY_SERVER.",
      {
        DISCORD_COMMUNITY_SERVER,
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

  if (!guild.roles.cache.has(DISCORD_COMMUNITY_PREMIUM_ROLE)) {
    logger.warn("Cannot find Premium Role. Please ensure the correct role id", {
      guild,
      roleId: DISCORD_COMMUNITY_PREMIUM_ROLE,
    });
    return;
  }

  runInterval("Check for Premium Users", checkPremiumRoles, { interval: DAY, fnOpts: [guild] });
  subscriptionEvents.on("add", checkPremiumRole);
  subscriptionEvents.on("update", checkPremiumRole);
  subscriptionEvents.on("remove", checkPremiumRole);
};

module.exports = {
  name: "subscriptions",
  init,
};
