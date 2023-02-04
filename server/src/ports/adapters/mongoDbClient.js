const MongoClient = require("mongodb").MongoClient;
const logger = require("../../helpers/logger");
const { sleep } = require("../../helpers/scheduler");

let client;
let db;

async function connect(mongoDbUrl) {
  client = new MongoClient(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    writeConcern: {
      wtimeout: 60000,
    },
  });

  try {
    logger.verbose("Connecting to database...");
    await client.connect();
    db = client.db();
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

const isConnected = () => {
  return !!client && !!client.topology && client.topology.isConnected();
};

async function close() {
  logger.verbose("Disconnecting from database...");
  return await client.close();
}

function getCollection(collection) {
  if (!db) throw new Error(`Database is not connected`);
  return db.collection(collection);
}

module.exports = {
  client,
  connect,
  close,
  isConnected,
  getCollection,
};
