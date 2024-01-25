module.exports = {
  events: {
    batch: process.env.AMQP_QUEUE_EVENTS_BATCH || true,
  },

  battles: {
    batch: process.env.AMQP_QUEUE_BATTLES_BATCH || true,
  },

  discord: {
    token: process.env.DISCORD_TOKEN,
    community: {
      server: process.env.DISCORD_COMMUNITY_SERVER,
      premiumRole: process.env.DISCORD_COMMUNITY_PREMIUM_ROLE,
    },
  },

  dashboard: {
    url: process.env.DASHBOARD_URL || "http://localhost",
  },

  crawler: {
    events: {
      west: true,
      east: true,
    },
    battles: {
      west: true,
      east: true,
    },
  },

  bot: {
    shards: {
      total: process.env.SHARDS_TOTAL || "auto",
      spawn: process.env.SHARDS_TO_SPAWN || "auto",
    },
    guildRankings: true,
    servers: {
      cacheInterval: 60000,
    },
  },
};
