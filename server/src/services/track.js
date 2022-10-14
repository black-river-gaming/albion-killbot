const { find, findOne, updateOne } = require("../ports/database");
const { getNumber } = require("../helpers/utils");
const { hasSubscriptionByServerId } = require("./subscriptions");

const { MAX_PLAYERS, MAX_GUILDS, MAX_ALLIANCES, SUB_MAX_PLAYERS, SUB_MAX_GUILDS, SUB_MAX_ALLIANCES } = process.env;
const TRACK_COLLECTION = "track";

const DEFAULT_TRACK = {
  players: [],
  guilds: [],
  alliances: [],
};

async function getTrack(server) {
  const track = await findOne(TRACK_COLLECTION, { server });
  return {
    ...DEFAULT_TRACK,
    ...track,
  };
}

async function getTrackForServer(servers) {
  const trackForServer = {};

  servers.forEach((server) => {
    trackForServer[server.id] = { ...DEFAULT_TRACK };
  });

  (await find(TRACK_COLLECTION, {})).forEach((track) => {
    // TODO: Trim track list if subscription is expired
    // Better to do when Track list gets refactored
    trackForServer[track.server] = track;
  });

  return trackForServer;
}

async function setTrack(server, track) {
  await updateOne(TRACK_COLLECTION, { server }, { $set: track }, { upsert: true });
  return await getTrack(server);
}

async function getLimitsByServerId(server) {
  let players = getNumber(MAX_PLAYERS, 10);
  let guilds = getNumber(MAX_GUILDS, 1);
  let alliances = getNumber(MAX_ALLIANCES, 1);

  if (await hasSubscriptionByServerId(server)) {
    players = getNumber(SUB_MAX_PLAYERS, players);
    guilds = getNumber(SUB_MAX_GUILDS, guilds);
    alliances = getNumber(SUB_MAX_ALLIANCES, alliances);
  }

  return {
    players,
    guilds,
    alliances,
  };
}

module.exports = {
  getLimitsByServerId,
  getTrack,
  getTrackForServer,
  setTrack,
};
