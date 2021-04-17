const { getI18n } = require("../messages");

module.exports = {
  aliases: ["test"],
  description: "HELP.TEST",
  run: async (client, guild, message) => {
    const l = getI18n(guild.config.lang);

    if (!guild.config.channel || typeof guild.config.channel === "string") {
      guild.config.channel = {};
    }

    if (Object.keys(guild.config.channel).length === 0) {
      message.channel.send(l.__("CHANNEL_NOT_SET"));
    } else {
      const categories = Object.keys(guild.config.channel);
      if (categories.length === 0) return message.channel.send(l.__("CHANNEL_NOT_SET"));
      for (let category of categories) {
        const channel = client.channels.cache.find((c) => c.id === guild.config.channel[category]);
        try {
          await channel.send(l.__("TEST_MSG", { channel: `${channel}` }));
        } catch (e) {
          await message.channel.send(l.__("TEST_FAIL", { channel: `${channel}` }));
        }
      }
    }
  },
};
