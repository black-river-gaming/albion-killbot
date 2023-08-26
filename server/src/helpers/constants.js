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

const REPORT_MODES = {
  IMAGE: "image",
  TEXT: "text",
};

const albionKillboardServers = {
  "Albion West": "live_us",
  "Albion East": "live_sgp",
};

const REPORT_PROVIDERS = [
  {
    id: "albion-killboard",
    name: "Albion Killboard",
    events: ({ id, server }) =>
      `https://albiononline.com/killboard/kill/${id}?server=${albionKillboardServers[server]}`,
    battles: ({ id, server }) =>
      `https://albiononline.com/killboard/battles/${id}?server=${albionKillboardServers[server]}`,
  },
  {
    id: "albion2d",
    name: "Albion Online 2D",
    events: ({ id, lang }) => `https://albiononline2d.com/${lang}/scoreboard/events/${id}`,
    battles: ({ id, lang }) => `https://albiononline2d.com/${lang}/scoreboard/battles/${id}`,
  },
  {
    id: "albion-battles",
    name: "Albion Battles",
    battles: ({ id }) => `https://albionbattles.com/battles/${id}`,
  },
  {
    id: "kill-board",
    name: "Kill-board",
    battles: ({ id }) => `https://kill-board.com/battles/${id}`,
  },
];

const RANKING_MODES = ["off", "hourly", "daily"];

module.exports = {
  DAY,
  HOUR,
  MINUTE,
  SECOND,

  RANKING_MODES,
  REPORT_MODES,
  REPORT_PROVIDERS,
  SERVERS,
  SERVER_LIST,
  SUBSCRIPTION_STATUS,
};
