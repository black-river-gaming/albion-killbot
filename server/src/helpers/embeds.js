const moment = require("moment");
const { SERVER_LIST } = require("./constants");
const { getLocale } = require("./locale");
const { digitsFormatter, humanFormatter, printSpace } = require("./utils");

// TODO: Give users the ability to choose these
const KILL_URL = "https://albiononline.com/{lang}/killboard/kill/{kill}";
const BATTLE_URL = "https://albiononline.com/killboard/battles/{battle}";
const GUILD_RANKING_URL = "https://albiononline.com/pt/killboard/guild/{guild}";

const GREEN = 52224;
const RED = 13369344;
const GOLD = 0x89710f;
const BATTLE = 16752981;
const RANKING_LINE_LENGTH = 23;

const COLORS = {
  GREY: 0xdcdfdf,
  LIGHT_GREEN: 0x57ad65,
  LIGHT_RED: 0xed4f4f,
};

const MAXLEN = {
  TITLE: 256,
  DESCRIPTION: 2048,
  FIELD: {
    NAME: 256,
    VALUE: 1024,
    COUNT: 25,
  },
  FOOTER: 2048,
  AUTHOR: 256,
};

const footer = {
  text: "Powered by Albion Killbot",
};

const embedEvent = (event, { lootValue, locale, guildTags = true }) => {
  const l = getLocale(locale);
  const { t } = l;

  const lootSum = lootValue ? lootValue.equipment + lootValue.inventory : null;
  const good = event.good;

  let killer = "";
  if (guildTags && event.Killer.GuildName) {
    killer += `[${event.Killer.GuildName}] `;
  }
  killer += event.Killer.Name;

  let victim = "";
  if (guildTags && event.Victim.GuildName) {
    victim += `[${event.Victim.GuildName}] `;
  }
  victim += event.Victim.Name;

  const title = t(good ? "KILL.GOOD_TITLE" : "KILL.BAD_TITLE", {
    killer,
    victim,
  });

  let description;
  if (event.numberOfParticipants === 1) {
    description = t(`KILL.SOLO_${Math.floor(Math.random() * 6)}`);
  } else {
    const totalDamage = event.Participants.reduce((sum, participant) => {
      return sum + participant.DamageDone;
    }, 0);
    const assist = [];
    event.Participants.forEach((participant) => {
      // Self-damage isn't assist :P
      if (participant.Name === event.Victim.Name) {
        return;
      }
      const damagePercent = Math.round((participant.DamageDone / Math.max(1, totalDamage)) * 100);
      assist.push(`${participant.Name} (${damagePercent}%)`);
    });

    if (assist.length > 0) {
      description = t("KILL.ASSIST", { assists: assist.join(" / ") });
    }
  }

  let killerGuildValue;
  if (event.Killer.GuildName) {
    killerGuildValue = event.Killer.AllianceName ? `[${event.Killer.AllianceName}] ` : "";
    killerGuildValue += event.Killer.GuildName;
  }

  let victimGuildValue;
  if (event.Victim.GuildName) {
    victimGuildValue = event.Victim.AllianceName ? `[${event.Victim.AllianceName}] ` : "";
    victimGuildValue += event.Victim.GuildName;
  }

  return {
    embeds: [
      {
        color: good ? GREEN : RED,
        title,
        url: KILL_URL.replace("{lang}", l.getLocale()).replace("{kill}", event.EventId),
        description,
        thumbnail: {
          url: "https://user-images.githubusercontent.com/13356774/76129825-ee15b580-5fde-11ea-9f77-7ae16bd65368.png",
        },
        fields: [
          {
            name: t("KILL.FAME"),
            value: digitsFormatter(event.TotalVictimKillFame),
            inline: true,
          },
          {
            name: t("KILL.LOOT_VALUE"),
            value: digitsFormatter(lootSum) || "-",
            inline: true,
          },
          {
            name: "\u200B",
            value: "\u200B",
            inline: true,
          },
          {
            name: t("KILL.KILLER_GUILD"),
            value: killerGuildValue || t("KILL.NO_GUILD"),
            inline: true,
          },
          {
            name: t("KILL.VICTIM_GUILD"),
            value: victimGuildValue || t("KILL.NO_GUILD"),
            inline: true,
          },
          {
            name: "\u200B",
            value: "\u200B",
            inline: true,
          },
          {
            name: t("KILL.KILLER_IP"),
            value: `${Math.round(event.Killer.AverageItemPower)}`,
            inline: true,
          },
          {
            name: t("KILL.VICTIM_IP"),
            value: `${Math.round(event.Victim.AverageItemPower)}`,
            inline: true,
          },
          {
            name: "\u200B",
            value: "\u200B",
            inline: true,
          },
        ],
        timestamp: event.TimeStamp,
        footer,
      },
    ],
  };
};

const embedEventImage = (event, image, { locale, guildTags = true, addFooter }) => {
  const l = getLocale(locale);
  const { t } = l;

  const good = event.good;

  let killer = "";
  if (guildTags && event.Killer.GuildName) {
    killer += `[${event.Killer.GuildName}] `;
  }
  killer += event.Killer.Name;

  let victim = "";
  if (guildTags && event.Victim.GuildName) {
    victim += `[${event.Victim.GuildName}] `;
  }
  victim += event.Victim.Name;

  const title = t(good ? "KILL.GOOD_TITLE" : "KILL.BAD_TITLE", {
    killer,
    victim,
  });
  const filename = `${event.EventId}-event.png`;

  return {
    embeds: [
      {
        color: good ? GREEN : RED,
        title,
        url: KILL_URL.replace("{lang}", l.getLocale()).replace("{kill}", event.EventId),
        image: {
          url: `attachment://${filename}`,
        },
        timestamp: addFooter ? moment(event.TimeStamp).toISOString() : undefined,
        footer: addFooter ? footer : undefined,
      },
    ],
    files: [
      {
        attachment: image,
        name: filename,
      },
    ],
  };
};

const embedEventInventoryImage = (event, image, { locale }) => {
  const l = getLocale(locale);

  const good = event.good;
  const filename = `${event.EventId}-inventory.png`;

  return {
    embeds: [
      {
        color: good ? GREEN : RED,
        url: KILL_URL.replace("{lang}", l.getLocale()).replace("{kill}", event.EventId),
        image: {
          url: `attachment://${filename}`,
        },
        timestamp: moment(event.TimeStamp).toISOString(),
        footer,
      },
    ],
    files: [
      {
        attachment: image,
        name: filename,
      },
    ],
  };
};

const embedBattle = (battle, { locale }) => {
  const { t } = getLocale(locale);

  const guildCount = Object.keys(battle.guilds || {}).length;

  const duration = moment
    .duration(moment(battle.endTime) - moment(battle.startTime))
    .locale(locale || "en")
    .humanize();
  const description = t("BATTLE.DESCRIPTION", {
    players: Object.keys(battle.players || {}).length,
    kills: battle.totalKills,
    fame: digitsFormatter(battle.totalFame),
    duration,
  });

  const line = (item) => {
    return t("BATTLE.LINE", {
      name: item.name,
      total: item.total,
      kills: item.kills,
      deaths: item.deaths,
      fame: digitsFormatter(item.killFame),
    });
  };

  const fields = [];
  const players = Object.keys(battle.players).map((id) => battle.players[id]);
  Object.keys(battle.alliances).forEach((id) => {
    const alliance = battle.alliances[id];
    alliance.total = players.reduce((sum, player) => sum + Number(player.allianceId === alliance.id), 0);
    const name = line(alliance);

    let value = "";
    Object.values(battle.guilds)
      .filter((guild) => guild.allianceId === id)
      .forEach((guild) => {
        guild.total = players.reduce((sum, player) => sum + Number(player.guildId === guild.id), 0);
        value += line(guild);
        value += "\n";
      });

    fields.push({
      name,
      value: value.substr(0, MAXLEN.FIELD.VALUE),
    });
  });

  const guildsWithoutAlliance = Object.values(battle.guilds).filter((guild) => !guild.allianceId);
  const playersWithoutGuild = Object.values(battle.players).filter((player) => !player.guildId);
  if (guildsWithoutAlliance.length > 0 || playersWithoutGuild.length > 0) {
    const name = t("BATTLE.NO_ALLIANCE");

    let value = "";
    guildsWithoutAlliance.forEach((guild) => {
      guild.total = players.reduce((sum, player) => sum + Number(player.guildId === guild.id), 0);
      value += line(guild);
      value += "\n";
    });

    if (playersWithoutGuild.length > 0) {
      const stats = {
        name: t("BATTLE.NO_GUILD"),
        total: 0,
        kills: 0,
        deaths: 0,
        killFame: 0,
      };
      playersWithoutGuild.forEach((player) => {
        stats.total += 1;
        stats.kills += player.kills;
        stats.deaths += player.deaths;
        stats.killFame += player.killFame;
      });
      value += line(stats);
      value += "\n";
    }

    fields.push({
      name,
      value: value.substr(0, MAXLEN.FIELD.VALUE),
    });
  }

  return {
    embeds: [
      {
        color: BATTLE,
        title: t("BATTLE.EVENT", { guilds: guildCount }),
        url: BATTLE_URL.replace("{battle}", battle.id),
        description,
        thumbnail: {
          url: "https://user-images.githubusercontent.com/13356774/76130049-b9eec480-5fdf-11ea-95c0-7de130a705a3.png",
        },
        fields: fields.slice(0, MAXLEN.FIELD.COUNT),
        timestamp: moment(battle.endTime).toISOString(),
        footer,
      },
    ],
  };
};

const embedGuildRanking = (guild, { locale }) => {
  const { t } = getLocale(locale);

  const generateRankFieldValue = (ranking, pvp = false) => {
    let value = "```c";
    if (!ranking || ranking.length === 0) {
      const nodata = t("RANKING.NO_DATA_SHORT");
      const count = RANKING_LINE_LENGTH - nodata.length;
      value += `\n${nodata}${printSpace(count)}`;
      value += "```";
      return value;
    }
    ranking.forEach((item) => {
      if (pvp) {
        const fameValue = humanFormatter(item.KillFame, 2);
        const count = RANKING_LINE_LENGTH - fameValue.length - item.Name.length;
        value += `\n${item.Name}${printSpace(count)}${fameValue}`;
      } else {
        const fameValue = humanFormatter(item.Fame, 2);
        const count = RANKING_LINE_LENGTH - fameValue.length - item.Player.Name.length;
        value += `\n${item.Player.Name}${printSpace(count)}${fameValue}`;
      }
    });
    value += "```";
    return value;
  };

  const ranking = {
    title: t("RANKING.MONTHLY", { guild: guild.Name }),
    description: t("RANKING.GUILD_RANKING_DESCRIPTION", {
      killFame: digitsFormatter(guild.killFame) || "-",
      deathFame: digitsFormatter(guild.DeathFame) || "-",
    }),
    color: GOLD,
    thumbnail: {
      url: "https://user-images.githubusercontent.com/13356774/76129834-f53cc380-5fde-11ea-8c88-daa9872c2d72.png",
    },
    fields: [],
    timestamp: moment(guild.updatedAt).toISOString(),
    footer,
    url: GUILD_RANKING_URL.replace("{guild}", guild.Id),
  };

  if (guild.rankings) {
    if (guild.rankings.pve) {
      ranking.fields.push({
        name: t("RANKING.PVE"),
        value: generateRankFieldValue(guild.rankings.pve),
        inline: true,
      });
    }

    if (guild.rankings.pvp) {
      ranking.fields.push({
        name: t("RANKING.PVP"),
        value: generateRankFieldValue(guild.rankings.pvp, true),
        inline: true,
      });
    }

    if (ranking.fields.length === 2) {
      ranking.fields.push({
        name: "\u200B",
        value: "\u200B",
        inline: false,
      });
    }

    if (guild.rankings.gathering) {
      ranking.fields.push({
        name: t("RANKING.GATHERING"),
        value: generateRankFieldValue(guild.rankings.gathering),
        inline: true,
      });
    }

    if (guild.rankings.crafting) {
      ranking.fields.push({
        name: t("RANKING.CRAFTING"),
        value: generateRankFieldValue(guild.rankings.crafting),
        inline: true,
      });
    }
  }

  return {
    embeds: [ranking],
  };
};

const embedTrackList = (track, limits, { locale }) => {
  const { t } = getLocale(locale);

  const printTrackList = (server, list, limit) => {
    if (!list || !Array.isArray(list)) return t("TRACK.NONE");

    list = list.filter((item) => item.server === server);
    if (list.length === 0) return t("TRACK.NONE");

    let value = "";

    list.forEach((item, i) => {
      if (i >= limit) value += `\n~~${item.name}~~`;
      else value += `\n${item.name}`;
    });

    return value;
  };

  return {
    embeds: [
      {
        color: COLORS.GREY,
        title: t("TRACK.PLAYERS.TITLE", { actual: track.players.length, max: limits.players }),
        fields: SERVER_LIST.map((server) => ({
          name: server,
          value: printTrackList(server, track.players, limits.players),
          inline: true,
        })),
      },
      {
        color: COLORS.LIGHT_GREEN,
        title: t("TRACK.GUILDS.TITLE", { actual: track.guilds.length, max: limits.guilds }),
        fields: SERVER_LIST.map((server) => ({
          name: server,
          value: printTrackList(server, track.guilds, limits.guilds),
          inline: true,
        })),
      },
      {
        color: COLORS.LIGHT_RED,
        title: t("TRACK.ALLIANCES.TITLE", { actual: track.alliances.length, max: limits.alliances }),
        fields: SERVER_LIST.map((server) => ({
          name: server,
          value: printTrackList(server, track.alliances, limits.alliances),
          inline: true,
        })),
      },
    ],
  };
};

const embedPvpRanking = (rankings, { locale }) => {
  const { t } = getLocale(locale);

  const generateRankFieldValue = (ranking, name = "name", number = "fame") => {
    let value = "```c";
    if (ranking.length === 0) {
      const nodata = t("RANKING.NO_DATA_SHORT");
      const count = RANKING_LINE_LENGTH - nodata.length;
      value += `\n${nodata}${printSpace(count)}`;
    }
    ranking.forEach((item) => {
      const nameValue = item[name];
      const numberValue = humanFormatter(item[number], 2);
      const count = RANKING_LINE_LENGTH - numberValue.length - nameValue.length;
      value += `\n${nameValue}${printSpace(count)}${numberValue}`;
    });
    value += "```";
    return value;
  };

  return {
    embeds: [
      {
        title: t("RANKING.DAILY"),
        thumbnail: {
          url: "https://user-images.githubusercontent.com/13356774/76129834-f53cc380-5fde-11ea-8c88-daa9872c2d72.png",
        },
        fields: [
          {
            name: t("RANKING.TOTAL_KILL_FAME"),
            value: digitsFormatter(rankings.totalKillFame),
            inline: true,
          },
          {
            name: t("RANKING.TOTAL_DEATH_FAME"),
            value: digitsFormatter(rankings.totalDeathFame),
            inline: true,
          },
          {
            name: "\u200B",
            value: "\u200B",
            inline: false,
          },
          {
            name: t("RANKING.KILL_FAME"),
            value: generateRankFieldValue(rankings.killRanking, "name", "killFame"),
            inline: true,
          },
          {
            name: t("RANKING.DEATH_FAME"),
            value: generateRankFieldValue(rankings.deathRanking, "name", "deathFame"),
            inline: true,
          },
        ],
        footer,
      },
    ],
  };
};

module.exports = {
  embedBattle,
  embedEvent,
  embedEventImage,
  embedEventInventoryImage,
  embedGuildRanking,
  embedPvpRanking,
  embedTrackList,
};
