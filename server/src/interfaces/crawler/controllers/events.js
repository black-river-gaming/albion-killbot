const logger = require("../../../helpers/logger");
const { fetchEventsTo, publishEvent } = require("../../../services/events");

const { AMQP_QUEUE_EVENTS_BATCH } = process.env;

let latestEvent;

async function fetchEvents() {
  if (!latestEvent) {
    logger.info("Retrieving first batch of events.");
  } else {
    logger.info(`Fetching Albion Online events from API up to event ${latestEvent.EventId}.`);
  }

  const events = await fetchEventsTo(latestEvent);
  if (events.length === 0) return logger.verbose("No new events.");

  // Publish new events, from oldest to newest
  const eventsToPublish = [];
  logger.verbose(`Publishing ${events.length} new events to exchange...`);
  for (const evt of events) {
    if (latestEvent && evt.EventId <= latestEvent.EventId) {
      logger.warn(`The published id is lower than latestEvent! Skipping.`);
      continue;
    }

    if (!AMQP_QUEUE_EVENTS_BATCH) {
      logger.debug(`Publishing event ${evt.EventId}`);
      await publishEvent(evt);
    } else {
      eventsToPublish.push(evt);
    }

    latestEvent = evt;
  }

  // Batch publish
  if (AMQP_QUEUE_EVENTS_BATCH) {
    await publishEvent(eventsToPublish);
  }

  logger.info("Publish events complete.");
}

module.exports = {
  fetchEvents,
};
