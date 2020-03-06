const axios = require("axios");

const EVENTS_ENDPOINT =
    "https://gameinfo.albiononline.com/api/gameinfo/events?limit=51&offset=0";

// TODO: Persist this
let lastEventId = null;

function getNewEvents(events) {
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
    console.log(
        `Events scanned: ${scanned} events. New events: ${newEvents.length}`
    );

    if (events.length > 0) {
        lastEventId = events[0].EventId;
    }

    return newEvents;
}

exports.getEvents = async () => {
    console.log("Fetching Albion Online events...");
    try {
        const res = await axios.get(EVENTS_ENDPOINT);
        return getNewEvents(res.data);
    } catch (err) {
        console.error(`Unable to fetch data from API: ${err}`);
        return [];
    }
};
