const { search, getAllianceById } = require("../queries/search");
const { setConfig } = require("../config");
const { getI18n } = require("../messages");
const { getNumber } = require("../utils");

const SUPPORTED_TYPES = ["player", "guild", "alliance"];

module.exports = {
  aliases: ["track"],
  args: ["player/guild/alliance", "name"],
  description: "HELP.TRACK",
  run: async (client, guild, message, args) => {
    const l = getI18n(guild.config.lang);

    if (!args || !args[0] || !args[1]) {
      message.channel.send(l.__("TRACK.MISSING_PARAMETERS"));
      return;
    }

    if (!guild.config.trackedPlayers) guild.config.trackedPlayers = [];
    if (!guild.config.trackedGuilds) guild.config.trackedGuilds = [];
    if (!guild.config.trackedAlliances) guild.config.trackedAlliances = [];

    const type = args.shift().toLowerCase();
    const q = args.join(" ").trim();

    if (!SUPPORTED_TYPES.includes(type)) {
      return message.channel.send(l.__("TRACK.UNSUPPORTED_TYPE"));
    }

    if (type == "alliance") {
      // For alliances, tracking is done via id only
      const limit = getNumber(process.env.MAX_ALLIANCES, 1);
      if (limit == 0) {
        const trackType = l.__(`TRACK.${type.toUpperCase()}S`).toLowerCase();
        return message.channel.send(l.__("TRACK.TRACKING_DISABLED", { type: trackType }));
      }
      if (guild.config.trackedAlliances.length >= limit)
        return message.channel.send(l.__("TRACK.LIMIT_REACHED", { limit }));
      if (guild.config.trackedAlliances.some((a) => a.id === q))
        return message.channel.send(l.__("TRACK.ALREADY_TRACKED"));

      const alliance = await getAllianceById(q);
      if (!alliance) return message.channel.send(l.__("TRACK.NOT_FOUND"));
      guild.config.trackedAlliances.push({
        id: alliance.AllianceId,
        name: alliance.AllianceTag,
      });
      if (!(await setConfig(guild))) {
        return message.channel.send(l.__("CONFIG_NOT_SET"));
      }
      return message.channel.send(l.__("TRACK.ALLIANCE_TRACKED", { name: alliance.AllianceTag }));
    } else {
      // For players and guilds, we can use the default search method
      const track = async (tracked, msg, limit = 5) => {
        if (limit == 0) {
          const trackType = l.__(`TRACK.${type.toUpperCase()}S`).toLowerCase();
          return message.channel.send(l.__("TRACK.TRACKING_DISABLED", { type: trackType }));
        }
        if (!guild.config[tracked]) {
          guild.config[tracked] = [];
        }

        let entity = guild.config[tracked].find(
          (p) => p.name.localeCompare(q, undefined, { sensitivity: "base" }) === 0,
        );
        if (entity) {
          message.channel.send(l.__("TRACK.ALREADY_TRACKED"));
          return;
        }
        if (guild.config[tracked].length >= limit) {
          message.channel.send(l.__("TRACK.LIMIT_REACHED", { limit }));
          return;
        }

        const results = await search(q);
        if (!results) {
          return message.channel.send(l.__("TRACK.SEARCH_FAILED"));
        }

        entity = results[`${type}s`].find((p) => p.Name.localeCompare(q, undefined, { sensitivity: "base" }) === 0);
        if (!entity) {
          message.channel.send(l.__("TRACK.NOT_FOUND"));
          return;
        }
        guild.config[tracked].push({ id: entity.Id, name: entity.Name });
        if (!(await setConfig(guild))) {
          message.channel.send(l.__("CONFIG_NOT_SET"));
        }
        await message.channel.send(l.__(msg, { name: entity.Name }));
      };

      switch (type) {
        case "player":
          return track("trackedPlayers", "TRACK.PLAYER_TRACKED", getNumber(process.env.MAX_PLAYERS, 30));
        case "guild":
          return track("trackedGuilds", "TRACK.GUILD_TRACKED", getNumber(process.env.MAX_GUILDS, 5));
      }
    }
  },
};
