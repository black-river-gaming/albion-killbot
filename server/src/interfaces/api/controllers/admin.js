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

async function createSubscription(req, res) {
  const { owner, server, expires, limits } = req.body;
  const subscription = {
    owner,
    server,
    expires,
    limits,
  };

  try {
    if (expires !== "never") {
      const date = moment(expires, moment.ISO_8601, true);
      if (!date.isValid()) return res.sendStatus(422);
      subscription.expires = date.toDate();
    }

    const createdSubscription = await subscriptionsService.addSubscription(subscription);

    return res.status(201).json(createdSubscription);
  } catch (error) {
    logger.error(`Unable to create subscription: ${error.message}`, {
      error,
      subscription,
    });
    return res.sendStatus(500);
  }
}

async function getSubscription(req, res) {
  const { subscriptionId } = req.params;

  try {
    const subscription = await subscriptionsService.getSubscriptionById(subscriptionId);
    if (!subscription) return res.sendStatus(404);

    return res.send(subscription);
  } catch (error) {
    logger.error(`Unable to fetch subscription ${subscriptionId}: ${error.message}`, { error, subscriptionId });
    return res.sendStatus(500);
  }
}

async function updateSubscription(req, res) {
  const { subscriptionId } = req.params;
  const subscription = {
    ...req.body,
  };
  const { expires } = req.body;

  try {
    if (expires && expires !== "never") {
      const date = moment(expires, moment.ISO_8601, true);
      if (!date.isValid()) return res.sendStatus(422);
      subscription.expires = date.toDate();
    }

    const createdSubscription = await subscriptionsService.updateSubscription(subscriptionId, subscription);
    if (!createdSubscription) return res.sendStatus(404);

    return res.send(createdSubscription);
  } catch (error) {
    logger.error(`Unable to update subscription: ${error.message}`, {
      error,
      subscription,
    });
    return res.sendStatus(500);
  }
}

async function deleteSubscription(req, res) {
  const { subscriptionId } = req.params;

  try {
    const subscription = await subscriptionsService.getSubscriptionById(subscriptionId);
    if (!subscription) return res.sendStatus(404);

    await subscriptionsService.removeSubscription(subscription.id);

    res.send({});
  } catch (error) {
    logger.error(`Unable to delete subscription: ${error.message}`, {
      error,
      subscriptionId,
    });
    return res.sendStatus(500);
  }
}

module.exports = {
  getServers,
  leaveServer,

  getSubscriptions,
  createSubscription,
  getSubscription,
  updateSubscription,
  deleteSubscription,
};
