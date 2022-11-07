const { InteractionType } = require("discord-api-types/v10");
const { String } = require("discord-api-types/v10").ApplicationCommandOptionType;
const { getLocale } = require("../../../helpers/locale");
const { removeTrack, TRACK_TYPE } = require("../../../services/track");

const t = getLocale().t;

const options = [
  {
    name: "player",
    description: t("TRACK.PLAYERS.DESCRIPTION"),
    type: String,
  },
  {
    name: "guild",
    description: t("TRACK.GUILDS.DESCRIPTION"),
    type: String,
  },
  {
    name: "alliance",
    description: t("TRACK.ALLIANCES.DESCRIPTION"),
    type: String,
  },
];

const command = {
  name: "untrack",
  description: t("HELP.UNTRACK"),
  type: InteractionType.Ping,
  default_member_permissions: "0",
  options,
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
