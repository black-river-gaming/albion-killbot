const MongoClient = require("mongodb").MongoClient;
const logger = require("./logger")("database");
const { sleep } = require("./utils");

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  logger.warn(
    "Please define MONGODB_URL environment variable with the MongoDB location. Server config persistence is disabled.",
  );
}

const client = new MongoClient(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  w: 1,
  wtimeout: 60000,
});
let db;

exports.connect = async () => {
  const isConnected = () => {
    return !!client && !!client.topology && client.topology.isConnected();
  };

  const exit = false;
  while (!exit) {
    try {
      if (!isConnected()) {
        logger.info("Connecting to database...");
        await client.connect();
        logger.info("Connection to database stabilished.");
        db = client.db();
      }
      await sleep(60000);
    } catch (e) {
      logger.error(`Unable to connect to database: ${e}`);
      await sleep(5000);
    }
  }
};
exports.db = db;
exports.collection = collection => {
  if (!db) return;
  return db.collection(collection);
};
