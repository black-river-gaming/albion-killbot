const axios = require("axios");
const logger = require("../../helpers/logger");
const { sleep } = require("../../helpers/scheduler");

const TOKEN_ENDPOINT = "/oauth2/token";
const USERS_ENDPOINT = "/users";
const GUILDS_ENDPOINT = "/guilds";

const { DASHBOARD_URL, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } = process.env;

const discordApiClient = axios.create({
  baseURL: "https://discord.com/api/v10",
});

// Handle Discord 429: Too Many Requests
discordApiClient.interceptors.response.use(null, async (error) => {
  const { config, response } = error;

  if (config && response && response.status == 429) {
    let retryAfter = 5000;
    if (response.data) retryAfter = response.data.retry_after || retryAfter;
    if (response.headers) retryAfter = response.headers["retry-after"] || retryAfter;
    logger.warn(`Discord API request to ${config.url} returned ${response.status}. Retrying in ${retryAfter}s...`, {
      response: {
        headers: response.headers,
        data: response.data,
      },
      retryAfter,
    });
    await sleep(retryAfter * 1000);
    return discordApiClient.request(config);
  }

  return Promise.reject(error);
});

async function exchangeCode(code) {
  const params = new URLSearchParams();
  params.append("client_id", DISCORD_CLIENT_ID);
  params.append("client_secret", DISCORD_CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", `${DASHBOARD_URL}/auth`);

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

// Users
async function getCurrentUser(Authorization) {
  const res = await discordApiClient.get(`${USERS_ENDPOINT}/@me`, {
    headers: {
      Authorization,
    },
  });
  return res.data;
}

async function getCurrentUserGuilds(Authorization, params) {
  const res = await discordApiClient.get(`${USERS_ENDPOINT}/@me/guilds`, {
    headers: {
      Authorization,
    },
    params,
  });
  return res.data;
}

async function leaveGuild(Authorization, guildId) {
  const res = await discordApiClient.delete(`${USERS_ENDPOINT}/@me/guilds/${guildId}`, {
    headers: {
      Authorization,
    },
  });
  return res.data;
}

// Guilds
async function getGuild(Authorization, guildId) {
  const res = await discordApiClient.get(`${GUILDS_ENDPOINT}/${guildId}`, {
    headers: {
      Authorization,
    },
  });
  return res.data;
}

async function getGuildChannels(Authorization, guildId) {
  const res = await discordApiClient.get(`${GUILDS_ENDPOINT}/${guildId}/channels`, {
    headers: {
      Authorization,
    },
  });
  return res.data;
}

async function addGuildMemberRole(Authorization, { guildId, memberId, roleId, reason }) {
  const res = await discordApiClient.put(`/guilds/${guildId}/members/${memberId}/roles/${roleId}`, null, {
    headers: {
      Authorization,
      "X-Audit-Log-Reason": reason,
    },
  });
  return res.data;
}

async function removeGuildMemberRole(Authorization, { guildId, memberId, roleId, reason }) {
  const res = await discordApiClient.delete(`/guilds/${guildId}/members/${memberId}/roles/${roleId}`, {
    headers: {
      Authorization,
      "X-Audit-Log-Reason": reason,
    },
  });
  return res.data;
}

module.exports = {
  addGuildMemberRole,
  exchangeCode,
  getCurrentUser,
  getCurrentUserGuilds,
  getGuild,
  getGuildChannels,
  leaveGuild,
  refreshToken,
  removeGuildMemberRole,
};
