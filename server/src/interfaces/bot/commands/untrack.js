const { InteractionType } = require("discord-api-types/v10");
const { String } = require("discord-api-types/v10").ApplicationCommandOptionType;
const { getLocale } = require("../../../helpers/locale");
const { setTrack } = require("../../../services/track");

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
    const allianceId = interaction.options.getString("alliance");

    if (!playerName && !guildName && !allianceId) {
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

    const untrack = async (type, value) => {
      if (!track) track = {};
      if (!track[type]) track[type] = [];

      const equalsCaseInsensitive = (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }) === 0;
      const entity = track[type].find((trackEntity) => equalsCaseInsensitive(trackEntity.name, value));

      if (!entity) return addContent(t("TRACK.NOT_FOUND"));

      track[type] = track[type].filter((e) => e != entity);

      await setTrack(interaction.guild.id, track);
      return addContent(t(`TRACK.${type.toUpperCase()}.UNTRACKED`, { name: entity.name }));
    };

    if (allianceId) await untrack("alliances", allianceId);
    if (playerName) await untrack("players", playerName);
    if (guildName) await untrack("guilds", guildName);

    return await interaction.editReply({ content, ephemeral: true });
  },
};

module.exports = command;
