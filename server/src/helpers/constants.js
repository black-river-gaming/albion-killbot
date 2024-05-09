const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const SUBSCRIPTION_STATUS = {
  FREE: "Free",
  ACTIVE: "Active",
  EXPIRED: "Expired",
};

const REPORT_MODES = {
  IMAGE: "image",
  TEXT: "text",
};

const liveId = {
  americas: "live_us",
  asia: "live_sgp",
  europe: "live_ams",
};

const albion2dSudbdomain = (server) => (server !== "americas" ? `${server}.` : "");

const REPORT_PROVIDERS = [
  {
    id: "albion-killboard",
    name: "Albion Killboard",
    events: ({ id, server }) => `https://albiononline.com/killboard/kill/${id}?server=${liveId[server]}`,
    battles: ({ id, server }) => `https://albiononline.com/killboard/battles/${id}?server=${liveId[server]}`,
  },
  {
    id: "albion2d",
    name: "Albion Online 2D",
    events: ({ id, server, lang }) =>
      `https://${albion2dSudbdomain(server)}albiononline2d.com/${lang}/scoreboard/events/${id}`,
    battles: ({ id, server, lang }) =>
      `https://${albion2dSudbdomain(server)}albiononline2d.com/${lang}/scoreboard/battles/${id}`,
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

const RANKING_MODES = ["off", "1hour", "6hour", "12hour", "1day", "7day", "15day", "1month"];

module.exports = {
  DAY,
  HOUR,
  MINUTE,
  SECOND,

  RANKING_MODES,
  REPORT_MODES,
  REPORT_PROVIDERS,
  SUBSCRIPTION_STATUS,
};
