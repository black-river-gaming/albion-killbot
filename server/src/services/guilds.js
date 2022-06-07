const { getCollection } = require("../ports/database");
const albion = require("../ports/albion");

const GUILDS_COLLECTION = "guilds";

async function updateGuild(guildId) {
  const collection = getCollection(GUILDS_COLLECTION);
  if (!collection) return;

  const guild = await albion.getGuild(guildId, { rankings: true });
  if (!guild) return;

  guild.updatedAt = new Date();

  return await collection.replaceOne({ _id: guild._id }, guild, { upsert: true });
}

async function getAllGuilds() {
  const albionGuilds = {};

  const collection = getCollection(GUILDS_COLLECTION);
  if (!collection) return albionGuilds;

  await collection.find({}).forEach((guild) => {
    albionGuilds[guild.Id] = guild;
  });

  return albionGuilds;
}

async function getGuild(guildId) {
  const collection = getCollection(GUILDS_COLLECTION);
  if (!collection) throw new Error("Not connected to the database.");

  return await collection.findOne({ Id: guildId });
}

module.exports = {
  getAllGuilds,
  getGuild,
  updateGuild,
};
