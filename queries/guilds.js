const axios = require("axios");
const moment = require("moment");
const logger = require("../logger")("queries.guilds");
const database = require("../database");
const { getConfigByGuild } = require("../config");
const { embedRankings } = require("../messages");

// TODO: Export this to a const file
const GUILDS_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/guilds";
const STATISTICS_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/players/statistics";
const FAME_ENDPOINT = "https://gameinfo.albiononline.com/api/gameinfo/events/playerfame";

const GUILDS_COLLECTION = "guilds";

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const getGuildData = async (guildConfigs) => {
  const guildIds = Object.keys(guildConfigs).reduce((guildIds, gid) => {
    const config = guildConfigs[gid];
    if (!config || config.trackedGuilds.length === 0) return guildIds;
    return guildIds.concat(config.trackedGuilds.filter(t => guildIds.indexOf(t.id) === -1).map(t => t.id));
  }, []);

  const guildData = {};
  guildIds.forEach(id => {
    guildData[id] = null;
  });

  const collection = database.collection(GUILDS_COLLECTION);
  if (!collection) return guildData;

  try {
    const results = await collection.find({}).toArray();
    results.forEach(guild => {
      if (guild._id in guildData) {
        guildData[guild._id] = guild;
      }
    });
  } catch (e) {
    logger.error(`Unable to get guild data: ${e}`);
  }

  return guildData;
};

exports.update = async ({ client }) => {
  const allGuildConfigs = await getConfigByGuild(client.guilds.cache.array());
  const guildData = await getGuildData(allGuildConfigs);

  for (const id of Object.keys(guildData)) {
    const guild = guildData[id];
    if (!!guild && moment().diff(moment(guild.updatedAt), "days") < 1) continue;

    logger.debug(`[#${client.shardId}] Updating guild "${guild ? guild.Name : id}" data...`);
    await exports.updateGuild({ client }, id);
  }

  logger.debug(`[#${client.shardId}] Guild update finished!`);
};

exports.updateGuild = async ({ client }, guildId) => {
  const collection = database.collection(GUILDS_COLLECTION);
  if (!collection) return;

  let guild;
  while (!guild) {
    try {
      const res = await axios.get(`${GUILDS_ENDPOINT}/${guildId}`);
      guild = res.data;
      guild._id = guild.Id;
    } catch (err) {
      logger.error(`Unable to fetch data from API: ${err}`);
    }
  }

  const rankings = {
    pve: null,
    pvp: null,
    gathering: null,
    crafting: null,
  };
  const params = {
    range: "month",
    limit: 11,
    offset: 0,
    reigon: "Total",
    guildId,
  };
  const timeout = 60000;

  while (!rankings.pve) {
    logger.debug(`[#${client.shardId}] [${guild.Name}] Fetching PvE rankings...`);
    params.type = "PvE";
    params.timestamp = moment().unix();
    try {
      const pveRes = await axios.get(STATISTICS_ENDPOINT, {
        params,
        timeout,
      });
      rankings.pve = pveRes.data;
    } catch (e) {
      logger.error(`[#${client.shardId}] [${guild.Name}] Failed to fetch PvE rankings: ${e}. Trying again...`);
    }
    await sleep(5000);
  }

  while (!rankings.pvp) {
    logger.debug(`[#${client.shardId}] [${guild.Name}] Fetching PvP rankings...`);
    params.type = "PvP";
    params.timestamp = moment().unix();
    try {
      const pvpRes = await axios.get(FAME_ENDPOINT, {
        params,
        timeout,
      });
      rankings.pvp = pvpRes.data;
    } catch (e) {
      logger.error(`[#${client.shardId}] [${guild.Name}] Failed to fetch PvP rankings: ${e}. Trying again...`);
    }
    await sleep(5000);
  }

  while (!rankings.gathering) {
    logger.debug(`[#${client.shardId}] [${guild.Name}] Fetching Gathering rankings...`);
    params.type = "Gathering";
    params.subtype = "All";
    params.timestamp = moment().unix();
    try {
      const gatherRes = await axios.get(STATISTICS_ENDPOINT, {
        params,
        timeout,
      });
      rankings.gathering = gatherRes.data;
    } catch (e) {
      logger.error(`[#${client.shardId}] [${guild.Name}] Failed to fetch Gathering rankings: ${e}. Trying again...`);
    }
    await sleep(5000);
  }

  while (!rankings.crafting) {
    logger.debug(`[#${client.shardId}] [${guild.Name}] Fetching Crafting rankings...`);
    params.type = "Crafting";
    params.timestamp = moment().unix();
    delete params.subtype;
    try {
      const craftRes = await axios.get(STATISTICS_ENDPOINT, {
        params,
        timeout,
      });
      rankings.crafting = craftRes.data;
    } catch (e) {
      logger.error(`[#${client.shardId}] [${guild.Name}] Failed to fetch Crafting rankings: ${e}. Trying again...`);
    }
    await sleep(5000);
  }

  guild.rankings = rankings;
  guild.updatedAt = new Date();

  try {
    await collection.replaceOne({ _id: guild._id }, guild, { upsert: true });
    logger.debug(`[#${client.shardId}] [${guild.Name}] Guild updated sucessfully.`);
  } catch (e) {
    logger.error(`[#${client.shardId}] Unable to update data for guild ${guild.Name}: ${e}`);
  }
};

exports.showRanking = async ({ client, sendGuildMessage }) => {
  logger.info(`[#${client.shardId}] Displaying guild rankings to all servers.`);

  const allGuildConfigs = await getConfigByGuild(client.guilds.cache.array());
  const allGuildData = await getGuildData(allGuildConfigs);

  for (const guild of client.guilds.cache.array()) {
    guild.config = allGuildConfigs[guild.id];
    if (!guild.config) continue;

    for (const trackedGuild of guild.config.trackedGuilds) {
      const guildData = allGuildData[trackedGuild.id];
      if (!guildData || !guildData.rankings) {
        logger.debug(`[#${client.shardId}] No data available for guild "${trackedGuild.name}".`);
        continue;
      }
      await sendGuildMessage(guild, embedRankings(guildData, guild.config.lang), "rankings");
    }
  }
};
