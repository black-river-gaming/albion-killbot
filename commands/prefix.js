const { setConfig } = require("../config");
const { getI18n } = require("../messages");

module.exports = {
  aliases: ["prefix"],
  args: ["prefix"],
  description: "HELP.PREFIX",
  run: async (client, guild, message, args) => {
    const l = getI18n(guild.config.lang);

    const prefix = args[0].toLowerCase();
    guild.config.prefix = prefix;
    if (!(await setConfig(guild))) {
      await message.channel.send(l.__("CONFIG_NOT_SET"));
    }

    await message.channel.send(l.__("PREFIX.SET_PREFIX", { prefix }));
  },
};
