const dbClient = require("../adapters/mongoDbClient");

async function init() {
  await dbClient.connect();
}

const getCollection = (collection) => {
  return dbClient.getCollection(collection);
};

module.exports = {
  init,
  getCollection,
};
