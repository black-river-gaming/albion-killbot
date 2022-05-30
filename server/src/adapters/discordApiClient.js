const axios = require("axios");

const TOKEN_ENDPOINT = "/oauth2/token";
const USERS_ENDPOINT = "/users";

const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URL } = process.env;

const discordApiClient = axios.create({
  baseURL: "https://discord.com/api/v10",
});

async function exchangeCode(code) {
  const params = new URLSearchParams();
  params.append("client_id", DISCORD_CLIENT_ID);
  params.append("client_secret", DISCORD_CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", DISCORD_REDIRECT_URL);

  const res = await discordApiClient.post(TOKEN_ENDPOINT, params);
  return res.data;
}

async function refreshToken(refreshToken) {
  const params = new URLSearchParams();
  params.append("client_id", DISCORD_CLIENT_ID);
  params.append("client_secret", DISCORD_CLIENT_SECRET);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const res = await discordApiClient.post(TOKEN_ENDPOINT, params);
  return res.data;
}

async function getMe(Authorization) {
  const res = await discordApiClient.get(`${USERS_ENDPOINT}/@me`, {
    headers: {
      Authorization,
    },
  });
  return res.data;
}

async function getMeGuilds(Authorization) {
  const res = await discordApiClient.get(`${USERS_ENDPOINT}/@me/guilds`, {
    headers: {
      Authorization,
    },
  });
  return res.data;
}

module.exports = {
  exchangeCode,
  refreshToken,
  getMe,
  getMeGuilds,
};
