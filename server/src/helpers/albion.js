function isAlbionId(id) {
  return /[\w-]{22}/.test(id);
}

function isTrackEntity(entity) {
  return entity && typeof entity.id === "string" && typeof entity.name === "string";
}

function toTrackEntity(entity) {
  if (!entity) return entity;

  if (entity.Id && entity.Name) {
    return {
      id: entity.Id,
      name: entity.Name,
    };
  }

  if (entity.AllianceId && entity.AllianceTag) {
    return {
      id: entity.AllianceId,
      name: entity.AllianceTag,
    };
  }

  return entity;
}

// Get all victim items, including equipment and inventory, excluding nulls
function getVictimItems(event) {
  const { Equipment, Inventory } = event.Victim;
  return [
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
  ]
    .concat(Inventory)
    .filter((item) => !!item);
}

const transformEvent = (event) => ({
  EventId: event.EventId,
  BattleId: event.BattleId,
  TimeStamp: event.TimeStamp,
  TotalVictimKillFame: event.TotalVictimKillFame,
  TotalVictimLootValue: event.TotalVictimLootValue,
  Killer: event.Killer,
  Victim: event.Victim,
  Participants: event.Participants,
});

module.exports = {
  getVictimItems,
  isAlbionId,
  isTrackEntity,
  toTrackEntity,
  transformEvent,
};
