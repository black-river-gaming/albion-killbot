const { readdirSync } = require("fs");
const path = require("path");
const { setConfig } = require("../config");
const { getI18n } = require("../messages");

const langs = [];
const langFiles = readdirSync(path.join(__dirname, "..", "locales"));
langFiles.forEach((langFile) => {
  langs.push(path.parse(langFile).name);
});

module.exports = {
  aliases: ["language", "lang"],
  args: ["language"],
  description: "HELP.LANGUAGE",
  run: async (client, guild, message, args) => {
    const l = getI18n(guild.config.lang);

    if (!args[0]) {
      return message.channel.send(l.__("LANGUAGE.AVAILABLE", { langs: langs.join(", ") }));
    }

    const lang = args[0].toLowerCase();
    if (langs.indexOf(lang) < 0) {
      return message.channel.send(l.__("LANGUAGE.NOT_SUPPORTED"));
    }

    guild.config.lang = lang;
    l.setLocale(lang);
    if (!(await setConfig(guild))) {
      message.channel.send(l.__("CONFIG_NOT_SET"));
    }

    await message.channel.send(l.__("LANGUAGE.SET_LANGUAGE", { lang }));
  },
};
