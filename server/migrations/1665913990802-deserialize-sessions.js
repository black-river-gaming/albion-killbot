const logger = require("../src/helpers/logger");
const database = require("../src/ports/database");

async function run() {
  logger.info(`Deserializing all sessions.`);

  const collection = database.getCollection("sessions");
  const sessions = await collection.find({});

  while (await sessions.hasNext()) {
    const session = await sessions.next();

    if (typeof session.session !== "string") {
      logger.debug(`Skipped session ${session._id}.`);
      continue;
    }

    try {
      const parsedSession = JSON.parse(session.session);
      await collection.updateOne(
        { _id: session._id },
        {
          $set: { session: parsedSession },
        },
      );

      logger.debug(`Parsed session ${session._id}.`);
    } catch (error) {
      logger.error(`Unable to deserialize session ${session._id}. Deleting.`);
      await collection.deleteOne({ _id: session._id });
    }
  }

  logger.verbose(`Deserialize sessions completed.`);
}

module.exports = {
  run,
};
