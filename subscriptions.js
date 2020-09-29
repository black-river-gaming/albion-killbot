const logger = require("./logger")("subscriptions");
const moment = require("moment");

const SUBSCRIPTIONS_ONLY = Boolean(process.env.SUBSCRIPTIONS_ONLY);

exports.hasSubscription = config => {
  if (!SUBSCRIPTIONS_ONLY) return true;
  if (!config) {
    logger.warn("Do not call hasSubscription method for guilds that have not fetched config.");
    return false;
  }
  if (!config.subscription) return false;
  return moment(config.subscription).diff() > 0;
};
