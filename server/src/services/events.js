const { getEvents } = require("../adapters/albionApiClient");
const logger = require("../helpers/logger");
const { sleep } = require("../helpers/utils");

async function fetchEventsTo(latestEvent, { offset = 0 } = {}, events = []) {
  // Maximum offset reached, just return what we have
  if (offset >= 1000) return events;

  try {
    // If not latestEvent, just fetch a single one to create a reference
    if (!latestEvent) {
      return await getEvents({
        limit: 1,
      });
    }

    logger.debug(`Fetching events with offset: ${offset}`);
    const albionEvents = await getEvents({
      offset,
    });

    const foundLatest = !albionEvents.every((evt) => {
      if (evt.EventId <= latestEvent.EventId) return false;
      // Ignore items already on the queue
      if (events.findIndex((e) => e.EventId === evt.EventId) >= 0) return true;
      events.push(evt);
      return true;
    });

    return foundLatest ? events : fetchEventsTo(latestEvent, { offset: offset + albionEvents.length }, events);
  } catch (err) {
    logger.error(`Unable to fetch event data from API [${err}]. Retrying...`);
    await sleep(5000);
    return fetchEventsTo(latestEvent, { offset }, events);
  }
}

module.exports = {
  fetchEventsTo,
};
