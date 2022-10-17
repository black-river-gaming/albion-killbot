const axios = require("axios");
const moment = require("moment");
const logger = require("../../helpers/logger");

const { PATREON_ACCESS_TOKEN } = process.env;

const patreonApiClient = axios.create({
  baseURL: "https://www.patreon.com/api/oauth2/v2",
  headers: {
    Authorization: `Bearer ${PATREON_ACCESS_TOKEN}`,
  },
  paramsSerializer: (params) =>
    Object.keys(params)
      .map((k) => `${encodeURI(k)}=${params[k]}`)
      .join("&"),
});

let campaigns, cacheExpires, pledges, users;
async function fetchPledges() {
  if (cacheExpires && cacheExpires.isAfter(moment())) {
    return {
      pledges,
      users,
    };
  }

  pledges = [];
  users = [];
  logger.verbose("Fetching patreon pledges...");

  try {
    campaigns = campaigns || (await patreonApiClient.get("/campaigns")).data.data;
    for (const campaign of campaigns) {
      let req = patreonApiClient.get(`/campaigns/${campaign.id}/members`, {
        params: {
          include: "user",
          ["fields[user]"]: "url,social_connections",
          ["fields[member]"]: "patron_status,next_charge_date",
          ["page[count]"]: 100,
        },
      });

      while (req) {
        const campaignPledges = (await req).data;

        pledges = pledges.concat(campaignPledges.data);
        users = users.concat(campaignPledges.included.filter((i) => i.type === "user"));

        req = null;
        if (campaignPledges.links) {
          req = patreonApiClient.get(campaignPledges.links.next);
        }
      }
    }
  } catch (e) {
    logger.error(`Failed to fetch pledge list:`, e);
    throw new Error("FETCH_FAIL");
  }

  logger.verbose(`Fetch complete. Pledge: ${pledges.length} / Users: ${users.length}`);
  cacheExpires = moment().add(12, "hours");

  return {
    pledges,
    users,
  };
}

module.exports = {
  fetchPledges,
};
