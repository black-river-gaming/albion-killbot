const amqp = require("amqplib");
const logger = require("../../helpers/logger");
const { sleep } = require("../../helpers/scheduler");

const QUEUE_MAX_LENGTH = Number(process.env.AMQP_QUEUE_MAX_LENGTH) || 10000;
const QUEUE_MESSAGE_TTL = 1000 * 60 * 60 * 4; // 4 hours

let client;
let subscriptions = [];
let pubChannel;

const connect = async (rabbitMQUrl) => {
  try {
    logger.verbose("Connecting to message broker...");
    client = await amqp.connect(rabbitMQUrl);
    logger.info("Connection to message broker stabilished.");

    // Restore previous channels
    if (pubChannel) pubChannel = await client.createChannel();
    subscriptions.forEach((fn) => fn());
  } catch (e) {
    logger.error(`Unable to connect to message broker:`, e);
    await sleep(5000);
    return connect(rabbitMQUrl);
  }

  client.on("err", (e) => logger.error(`Message broker connection error:`, e));

  client.on("close", async () => {
    logger.error("Message broker connection closed. Trying to reconnect...");
    await sleep(5000);
    return connect(rabbitMQUrl);
  });
};

const publish = async (exchange, routingKey, content) => {
  if (!pubChannel) {
    pubChannel = await client.createChannel();
  }

  await pubChannel.assertExchange(exchange, "fanout", {
    durable: false,
  });

  await pubChannel.publish(exchange, routingKey, Buffer.from(JSON.stringify(content)));
};

// This will ensure that subscriptions will be restored when the connection resumes
// It wraps the subscription function so it can be recalled on server reconnections
const subscribe = async (exchange, queue, cb, { prefetch }) => {
  const subFn = async () => {
    // Create channel
    const channel = await client.createChannel();
    if (prefetch) {
      channel.prefetch(prefetch, false);
    }

    await channel.assertExchange(exchange, "fanout", {
      durable: false,
    });

    // Assert Queue
    const q = await channel.assertQueue(queue, {
      exclusive: true,
      durable: false,
      "x-queue-type": "classic",
      maxLength: QUEUE_MAX_LENGTH,
      messageTtl: QUEUE_MESSAGE_TTL,
    });

    // Bind Queue
    await channel.bindQueue(q.queue, exchange, "");

    // Consume queue callback
    await channel.consume(
      q.queue,
      async (msg) => {
        if (await cb(msg)) channel.ack(msg);
        else channel.nack(msg);
      },
      {
        exclusive: false,
      },
    );
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
