const MongoClient = require("mongodb").MongoClient;
const logger = require("../helpers/logger");
const { sleep } = require("../helpers/utils");

const { MONGODB_URL } = process.env;

if (!MONGODB_URL) {
  throw new Error("Please define MONGODB_URL environment variable with the MongoDB location.");
}

const client = new MongoClient(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  writeConcern: {
    wtimeout: 60000,
  },
});

const isConnected = () => {
  return !!client && !!client.topology && client.topology.isConnected();
};

async function connect() {
  try {
    logger.debug("Connecting to database...");
    await client.connect();
    logger.info("Connection to database stabilished.");
  } catch (e) {
    logger.error(`Unable to connect to database: ${e}`);
    await sleep(5000);
    return connect();
  }

  client.on("error", (e) => {
    logger.info(`Connection error: ${e}`);
  });
}

async function getCollection(collection) {
  return client.db().collection(collection);
}

module.exports = {
  connect,
  isConnected,
  getCollection,
};
