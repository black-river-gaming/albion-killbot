const { setConfig } = require("../config");
const { getI18n } = require("../messages");

const modes = ["text", "image"];

module.exports = {
  aliases: ["mode"],
  args: ["mode"],
  description: "HELP.MODE",
  run: async (client, guild, message, args) => {
    const l = getI18n(guild.config.lang);

    if (!args[0]) {
      return message.channel.send(
        l.__("MODE.AVAILABLE", { modes: modes.join(", ") })
      );
    }

    const mode = args[0].toLowerCase();
    if (modes.indexOf(mode) < 0) {
      return message.channel.send(
        l.__("MODE.NOT_SUPPORTED", { modes: modes.join(", ") })
      );
    }

    guild.config.mode = mode;
    if (!(await setConfig(guild))) {
      message.channel.send(l.__("CONFIG_NOT_SET"));
    }

    message.channel.send(l.__("MODE.SET", { mode }));
  }
};
