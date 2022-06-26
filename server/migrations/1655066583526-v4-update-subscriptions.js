const database = require("../src/ports/database");
const SUBSCRIPTIONS_COLLECTION = "subscriptions";
const SETTINGS_COLLECTION = "settings";

async function exportSubscriptionsToCollection() {
  const settingsCollection = database.getCollection(SETTINGS_COLLECTION);
  const subscriptionsCollection = database.getCollection(SUBSCRIPTIONS_COLLECTION);
  const settings = await settingsCollection.find({});

  let setting = await settings.next();
  while (setting) {
    if (setting.subscription) {
      const { subscription, guild } = setting;

      subscription.server = subscription.guild;
      delete subscription.guild;

      await subscriptionsCollection.insertOne({ ...subscription, guild });
      await settingsCollection.updateOne(
        { _id: setting._id },
        {
          $unset: { subscription: "" },
        },
      );
    }

    setting = await settings.next();
  }
}

async function run() {
  await exportSubscriptionsToCollection();
}

module.exports = {
  run,
};
