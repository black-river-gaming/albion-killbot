const { SECOND, SERVERS } = require("../../../helpers/constants");
const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/scheduler");

const { fetchEventsTo, publishEvent } = require("../../../services/events");

const { AMQP_QUEUE_EVENTS_BATCH } = process.env;

const latestEvent = {
  [SERVERS.WEST]: null,
  [SERVERS.EAST]: null,
};

async function fetchEvents(server) {
  if (!latestEvent[server]) {
    logger.info(`[${server}] Retrieving first batch of events.`);
  } else {
    logger.info(`[${server}] Fetching Albion Online events from API up to event ${latestEvent[server].EventId}.`);
  }

  const events = await fetchEventsTo(latestEvent[server], { server });
  if (events.length === 0) return logger.verbose(`[${server}] No new events.`);

  // Publish new events, from oldest to newest
  const eventsToPublish = [];
  logger.verbose(`[${server}] Publishing ${events.length} new events to exchange...`);
  for (const evt of events) {
    if (latestEvent[server] && evt.EventId <= latestEvent[server].EventId) {
      logger.warn(`[${server}] The published id is lower than latestEvent! Skipping.`, {
        latestEventId: latestEvent[server].EventId,
        eventId: evt.EventId,
        server,
      });
      continue;
    }

    if (!AMQP_QUEUE_EVENTS_BATCH) {
      logger.debug(`[${server}] Publishing event ${evt.EventId}`);
      await publishEvent(evt);
    } else {
      eventsToPublish.push(evt);
    }

    latestEvent[server] = evt;
  }

  // Batch publish
  if (AMQP_QUEUE_EVENTS_BATCH) {
    await publishEvent(eventsToPublish);
  }

  logger.info(`[${server}] Publish events complete.`);
}

const init = async () => {
  runInterval("Fetch events for west server", fetchEvents, {
    interval: 30 * SECOND,
    runOnStart: true,
    fnOpts: [SERVERS.WEST],
  });
  runInterval("Fetch events for east server", fetchEvents, {
    interval: 30 * SECOND,
    runOnStart: true,
    fnOpts: [SERVERS.EAST],
  });
};

module.exports = {
  name: "events",
  init,
};
