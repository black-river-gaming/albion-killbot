const { ObjectId } = require("mongodb");
const dbClient = require("./adapters/mongoDbClient");

const { client } = dbClient;

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
    document.id = document._id.toString();
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

async function insertOne(collectionName, query) {
  const collection = getCollection(collectionName);
  const result = await collection.insertOne(convertObjectId(query));
  return returnObjectId(result).insertedId;
}

async function find(collectionName, query, options) {
  const collection = getCollection(collectionName);
  const result = await collection.find(convertObjectId(query), options).toArray();
  return result.map((document) => returnObjectId(document));
}

async function findOne(collectionName, query) {
  const collection = getCollection(collectionName);
  const document = await collection.findOne(convertObjectId(query));
  return returnObjectId(document);
}

async function replaceOne(collectionName, filter, update, options) {
  const collection = getCollection(collectionName);
  const document = await collection.replaceOne(convertObjectId(filter), update, options);
  return returnObjectId(document);
}

async function updateMany(collectionName, filter, update, options) {
  const collection = getCollection(collectionName);
  const document = await collection.updateMany(convertObjectId(filter), update, options);
  return returnObjectId(document);
}

async function updateOne(collectionName, filter, update, options) {
  const collection = getCollection(collectionName);
  const document = await collection.updateOne(convertObjectId(filter), update, options);
  return returnObjectId(document);
}

async function deleteMany(collectionName, filter) {
  const collection = getCollection(collectionName);
  const result = await collection.deleteMany(convertObjectId(filter));
  return returnObjectId(result);
}

async function deleteOne(collectionName, filter) {
  const collection = getCollection(collectionName);
  const result = await collection.deleteOne(convertObjectId(filter));
  return returnObjectId(result);
}

module.exports = {
  client,
  cleanup,
  deleteMany,
  deleteOne,
  dropColection,
  find,
  findOne,
  getCollection,
  init,
  insertOne,
  replaceOne,
  updateMany,
  updateOne,
};
