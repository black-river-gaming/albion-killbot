const { search } = require("../queries/search");
const { setConfig } = require("../config");
const { getI18n } = require("../messages");

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
    const name = args.join(" ").trim();

    if (type === "alliance") {
      message.channel.send(l.__("TRACK.ALLIANCE_DISABLED"));
      return;
    }

    if (!SUPPORTED_TYPES.includes(type)) {
      message.channel.send(l.__("TRACK.UNSUPPORTED_TYPE"));
      return;
    }

    // TODO: Constantize limits
    const track = async (entityList = [], dest, msg, limit = 5) => {
      let entity = dest.find(
        p =>
          p.name.localeCompare(name, undefined, { sensitivity: "base" }) === 0
      );
      if (entity) {
        message.channel.send(l.__("TRACK.ALREADY_TRACKED"));
        return;
      }
      if (dest.length >= limit) {
        message.channel.send(l.__("TRACK.LIMIT_REACHED", { limit }));
        return;
      }

      entity = entityList.find(
        p =>
          p.Name.localeCompare(name, undefined, { sensitivity: "base" }) === 0
      );
      if (!entity) {
        message.channel.send(l.__("TRACK.NOT_FOUND"));
        return;
      }
      dest.push({ id: entity.Id, name: entity.Name });
      if (!(await setConfig(guild))) {
        message.channel.send(l.__("CONFIG_NOT_SET"));
      }
      message.channel.send(l.__(msg, { name: entity.Name }));

      if (!guild.config.channel) {
        message.channel.send(l.__("CHANNEL_NOT_SET"));
      }
    };

    const results = await search(name);
    switch (type) {
    case "player":
      return track(
        results.players,
        guild.config.trackedPlayers,
        "TRACK.PLAYER_TRACKED",
        30
      );
    case "guild":
      return track(
        results.guilds,
        guild.config.trackedGuilds,
        "TRACK.GUILD_TRACKED"
      );
    case "alliance":
      return track(
        results.alliances,
        guild.config.trackedAlliances,
        "TRACK.ALLIANCE_TRACKED",
        1
      );
    }
  }
};
