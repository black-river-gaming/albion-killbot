const { InteractionType } = require("discord-api-types/v10");
const { String } = require("discord-api-types/v10").ApplicationCommandOptionType;
const { getLocale } = require("../../../helpers/locale");
const { getAlliance, search } = require("../../../services/search");
const { getLimits, setTrack } = require("../../../services/track");

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
  name: "track",
  description: t("HELP.TRACK"),
  type: InteractionType.Ping,
  default_member_permissions: "0",
  options,
  handle: async (interaction, { track, t }) => {
    const limits = await getLimits(interaction.guild.id);

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

    const addTrack = async (type, value, limit = 5) => {
      if (limit == 0) {
        const trackType = t(`TRACK.${type.toUpperCase()}.DESCRIPTION`).toLowerCase();
        return addContent(t("TRACK.TRACKING_DISABLED", { type: trackType }));
      }

      if (!track) track = {};
      if (!track[type]) track[type] = [];

      if (track[type].length >= limit) return addContent(t("TRACK.LIMIT_REACHED", { limit }));

      if (type == "alliances") {
        if (track.alliances.some((a) => a.id === value)) return addContent(t("TRACK.ALREADY_TRACKED"));

        const alliance = await getAlliance(value);
        if (!alliance) return addContent(t("TRACK.NOT_FOUND"));

        track.alliances.push(alliance);

        await setTrack(interaction.guild.id, track);
        return addContent(t("TRACK.ALLIANCES.TRACKED", { name: alliance.name }));
      } else {
        const equalsCaseInsensitive = (a, b) => a && a.localeCompare(b, undefined, { sensitivity: "base" }) === 0;

        if (track[type].some((trackEntity) => equalsCaseInsensitive(trackEntity.name, value)))
          return addContent(t("TRACK.ALREADY_TRACKED"));

        const searchResults = await search(value);
        if (!searchResults) return addContent(t("TRACK.SEARCH_FAILED"));

        const entity = searchResults[type].find((searchEntity) => equalsCaseInsensitive(searchEntity.name, value));
        if (!entity) return addContent(t("TRACK.NOT_FOUND"));

        track[type].push(entity);

        await setTrack(interaction.guild.id, track);
        return addContent(t(`TRACK.${type.toUpperCase()}.TRACKED`, { name: entity.name }));
      }
    };

    if (allianceId) await addTrack("alliances", allianceId, limits.alliances);
    if (playerName) await addTrack("players", playerName, limits.players);
    if (guildName) await addTrack("guilds", guildName, limits.guilds);

    return await interaction.editReply({ content, ephemeral: true });
  },
};

module.exports = command;
