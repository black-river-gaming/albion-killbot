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

async function removeTrack(serverId, trackType, trackEntity) {
  if (!Object.values(TRACK_TYPE).indexOf(trackType) < 0) throw new Error("Invalid track type.");
  if (!isTrackEntity(trackEntity)) throw new Error("Not a valid track entity");

  const track = await getTrack(serverId);
  track[trackType] = track[trackType].filter((te) => te.id != trackEntity.id);
  logger.info(`Removed tracked ${trackType} for server ${serverId}: ${trackEntity.name}`, {
    metadata: {
      DEFAULT_TRACK,
      serverId,
      track,
      trackType,
      trackEntity,
    },
  });
  return await setTrack(serverId, track);
}

async function getTrack(serverId) {
  return await memoize(`track-${serverId}`, async () => {
    const track = await findOne(TRACK_COLLECTION, { server: serverId });
    return Object.assign(clone(DEFAULT_TRACK), track);
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
  TRACK_TYPE,
  addTrack,
  getTrack,
  removeTrack,
  setTrack,
  updateTrackCache,
};
