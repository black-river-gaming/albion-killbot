const amqp = require("amqplib");
const logger = require("./logger")("queue");
const { sleep } = require("./utils");

const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!RABBITMQ_URL) {
  logger.warn(
    "Please set RABBITMQ_URL environment variable with the RabbitMQ location with the following format: amqp://host",
  );
  process.exit(1);
}

let client;
let channels;
let subscriptions = [];

exports.connect = async () => {
  try {
    logger.debug("Connecting to message broker...");
    client = await amqp.connect(RABBITMQ_URL);
    channels = {};
    subscriptions.forEach((fn => fn()));

    logger.info("Connection to message broker stabilished.");
  } catch (e) {
    logger.error(`Unable to connect to message broker: ${e}`);
    await sleep(5000);
    return exports.connect();
  }

  client.on("err", err => logger.error(`Message broker connection error: ${err}`));

  client.on("close", async () => {
    logger.error("Message broker connection closed. Trying to reconnect...");
    await sleep(5000);
    return exports.connect();
  });
};

exports.publish = async (exchange, routingKey, content) => {
  if (!channels.pubChan) {
    channels.pubChan = await client.createChannel();
  }

  await channels.pubChan.assertExchange(exchange, "fanout", {
    durable: false,
  });

  await channels.pubChan.publish(exchange, routingKey, Buffer.from(JSON.stringify(content)));
};

// This will ensure that subscriptions will be restored when the connection resumes
// fn = subscription function to be called
// params = options for the subscription function
exports.subscribe = async(fn, params) => {
  subscriptions.push(() => fn(params));
  fn(params);
};

exports.unsubscribeAll = () => {
  subscriptions = [];
};

exports.assertChannel = async(id, prefetch = 0) => {
  if (!channels[id]) {
    channels[id] = await client.createChannel();
    if (prefetch) {
      channels[id].prefetch(prefetch);
    }
  }
  return channels[id];
};
