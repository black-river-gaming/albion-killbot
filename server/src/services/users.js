const discord = require("../ports/discord");

async function getCurrentUser(accessToken) {
  return await discord.getUser(accessToken);
}

module.exports = {
  getCurrentUser,
};
