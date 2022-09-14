const { findOne, updateOne } = require("../ports/database");
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
  return await findOne(TRACK_COLLECTION, { server });
}

async function setTrack(server, track) {
  await updateOne({ server }, { $set: track }, { upsert: true });
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
  DEFAULT_TRACK,
  getLimitsByServerId,
  getTrack,
  setTrack,
};
