const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const SERVERS = {
  EAST: "Albion East",
  WEST: "Albion West",
};

const SERVER_LIST = [SERVERS.WEST, SERVERS.EAST];

const SUBSCRIPTION_STATUS = {
  FREE: "Free",
  ACTIVE: "Active",
  EXPIRED: "Expired",
};

module.exports = {
  DAY,
  HOUR,
  MINUTE,
  SECOND,
  SERVERS,
  SERVER_LIST,
  SUBSCRIPTION_STATUS,
};
