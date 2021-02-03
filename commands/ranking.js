const { getGuildData } = require("../queries/guilds");
const { getI18n, embedRankings } = require("../messages");

module.exports = {
  aliases: ["ranking"],
  description: "HELP.RANKING",
  run: async (client, guild, message) => {
    const l = getI18n(guild.config.lang);

    const allGuildData = await getGuildData({
      [guild.id]: guild.config,
    });

    for (const trackedGuild of guild.config.trackedGuilds) {
      const guildData = allGuildData[trackedGuild.id];
      if (!guildData || !guildData.rankings) {
        await message.channel.send(l.__("RANKING.NO_DATA", { guild: trackedGuild.name }));
        continue;
      }
      await message.channel.send(embedRankings(guildData, guild.config.lang));
    }
  },
};
