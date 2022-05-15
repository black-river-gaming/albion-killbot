const logger = require("../../../helpers/logger");
const { fetchEventsTo, publishEventToExchange } = require("../../../services/events");

const noop = () => {
  throw new Error("Not implemented yet");
};

let latestEvent;

async function fetchEvents() {
  if (!latestEvent) {
    logger.info("Retrieving first batch of events.");
  } else {
    logger.info(`Fetching Albion Online events from API up to event ${latestEvent.EventId}.`);
  }

  const events = await fetchEventsTo(latestEvent);
  if (events.length === 0) return logger.debug("No new events.");

  // Publish new events, from oldest to newest
  logger.debug(`Publishing ${events.length} new events to exchange...`);
  for (const evt of events) {
    if (latestEvent && evt.EventId <= latestEvent.EventId) {
      logger.warn(`The published id is lower than latestEvent! Skipping.`);
      continue;
    }
    await publishEventToExchange(evt);
    latestEvent = evt;
  }
  logger.info("Publish events complete.");
}

module.exports = {
  fetchEvents,
  fetchBattles: noop,
};
