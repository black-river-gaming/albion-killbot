const { categories, setConfig } = require("../config");
const { getI18n } = require("../messages");

module.exports = {
  aliases: ["channel"],
  args: ["channel", "category"],
  description: "HELP.CHANNEL",
  run: async (client, guild, message, args) => {
    const l = getI18n(guild.config.lang);

    if (!guild.config.channel || typeof guild.config.channel === "string") {
      guild.config.channel = {};
    }

    // Show current settings if no args are given
    if (!args[0] && !args[1]) {
      const categories = Object.keys(guild.config.channel);
      if (categories.length === 0) return message.channel.send(l.__("CHANNEL_NOT_SET"));
      for (let category of categories) {
        const channel = client.channels.cache.find(c => c.id === guild.config.channel[category]);
        await message.channel.send(l.__("CHANNEL.SET_CHANNEL", { category, channel: `${channel}` }));
      }
      return;
    }

    // Validate mentioned channel first
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
    if (!client.channels.cache.some(c => c.id === channel.id)) {
      message.channel.send(l.__("CHANNEL.NOT_FOUND"));
      return;
    }

    // Validate category
    const category = (args[1] || "general").toLowerCase();
    if (categories.indexOf(category) < 0) {
      return message.channel.send(l.__("CHANNEL.CATEGORIES_AVAILABLE", { categories: categories.join(", ") }));
    }

    guild.config.channel[category] = channel.id;
    if (!(await setConfig(guild))) {
      message.channel.send(l.__("CONFIG_NOT_SET"));
    }

    message.channel.send(l.__("CHANNEL.SET_CHANNEL", { category, channel: `${channel}` }));
  },
};
