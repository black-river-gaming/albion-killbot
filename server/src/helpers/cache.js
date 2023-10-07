const logger = require("./logger");

const cache = new Map();

const remove = (key) => {
  if (cache.has(key)) {
    const data = cache.get(key);
    if (data.timeoutId) clearTimeout(data.timeoutId);
    if (data.intervalId) clearInterval(data.intervalId);
  }

  return cache.delete(key);
};

const get = (key, { debug = false } = {}) => {
  if (!cache.has(key)) {
    if (debug) logger.verbose(`Cache miss: ${key}. Cache size: ${cache.size}`);
    return null;
  }

  const data = cache.get(key);
  if (data.expires && data.expires < Date.now()) {
    remove(key);
    if (debug) logger.verbose(`Cache expired: ${key}. Cache size: ${cache.size}`);
    return null;
  }

  if (debug) logger.verbose(`Cache hit: ${key}. Cache size: ${cache.size}`);
  return data.value;
};

const set = (key, value, { timeout, timeoutCallback, debug = false, ignore } = {}) => {
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
  };

  if (timeout) {
    data.expires = Date.now() + timeout;
    data.timeoutId = setTimeout(() => {
      remove(key);
      if (timeoutCallback) timeoutCallback(key, value);
    }, timeout);
  }

  cache.set(key, data);
  if (debug) logger.verbose(`Cache set: ${key}. Cache size: ${cache.size}`);

  return value;
};

const memoize = async (key, fn, { timeout, timeoutCallback, debug, ignore, refresh } = {}) => {
  // If entry exists and has data, return it
  let value = get(key, { debug });
  if (value) return value;

  if (timeout && typeof timeout !== "number") throw new Error("Cache 'timeout' option must be a valid number.");
  if (refresh && typeof refresh !== "number") throw new Error("Cache 'refresh' option must be a valid number.");
  if (timeoutCallback && typeof timeoutCallback !== "function")
    throw new Error("Cache 'timeoutCallback' must be a valid function.");

  value = await fn();
  set(key, value, { timeout, timeoutCallback, debug, ignore });

  if (refresh) {
    const data = cache.get(key);

    if (data.intervalId) clearInterval(data.intervalId);
    data.intervalId = setInterval(async () => {
      data.value = await fn();
      cache.set(key, data);
      if (debug) logger.verbose(`Cache refresh: ${key}. Cache size: ${cache.size}`);
    }, refresh);

    cache.set(key, data);
  }
  return value;
};

const size = () => cache.size();

module.exports = {
  get,
  memoize,
  remove,
  set,
  size,
};
