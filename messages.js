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

const ranking_mock = {
  pve: [
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "Nicholas2",
        Id: "kZWIcVV1TTuFGK6CEvc9xw",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 1113064,
        KillFame: 565198,
        FameRatio: 0.51,
        LifetimeStatistics: {
          PvE: {
            Total: 12136737,
            Royal: 128258,
            Outlands: 32716,
            Hellgate: 20779
          },
          Gathering: {
            Fiber: { Total: 47967, Royal: 47913, Outlands: 0 },
            Hide: { Total: 67, Royal: 0, Outlands: 0 },
            Ore: { Total: 109047, Royal: 103158, Outlands: 5821 },
            Rock: { Total: 49003, Royal: 46708, Outlands: 2025 },
            Wood: { Total: 58, Royal: 0, Outlands: 0 },
            All: { Total: 206142, Royal: 197779, Outlands: 7846 }
          },
          Crafting: { Total: 1141076, Royal: 112, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.798475Z"
        }
      },
      Fame: 8586571
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "Anjek",
        Id: "hK0T1yR9SIea9Sg_3-D2rw",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 958789,
        KillFame: 196269,
        FameRatio: 0.2,
        LifetimeStatistics: {
          PvE: {
            Total: 8467428,
            Royal: 150172,
            Outlands: 62039,
            Hellgate: 40547
          },
          Gathering: {
            Fiber: { Total: 61302, Royal: 52453, Outlands: 8227 },
            Hide: { Total: 26190, Royal: 25906, Outlands: 0 },
            Ore: { Total: 5220, Royal: 5080, Outlands: 0 },
            Rock: { Total: 4072, Royal: 3865, Outlands: 0 },
            Wood: { Total: 34231, Royal: 33975, Outlands: 0 },
            All: { Total: 131015, Royal: 121279, Outlands: 8227 }
          },
          Crafting: { Total: 637736, Royal: 1965, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.285676Z"
        }
      },
      Fame: 8024552
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "EmooR",
        Id: "voBIMDZeSliGlRtv15xacA",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 1032513,
        KillFame: 119792,
        FameRatio: 0.12,
        LifetimeStatistics: {
          PvE: { Total: 8995213, Royal: 570058, Outlands: 18702, Hellgate: 0 },
          Gathering: {
            Fiber: { Total: 27, Royal: 0, Outlands: 0 },
            Hide: { Total: 27, Royal: 0, Outlands: 0 },
            Ore: { Total: 3513, Royal: 3499, Outlands: 0 },
            Rock: { Total: 0, Royal: 0, Outlands: 0 },
            Wood: { Total: 45, Royal: 0, Outlands: 0 },
            All: { Total: 3612, Royal: 3499, Outlands: 0 }
          },
          Crafting: { Total: 1378, Royal: 0, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.222455Z"
        }
      },
      Fame: 7900249
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "TaymonCante",
        Id: "CnHU5HjIRSOW2Jkk8sdCpw",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 314389,
        KillFame: 5377,
        FameRatio: 0.02,
        LifetimeStatistics: {
          PvE: {
            Total: 5364670,
            Royal: 211531,
            Outlands: 1800,
            Hellgate: 8068
          },
          Gathering: {
            Fiber: { Total: 4615, Royal: 4539, Outlands: 0 },
            Hide: { Total: 49, Royal: 0, Outlands: 0 },
            Ore: { Total: 9561, Royal: 9547, Outlands: 0 },
            Rock: { Total: 2208, Royal: 2208, Outlands: 0 },
            Wood: { Total: 544, Royal: 526, Outlands: 0 },
            All: { Total: 16977, Royal: 16820, Outlands: 0 }
          },
          Crafting: { Total: 172421, Royal: 624, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.436205Z"
        }
      },
      Fame: 3938283
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "NorKTaL",
        Id: "f48ZOhxXTCSbSkyg8no3YQ",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 46661,
        KillFame: 2389,
        FameRatio: 0.05,
        LifetimeStatistics: {
          PvE: { Total: 882170, Royal: 11335, Outlands: 0, Hellgate: 0 },
          Gathering: {
            Fiber: { Total: 99, Royal: 85, Outlands: 0 },
            Hide: { Total: 675, Royal: 639, Outlands: 0 },
            Ore: { Total: 1746, Royal: 1719, Outlands: 0 },
            Rock: { Total: 378, Royal: 378, Outlands: 0 },
            Wood: { Total: 729, Royal: 630, Outlands: 0 },
            All: { Total: 3627, Royal: 3451, Outlands: 0 }
          },
          Crafting: { Total: 3634, Royal: 867, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.978104Z"
        }
      },
      Fame: 881616
    }
  ],
  pvp: [
    {
      Id: "kZWIcVV1TTuFGK6CEvc9xw",
      Name: "Nicholas2",
      GuildId: "m1HVpwomTMiAJKxwopwIpQ",
      GuildName: "Black River",
      AllianceId: "",
      AllianceName: "",
      Avatar: "",
      AvatarRing: "",
      KillFame: 565187,
      DeathFame: 1113064,
      FameRatio: 0.51,
      totalKills: null,
      gvgKills: null,
      gvgWon: null
    },
    {
      Id: "hK0T1yR9SIea9Sg_3-D2rw",
      Name: "Anjek",
      GuildId: "m1HVpwomTMiAJKxwopwIpQ",
      GuildName: "Black River",
      AllianceId: "",
      AllianceName: "",
      Avatar: "",
      AvatarRing: "",
      KillFame: 196264,
      DeathFame: 958789,
      FameRatio: 0.2,
      totalKills: null,
      gvgKills: null,
      gvgWon: null
    },
    {
      Id: "voBIMDZeSliGlRtv15xacA",
      Name: "EmooR",
      GuildId: "m1HVpwomTMiAJKxwopwIpQ",
      GuildName: "Black River",
      AllianceId: "",
      AllianceName: "",
      Avatar: "",
      AvatarRing: "",
      KillFame: 119790,
      DeathFame: 1032513,
      FameRatio: 0.12,
      totalKills: null,
      gvgKills: null,
      gvgWon: null
    },
    {
      Id: "CnHU5HjIRSOW2Jkk8sdCpw",
      Name: "TaymonCante",
      GuildId: "m1HVpwomTMiAJKxwopwIpQ",
      GuildName: "Black River",
      AllianceId: "",
      AllianceName: "",
      Avatar: "",
      AvatarRing: "",
      KillFame: 5377,
      DeathFame: 314389,
      FameRatio: 0.02,
      totalKills: null,
      gvgKills: null,
      gvgWon: null
    },
    {
      Id: "f48ZOhxXTCSbSkyg8no3YQ",
      Name: "NorKTaL",
      GuildId: "m1HVpwomTMiAJKxwopwIpQ",
      GuildName: "Black River",
      AllianceId: "",
      AllianceName: "",
      Avatar: "",
      AvatarRing: "",
      KillFame: 2389,
      DeathFame: 46661,
      FameRatio: 0.05,
      totalKills: null,
      gvgKills: null,
      gvgWon: null
    }
  ],
  gathering: [
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "Anjek",
        Id: "hK0T1yR9SIea9Sg_3-D2rw",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 958789,
        KillFame: 196269,
        FameRatio: 0.2,
        LifetimeStatistics: {
          PvE: {
            Total: 8467428,
            Royal: 150172,
            Outlands: 62039,
            Hellgate: 40547
          },
          Gathering: {
            Fiber: { Total: 61302, Royal: 52453, Outlands: 8227 },
            Hide: { Total: 26190, Royal: 25906, Outlands: 0 },
            Ore: { Total: 5220, Royal: 5080, Outlands: 0 },
            Rock: { Total: 4072, Royal: 3865, Outlands: 0 },
            Wood: { Total: 34231, Royal: 33975, Outlands: 0 },
            All: { Total: 131015, Royal: 121279, Outlands: 8227 }
          },
          Crafting: { Total: 637736, Royal: 1965, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.285676Z"
        }
      },
      Fame: 108173
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "Nicholas2",
        Id: "kZWIcVV1TTuFGK6CEvc9xw",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 1113064,
        KillFame: 565198,
        FameRatio: 0.51,
        LifetimeStatistics: {
          PvE: {
            Total: 12136737,
            Royal: 128258,
            Outlands: 32716,
            Hellgate: 20779
          },
          Gathering: {
            Fiber: { Total: 47967, Royal: 47913, Outlands: 0 },
            Hide: { Total: 67, Royal: 0, Outlands: 0 },
            Ore: { Total: 109047, Royal: 103158, Outlands: 5821 },
            Rock: { Total: 49003, Royal: 46708, Outlands: 2025 },
            Wood: { Total: 58, Royal: 0, Outlands: 0 },
            All: { Total: 206142, Royal: 197779, Outlands: 7846 }
          },
          Crafting: { Total: 1141076, Royal: 112, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.798475Z"
        }
      },
      Fame: 44567
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "NorKTaL",
        Id: "f48ZOhxXTCSbSkyg8no3YQ",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 46661,
        KillFame: 2389,
        FameRatio: 0.05,
        LifetimeStatistics: {
          PvE: { Total: 882170, Royal: 11335, Outlands: 0, Hellgate: 0 },
          Gathering: {
            Fiber: { Total: 99, Royal: 85, Outlands: 0 },
            Hide: { Total: 675, Royal: 639, Outlands: 0 },
            Ore: { Total: 1746, Royal: 1719, Outlands: 0 },
            Rock: { Total: 378, Royal: 378, Outlands: 0 },
            Wood: { Total: 729, Royal: 630, Outlands: 0 },
            All: { Total: 3627, Royal: 3451, Outlands: 0 }
          },
          Crafting: { Total: 3634, Royal: 867, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.978104Z"
        }
      },
      Fame: 3452
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "EmooR",
        Id: "voBIMDZeSliGlRtv15xacA",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 1032513,
        KillFame: 119792,
        FameRatio: 0.12,
        LifetimeStatistics: {
          PvE: { Total: 8995213, Royal: 570058, Outlands: 18702, Hellgate: 0 },
          Gathering: {
            Fiber: { Total: 27, Royal: 0, Outlands: 0 },
            Hide: { Total: 27, Royal: 0, Outlands: 0 },
            Ore: { Total: 3513, Royal: 3499, Outlands: 0 },
            Rock: { Total: 0, Royal: 0, Outlands: 0 },
            Wood: { Total: 45, Royal: 0, Outlands: 0 },
            All: { Total: 3612, Royal: 3499, Outlands: 0 }
          },
          Crafting: { Total: 1378, Royal: 0, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.222455Z"
        }
      },
      Fame: 2762
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "TaymonCante",
        Id: "CnHU5HjIRSOW2Jkk8sdCpw",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 314389,
        KillFame: 5377,
        FameRatio: 0.02,
        LifetimeStatistics: {
          PvE: {
            Total: 5364670,
            Royal: 211531,
            Outlands: 1800,
            Hellgate: 8068
          },
          Gathering: {
            Fiber: { Total: 4615, Royal: 4539, Outlands: 0 },
            Hide: { Total: 49, Royal: 0, Outlands: 0 },
            Ore: { Total: 9561, Royal: 9547, Outlands: 0 },
            Rock: { Total: 2208, Royal: 2208, Outlands: 0 },
            Wood: { Total: 544, Royal: 526, Outlands: 0 },
            All: { Total: 16977, Royal: 16820, Outlands: 0 }
          },
          Crafting: { Total: 172421, Royal: 624, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.436205Z"
        }
      },
      Fame: 0
    }
  ],
  crafting: [
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "Anjek",
        Id: "hK0T1yR9SIea9Sg_3-D2rw",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 958789,
        KillFame: 196269,
        FameRatio: 0.2,
        LifetimeStatistics: {
          PvE: {
            Total: 8467428,
            Royal: 150172,
            Outlands: 62039,
            Hellgate: 40547
          },
          Gathering: {
            Fiber: { Total: 61302, Royal: 52453, Outlands: 8227 },
            Hide: { Total: 26190, Royal: 25906, Outlands: 0 },
            Ore: { Total: 5220, Royal: 5080, Outlands: 0 },
            Rock: { Total: 4072, Royal: 3865, Outlands: 0 },
            Wood: { Total: 34231, Royal: 33975, Outlands: 0 },
            All: { Total: 131015, Royal: 121279, Outlands: 8227 }
          },
          Crafting: { Total: 637736, Royal: 1965, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.285676Z"
        }
      },
      Fame: 512635
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "Nicholas2",
        Id: "kZWIcVV1TTuFGK6CEvc9xw",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 1113064,
        KillFame: 565198,
        FameRatio: 0.51,
        LifetimeStatistics: {
          PvE: {
            Total: 12136737,
            Royal: 128258,
            Outlands: 32716,
            Hellgate: 20779
          },
          Gathering: {
            Fiber: { Total: 47967, Royal: 47913, Outlands: 0 },
            Hide: { Total: 67, Royal: 0, Outlands: 0 },
            Ore: { Total: 109047, Royal: 103158, Outlands: 5821 },
            Rock: { Total: 49003, Royal: 46708, Outlands: 2025 },
            Wood: { Total: 58, Royal: 0, Outlands: 0 },
            All: { Total: 206142, Royal: 197779, Outlands: 7846 }
          },
          Crafting: { Total: 1141076, Royal: 112, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.798475Z"
        }
      },
      Fame: 442197
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "TaymonCante",
        Id: "CnHU5HjIRSOW2Jkk8sdCpw",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 314389,
        KillFame: 5377,
        FameRatio: 0.02,
        LifetimeStatistics: {
          PvE: {
            Total: 5364670,
            Royal: 211531,
            Outlands: 1800,
            Hellgate: 8068
          },
          Gathering: {
            Fiber: { Total: 4615, Royal: 4539, Outlands: 0 },
            Hide: { Total: 49, Royal: 0, Outlands: 0 },
            Ore: { Total: 9561, Royal: 9547, Outlands: 0 },
            Rock: { Total: 2208, Royal: 2208, Outlands: 0 },
            Wood: { Total: 544, Royal: 526, Outlands: 0 },
            All: { Total: 16977, Royal: 16820, Outlands: 0 }
          },
          Crafting: { Total: 172421, Royal: 624, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.436205Z"
        }
      },
      Fame: 87360
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "NorKTaL",
        Id: "f48ZOhxXTCSbSkyg8no3YQ",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 46661,
        KillFame: 2389,
        FameRatio: 0.05,
        LifetimeStatistics: {
          PvE: { Total: 882170, Royal: 11335, Outlands: 0, Hellgate: 0 },
          Gathering: {
            Fiber: { Total: 99, Royal: 85, Outlands: 0 },
            Hide: { Total: 675, Royal: 639, Outlands: 0 },
            Ore: { Total: 1746, Royal: 1719, Outlands: 0 },
            Rock: { Total: 378, Royal: 378, Outlands: 0 },
            Wood: { Total: 729, Royal: 630, Outlands: 0 },
            All: { Total: 3627, Royal: 3451, Outlands: 0 }
          },
          Crafting: { Total: 3634, Royal: 867, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.978104Z"
        }
      },
      Fame: 3411
    },
    {
      Player: {
        AverageItemPower: 0.0,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null
        },
        Inventory: [],
        Name: "EmooR",
        Id: "voBIMDZeSliGlRtv15xacA",
        GuildName: "Black River",
        GuildId: "m1HVpwomTMiAJKxwopwIpQ",
        AllianceName: "",
        AllianceId: "",
        AllianceTag: "",
        Avatar: "",
        AvatarRing: "",
        DeathFame: 1032513,
        KillFame: 119792,
        FameRatio: 0.12,
        LifetimeStatistics: {
          PvE: { Total: 8995213, Royal: 570058, Outlands: 18702, Hellgate: 0 },
          Gathering: {
            Fiber: { Total: 27, Royal: 0, Outlands: 0 },
            Hide: { Total: 27, Royal: 0, Outlands: 0 },
            Ore: { Total: 3513, Royal: 3499, Outlands: 0 },
            Rock: { Total: 0, Royal: 0, Outlands: 0 },
            Wood: { Total: 45, Royal: 0, Outlands: 0 },
            All: { Total: 3612, Royal: 3499, Outlands: 0 }
          },
          Crafting: { Total: 1378, Royal: 0, Outlands: 0 },
          CrystalLeague: 0,
          Timestamp: "2020-02-18T00:21:09.222455Z"
        }
      },
      Fame: 547
    }
  ]
};

exports.embedRankings = rankings => {
  rankings = ranking_mock;
  console.log(rankings);

  return {};
};
