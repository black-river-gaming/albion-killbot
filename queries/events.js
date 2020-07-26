const axios = require("axios");
const moment = require("moment");
const logger = require("../logger")("queries.events");
const database = require("../database");
const { sleep } = require("../utils");

const EVENTS_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/events";
const EVENTS_LIMIT = 51;
const EVENTS_COLLECTION = "events";
const EVENT_KEEP_HOURS = 2;

function getNewEvents(
  events,
  trackedPlayers = [],
  trackedGuilds = [],
  trackedAlliances = [],
) {
  if (
    trackedPlayers.length === 0 &&
    trackedGuilds.length === 0 &&
    trackedAlliances.length === 0
  ) {
    return [];
  }

  const playerIds = trackedPlayers.map(t => t.id);
  const guildIds = trackedGuilds.map(t => t.id);
  const allianceIds = trackedAlliances.map(t => t.id);

  const newEvents = [];
  events.forEach(event => {
    // Ignore Arena kills or Duel kills
    if (event.TotalVictimKillFame <= 0) {
      return;
    }

    // Check for kill in event.Killer / event.Victim for anything tracked
    // Since we are parsing from newer to older events
    // we need to use FILO array
    const goodEvent =
      allianceIds.indexOf(event.Killer.AllianceId) >= 0 ||
      guildIds.indexOf(event.Killer.GuildId) >= 0 ||
      playerIds.indexOf(event.Killer.Id) >= 0;
    const badEvent =
      allianceIds.indexOf(event.Victim.AllianceId) >= 0 ||
      guildIds.indexOf(event.Victim.GuildId) >= 0 ||
      playerIds.indexOf(event.Victim.Id) >= 0;
    if (goodEvent || badEvent) {
      // We need to create a new object here for every guild
      newEvents.unshift(Object.assign({}, event, { good: goodEvent }));
    }
  });
  return newEvents;
}

exports.getEvents = async () => {
  const collection = database.collection(EVENTS_COLLECTION);
  if (!collection) {
    return logger.warn("Not connected to database. Skipping get events.");
  }

  // Find latest event
  let latestEvent = await collection
    .find({})
    .sort({ EventId: -1 })
    .limit(1)
    .next();

  const fetchEventsTo = async (latestEvent, offset = 0, events = []) => {
    // Maximum offset reached, just return what we have
    if (offset >= 1000) return events;

    try {
      logger.debug(`[getEvents] Fetching events with offset: ${offset}`);
      // Manual timeout is necessary because network timeout isn't triggered by axios
      const source = axios.CancelToken.source();
      setTimeout(() => {
        source.cancel();
      }, 60000);
      const res = await axios.get(EVENTS_ENDPOINT, {
        cancelToken: source.token,
        params: {
          offset,
          limit: EVENTS_LIMIT,
          timestamp: moment().unix(),
        },
        timeout: 60000,
      });
      const foundLatest = !res.data.every(evt => {
        if (evt.EventId <= latestEvent.EventId) return false;
        events.push(evt);
        return true;
      });
      return foundLatest
        ? events
        : fetchEventsTo(latestEvent, offset + EVENTS_LIMIT, events);
    } catch (err) {
      logger.error(`[getEvents] Unable to fetch event data from API [${err}].`);
      await sleep(5000);
      return fetchEventsTo(latestEvent, offset, events);
    }
  };

  if (!latestEvent) {
    logger.info("[getEvents] No latest event found. Retrieving first events.");
    latestEvent = { EventId: 0 };
  } else {
    logger.info(
      `[getEvents] Fetching Albion Online events from API up to event ${latestEvent.EventId}.`,
    );
  }
  const events = await fetchEventsTo(latestEvent);
  if (events.length === 0) return logger.debug("[getEvents] No new events.");

  // Insert events that aren't in the database yet
  let ops = [];
  events.forEach(async evt => {
    ops.push({
      updateOne: {
        filter: { EventId: evt.EventId },
        update: {
          $setOnInsert: { ...evt, read: false },
        },
        upsert: true,
        writeConcern: {
          wtimeout: 60000,
        },
      },
    });
  });
  logger.debug(
    `[getEvents] Performing ${ops.length} write operations in database.`,
  );
  const writeResult = await collection.bulkWrite(ops, { ordered: false });

  // Delete older events to free cache space
  logger.debug("[getEvents] Deleting old events from database.");
  const deleteResult = await collection.deleteMany({
    TimeStamp: {
      $lte: moment()
        .subtract(EVENT_KEEP_HOURS, "hours")
        .toISOString(),
    },
  });

  logger.info(
    `[getEvents] Fetch success. (New events inserted: ${writeResult.upsertedCount}, old events removed: ${deleteResult.deletedCount}).`,
  );
};

exports.getEventsByGuild = async guildConfigs => {
  const collection = database.collection(EVENTS_COLLECTION);
  if (!collection) {
    return logger.warn(
      "[scanEvents] Not connected to database. Skipping notify events.",
    );
  }

  // Get unread events
  const events = await collection
    .find({ read: false })
    .sort({ EventId: 1 })
    .limit(1000)
    .toArray();
  if (events.length === 0) {
    return logger.debug("[scanEvents] No new events to notify.");
  }

  // Set events as read before sending to ensure no double events notification
  let ops = [];
  events.forEach(async evt => {
    ops.push({
      updateOne: {
        filter: { EventId: evt.EventId },
        update: {
          $set: { read: true },
        },
      },
    });
  });
  const writeResult = await collection.bulkWrite(ops, { ordered: false });
  logger.info(
    `[scanEvents] Notify success. (Events read: ${writeResult.modifiedCount}).`,
  );

  const eventsByGuild = {};
  for (let guild of Object.keys(guildConfigs)) {
    const config = guildConfigs[guild];
    if (!config) {
      continue;
    }
    eventsByGuild[guild] = getNewEvents(
      events,
      config.trackedPlayers,
      config.trackedGuilds,
      config.trackedAlliances,
    );
  }

  return eventsByGuild;
};
