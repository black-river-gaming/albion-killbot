const { categories, setConfig } = require("../config");
const { getI18n } = require("../messages");

const options = ["on", "off", "enable", "disable"];
const enabled = [options[0], options[2]];

module.exports = {
  aliases: ["category"],
  args: ["category", "on/off"],
  description: "HELP.CATEGORY",
  run: async (client, guild, message, args) => {
    const l = getI18n(guild.config.lang);

    if (!guild.config.categories) {
      guild.config.categories = {};
    }

    if (!args[0] || !args[1]) {
      return message.channel.send(l.__("CATEGORY.MISSING_PARAMETERS"));
    }

    // Validate category
    const category = args[0].toLowerCase();
    if (categories.indexOf(category) < 0) {
      return message.channel.send(l.__("CATEGORY.AVAILABLE", { categories: categories.join(", ") }));
    }

    let option = args[1].toLowerCase();
    if (options.indexOf(option) < 0) {
      return message.channel.send(l.__("CATEGORY.OPTIONS", { options: options.join("/") }));
    }
    option = enabled.includes(option);

    guild.config.categories[category] = option;
    if (!(await setConfig(guild))) {
      message.channel.send(l.__("CONFIG_NOT_SET"));
    }

    option = option ? l.__("GENERAL.ENABLED") : l.__("GENERAL.DISABLED");
    message.channel.send(l.__("CATEGORY.SET", { category, option }));
  },
};
