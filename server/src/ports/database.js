const dbClient = require("../adapters/mongoDbClient");

async function init() {
  await dbClient.connect();
}

async function cleanup() {
  await dbClient.close();
}

const getCollection = (collection) => {
  return dbClient.getCollection(collection);
};

module.exports = {
  init,
  cleanup,
  getCollection,
};
