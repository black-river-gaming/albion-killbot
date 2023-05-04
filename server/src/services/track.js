const { find, findOne, updateOne } = require("../ports/database");

const { isTrackEntity } = require("../helpers/albion");
const { memoize, set, remove } = require("../helpers/cache");
const logger = require("../helpers/logger");
const { clone } = require("../helpers/utils");

const TRACK_COLLECTION = "track";

const TRACK_TYPE = {
  PLAYERS: "players",
  GUILDS: "guilds",
  ALLIANCES: "alliances",
};

const DEFAULT_TRACK = Object.freeze({
  [TRACK_TYPE.PLAYERS]: [],
  [TRACK_TYPE.GUILDS]: [],
  [TRACK_TYPE.ALLIANCES]: [],
});

const generateTrack = (track) => Object.assign(clone(DEFAULT_TRACK), track);

async function setTrack(serverId, data) {
  // TODO: Schema validation
  const { players, guilds, alliances } = data;

  await updateOne(
    TRACK_COLLECTION,
    { server: serverId },
    { $set: { server: serverId, players, guilds, alliances } },
    { upsert: true },
  );
  remove(`track-${serverId}`);
  return await getTrack(serverId);
}

async function addTrack(serverId, type, item) {
  if (!Object.values(TRACK_TYPE).indexOf(type) < 0) throw new Error("Invalid track type.");
  if (!isTrackEntity(item)) throw new Error("Not a valid track entity");

  const track = await getTrack(serverId);
  track[type].push(item);
  logger.info(`Added tracked ${type} for server ${serverId}: ${item.name}`, {
    serverId,
    track,
    type,
    item,
  });

  return await setTrack(serverId, track);
}

async function removeTrack(serverId, type, item) {
  if (!Object.values(TRACK_TYPE).indexOf(type) < 0) throw new Error("Invalid track type.");
  if (!isTrackEntity(item)) throw new Error("Not a valid track entity");

  const track = await getTrack(serverId);
  track[type] = track[type].filter((trackItem) => trackItem.id != item.id);
  logger.info(`Removed tracked ${type} for server ${serverId}: ${item.name}`, {
    serverId,
    track,
    type,
    item,
  });

  return await setTrack(serverId, track);
}

async function fetchTracks(query = {}) {
  return find(TRACK_COLLECTION, query);
}

async function getTrack(serverId) {
  return await memoize(`track-${serverId}`, async () => {
    const track = await findOne(TRACK_COLLECTION, { server: serverId });
    return generateTrack(track);
  });
}

async function updateTrackCache(serverIds, { timeout, debug } = {}) {
  const tracks = await find(TRACK_COLLECTION, {});

  serverIds.forEach((serverId) => {
    const track = tracks.find((track) => track.server === serverId);
    set(`track-${serverId}`, generateTrack(track), { timeout, debug });
  });
}

module.exports = {
  TRACK_TYPE,
  addTrack,
  fetchTracks,
  getTrack,
  removeTrack,
  setTrack,
  updateTrackCache,
};
