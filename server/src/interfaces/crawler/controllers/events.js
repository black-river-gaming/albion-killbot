const config = require("config");

const { SECOND, SERVERS, MINUTE } = require("../../../helpers/constants");
const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/scheduler");

const eventsService = require("../../../services/events");
const { addRankingEvent } = require("../../../services/rankings");
const { transformEvent } = require("../../../helpers/albion");

const serverData = {
  [SERVERS.WEST]: {
    latestEventId: null,
    publishedEventIds: [],
  },
  [SERVERS.EAST]: {
    latestEventId: null,
    publishedEventIds: [],
  },
};

async function fetchEvents(server) {
  const { latestEventId, publishedEventIds } = serverData[server];

  if (!latestEventId) {
    logger.info(`[${server}] Retrieving first batch of events.`, { server });
  } else {
    logger.info(`[${server}] Fetching Albion Online events from API up to event ${latestEventId}.`, {
      server,
      latestEventId,
    });
  }

  const events = await eventsService.fetchEventsTo(latestEventId, { server });
  if (events.length === 0) return logger.verbose(`[${server}] No new events.`, { server });

  const eventsToPublish = [];
  for (const evt of events) {
    if (latestEventId && evt.EventId <= latestEventId) {
      logger.warn(`[${server}] The published id is lower than latestEvent! Skipping.`, {
        eventId: evt.EventId,
        latestEventId,
        server,
      });
      continue;
    }

    if (!config.get("amqp.events.batch")) await eventsService.publishEvent(evt);

    addRankingEvent(evt);
    eventsToPublish.push(evt);
    publishedEventIds.push(evt.EventId);
    serverData[server].latestEventId = evt.EventId;
  }

  if (eventsToPublish.length > 0) {
    if (config.get("amqp.events.batch")) await eventsService.publishEvent(eventsToPublish);

    logger.verbose(`[${server}] Published ${eventsToPublish.length} events.`, {
      server,
      eventIds: eventsToPublish.map((event) => event.EventId),
    });
  }
}

const fetchEventsDelayed = async (server) => {
  const { publishedEventIds } = serverData[server];

  // Don't to that until we have published a minimum amount of events
  if (publishedEventIds.length < 1000) return;
  // If we have too much published events, trim them a little bit
  if (publishedEventIds.length > 5000) publishedEventIds.splice(0, 1000);

  const eventsToPublish = [];
  const events = await eventsService.fetchEventsTo(1, { server, silent: true });

  for (const evt of events) {
    if (!publishedEventIds.includes(evt.EventId)) {
      logger.debug(`[${server}] Event ${evt.EventId} was not published in the normal crawl function!`, {
        server,
        event: transformEvent(evt),
      });

      if (!config.get("amqp.events.batch")) await eventsService.publishEvent(evt);

      addRankingEvent(evt);
      eventsToPublish.push(evt);
      publishedEventIds.push(evt.EventId);
    }
  }

  if (eventsToPublish.length > 0) {
    if (config.get("amqp.events.batch")) await eventsService.publishEvent(eventsToPublish);

    logger.warn(`[${server}] Published ${eventsToPublish.length} delayed events.`, {
      server,
      eventIds: eventsToPublish.map((event) => event.EventId),
    });
  }
};

const init = async () => {
  if (config.get("crawler.events.west")) {
    runInterval("Fetch events for west server", fetchEvents, {
      interval: 30 * SECOND,
      runOnStart: true,
      fnOpts: [SERVERS.WEST],
    });
    runInterval("Check missed events for west server", fetchEventsDelayed, {
      interval: 5 * MINUTE,
      fnOpts: [SERVERS.WEST],
    });
  }
  if (config.get("crawler.events.east")) {
    runInterval("Fetch events for east server", fetchEvents, {
      interval: 30 * SECOND,
      runOnStart: true,
      fnOpts: [SERVERS.EAST],
    });
    runInterval("Check missed events for east server", fetchEventsDelayed, {
      interval: 5 * MINUTE,
      fnOpts: [SERVERS.EAST],
    });
  }
};

module.exports = {
  name: "events",
  init,
};
