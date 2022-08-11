// This method checks if an event is tracked by a discord server
// and flags it as a good event (killed is tracked) or bad event (victim is tracker)
// and returns a copy of it or null if the event is not tracked at all
function getTrackedEvent(event, settings) {
  if (!settings.track) return;
  const { players = [], guilds = [], alliances = [] } = settings.track;

  if (players.length === 0 && guilds.length === 0 && alliances.length === 0) {
    return null;
  }

  const playerIds = players.map((t) => t.id);
  const guildIds = guilds.map((t) => t.id);
  const allianceIds = alliances.map((t) => t.id);

  // Ignore Arena kills or Duel kills
  if (event.TotalVictimKillFame <= 0) {
    return null;
  }

  // Check for kill in event.Killer / event.Victim for anything tracked
  const goodEvent =
    allianceIds.indexOf(event.Killer.AllianceId) >= 0 ||
    guildIds.indexOf(event.Killer.GuildId) >= 0 ||
    playerIds.indexOf(event.Killer.Id) >= 0;
  const badEvent =
    allianceIds.indexOf(event.Victim.AllianceId) >= 0 ||
    guildIds.indexOf(event.Victim.GuildId) >= 0 ||
    playerIds.indexOf(event.Victim.Id) >= 0;
  if (goodEvent || badEvent) {
    // We need to create a new object here so we don't change the original event
    return Object.assign({}, event, { good: goodEvent });
  }

  return null;
}

// This method checks if a battle is tracked by a discord server
// and returns the battle or null if the event is not tracked at all
function getTrackedBattle(battle, settings) {
  if (!settings.track) return;
  const { players = [], guilds = [], alliances = [] } = settings.track;

  if (players.length === 0 && guilds.length === 0 && alliances.length === 0) {
    return null;
  }

  const playerIds = players.map((t) => t.id);
  const guildIds = guilds.map((t) => t.id);
  const allianceIds = alliances.map((t) => t.id);

  // Ignore battles without fame
  if (battle.totalFame <= 0) {
    return null;
  }

  // Check for tracked ids in players, guilds and alliances
  const hasTrackedPlayer = Object.keys(battle.players || {}).some((id) => playerIds.indexOf(id) >= 0);
  const hasTrackedGuild = Object.keys(battle.guilds || {}).some((id) => guildIds.indexOf(id) >= 0);
  const hasTrackedAlliance = Object.keys(battle.alliances || {}).some((id) => allianceIds.indexOf(id) >= 0);
  if (hasTrackedPlayer || hasTrackedGuild || hasTrackedAlliance) {
    return battle;
  }

  return null;
}

async function isPlayerTracked(player, settings) {
  const { track } = settings;

  return (
    track.players.some((t) => t.id === player.Id) ||
    track.guilds.some((t) => t.id === player.GuildId) ||
    track.alliances.some((t) => t.id === player.AllianceId)
  );
}

module.exports = {
  getTrackedBattle,
  getTrackedEvent,
  isPlayerTracked,
};
