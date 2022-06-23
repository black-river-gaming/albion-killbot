const { ObjectId } = require("mongodb");
const dbClient = require("../adapters/mongoDbClient");

// TODO: Extract helper functions
function convertObjectId(query) {
  if (query._id && !(query._id instanceof ObjectId)) {
    query._id = ObjectId(query._id);
  }
  return query;
}

function returnObjectId(document) {
  if (!document) return null;
  if (document._id) {
    document.id = document._id;
    delete document._id;
  }
  return { id: document.id, ...document };
}

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

async function find(collectionName, query) {
  const collection = getCollection(collectionName);
  const result = await collection.find(convertObjectId(query)).toArray();
  return result.map((document) => returnObjectId(document));
}

async function findOne(collectionName, query) {
  const collection = getCollection(collectionName);
  const document = await collection.findOne(convertObjectId(query));
  return returnObjectId(document);
}

module.exports = {
  cleanup,
  dropColection,
  find,
  findOne,
  getCollection,
  init,
};
