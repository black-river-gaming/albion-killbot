const axios = require("axios");

const EVENTS_ENDPOINT =
  "https://gameinfo.albiononline.com/api/gameinfo/events?limit=51&offset=0";

let lastEventId = null;
function parse(events, callback) {
  console.log(`Parsing ${events.length} events`);
  const newsEvents = [];
  events.every(event => {
    if (event.EventId === lastEventId) return false;
    // Ignore Arena kills or Duel kills
    if (event.TotalVictimKillFame <= 0) {
      return true;
    }

    // TODO: Feature to check for tracked players / guilds / alliances
    // Check for kill in event.Killer / event.Victim
    if (
      event.Killer.GuildName === "Black River" ||
      event.Victim.GuildName === "Black River"
    ) {
      // Since we are parsing from newer to older events
      // we need to use FILO array
      newsEvents.unshift(event);
    }

    return true;
  });

  if (events.length > 0) {
    lastEventId = events[0].EventId;
  }

  if (newsEvents.length > 0) {
    callback(newsEvents);
  }
}

exports.fetch = async callback => {
  console.log("Fetching Albion Online events...");
  try {
    const res = await axios.get(EVENTS_ENDPOINT);
    parse(res.data, callback);
  } catch (err) {
    console.error(`Unable to fetch data from API: ${err}`);
  }
};
