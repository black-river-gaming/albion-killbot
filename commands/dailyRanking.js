const { setConfig } = require("../config");
const { getI18n } = require("../messages");

const modes = ["on", "off"];

module.exports = {
  aliases: ["dailyranking"],
  args: ["on/off/daily"],
  description: "HELP.DAILY_RANKING",
  run: async (client, guild, message, args) => {
    const l = getI18n(guild.config.lang);

    if (!args[0]) {
      const mode = guild.config.dailyRanking;
      return message.channel.send(l.__("RANKING.DAILY_RANKING_SET", { mode }));
    }

    const mode = args[0].toLowerCase();
    if (modes.indexOf(mode) < 0) {
      return message.channel.send(
        l.__("MODES_AVAILABLE", { modes: modes.join(", ") }),
      );
    }

    guild.config.dailyRanking = mode;
    if (!(await setConfig(guild))) {
      message.channel.send(l.__("CONFIG_NOT_SET"));
    }

    message.channel.send(l.__("RANKING.DAILY_RANKING_SET", { mode }));
  },
};
