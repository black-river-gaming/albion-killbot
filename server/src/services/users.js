const discord = require("../ports/discord");

async function getCurrentUser(accessToken) {
  return await discord.getCurrentUser(accessToken);
}

async function getUser(userId) {
  return await discord.getUser(userId);
}

module.exports = {
  getCurrentUser,
  getUser,
};
