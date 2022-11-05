const { find, findOne, updateOne } = require("../ports/database");
const { memoize, set, remove } = require("../helpers/cache");

const TRACK_COLLECTION = "track";

const DEFAULT_TRACK = Object.freeze({
  players: [],
  guilds: [],
  alliances: [],
});

async function getTrack(serverId) {
  return await memoize(`track-${serverId}`, async () => {
    const track = await findOne(TRACK_COLLECTION, { server: serverId });
    return Object.assign({}, DEFAULT_TRACK, track);
  });
}

async function setTrack(serverId, track) {
  await updateOne(TRACK_COLLECTION, { server: serverId }, { $set: track }, { upsert: true });
  remove(`track-${serverId}`);
  return await getTrack(serverId);
}

async function updateTrackCache(timeout) {
  const tracks = await find(TRACK_COLLECTION, {});
  tracks.forEach((track) => {
    if (!track.server) return;

    const serverId = track.server;
    set(`track-${serverId}`, track, { timeout });
  });
}

module.exports = {
  getTrack,
  setTrack,
  updateTrackCache,
};
