const { getCollection } = require("../ports/database");
const { getGuild } = require("../ports/albion");

const GUILDS_COLLECTION = "guilds";

async function updateGuild(guildId) {
  const collection = getCollection(GUILDS_COLLECTION);
  if (!collection) return;

  const guild = await getGuild(guildId);

  guild._id = guild.Id;
  guild.updatedAt = new Date();

  return await collection.replaceOne({ _id: guild._id }, guild, { upsert: true });
}

async function getAllGuilds() {
  const albionGuilds = {};

  const collection = getCollection(GUILDS_COLLECTION);
  if (!collection) return albionGuilds;

  await collection.find({}).forEach((guild) => {
    albionGuilds[guild._id] = guild;
  });

  return albionGuilds;
}

// exports.getGuildData = async (guildConfigs) => {
//   const guildIds = Object.keys(guildConfigs).reduce((guildIds, gid) => {
//     const config = guildConfigs[gid];
//     if (!config || config.trackedGuilds.length === 0) return guildIds;
//     return guildIds.concat(config.trackedGuilds.filter((t) => guildIds.indexOf(t.id) === -1).map((t) => t.id));
//   }, []);

//   const guildData = {};
//   guildIds.forEach((id) => {
//     guildData[id] = null;
//   });

//   const collection = database.collection(GUILDS_COLLECTION);
//   if (!collection) return guildData;

//   try {
//     const results = await collection.find({}).toArray();
//     results.forEach((guild) => {
//       if (guild._id in guildData) {
//         guildData[guild._id] = guild;
//       }
//     });
//   } catch (e) {
//     logger.error(`Unable to get guild data: ${e}`);
//   }

//   return guildData;
// };

module.exports = {
  getAllGuilds,
  updateGuild,
};
