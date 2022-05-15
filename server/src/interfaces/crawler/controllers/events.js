const noop = () => {
  throw new Error("Not implemented yet");
};

async function fetchEvents() {}

module.exports = {
  fetchEvents,
  fetchBattles: noop,
};
