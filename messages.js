const moment = require("moment");

const GREEN = 52224;
const RED = 13369344;

// TODO: Mode to utils file
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

// TODO: i18n based on config
const soloMessages = [
  "SOLADINHO BR!!! HUEHUEU",
  "E foi de soled!",
  "Ciiiiiirco de soled",
  "Chamou pro duelo e foi de beise",
  "Não garantiu no x1",
  "O maluco foi solado!",
  "Solado parça!"
];

exports.embedEvent = event => {
  // TODO: Tracking based on config
  const good = event.Killer.GuildName === "Black River";

  const title = `${event.Killer.Name} eliminou ${event.Victim.Name}!`;

  let description;
  if (event.numberOfParticipants === 1) {
    description = soloMessages[Math.floor(Math.random() * soloMessages.length)];
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
      description = `Assistência(s): ${assist.join(" / ")}`;
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

  // TODO: More info
  return {
    embed: {
      color: good ? GREEN : RED,
      title,
      url: `https://albiononline.com/pt/killboard/kill/${event.EventId}`,
      description,
      thumbnail: {
        url:
          "https://assets.albiononline.com/assets/images/killboard/kill__date.png?ud136854d"
      },
      fields: [
        {
          name: "Fama do Abate",
          value:
            event.TotalVictimKillFame.toString().replace(
              /\B(?=(\d{3})+(?!\d))/g,
              "."
            ) || 0,
          inline: false
        },
        {
          name: "Guilda do Matador",
          value: killerGuildValue || "Sem guilda",
          inline: true
        },
        {
          name: "Guilda da Vítima",
          value: victimGuildValue || "Sem guilda",
          inline: true
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true
        },
        {
          name: "IP do Matador",
          value: Math.round(event.Killer.AverageItemPower),
          inline: true
        },
        {
          name: "IP da Vítima",
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

const LINE_LENGTH = 23;

exports.embedRankings = rankings => {
  const guildId = rankings.pvp[0].GuildId;
  const guildName = rankings.pvp[0].GuildName;

  const generateRankFieldValue = (ranking, pvp = false) => {
    let value = "```c";
    ranking.forEach(item => {
      if (pvp) {
        const fameValue = nFormatter(item.KillFame, 2);
        value += `\n${item.Name}${" ".repeat(
          LINE_LENGTH - fameValue.length - item.Name.length
        )}${fameValue}`;
      } else {
        const fameValue = nFormatter(item.Fame, 2);
        value += `\n${item.Player.Name}${" ".repeat(
          LINE_LENGTH - fameValue.length - item.Player.Name.length
        )}${fameValue}`;
      }
    });
    value += "```";
    return value;
  };

  return {
    embed: {
      title: `Ranking Mensal - ${guildName}`,
      url: `https://albiononline.com/pt/killboard/guild/${guildId}`,
      thumbnail: {
        url:
          "https://lh3.googleusercontent.com/proxy/jlLaug3U317mYo7Sk58pAGK9XxeQO_FLojvRb-vnRTbBmEraP5JMoyo6ggYogktbAK0bZQGvycNAPZRXCl4CCrxWYV2dfTQgnPRA2J1nIMaDhplBzKIIbURB7lKLJUQrtBdd2M8"
      },
      fields: [
        {
          name: "Ranking PvE",
          value: generateRankFieldValue(rankings.pve),
          inline: true
        },
        {
          name: "Ranking PvP",
          value: generateRankFieldValue(rankings.pvp, true),
          inline: true
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: false
        },
        {
          name: "Ranking de Coleta",
          value: generateRankFieldValue(rankings.gathering),
          inline: true
        },
        {
          name: "Ranking de Criação",
          value: generateRankFieldValue(rankings.crafting),
          inline: true
        }
      ],
      timestamp: moment().toISOString()
    }
  };
};
