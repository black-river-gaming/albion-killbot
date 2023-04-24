const amqp = require("amqplib");
const logger = require("../../helpers/logger");
const { sleep } = require("../../helpers/scheduler");

const QUEUE_MAX_LENGTH = Number(process.env.AMQP_QUEUE_MAX_LENGTH) || 10000;
const QUEUE_MESSAGE_TTL = 1000 * 60 * 60 * 4; // 4 hours

let client;
let pubChannel;
let subscriptions = [];

const connect = async (amqpUrl) => {
  try {
    logger.verbose("Connecting to message broker...");
    client = await amqp.connect(amqpUrl);
    logger.info("Connection to message broker stabilished.");

    client.on("error", (error) => {
      logger.error(`Message broker connection error: ${error.message}`, { error });
    });

    client.on("close", async () => {
      logger.error("Message broker connection closed. Trying to reconnect...");
      await sleep(5000);
      return connect(amqpUrl);
    });

    pubChannel = null;
    subscriptions.forEach((fn) => fn());
  } catch (e) {
    logger.error(`Unable to connect to message broker:`, e);
    await sleep(5000);
    return connect(amqpUrl);
  }
};

const publish = async (exchange, data) => {
  if (!client) throw new Error("Client not connected");
  if (!pubChannel) pubChannel = await client.createChannel();

  await pubChannel.assertExchange(exchange, "fanout", {
    durable: false,
  });

  await pubChannel.publish(exchange, "", Buffer.from(data), {
    persistent: true,
  });
};

// This will ensure that subscriptions will be restored when the connection resumes
// It wraps the subscription function so it can be recalled on server reconnections
const subscribe = async (exchange, queue, cb, { prefetch }) => {
  const subFn = async () => {
    if (!client) throw new Error("Client not connected");

    // Create channel
    const channel = await client.createChannel();
    if (prefetch) {
      channel.prefetch(prefetch, false);
    }

    await channel.assertExchange(exchange, "fanout", {
      durable: false,
    });

    // Assert Queue
    await channel.assertQueue(queue, {
      exclusive: true,
      durable: false,
      maxLength: QUEUE_MAX_LENGTH,
      messageTtl: QUEUE_MESSAGE_TTL,
    });

    // Bind Queue
    await channel.bindQueue(queue, exchange, "");

    // Consume queue callback
    await channel.consume(queue, cb, {
      noAck: true,
    });
  };

  await subFn();
  subscriptions.push(subFn);
};

const unsubscribeAll = async () => {
  subscriptions = [];
};

module.exports = {
  connect,
  publish,
  subscribe,
  unsubscribeAll,
};
