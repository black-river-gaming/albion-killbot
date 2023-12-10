function isAlbionId(id) {
  return /[\w-]{22}/.test(id);
}

function isTrackEntity(entity) {
  return (
    entity && typeof entity.id === "string" && typeof entity.name === "string" && typeof entity.server === "string"
  );
}

function toTrackEntity(entity, server) {
  if (!entity) return entity;

  if (entity.Id && entity.Name) {
    return {
      id: entity.Id,
      name: entity.Name,
      server,
    };
  }

  if (entity.AllianceId && entity.AllianceTag) {
    return {
      id: entity.AllianceId,
      name: entity.AllianceTag,
      server,
    };
  }

  return entity;
}

// Get all victim items, including equipment and inventory, excluding nulls
function getVictimItems(event) {
  const { Equipment, Inventory } = event.Victim;
  return {
    equipment: [
      Equipment.Armor,
      Equipment.Bag,
      Equipment.Cape,
      Equipment.Food,
      Equipment.Head,
      Equipment.MainHand,
      Equipment.Mount,
      Equipment.OffHand,
      Equipment.Potion,
      Equipment.Shoes,
    ].filter((item) => !!item),
    inventory: Inventory.filter((item) => !!item),
  };
}

const transformEventPlayer = (player) => ({
  id: player.Id,
  name: player.Name,
  ip: player.AverageItemPower,
  killFame: player.KillFame,
  deathFame: player.DeathFame,
  guild: player.GuildId
    ? {
        id: player.GuildId,
        name: player.GuildName,
      }
    : null,
  alliance: player.AllianceId
    ? {
        id: player.AllianceId,
        tag: player.AllianceTag,
        name: player.AllianceName,
      }
    : null,
  equipment: player.Equipment,
});

const transformEvent = (event) => ({
  id: event.EventId,
  server: event.server,
  battle: event.BattleId,
  timestamp: event.TimeStamp,
  fame: event.TotalVictimKillFame,
  lootValue: event.lootValue,
  killer: transformEventPlayer(event.Killer),
  victim: transformEventPlayer(event.Victim),
  participants: event.Participants.map(transformEventPlayer),
});

module.exports = {
  getVictimItems,
  isAlbionId,
  isTrackEntity,
  toTrackEntity,
  transformEvent,
};
