const { setConfig } = require("../config");
const { getI18n } = require("../messages");

const SUPPORTED_TYPES = ["player", "guild", "alliance"];

module.exports = {
  aliases: ["untrack"],
  args: ["player/guild/alliance", "name"],
  description: "HELP.UNTRACK",
  run: async (client, guild, message, args) => {
    const l = getI18n(guild);

    if (!args || !args[0] || !args[1]) {
      message.channel.send(l.__("TRACK.MISSING_PARAMETERS"));
      return;
    }

    if (!guild.config.trackedPlayers) guild.config.trackedPlayers = [];
    if (!guild.config.trackedGuilds) guild.config.trackedGuilds = [];
    if (!guild.config.trackedAlliances) guild.config.trackedAlliances = [];

    const type = args.shift().toLowerCase();
    const name = args.join(" ").trim();

    if (!SUPPORTED_TYPES.includes(type)) {
      message.channel.send(l.__("TRACK.UNSUPPORTED_TYPE"));
      return;
    }

    const untrack = async (name, dest, msg) => {
      const entity = dest.find(
        p =>
          p.name.localeCompare(name, undefined, { sensitivity: "base" }) === 0
      );
      if (!entity) {
        message.channel.send(l.__("TRACK.NOT_FOUND"));
        return;
      }

      dest.splice(dest.indexOf(entity), 1);
      if (!(await setConfig(guild))) {
        message.channel.send(l.__("CONFIG_NOT_SET"));
      }
      message.channel.send(l.__(msg, { name: entity.name }));
    };

    switch (type) {
    case "player":
      return untrack(
        name,
        guild.config.trackedPlayers,
        "TRACK.PLAYER_UNTRACKED"
      );
    case "guild":
      return untrack(
        name,
        guild.config.trackedGuilds,
        "TRACK.GUILD_UNTRACKED"
      );
    case "alliance":
      return untrack(
        name,
        guild.config.trackedAlliances,
        "TRACK.ALLIANCE_UNTRACKED"
      );
    }
  }
};
