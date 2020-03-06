const GREEN = 52224;
const RED = 13369344;

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
        description =
            soloMessages[Math.floor(Math.random() * soloMessages.length)];
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
    };
};
