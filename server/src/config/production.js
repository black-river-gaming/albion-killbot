const { getBool } = require("../helpers/utils");

module.exports = {
  features: {
    events: {
      useHistoryPrices: getBool(process.env.FEATURE_USE_HISTORY_PRICES, true),
    },
  },
};
