const { setConfig } = require("../config");
const { getI18n } = require("../messages");

module.exports = {
  aliases: ["channel"],
  args: ["channel"],
  description: "HELP.CHANNEL",
  run: async (client, guild, message) => {
    const l = getI18n(guild.config.lang);

    if (!message.mentions.channels || !message.mentions.channels.first()) {
      message.channel.send(l.__("CHANNEL.NO_CHANNEL"));
      return;
    }
    const channel = message.mentions.channels.first();

    if (channel.type !== "text") {
      message.channel.send(l.__("CHANNEL.NOT_FOUND"));
      return;
    }

    // Check if client can see channel
    if (!client.channels.some(c => c.id === channel.id)) {
      message.channel.send(l.__("CHANNEL.NOT_FOUND"));
      return;
    }

    guild.config.channel = channel.id;
    if (!(await setConfig(guild))) {
      message.channel.send(l.__("CONFIG_NOT_SET"));
    }

    message.channel.send(l.__("CHANNEL.SET_CHANNEL", { channel: channel }));
  },
};
