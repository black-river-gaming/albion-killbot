const logger = require("./logger");

const cache = new Map();

const remove = (key) => {
  if (cache.has(key)) {
    const data = cache.get(key);
    if (data.timeoutId) clearTimeout(data.timeoutId);
  }

  return cache.delete(key);
};

const get = (key, { debug = false } = {}) => {
  if (cache.has(key)) {
    const data = cache.get(key);

    if (data.expires >= Date.now()) {
      if (debug) logger.verbose(`Cache hit: ${key}. Cache size: ${cache.size}`);
      return data.value;
    } else {
      remove(key);
      if (debug) logger.verbose(`Cache expired: ${key}. Cache size: ${cache.size}`);
    }
  }

  if (debug) logger.verbose(`Cache miss: ${key}. Cache size: ${cache.size}`);
  return null;
};

const set = (key, value, { timeout = 60000, timeoutCallback, debug = false, ignore } = {}) => {
  // If the value is strict equal to ignore, ignore cache
  if (value === ignore) return value;

  if (timeout && typeof timeout !== "number") throw new Error("Timeout for cache must be a valid number.");
  if (timeoutCallback && typeof timeoutCallback !== "function")
    throw new Error("Timeout callback for cache must be a valid function.");

  // Delete old entry
  if (cache.has(key)) {
    remove(key);
  }

  const data = {
    value,
    expires: Date.now() + timeout,
  };

  if (!isNaN(data.expires)) {
    data.timeoutId = setTimeout(() => {
      remove(key);
      if (timeoutCallback) timeoutCallback(key, value);
    }, timeout);
  }

  cache.set(key, data);
  if (debug) logger.verbose(`Cache set: ${key}. Cache size: ${cache.size}`);

  return value;
};

const memoize = async (key, fn, { timeout, timeoutCallback, debug, ignore } = {}) => {
  // If entry exists, return it
  if (cache.has(key)) return get(key, { debug });

  if (timeout && typeof timeout !== "number") throw new Error("Timeout for cache must be a valid number.");
  if (timeoutCallback && typeof timeoutCallback !== "function")
    throw new Error("Timeout callback for cache must be a valid function.");

  const value = await fn();
  return set(key, value, { timeout, timeoutCallback, debug, ignore });
};

const size = () => cache.size();

module.exports = {
  get,
  memoize,
  remove,
  set,
  size,
};
