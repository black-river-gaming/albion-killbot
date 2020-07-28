const { embedList } = require("../messages");
const { getI18n } = require("../messages");

module.exports = {
  aliases: ["list"],
  description: "HELP.LIST",
  run: async (client, guild, message) => {
    const l = getI18n(guild.config.lang);
    message.channel.send(embedList(guild.config));

    if (!guild.config.channel) {
      message.channel.send(l.__("CHANNEL_NOT_SET"));
    }
  },
};
