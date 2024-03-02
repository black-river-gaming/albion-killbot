const crypto = require("crypto");
const albion = require("../ports/albion");
const { publish, subscribe } = require("../ports/queue");
const logger = require("../helpers/logger");
const { sleep } = require("../helpers/scheduler");

const EVENTS_EXCHANGE = "events";
const EVENTS_QUEUE_PREFIX = "events";

async function fetchEvents({ server, offset, limit = 51 }) {
  try {
    logger.verbose(`[${server}] Fetching events with offset: ${String(offset).padStart(3, "0")}`, {
      server,
      offset,
      limit,
    });
    return albion.getEvents({
      server,
      offset,
      limit,
    });
  } catch (error) {
    logger.warn(`[${server}] Unable to fetch event data from API: ${error.message}. Retrying...`, {
      server,
      error,
    });
    await sleep(5000);
    return fetchEvents({ server, offset, limit });
  }
}

async function fetchEventsTo(latestEventId, { server, offset = 0, silent = false } = {}, events = []) {
  // Maximum offset reached, just return what we have
  if (offset >= 1000) return events;

  try {
    // If not latestEvent, just fetch a single one to create a reference
    if (!latestEventId) {
      return await albion.getEvents({
        server,
        limit: 1,
      });
    }

    if (!silent) {
      logger.verbose(
        `[${server}] silent: ${silent} Fetching events [offset: ${String(offset).padStart(
          3,
          "0",
        )}, latestEventId: ${latestEventId}]`,
        {
          server,
          offset,
          latestEventId,
        },
      );
    }
    const albionEvents = await albion.getEvents({
      server,
      offset,
    });

    const foundLatest = !albionEvents.every((evt) => {
      if (evt.EventId <= latestEventId) return false;
      // Ignore items already on the queue
      if (events.findIndex((e) => e.EventId === evt.EventId) >= 0) return true;
      // Set event server for later
      evt.server = server;
      events.push(evt);
      return true;
    });

    return foundLatest
      ? events.sort((a, b) => a.EventId - b.EventId)
      : fetchEventsTo(latestEventId, { server, offset: offset + albionEvents.length, silent }, events);
  } catch (error) {
    if (!silent) {
      logger.warn(`[${server}] Unable to fetch event data from API: ${error.message}. Retrying...`, {
        server,
        error,
      });
    }
    await sleep(5000);
    return fetchEventsTo(latestEventId, { server, offset, silent }, events);
  }
}

async function publishEvent(event) {
  return await publish(EVENTS_EXCHANGE, event);
}

async function subscribeEvents(callback, { queue_suffix } = {}) {
  const queue = `${EVENTS_QUEUE_PREFIX}-${queue_suffix || crypto.randomUUID()}`;
  return await subscribe(EVENTS_EXCHANGE, queue, callback);
}

async function getEvent(eventId, { server }) {
  return await albion.getEvent(eventId, { server });
}

async function getEventVictimLootValue(event, { server }) {
  return albion.getLootValue(event, { server });
}

module.exports = {
  fetchEvents,
  fetchEventsTo,
  getEvent,
  getEventVictimLootValue,
  publishEvent,
  subscribeEvents,
};
