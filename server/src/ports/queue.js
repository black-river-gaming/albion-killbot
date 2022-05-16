const rabbitMQClient = require("../adapters/rabbitMQClient");
const logger = require("../helpers/logger");

const PREFETCH_COUNT = 1;

async function init() {
  await rabbitMQClient.connect();
}

async function publish(exchange, data) {
  return await rabbitMQClient.publish(exchange, "", data);
}

async function subscribe(exchange, queue, callback) {
  const parsedAndCallback = (msg) => {
    const res = JSON.parse(msg.content.toString());
    if (!res) {
      logger.warn("Empty response object received from queue. Ignoring.");
      return true;
    }
    return callback(res);
  };
  return await rabbitMQClient.subscribe(exchange, queue, parsedAndCallback, {
    prefetch: PREFETCH_COUNT,
  });
}

async function unsubscribeAll() {
  return await rabbitMQClient.unsubscribeAll();
}

module.exports = {
  init,
  publish,
  subscribe,
  unsubscribeAll,
};
