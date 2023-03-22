const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const SERVERS = {
  EAST: "Albion East",
  WEST: "Albion West",
};

const SERVER_LIST = [SERVERS.WEST, SERVERS.EAST];

module.exports = {
  SECOND,
  MINUTE,
  HOUR,
  DAY,
  SERVERS,
  SERVER_LIST,
};
