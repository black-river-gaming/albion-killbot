const dbClient = require("../adapters/mongoDbClient");

async function init() {
  await dbClient.connect();
}

async function cleanup() {
  await dbClient.close();
}

const getCollection = (collectionName) => {
  const collection = dbClient.getCollection(collectionName);
  if (!collection) throw new Error("Database not connected");
  return collection;
};

module.exports = {
  init,
  cleanup,
  getCollection,
};
