const { InteractionType } = require("discord-api-types/v10");
const { String } = require("discord-api-types/v10").ApplicationCommandOptionType;
const { getLocale } = require("../../../helpers/locale");
const { getNumber } = require("../../../helpers/utils");
const { getAlliance, search } = require("../../../services/search");
const { setSettings } = require("../../../services/settings");

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
  handle: async (interaction, settings) => {
    const t = getLocale(settings.lang).t;

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

    const track = async (type, value, limit = 5) => {
      if (limit == 0) {
        const trackType = t(`TRACK.${type.toUpperCase()}.DESCRIPTION`).toLowerCase();
        return addContent(t("TRACK.TRACKING_DISABLED", { type: trackType }));
      }

      if (!settings.track) settings.track = {};
      if (!settings.track[type]) settings.track[type] = [];

      if (settings.track[type].length >= limit) return addContent(t("TRACK.LIMIT_REACHED", { limit }));

      if (type == "alliances") {
        if (settings.track.alliances.some((a) => a.id === value)) return addContent(t("TRACK.ALREADY_TRACKED"));

        const alliance = await getAlliance(value);
        if (!alliance) return addContent(t("TRACK.NOT_FOUND"));

        settings.track.alliances.push({
          id: alliance.AllianceId,
          name: alliance.AllianceTag,
        });

        await setSettings(interaction.guild.id, settings);
        return addContent(t("TRACK.ALLIANCES.TRACKED", { name: alliance.AllianceTag }));
      } else {
        const equalsCaseInsensitive = (a, b) => a && a.localeCompare(b, undefined, { sensitivity: "base" }) === 0;

        if (settings.track[type].some((trackEntity) => equalsCaseInsensitive(trackEntity.name, value)))
          return addContent(t("TRACK.ALREADY_TRACKED"));

        const searchResults = await search(value);
        if (!searchResults) return addContent(t("TRACK.SEARCH_FAILED"));

        const entity = searchResults[type].find((searchEntity) => equalsCaseInsensitive(searchEntity.name, value));
        if (!entity) return addContent(t("TRACK.NOT_FOUND"));

        settings.track[type].push({
          id: entity.id,
          name: entity.name,
        });

        await setSettings(interaction.guild.id, settings);
        return addContent(t(`TRACK.${type.toUpperCase()}.TRACKED`, { name: entity.name }));
      }
    };

    if (allianceId) await track("alliances", allianceId, getNumber(process.env.MAX_ALLIANCES, 1));
    if (playerName) await track("players", playerName, getNumber(process.env.MAX_PLAYERS, 30));
    if (guildName) await track("guilds", guildName, getNumber(process.env.MAX_GUILDS, 5));

    return await interaction.editReply({ content, ephemeral: true });
  },
};

module.exports = command;
