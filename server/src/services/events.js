const config = require("config");
const crypto = require("crypto");
const albion = require("../ports/albion");
const { publish, subscribe } = require("../ports/queue");
const logger = require("../helpers/logger");
const { sleep } = require("../helpers/scheduler");

const EVENTS_EXCHANGE = "events";
const EVENTS_QUEUE_PREFIX = "events";

async function fetchEvents({ server, offset, limit = 51 }) {
  try {
    logger.verbose(`[${server.name}] Fetching events with offset: ${String(offset).padStart(3, "0")}`, {
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
    logger.warn(`[${server.name}] Unable to fetch event data from API: ${error.message}. Retrying...`, {
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
    if (!silent) {
      logger.verbose(
        `[${server.name}] Fetching events [offset: ${String(offset).padStart(
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
      if (!latestEventId) latestEventId = evt.EventId - 1;
      if (evt.EventId <= latestEventId) return false;
      // Ignore items already on the queue
      if (events.findIndex((e) => e.EventId === evt.EventId) >= 0) return true;
      // Set event server for later
      evt.server = server.id;
      events.push(evt);
      return true;
    });

    // Prefetch lootValue if it's a juicy kill
    for (const evt of events) {
      if (config.get("features.juicy.enabled") && evt.TotalVictimKillFame > config.get("features.juicy.minFame")) {
        evt.lootValue = await getEventVictimLootValue(evt, { server });
        if (evt.lootValue) {
          const lootSum = evt.lootValue.equipment + evt.lootValue.inventory;
          if (lootSum >= config.get("features.juicy.goodLootValue")) evt.juicy = "good";
          if (lootSum >= config.get("features.juicy.insaneLootValue")) evt.juicy = "insane";
        }
      }
    }

    return foundLatest
      ? events
      : fetchEventsTo(latestEventId, { server, offset: offset + albionEvents.length, silent }, events);
  } catch (error) {
    if (!silent) {
      logger.warn(`[${server.name}] Unable to fetch event data from API: ${error.message}. Retrying...`, {
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
