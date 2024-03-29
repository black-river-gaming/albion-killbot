const { getBool } = require("../helpers/utils");

module.exports = {
  features: {
    events: {
      displayTraitIcons: getBool(process.env.DISPLAY_TRAIT_ICONS, true),
      useHistoryPrices: getBool(process.env.FEATURE_USE_HISTORY_PRICES, true),
    },
  },
};
