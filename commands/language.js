const { setConfig } = require("../config");
const { getI18n } = require("../messages");

// TODO: Supported languages from locales folder
const SUPPORTED_LANGS = ["en", "pt"];

module.exports = {
  aliases: ["language", "lang"],
  args: ["language"],
  description: "HELP.LANGUAGE",
  run: async (client, guild, message, args) => {
    const l = getI18n(guild);

    const lang = (args[0] || "").toLowerCase();
    if (SUPPORTED_LANGS.indexOf(lang) < 0) {
      message.channel.send(l.__("LANGUAGE.NOT_SUPPORTED"));
      return;
    }

    guild.config.lang = lang;
    l.setLocale(lang);
    if (!(await setConfig(guild))) {
      message.channel.send(l.__("CONFIG_NOT_SET"));
    }

    message.channel.send(l.__("LANGUAGE.SET_LANGUAGE", { lang }));
  }
};
