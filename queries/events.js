const axios = require("axios");

const EVENTS_ENDPOINT =
  "https://gameinfo.albiononline.com/api/gameinfo/events?limit=50&offset=0";

let lastEventId = null;

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
    return;
  }

  const playerIds = trackedPlayers.map(t => t.id);
  const guildIds = trackedGuilds.map(t => t.id);
  const allianceIds = trackedAlliances.map(t => t.id);

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
      // We need to create a new object here for every guild
      newEvents.unshift(Object.assign({}, event, { good: goodEvent }));
    }

    return true;
  });

  return newEvents;
}

exports.getEvents = async allConfigs => {
  console.log("Fetching Albion Online events...");
  const eventsByGuild = {};
  try {
    const res = await axios.get(EVENTS_ENDPOINT);
    // We only want unread events
    const events = res.data.filter(ev => ev.EventId > lastEventId);
    // Currently there is a bug in Albion API that sometimes brings past events instead of new ones
    // So we are ignoring requests from the "past" for now
    if (events.length === 0) {
      return {
        eventsByGuild: {},
        rate: 999
      };
    }

    for (let key of Object.keys(allConfigs)) {
      const config = allConfigs[key];
      if (!config) continue;
      eventsByGuild[key] = getNewEvents(
        events,
        config.trackedPlayers,
        config.trackedGuilds,
        config.trackedAlliances
      );
    }

    // Sometimes the API return old values, se we just want increasing values
    if (events.length > 0 && events[0].EventId > lastEventId) {
      lastEventId = events[0].EventId;
    }

    return {
      eventsByGuild,
      rate: Math.round((events.length / 50) * 100)
    };
  } catch (err) {
    console.error(`Unable to fetch data from API: ${err}`);
    return {
      eventsByGuild: {},
      rate: 0
    };
  }
};
