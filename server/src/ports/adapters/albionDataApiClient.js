const axios = require("axios");

const albionDataApiClient = axios.create({
  baseURL: "https://www.albion-online-data.com/api/v2/stats/",
});

async function getPrices(itemList, { locations, qualities }) {
  const res = await albionDataApiClient.get(`Prices/${itemList}.json`, {
    params: {
      locations,
      qualities,
    },
  });
  return res.data;
}

module.exports = {
  getPrices,
};
