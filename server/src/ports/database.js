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

async function dropColection(collectionName) {
  try {
    await dbClient.getCollection(collectionName).drop();
  } catch (e) {
    // In case the collection does not exist, just ignore
    if (e.message.match(/ns not found/)) return true;
    throw e;
  }
  return true;
}

module.exports = {
  init,
  cleanup,
  getCollection,
  dropColection,
};
