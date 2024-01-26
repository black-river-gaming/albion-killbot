module.exports = {
  events: {
    batch: process.env.AMQP_QUEUE_EVENTS_BATCH || true,
  },

  battles: {
    batch: process.env.AMQP_QUEUE_BATTLES_BATCH || true,
  },

  database: {
    uri: process.env.MONGODB_URL,
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

  stripe: {
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  api: {
    port: process.env.PORT || 80,
    session: {
      cookieName: process.env.SESSION_COOKIE_NAME || "albion-killbot",
      domain: process.env.SESSION_DOMAIN || null,
      maxAge: process.env.SESSION_MAX_AGE || 604800000,
      secret: process.env.SESSION_SECRET || "defaultSecret",
    },
    rateLimit: {
      interval: process.env.RATE_LIMIT_WINDOW || 60000,
      requests: process.env.RATE_LIMIT_REQUESTS || 0,
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
};
