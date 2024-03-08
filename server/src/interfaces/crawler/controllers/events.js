const config = require("config");

const { SECOND, MINUTE } = require("../../../helpers/constants");
const logger = require("../../../helpers/logger");
const { runInterval } = require("../../../helpers/scheduler");

const eventsService = require("../../../services/events");
const { addRankingEvent } = require("../../../services/rankings");
const { transformEvent, SERVER_LIST } = require("../../../helpers/albion");

const serverData = {};
for (const server of SERVER_LIST) {
  serverData[server.id] = {
    latestEventId: null,
    publishedEventIds: [],
  };
}

async function fetchEvents(server) {
  const { latestEventId, publishedEventIds } = serverData[server.id];

  if (!latestEventId) {
    logger.info(`[${server.name}] Retrieving first batch of events.`, { server });
  } else {
    logger.info(`[${server.name}] Fetching Albion Online events from API up to event ${latestEventId}.`, {
      server,
      latestEventId,
    });
  }

  const events = await eventsService.fetchEventsTo(latestEventId, { server });
  if (events.length === 0) return logger.verbose(`[${server.name}] No new events.`, { server });

  const eventsToPublish = [];
  for (const evt of events.sort((a, b) => a.EventId - b.EventId)) {
    if (latestEventId && evt.EventId <= latestEventId) {
      logger.warn(`[${server.name}] The published id is lower than latestEvent! Skipping.`, {
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
    serverData[server.id].latestEventId = evt.EventId;
  }

  if (eventsToPublish.length > 0) {
    if (config.get("amqp.events.batch")) await eventsService.publishEvent(eventsToPublish);

    logger.verbose(`[${server.name}] Published ${eventsToPublish.length} events.`, {
      server,
      length: eventsToPublish.length,
      eventIds: eventsToPublish.map((event) => event.EventId),
    });
  }
}

const fetchEventsDelayed = async (server) => {
  const { publishedEventIds } = serverData[server.id];

  // Don't to that until we have published a minimum amount of events
  if (publishedEventIds.length < 1000) return;
  // If we have too much published events, trim them a little bit
  if (publishedEventIds.length > 5000) publishedEventIds.splice(0, 1000);

  const eventsToPublish = [];
  // Start with offset to prevent this from overriding real-time crawling
  const events = await eventsService.fetchEventsTo(1, { server, offset: 102, silent: true });

  for (const evt of events.sort((a, b) => a.EventId - b.EventId)) {
    if (!publishedEventIds.includes(evt.EventId)) {
      logger.debug(`[${server.name}] Event ${evt.EventId} was not published in the normal crawl function!`, {
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

    logger.warn(`[${server.name}] Published ${eventsToPublish.length} delayed events.`, {
      server,
      eventIds: eventsToPublish.map((event) => event.EventId),
    });
  }
};

const init = async () => {
  for (const server of SERVER_LIST) {
    const configKey = `crawler.events.${server.id}`;
    if (config.has(configKey) && config.get(configKey)) {
      runInterval(`[${server.name}] Fetch events`, fetchEvents, {
        interval: 30 * SECOND,
        runOnStart: true,
        fnOpts: [server],
      });
      runInterval(`[${server.name}] Fetch delayed events`, fetchEventsDelayed, {
        interval: 5 * MINUTE,
        fnOpts: [server],
      });
    }
  }
};

module.exports = {
  name: "events",
  init,
};
