const axios = require("axios");

const EVENTS_ENDPOINT =
  "https://gameinfo.albiononline.com/api/gameinfo/events?limit=51&offset=0";

let lastEventId = null;

function getNewEvents(events, playerIds = [], guildIds = [], allianceIds = []) {
  const newEvents = [];
  events.every(event => {
    if (event.EventId <= lastEventId) {
      return false;
    }
    // Ignore Arena kills or Duel kills
    if (event.TotalVictimKillFame <= 0) {
      return true;
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
      event.good = goodEvent;
      newEvents.unshift(event);
    }

    return true;
  });

  return newEvents;
}

exports.getEvents = async serverConfig => {
  console.log("Fetching Albion Online events...");
  const newEvents = {};
  try {
    const res = await axios.get(EVENTS_ENDPOINT);
    const events = res.data;

    for (let key of Object.keys(serverConfig)) {
      const config = serverConfig[key];
      newEvents[key] = getNewEvents(
        events,
        config.playerIds,
        config.guildIds,
        config.allianceIds
      );
    }

    // Sometimes the API return old values, se we just want increasing values
    if (events.length > 0 && events[0].EventId > lastEventId) {
      lastEventId = events[0].EventId;
    }

    return newEvents;
  } catch (err) {
    console.error(`Unable to fetch data from API: ${err}`);
    return [];
  }
};
