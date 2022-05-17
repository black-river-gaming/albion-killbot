const path = require("node:path");
const i18n = require("i18n");

const LOCALE_DIR = path.join(__dirname, "..", "assets", "locales");

function getLocale(locale = "en") {
  const l = {};

  i18n.configure({
    defaultLocale: "en",
    directory: LOCALE_DIR,
    objectNotation: true,
    retryInDefaultLocale: true,
    api: {
      __: "t",
      __n: "tn",
    },
    register: l,
  });

  l.setLocale(locale);
  return l;
}

module.exports = {
  getLocale,
};
