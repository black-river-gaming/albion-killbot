const { setConfig } = require("../config");
const { getI18n } = require("../messages");

module.exports = {
  aliases: ["channel"],
  args: ["channel"],
  description: "HELP.CHANNEL",
  run: async (client, guild, message) => {
    const l = getI18n(guild);

    if (!message.mentions.channels || !message.mentions.channels.first()) {
      message.channel.send(l.__("CHANNEL.NO_CHANNEL"));
      return;
    }
    const channel = message.mentions.channels.first();

    guild.config.channel = channel.id;
    if (!(await setConfig(guild))) {
      message.channel.send(l.__("CONFIG_NOT_SET"));
    }

    message.channel.send(l.__("CHANNEL.SET_CHANNEL", { channel: channel }));
  }
};
