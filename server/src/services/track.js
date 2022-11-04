const { find, findOne, updateOne } = require("../ports/database");
const { getNumber } = require("../helpers/utils");
const { hasSubscriptionByServerId, getSubscriptionByServerId } = require("./subscriptions");
const { memoize, set, remove } = require("../helpers/cache");

const { MAX_PLAYERS, MAX_GUILDS, MAX_ALLIANCES, SUB_MAX_PLAYERS, SUB_MAX_GUILDS, SUB_MAX_ALLIANCES } = process.env;
const TRACK_COLLECTION = "track";

const DEFAULT_TRACK = Object.freeze({
  players: [],
  guilds: [],
  alliances: [],
});

async function getTrack(serverId) {
  return await memoize(`track-${serverId}`, () => {
    const track = findOne(TRACK_COLLECTION, { server: serverId });
    return Object.assign({}, DEFAULT_TRACK, track);
  });
}

async function setTrack(serverId, track) {
  await updateOne(TRACK_COLLECTION, { server: serverId }, { $set: track }, { upsert: true });
  remove(`track-${serverId}`);
  return await getTrack(serverId);
}

async function getLimits(serverId) {
  let players = getNumber(MAX_PLAYERS, 10);
  let guilds = getNumber(MAX_GUILDS, 1);
  let alliances = getNumber(MAX_ALLIANCES, 1);

  if (await hasSubscriptionByServerId(serverId)) {
    const subscription = await getSubscriptionByServerId(serverId);
    if (subscription.limits) {
      players = getNumber(subscription.limits.players, players);
      guilds = getNumber(subscription.limits.guilds, guilds);
      alliances = getNumber(subscription.limits.alliances, alliances);
    } else {
      players = getNumber(SUB_MAX_PLAYERS, players);
      guilds = getNumber(SUB_MAX_GUILDS, guilds);
      alliances = getNumber(SUB_MAX_ALLIANCES, alliances);
    }
  }

  return {
    players,
    guilds,
    alliances,
  };
}

async function updateTrackCache() {
  const tracks = await find(TRACK_COLLECTION, {});
  tracks.forEach((track) => {
    if (!track.server) return;

    const serverId = track.server;
    set(`settings-${serverId}`, track);
  });
}

module.exports = {
  getLimits,
  getTrack,
  setTrack,
  updateTrackCache,
};
