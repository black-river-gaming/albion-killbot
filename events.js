const axios = require("axios");

const EVENTS_ENDPOINT =
    "https://gameinfo.albiononline.com/api/gameinfo/events?limit=51&offset=0";

let lastEventId = null;
function parse(events, callback) {
    const newEvents = [];
    let scanned = 0;
    events.every(event => {
        if (event.EventId === lastEventId) {
            return false;
        }
        // Ignore Arena kills or Duel kills
        if (event.TotalVictimKillFame <= 0) {
            return true;
        }
        scanned++;

        // TODO: Feature to check for tracked players / guilds / alliances
        // Check for kill in event.Killer / event.Victim
        if (
            event.Killer.GuildName === "Black River" ||
            event.Victim.GuildName === "Black River"
        ) {
            // Since we are parsing from newer to older events
            // we need to use FILO array
            newEvents.unshift(event);
        }

        return true;
    });
    console.log(`Events scanned: ${scanned} events.`);

    if (events.length > 0) {
        lastEventId = events[0].EventId;
    }

    if (newEvents.length > 0) {
        console.log(`New events: ${newEvents.length}.`);
        callback(newEvents);
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
