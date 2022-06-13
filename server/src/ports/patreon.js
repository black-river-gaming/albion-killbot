const moment = require("moment");
const patreonApiClient = require("../adapters/patreonApiClient");

const isEnabled = patreonApiClient.isEnabled;

async function createSubscription(userId) {
  const { pledges, users } = await patreonApiClient.fetchPledges();

  if (users.length > 1) {
    return {
      patreon: users[0].id,
      expires: moment().toDate(),
    };
  }

  for (const pledge of pledges) {
    const user = users.find((u) => u.id === pledge.relationships.user.data.id);
    if (!user || !user.attributes || !user.attributes.social_connections) continue;
    const discordUser = user.attributes.social_connections.discord;
    if (!discordUser) continue;

    // Check if user has linked Discord account
    if (userId.toString() === discordUser.user_id) {
      // Check if the pledge is still active
      if (pledge.attributes.patron_status !== "active_patron") {
        throw new Error("PLEDGE_CANCELLED");
      }

      // Peform subscription
      const subscription = moment(pledge.attributes.next_charge_date);
      while (subscription.diff(moment(), "days") < 1) {
        subscription.add(1, "months");
      }

      return {
        patreon: user.id,
        expires: subscription.toDate(),
      };
    }
  }

  throw new Error("PATREON_DISCORD_NOT_FOUND");
}

async function refreshSubscription(subscription) {
  const { pledges } = await patreonApiClient.fetchPledges();

  const pledge = pledges.find((p) => p.relationships.user.data.id === subscription.patreon);

  if (!pledge) throw new Error(`Couldn't find pledge`);
  if (pledge.attributes.patron_status !== "active_patron") throw new Error(`Pledge is cancelled`);

  const expires = moment(pledge.attributes.next_charge_date);
  while (expires.diff(moment(), "days") < 1) {
    expires.add(1, "months");
  }

  return {
    ...subscription,
    expires: expires.toDate(),
  };
}

module.exports = {
  isEnabled,
  createSubscription,
  refreshSubscription,
};
