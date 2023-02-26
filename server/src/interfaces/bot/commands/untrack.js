const { SlashCommandBuilder } = require("discord.js");
const { getLocale } = require("../../../helpers/locale");
const { removeTrack, TRACK_TYPE } = require("../../../services/track");

const t = getLocale().t;

const command = {
  data: new SlashCommandBuilder()
    .setName("untrack")
    .setDescription(t("HELP.UNTRACK"))
    .setDefaultMemberPermissions("0")
    .addStringOption((option) => option.setName("player").setDescription(t("TRACK.PLAYERS.DESCRIPTION")))
    .addStringOption((option) => option.setName("guild").setDescription(t("TRACK.GUILDS.DESCRIPTION")))
    .addStringOption((option) => option.setName("alliance").setDescription(t("TRACK.ALLIANCES.DESCRIPTION"))),
  handle: async (interaction, { track, t }) => {
    const playerName = interaction.options.getString("player");
    const guildName = interaction.options.getString("guild");
    const allianceName = interaction.options.getString("alliance");

    if (!playerName && !guildName && !allianceName) {
      return await interaction.reply({
        content: t("TRACK.MISSING_PARAMETERS"),
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    let content = ``;
    const addContent = (msg) => {
      content += msg + "\n";
    };

    const untrack = async (type, name) => {
      const equalsCaseInsensitive = (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }) === 0;
      const trackedEntity = track[type].find((t) => equalsCaseInsensitive(t.name, name));

      if (!trackedEntity) return addContent(t("TRACK.NOT_FOUND"));
      await removeTrack(interaction.guild.id, type, trackedEntity);

      return addContent(t(`TRACK.${type.toUpperCase()}.UNTRACKED`, { name: trackedEntity.name }));
    };

    if (allianceName) await untrack(TRACK_TYPE.ALLIANCES, allianceName);
    if (playerName) await untrack(TRACK_TYPE.PLAYERS, playerName);
    if (guildName) await untrack(TRACK_TYPE.GUILDS, guildName);

    return await interaction.editReply({ content, ephemeral: true });
  },
};

module.exports = command;
