const { embedList } = require("../messages");

module.exports = {
  aliases: ["list"],
  description: "HELP.LIST",
  run: async (client, guild, message) => {
    message.channel.send(embedList(guild.config));
  }
};
