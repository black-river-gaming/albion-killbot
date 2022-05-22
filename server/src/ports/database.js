const dbClient = require("../adapters/mongoDbClient");

async function init() {
  const { MONGODB_URL } = process.env;

  if (!MONGODB_URL) {
    throw new Error("Please define MONGODB_URL environment variable with the MongoDB location.");
  }

  await dbClient.connect(MONGODB_URL);
}

async function cleanup() {
  await dbClient.close();
}

function getCollection(collectionName) {
  const collection = dbClient.getCollection(collectionName);
  if (!collection) throw new Error("Database not connected");
  return collection;
}

module.exports = {
  init,
  cleanup,
  getCollection,
};
