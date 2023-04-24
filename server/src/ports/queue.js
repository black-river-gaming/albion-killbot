const amqpClient = require("./adapters/amqpClient");
const logger = require("../helpers/logger");

const PREFETCH_COUNT = 1;

async function init() {
  const { AMQP_URL } = process.env;

  if (!AMQP_URL) {
    throw new Error("Please set AMQP_URL environment variable with the RabbitMQ location.");
  }

  await amqpClient.connect(AMQP_URL);
}

async function publish(exchange, data) {
  try {
    return await amqpClient.publish(exchange, JSON.stringify(data));
  } catch (error) {
    logger.error(`Unable to publish message to exchange ${exchange}: ${error.message}`, {
      exchange,
      error,
    });
  }
}

async function subscribe(exchange, queue, callback) {
  const parsedAndCallback = async (msg) => {
    try {
      if (!msg || !msg.content) return false;

      const data = JSON.parse(msg.content.toString());
      if (!data) {
        logger.warn("Empty response object received from queue. Ignoring.");
        return true;
      }
      await callback(data);

      return true;
    } catch (error) {
      logger.error(`Unable to consume message for queue ${queue}: ${error.message}`, { exchange, queue, error });
      return false;
    }
  };
  return await amqpClient.subscribe(exchange, queue, parsedAndCallback, {
    prefetch: PREFETCH_COUNT,
  });
}

async function unsubscribeAll() {
  return await amqpClient.unsubscribeAll();
}

module.exports = {
  init,
  publish,
  subscribe,
  unsubscribeAll,
};
