const logger = require("../../../helpers/logger");
const { fetchEventsTo, publishEvent } = require("../../../services/events");

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
  logger.verbose(`Publishing ${events.length} new events to exchange...`);
  for (const evt of events) {
    if (latestEvent && evt.EventId <= latestEvent.EventId) {
      logger.warn(`The published id is lower than latestEvent! Skipping.`);
      continue;
    }
    logger.debug(`Publishing event ${evt.EventId}`);
    await publishEvent(evt);
    latestEvent = evt;
  }
  logger.info("Publish events complete.");
}

module.exports = {
  fetchEvents,
};
