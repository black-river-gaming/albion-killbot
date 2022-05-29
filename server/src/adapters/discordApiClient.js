const axios = require("axios");
const logger = require("../helpers/logger");

const TOKEN_ENDPOINT = "/oauth2/token";
const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URL } = process.env;

const discordApiClient = axios.create({
  baseURL: "https://discord.com/api/v10",
});

async function exchangeCode(code) {
  try {
    const params = new URLSearchParams();
    params.append("client_id", DISCORD_CLIENT_ID);
    params.append("client_secret", DISCORD_CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", DISCORD_REDIRECT_URL);

    const res = await discordApiClient.post(TOKEN_ENDPOINT, params);
    return res.data;
  } catch (e) {
    logger.error(`Error while retrieving discord token:`, e);
    throw e;
  }
}

async function refreshToken(refreshToken) {
  try {
    const params = new URLSearchParams();
    params.append("client_id", DISCORD_CLIENT_ID);
    params.append("client_secret", DISCORD_CLIENT_SECRET);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    const res = await discordApiClient.post(TOKEN_ENDPOINT, params);
    return res.data;
  } catch (e) {
    logger.error(`Error while refreshing discord token:`, e);
    throw e;
  }
}

module.exports = {
  exchangeCode,
  refreshToken,
};
