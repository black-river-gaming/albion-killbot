const moment = require("moment");
const { getLocale } = require("../../../helpers/locale");
const { digitsFormatter, humanFormatter } = require("../../../helpers/utils");

const KILL_URL = "https://albiononline.com/{lang}/killboard/kill/{kill}";
const GREEN = 52224;
const RED = 13369344;
const BATTLE = 16752981;
const RANKING_LINE_LENGTH = 23;

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

const embedEvent = (event, { locale }) => {
  const l = getLocale(locale);
  const { t } = l;

  const good = event.good;
  const title = t("KILL.EVENT", {
    killer: event.Killer.Name,
    victim: event.Victim.Name,
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
            inline: false,
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
      },
    ],
  };
};

const embedEventImage = (event, image, { locale }) => {
  const l = getLocale(locale);
  const { t } = l;

  const good = event.good;
  const title = t("KILL.EVENT", {
    killer: event.Killer.Name,
    victim: event.Victim.Name,
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
        url: `http://www.yaga.sk/killboard/battle.php?id=${battle.id}`,
        description,
        thumbnail: {
          url: "https://user-images.githubusercontent.com/13356774/76130049-b9eec480-5fdf-11ea-95c0-7de130a705a3.png",
        },
        fields: fields.slice(0, MAXLEN.FIELD.COUNT),
        timestamp: moment(battle.endTime).toISOString(),
      },
    ],
  };
};

const embedRankings = (guild, { locale }) => {
  const { t } = getLocale(locale);

  const generateRankFieldValue = (ranking, pvp = false) => {
    let value = "```c";
    if (ranking.length === 0) {
      const nodata = t("RANKING.NO_DATA_SHORT");
      value += `\n${nodata}${" ".repeat(RANKING_LINE_LENGTH - nodata.length)}`;
    }
    ranking.forEach((item) => {
      if (pvp) {
        const fameValue = humanFormatter(item.KillFame, 2);
        value += `\n${item.Name}${" ".repeat(RANKING_LINE_LENGTH - fameValue.length - item.Name.length)}${fameValue}`;
      } else {
        const fameValue = humanFormatter(item.Fame, 2);
        value += `\n${item.Player.Name}${" ".repeat(
          RANKING_LINE_LENGTH - fameValue.length - item.Player.Name.length,
        )}${fameValue}`;
      }
    });
    value += "```";
    return value;
  };

  return {
    embeds: [
      {
        title: t("RANKING.MONTHLY", { guild: guild.Name }),
        url: `https://albiononline.com/pt/killboard/guild/${guild._id}`,
        thumbnail: {
          url: "https://user-images.githubusercontent.com/13356774/76129834-f53cc380-5fde-11ea-8c88-daa9872c2d72.png",
        },
        fields: [
          {
            name: t("RANKING.PVE"),
            value: generateRankFieldValue(guild.rankings.pve),
            inline: true,
          },
          {
            name: t("RANKING.PVP"),
            value: generateRankFieldValue(guild.rankings.pvp, true),
            inline: true,
          },
          {
            name: "\u200B",
            value: "\u200B",
            inline: false,
          },
          {
            name: t("RANKING.GATHERING"),
            value: generateRankFieldValue(guild.rankings.gathering),
            inline: true,
          },
          {
            name: t("RANKING.CRAFTING"),
            value: generateRankFieldValue(guild.rankings.crafting),
            inline: true,
          },
        ],
        timestamp: moment().toISOString(),
      },
    ],
  };
};

const embedList = (config) => {
  const { t } = getLocale(config.lang);

  const configToList = (list) => {
    if (!list || list.length === 0) return t("TRACK.NONE");
    return list.map((item) => item.name).join("\n");
  };

  return {
    embeds: [
      {
        description: t("TRACK.LIST"),
        fields: [
          {
            name: t("TRACK.PLAYERS"),
            value: configToList(config.trackedPlayers),
            inline: true,
          },
          {
            name: t("TRACK.GUILDS"),
            value: configToList(config.trackedGuilds),
            inline: true,
          },
          {
            name: t("TRACK.ALLIANCES"),
            value: configToList(config.trackedAlliances),
            inline: true,
          },
        ],
      },
    ],
  };
};

const embedDailyRanking = (rankings, { locale }) => {
  const { t } = getLocale(locale);

  const generateRankFieldValue = (ranking, name = "name", number = "fame") => {
    let value = "```c";
    if (ranking.length === 0) {
      const nodata = t("RANKING.NO_DATA_SHORT");
      value += `\n${nodata}${" ".repeat(RANKING_LINE_LENGTH - nodata.length)}`;
    }
    ranking.forEach((item) => {
      const nameValue = item[name];
      const numberValue = humanFormatter(item[number], 2);
      value += `\n${nameValue}${" ".repeat(RANKING_LINE_LENGTH - numberValue.length - nameValue.length)}${numberValue}`;
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
      },
    ],
  };
};

module.exports = {
  embedEvent,
  embedEventImage,
  embedEventInventoryImage,
  embedDailyRanking,
  embedRankings,
  embedList,
  embedBattle,
};
