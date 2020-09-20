const axios = require("axios");
const moment = require("moment");
const logger = require("../logger")("queries.events");
const database = require("../database");
const { sleep, timeout } = require("../utils");
const { getConfigByGuild } = require("../config");
const { embedEvent, embedEventAsImage, embedInventoryAsImage } = require("../messages");
const dailyRanking = require("./dailyRanking");

const EVENTS_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/events";
const EVENTS_LIMIT = 51;
const EVENTS_COLLECTION = "events";
const EVENT_KEEP_HOURS = 2;
const NOTIFY_JOBS = Number(process.env.NOTIFY_JOBS) || 4;

function getNewEvents(events, trackedPlayers = [], trackedGuilds = [], trackedAlliances = []) {
  if (trackedPlayers.length === 0 && trackedGuilds.length === 0 && trackedAlliances.length === 0) {
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

exports.get = async () => {
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
      const res = await axios.get(EVENTS_ENDPOINT, {
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
      return foundLatest ? events : fetchEventsTo(latestEvent, offset + EVENTS_LIMIT, events);
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
    logger.info(`[getEvents] Fetching Albion Online events from API up to event ${latestEvent.EventId}.`);
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
  logger.debug(`[getEvents] Performing ${ops.length} write operations in database.`);
  const writeResult = await collection.bulkWrite(ops, { ordered: false });

  // Find latest read event
  let latestReadEvent = await collection
    .find({ read: true })
    .sort({ EventId: -1 })
    .limit(1)
    .next();
  logger.debug("[getEvents] Deleting old events from database.");
  let deleteResult;
  if (latestReadEvent) {
    // Delete older events to free cache space if there are read events
    deleteResult = await collection.deleteMany({
      EventId: {
        $lt: latestReadEvent.EventId,
      },
    });
  } else {
    // Or by time, so we don't overflow our collection either
    deleteResult = await collection.deleteMany({
      TimeStamp: {
        $lte: moment()
          .subtract(EVENT_KEEP_HOURS, "hours")
          .toISOString(),
      },
    });
  }

  logger.info(
    `[getEvents] Fetch success. (New events inserted: ${writeResult.upsertedCount}, old events removed: ${deleteResult.deletedCount}).`,
  );
};

exports.getEventsByGuild = async guildConfigs => {
  const collection = database.collection(EVENTS_COLLECTION);
  if (!collection) {
    logger.warn("Not connected to database. Skipping notify events.");
    return null;
  }

  // Get unread events
  const events = await collection
    .find({ read: false })
    .sort({ EventId: 1 })
    .limit(1000)
    .toArray();
  if (events.length === 0) {
    return null;
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
  logger.info(`Notify success. (Events read: ${writeResult.modifiedCount}).`);

  const eventsByGuild = {};
  for (let guild of Object.keys(guildConfigs)) {
    const config = guildConfigs[guild];
    if (!config) {
      continue;
    }
    const guildEvents = getNewEvents(events, config.trackedPlayers, config.trackedGuilds, config.trackedAlliances);
    if (guildEvents.length > 0) {
      eventsByGuild[guild] = guildEvents;
    }
  }

  return eventsByGuild;
};

exports.scan = async ({ client, sendGuildMessage }) => {
  logger.info("Notifying new events to all Discord Servers.");
  const allGuildConfigs = await getConfigByGuild(client.guilds.array());
  const eventsByGuild = await exports.getEventsByGuild(allGuildConfigs);
  if (!eventsByGuild) return logger.debug("No new events to notify.");

  const notifiedGuildIds = Object.keys(eventsByGuild);
  await Promise.all(
    Array(Math.min(notifiedGuildIds.length, NOTIFY_JOBS))
      .fill()
      .map(async (_, i) => {
        let stage = "starting";
        const startTime = moment();
        const timeoutIntervalId = setInterval(() => {
          if (notifiedGuildIds.length == 0) {
            const runTime = moment().diff(startTime, "seconds");
            logger.warn(`[Job #${i}] is taking too long to finish (Run time: ${runTime}s / Stage: ${stage})`);
          }
        }, 30000);

        while (notifiedGuildIds.length > 0) {
          const guild = client.guilds.get(notifiedGuildIds.pop());
          guild.config = allGuildConfigs[guild.id];
          if (!guild.config || !eventsByGuild[guild.id]) continue;
          const newEventsCount = eventsByGuild[guild.id].length;
          stage = `Getting events for guild ${guild.name}`;
          if (newEventsCount > 0) {
            logger.info(
              `[Job #${i}] Sending ${newEventsCount} new events to guild "${guild.name}". ${notifiedGuildIds.length} guilds remaining.`,
            );
          } else continue;

          for (let event of eventsByGuild[guild.id]) {
            dailyRanking.add(guild, event, allGuildConfigs[guild.id]);
            const mode = guild.config.mode;
            const hasInventory = event.Victim.Inventory.filter(i => i != null).length > 0;

            try {
              if (mode === "image") {
              // Image output
                stage = "Generating Kill Image";
                const killImage = await embedEventAsImage(event, guild.config.lang);
                stage = "Sending Kill Image";
                await timeout(sendGuildMessage(guild, killImage, "events"), 10000);
                if (hasInventory) {
                  stage = "Generating Inventory Image";
                  const inventoryImage = await embedInventoryAsImage(event, guild.config.lang);
                  stage = "Sending Inventory Image";
                  await timeout(sendGuildMessage(guild, inventoryImage, "events"), 10000);
                }
              } else {
              // Text output (default)
                stage = "Send Kill Text";
                await timeout(sendGuildMessage(guild, embedEvent(event, guild.config.lang), "events"), 5000);
              }
            } catch(e) {
              logger.error(`[Job #${i}] Error while sending event ${event.EventId} [${e}]`);
            }
          }
        }
        clearInterval(timeoutIntervalId);
        logger.debug(`Job #${i} finished.`);
      }),
  );
  logger.info("All jobs finished for Scan Events.");
};
