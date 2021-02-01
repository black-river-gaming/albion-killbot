const amqp = require("amqplib");
const logger = require("./logger")("queue");

const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!RABBITMQ_URL) {
  logger.warn(
    "Please set RABBITMQ_URL environment variable with the RabbitMQ location with the following format: amqp://host",
  );
  process.exit(1);
}

let client;

exports.connect = async () => {
  logger.debug("Connecting to message broker...");
  client = await amqp.connect(RABBITMQ_URL);
  logger.info("Connection to message broker stabilished.");
};

exports.createChannel = async () => {
  return await client.createChannel();
};
