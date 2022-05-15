const amqp = require("amqplib");
const logger = require("../helpers/logger");
const { sleep } = require("../helpers/utils");

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_MAX_LENGTH = Number(process.env.AMQP_QUEUE_MAX_LENGTH) || 10000;
const QUEUE_MESSAGE_TTL = 1000 * 60 * 60 * 4; // 4 hours

if (!RABBITMQ_URL) {
  logger.warn(
    "Please set RABBITMQ_URL environment variable with the RabbitMQ location with the following format: amqp://host",
  );
  process.exit(1);
}

let client;
let subscriptions = [];

const connect = async () => {
  try {
    logger.debug("Connecting to message broker...");
    client = await amqp.connect(RABBITMQ_URL);
    logger.info("Connection to message broker stabilished.");

    subscriptions.forEach((fn) => fn());
  } catch (e) {
    logger.error(`Unable to connect to message broker: ${e}`);
    await sleep(5000);
    return connect();
  }

  client.on("err", (err) => logger.error(`Message broker connection error: ${err}`));

  client.on("close", async () => {
    logger.error("Message broker connection closed. Trying to reconnect...");
    await sleep(5000);
    return connect();
  });
};

let pubChannel;
const publish = async (exchange, routingKey, content) => {
  if (!pubChannel) {
    pubChannel = await client.createChannel();
  }

  await pubChannel.assertExchange(exchange, "fanout", {
    durable: true,
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

    // Assert exchange
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
        exclusive: true,
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
