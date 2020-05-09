const { getI18n } = require("../messages");

module.exports = {
  aliases: ["test"],
  description: "HELP.TEST",
  run: async (client, guild, message) => {
    const l = getI18n(guild.config.lang);

    if (!guild.config.channel) {
      message.channel.send(l.__("CHANNEL_NOT_SET"));
    } else {
      try {
        const channel = client.channels.find(
          c => c.id === guild.config.channel
        );
        await channel.send(l.__("TEST_MSG", { channel }));
      } catch (e) {
        message.channel.send(l.__("TEST_FAIL"));
      }
    }
  }
};
