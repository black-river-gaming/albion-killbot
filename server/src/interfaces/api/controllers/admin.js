const moment = require("moment");
const logger = require("../../../helpers/logger");
const serversService = require("../../../services/servers");
const subscriptionsService = require("../../../services/subscriptions");

async function getServers(req, res) {
  try {
    const servers = await serversService.getBotServers();

    return res.send(servers);
  } catch (error) {
    return res.sendStatus(500);
  }
}

async function setServerSubscription(req, res) {
  const { serverId } = req.params;
  const { owner, limits } = req.body;
  let { expires } = req.body;

  try {
    // TODO: Validate owner, limits

    if (expires !== "never") {
      expires = moment(expires, moment.ISO_8601, true);
      if (!expires.isValid()) return res.sendStatus(422);
      expires = expires.toDate();
    }

    const subscription = await subscriptionsService.updateSubscriptionByServerId(serverId, { expires, owner, limits });

    return res.send(subscription);
  } catch (error) {
    logger.error(`Unable to update subscription for server #${serverId}: ${error.message}`, { error });
    return res.sendStatus(500);
  }
}

async function removeServerSubscription(req, res) {
  const { serverId } = req.params;

  try {
    await subscriptionsService.removeSubscriptionByServerId(serverId);

    return res.sendStatus(200);
  } catch (error) {
    logger.error(`Unable to delete subscription for server #${serverId}: ${error.message}`, { error });
    return res.sendStatus(500);
  }
}

async function leaveServer(req, res) {
  const { serverId } = req.params;

  try {
    await serversService.leaveServer(serverId);

    return res.send({});
  } catch (error) {
    logger.error(`Unable to leave server server #${serverId}: ${error.message}`, { error });
    return res.sendStatus(500);
  }
}

async function getSubscriptions(req, res) {
  const { owner, stripe, status, server } = req.query;

  try {
    const subscriptions = await subscriptionsService.fetchSubscriptions({ owner, stripe, status, server });

    return res.send(subscriptions);
  } catch (error) {
    logger.error(`Unable to retrieve subscription list: ${error.message}`, { error });
    return res.sendStatus(500);
  }
}

module.exports = {
  getServers,
  getSubscriptions,
  leaveServer,
  removeServerSubscription,
  setServerSubscription,
};
