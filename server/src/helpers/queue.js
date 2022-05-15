const rabbitMQClient = require("../adapters/rabbitMQClient");

const EVENTS_EXCHANGE = "events";
const BATTLES_EXCHANGE = "battles";

async function init() {
  await rabbitMQClient.connect();
}

async function publishEvent(data) {
  return await rabbitMQClient.publish(EVENTS_EXCHANGE, "", data);
}

async function publishBattle(data) {
  return await rabbitMQClient.publish(BATTLES_EXCHANGE, "", data);
}

module.exports = {
  init,
  publishBattle,
  publishEvent,
};
