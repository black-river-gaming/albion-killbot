const { SlashCommandBuilder } = require("discord.js");
const { SERVERS } = require("../../../helpers/constants");
const { getLocale } = require("../../../helpers/locale");
const { getTrackedItem } = require("../../../helpers/tracking");
const { removeTrack, TRACK_TYPE } = require("../../../services/track");

const { t } = getLocale();

const command = {
  data: new SlashCommandBuilder()
    .setName("untrack")
    .setDescription(t("HELP.UNTRACK"))
    .setDefaultMemberPermissions("0")
    .addStringOption((option) =>
      option.setName("server").setDescription(t("TRACK.ALLIANCES.DESCRIPTION")).setRequired(true).setChoices(
        {
          name: SERVERS.WEST,
          value: SERVERS.WEST,
        },
        {
          name: SERVERS.EAST,
          value: SERVERS.EAST,
        },
      ),
    )
    .addStringOption((option) => option.setName("player").setDescription(t("TRACK.PLAYERS.DESCRIPTION")))
    .addStringOption((option) => option.setName("guild").setDescription(t("TRACK.GUILDS.DESCRIPTION")))
    .addStringOption((option) => option.setName("alliance").setDescription(t("TRACK.ALLIANCES.DESCRIPTION"))),
  handle: async (interaction, { track, t }) => {
    if (!track) throw new Error(t("TRACK.ERRORS.FETCH_FAILED"));

    const server = interaction.options.getString("server");
    const playerName = interaction.options.getString("player");
    const guildName = interaction.options.getString("guild");
    const allianceName = interaction.options.getString("alliance");

    if (!server || (!playerName && !guildName && !allianceName)) {
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

    const findAndRemove = async (type, name) => {
      const trackedItem = getTrackedItem({ name, server }, track[type]);

      if (!trackedItem) return addContent(t("TRACK.NOT_FOUND"));
      await removeTrack(interaction.guild.id, type, trackedItem);

      return addContent(t(`TRACK.${type.toUpperCase()}.UNTRACKED`, { name: trackedItem.name }));
    };

    if (allianceName) await findAndRemove(TRACK_TYPE.ALLIANCES, allianceName);
    if (playerName) await findAndRemove(TRACK_TYPE.PLAYERS, playerName);
    if (guildName) await findAndRemove(TRACK_TYPE.GUILDS, guildName);

    return await interaction.editReply({ content, ephemeral: true });
  },
};

module.exports = command;
