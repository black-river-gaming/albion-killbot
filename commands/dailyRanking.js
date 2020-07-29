const { setConfig } = require("../config");
const { getI18n } = require("../messages");

const modes = ["on", "off"];

module.exports = {
  aliases: ["dailyRanking"],
  args: ["on"],
  description: "HELP.DAILY_RANKING",
  run: async (client, guild, message, args) => {
    const l = getI18n(guild.config.lang);

    if (!args[0]) {
      return message.channel.send(
        l.__("MODES_AVAILABLE", { modes: modes.join(", ") }),
      );
    }

    const mode = args[0].toLowerCase();
    if (modes.indexOf(mode) < 0) {
      return message.channel.send(
        l.__("MODES_AVAILABLE", { modes: modes.join(", ") }),
      );
    }

    guild.config.dailyRanking = mode === "on";
    if (!(await setConfig(guild))) {
      message.channel.send(l.__("CONFIG_NOT_SET"));
    }

    message.channel.send(l.__("RANKING.DAILY_RANKING_SET", { mode }));
  },
};
