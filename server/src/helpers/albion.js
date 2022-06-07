function isAlbionId(id) {
  return /[\w-]{22}/.test(id);
}

function toSearchResult(entity) {
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

module.exports = {
  isAlbionId,
  toSearchResult,
};
