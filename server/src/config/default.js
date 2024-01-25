module.exports = {
  events: {
    batch: process.env.AMQP_QUEUE_EVENTS_BATCH || true,
  },
  battles: {
    batch: process.env.AMQP_QUEUE_BATTLES_BATCH || true,
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
