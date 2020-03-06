const moment = require("moment");
const i18n = require("i18n");

const LOCALE_DIR = __dirname + "/locales";
const GREEN = 52224;
const RED = 13369344;
const RANKING_LINE_LENGTH = 23;

// TODO: Move to utils file
function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "m" },
    { value: 1e9, symbol: "b" },
    { value: 1e12, symbol: "t" },
    { value: 1e15, symbol: "q" },
    { value: 1e18, symbol: "Q" }
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

function setLocale(locale = "en") {
  const l = {};
  i18n.configure({
    directory: LOCALE_DIR,
    objectNotation: true,
    defaultLocale: locale,
    register: l
  });
  return l;
}

exports.getI18n = guild => setLocale(guild.config.lang);

exports.embedEvent = (event, locale) => {
  const l = setLocale(locale);
  const good = event.good;
  const title = l.__("KILL.EVENT", {
    killer: event.Killer.Name,
    victim: event.Victim.Name
  });

  let description;
  if (event.numberOfParticipants === 1) {
    description = l.__(`KILL.SOLO_${Math.floor(Math.random() * 6)}`);
  } else {
    const totalDamage = event.Participants.reduce((sum, participant) => {
      return sum + participant.DamageDone;
    }, 0);
    const assist = [];
    event.Participants.forEach(participant => {
      // Self-damage isn't assist :P
      if (participant.Name === event.Victim.Name) {
        return;
      }
      const damagePercent = Math.round(
        (participant.DamageDone / totalDamage) * 100
      );
      assist.push(`${participant.Name} (${damagePercent}%)`);
    });

    if (assist.length > 0) {
      description = l.__("KILL.ASSIST", { assists: assist.join(" / ") });
    }
  }

  let killerGuildValue;
  if (event.Killer.GuildName) {
    killerGuildValue = event.Killer.AllianceName
      ? `[${event.Killer.AllianceName}] `
      : "";
    killerGuildValue += event.Killer.GuildName;
  }

  let victimGuildValue;
  if (event.Victim.GuildName) {
    victimGuildValue = event.Victim.AllianceName
      ? `[${event.Victim.AllianceName}] `
      : "";
    victimGuildValue += event.Victim.GuildName;
  }

  return {
    embed: {
      color: good ? GREEN : RED,
      title,
      url: `https://albiononline.com/pt/killboard/kill/${event.EventId}`,
      description,
      thumbnail: {
        url: good
          ? "https://user-images.githubusercontent.com/13356774/74859732-e0450c80-531d-11ea-9f34-e7074a817454.png"
          : "https://user-images.githubusercontent.com/13356774/74859728-df13df80-531d-11ea-8bf2-7f8567af6a99.png"
      },
      fields: [
        {
          name: l.__("KILL.FAME"),
          value:
            event.TotalVictimKillFame.toString().replace(
              /\B(?=(\d{3})+(?!\d))/g,
              "."
            ) || 0,
          inline: false
        },
        {
          name: l.__("KILL.KILLER_GUILD"),
          value: killerGuildValue || l.__("KILL.NO_GUILD"),
          inline: true
        },
        {
          name: l.__("KILL.VICTIM_GUILD"),
          value: victimGuildValue || l.__("KILL.NO_GUILD"),
          inline: true
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true
        },
        {
          name: l.__("KILL.KILLER_IP"),
          value: Math.round(event.Killer.AverageItemPower),
          inline: true
        },
        {
          name: l.__("KILL.VICTIM_IP"),
          value: Math.round(event.Victim.AverageItemPower),
          inline: true
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true
        }
      ]
    }
  };
};

exports.embedRankings = (rankings, locale) => {
  const l = setLocale(locale);

  const guildId = rankings.pvp[0].GuildId;
  const guildName = rankings.pvp[0].GuildName;

  const generateRankFieldValue = (ranking, pvp = false) => {
    let value = "```c";
    ranking.forEach(item => {
      if (pvp) {
        const fameValue = nFormatter(item.KillFame, 2);
        value += `\n${item.Name}${" ".repeat(
          RANKING_LINE_LENGTH - fameValue.length - item.Name.length
        )}${fameValue}`;
      } else {
        const fameValue = nFormatter(item.Fame, 2);
        value += `\n${item.Player.Name}${" ".repeat(
          RANKING_LINE_LENGTH - fameValue.length - item.Player.Name.length
        )}${fameValue}`;
      }
    });
    value += "```";
    return value;
  };

  return {
    embed: {
      title: l.__("RANKING.MONTHLY", { guild: guildName }),
      url: `https://albiononline.com/pt/killboard/guild/${guildId}`,
      thumbnail: {
        url:
          "https://user-images.githubusercontent.com/13356774/74859708-d7543b00-531d-11ea-8bdb-b3aac5055078.png"
      },
      fields: [
        {
          name: l.__("RANKING.PVE"),
          value: generateRankFieldValue(rankings.pve),
          inline: true
        },
        {
          name: l.__("RANKING.PVP"),
          value: generateRankFieldValue(rankings.pvp, true),
          inline: true
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: false
        },
        {
          name: l.__("RANKING.GATHERING"),
          value: generateRankFieldValue(rankings.gathering),
          inline: true
        },
        {
          name: l.__("RANKING.CRAFTING"),
          value: generateRankFieldValue(rankings.crafting),
          inline: true
        }
      ],
      timestamp: moment().toISOString()
    }
  };
};

exports.embedList = config => {
  const l = setLocale(config.lang);

  const configToList = list => {
    if (!list || list.length === 0) return l.__("TRACK.NONE");
    return list.map(item => item.name).join("\n");
  };

  return {
    embed: {
      description: l.__("TRACK.LIST"),
      fields: [
        {
          name: l.__("TRACK.PLAYERS"),
          value: configToList(config.trackedPlayers),
          inline: true
        },
        {
          name: l.__("TRACK.GUILDS"),
          value: configToList(config.trackedGuilds),
          inline: true
        },
        {
          name: l.__("TRACK.ALLIANCES"),
          value: configToList(config.trackedAlliances),
          inline: true
        }
      ]
    }
  };
};
