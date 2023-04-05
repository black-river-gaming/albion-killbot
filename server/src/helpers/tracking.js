const { equalsCaseInsensitive } = require("./utils");

const applyLimits = (track, limits) => {
  let players = track.players || [];
  if (!isNaN(limits.players)) players = players.slice(0, Math.max(0, limits.players));

  let guilds = track.guilds || [];
  if (!isNaN(limits.guilds)) guilds = guilds.slice(0, Math.max(0, limits.guilds));

  let alliances = track.alliances || [];
  if (!isNaN(limits.alliances)) alliances = alliances.slice(0, Math.max(0, limits.alliances));

  return {
    players,
    guilds,
    alliances,
  };
};

// This method checks if an event is tracked by a discord server
// and flags it as a good event (killed is tracked) or bad event (victim is tracker)
// and returns a copy of it or null if the event is not tracked at all
function getTrackedEvent(event, track, limits) {
  const { players, guilds, alliances } = applyLimits(track, limits);

  if (players.length === 0 && guilds.length === 0 && alliances.length === 0) {
    return null;
  }

  // Ignore Arena kills or Duel kills
  if (event.TotalVictimKillFame <= 0) {
    return null;
  }

  // Scan track lists until we find any tracked object
  let good = false;
  let tracked = null;

  if (!tracked) good = true;
  if (!tracked) tracked = players.find((item) => item.id === event.Killer.Id);
  if (!tracked) tracked = guilds.find((item) => item.id === event.Killer.GuildId);
  if (!tracked) tracked = alliances.find((item) => item.id === event.Killer.AllianceId);

  if (!tracked) good = false;
  if (!tracked) tracked = players.find((item) => item.id === event.Victim.Id);
  if (!tracked) tracked = guilds.find((item) => item.id === event.Victim.GuildId);
  if (!tracked) tracked = alliances.find((item) => item.id === event.Victim.AllianceId);

  if (tracked) {
    // We need to create a new object here so we don't change the original event
    return Object.assign({}, event, { good, tracked });
  }

  return null;
}

// This method checks if a battle is tracked by a discord server
// and returns the battle or null if the event is not tracked at all
function getTrackedBattle(battle, track, limits) {
  const { players, guilds, alliances } = applyLimits(track, limits);

  if (players.length === 0 && guilds.length === 0 && alliances.length === 0) {
    return null;
  }

  const playerIds = players.filter((item) => item.server === battle.server).map((item) => item.id);
  const guildIds = guilds.filter((item) => item.server === battle.server).map((item) => item.id);
  const allianceIds = alliances.filter((item) => item.server === battle.server).map((item) => item.id);

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

function isPlayerTracked(player, { players = [], guilds = [], alliances = [] }, { server }) {
  if (server) {
    players = players.filter((t) => t.server === server);
    guilds = guilds.filter((t) => t.server === server);
    alliances = alliances.filter((t) => t.server === server);
  }

  return (
    players.some((t) => t.id === player.Id) ||
    guilds.some((t) => t.id === player.GuildId) ||
    alliances.some((t) => t.id === player.AllianceId)
  );
}

const getTrackedItem = ({ id, name, server }, trackList) => {
  if (!server) return null;
  if (!name && !id) return null;

  return trackList
    .filter((trackItem) => trackItem.server === server)
    .find((trackItem) => {
      if (id && !trackItem.id !== id) return false;
      if (name && !equalsCaseInsensitive(trackItem.name, name)) return false;
      return true;
    });
};

const isTracked = ({ id, name, server }, trackList) => {
  if (!server) return false;
  if (!name && !id) return false;

  return !!getTrackedItem({ id, name, server }, trackList);
};

module.exports = {
  getTrackedBattle,
  getTrackedEvent,
  getTrackedItem,
  isPlayerTracked,
  isTracked,
};
