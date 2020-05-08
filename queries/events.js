const axios = require("axios");
const moment = require("moment");
const logger = require("../logger");
const database = require("../database");

const EVENTS_ENDPOINT =
  "https://gameinfo.albiononline.com/api/gameinfo/events?limit=51&offset=0";
const EVENTS_COLLECTION = "events";
const EVENT_KEEP_HOURS = 2;

function getNewEvents(
  events,
  trackedPlayers = [],
  trackedGuilds = [],
  trackedAlliances = []
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
    if (event.TotalVictimKillFame <= 0) { return; }

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
  logger.info("Fetching Albion Online events from API.");

  let events;
  try {
    const res = await axios.get(EVENTS_ENDPOINT);
    events = res.data;
  } catch (err) {
    return logger.error(`Unable to fetch event data from API [${err}]`);
  }

  // Insert events that aren't in the database yet
  let ops = [];
  events.forEach(async evt => {
    ops.push({
      updateOne: {
        filter: { EventId: evt.EventId },
        update: {
          $setOnInsert: { ...evt, read: false },
        },
        upsert: true
      }
    });
  });
  const writeResult = await collection.bulkWrite(ops, { ordered: false });

  // Delete older events to free cache space
  const deleteResult = await collection.deleteMany({ TimeStamp: { $lte: moment().subtract(EVENT_KEEP_HOURS, "hours").toISOString() }});
  logger.info(`Fetch success. (New events inserted: ${writeResult.upsertedCount}, old events removed: ${deleteResult.deletedCount}).`);
};

exports.getEventsByGuild = async guildConfigs => {
  const collection = database.collection(EVENTS_COLLECTION);
  if (!collection) {
    return logger.warn("Not connected to database. Skipping notify events.");
  }

  // Get unread events
  const events = await (collection.find({ read: false }).toArray());
  if (events.length === 0) {
    return logger.debug("No new events to notify.");
  }

  // Set events as read before sending to ensure no double events notification
  const updateResult = await collection.updateMany({ EventId: {
    $in: events.map(evt => evt.EventId)
  }}, {
    $set: { read: true }
  });
  logger.info(`Notify success. (Events read: ${updateResult.modifiedCount}).`);

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
      config.trackedAlliances
    );
  }

  return eventsByGuild;
};
