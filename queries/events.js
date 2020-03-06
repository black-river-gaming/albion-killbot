const axios = require("axios");

const EVENTS_ENDPOINT =
  "https://gameinfo.albiononline.com/api/gameinfo/events?limit=51&offset=0";

// TODO: Persist this
let lastEventId = null;

function getNewEvents(events, playerIds, guildIds, allianceIds) {
  const newEvents = [];
  let scanned = 0;
  events.every(event => {
    if (event.EventId <= lastEventId) {
      return false;
    }
    // Ignore Arena kills or Duel kills
    if (event.TotalVictimKillFame <= 0) {
      return true;
    }
    scanned++;

    // Check for kill in event.Killer / event.Victim for anything tracked
    // Since we are parsing from newer to older events
    // we need to use FILO array
    if (
      allianceIds.indexOf(event.Killer.AllianceId) >= 0 ||
      allianceIds.indexOf(event.Victim.AllianceId) >= 0 ||
      guildIds.indexOf(event.Killer.GuildId) >= 0 ||
      guildIds.indexOf(event.Victim.GuildId) >= 0 ||
      playerIds.indexOf(event.Killer.Id) >= 0 ||
      playerIds.indexOf(event.Victim.Id) >= 0
    ) {
      newEvents.unshift(event);
    }

    return true;
  });
  console.log(
    `Events scanned: ${scanned} events. New events: ${newEvents.length}`
  );

  // Sometimes the API return old values, se we just want increasing values
  if (events.length > 0 && events[0].EventId > lastEventId) {
    lastEventId = events[0].EventId;
  }

  return newEvents;
}

exports.getEvents = async (playerIds = [], guildIds = [], allianceIds = []) => {
  console.log("Fetching Albion Online events...");
  try {
    const res = await axios.get(EVENTS_ENDPOINT);
    return getNewEvents(res.data, playerIds, guildIds, allianceIds);
  } catch (err) {
    console.error(`Unable to fetch data from API: ${err}`);
    return [];
  }
};
