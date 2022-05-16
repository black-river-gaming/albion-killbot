const dbClient = require("../adapters/mongoDbClient");

async function init() {
  await dbClient.connect();
}

const collection = (collection) => {
  return dbClient.getCollection(collection);
};

module.exports = {
  init,
  collection,
};
