const config = require("config");

const { SECOND, SERVERS } = require("../../../helpers/constants");
const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/scheduler");

const { fetchEventsTo, publishEvent } = require("../../../services/events");
const { addRankingEvent } = require("../../../services/rankings");

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
  logger.verbose(`[${server}] Publishing ${events.length} new events to exchange...`, {
    length: events.length,
    eventIds: events.map((event) => event.EventId),
  });
  for (const evt of events) {
    if (latestEvent[server] && evt.EventId <= latestEvent[server].EventId) {
      logger.warn(`[${server}] The published id is lower than latestEvent! Skipping.`, {
        latestEventId: latestEvent[server].EventId,
        eventId: evt.EventId,
        server,
      });
      continue;
    }

    if (!config.get("amqp.events.batch")) {
      logger.debug(`[${server}] Publishing event ${evt.EventId}`);
      await publishEvent(evt);
    } else {
      eventsToPublish.push(evt);
    }

    addRankingEvent(evt);
    latestEvent[server] = evt;
  }

  if (config.get("amqp.events.batch")) {
    await publishEvent(eventsToPublish);
  }

  logger.info(`[${server}] Publish events complete.`);
}

const init = async () => {
  if (config.get("crawler.events.west")) {
    runInterval("Fetch events for west server", fetchEvents, {
      interval: 30 * SECOND,
      runOnStart: true,
      fnOpts: [SERVERS.WEST],
    });
  }
  if (config.get("crawler.events.east")) {
    runInterval("Fetch events for east server", fetchEvents, {
      interval: 30 * SECOND,
      runOnStart: true,
      fnOpts: [SERVERS.EAST],
    });
  }
};

module.exports = {
  name: "events",
  init,
};
