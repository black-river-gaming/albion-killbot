function disableCache(req, res, next) {
  res.set("Cache-Control", "No-Cache");
  return next();
}

module.exports = {
  disableCache,
};
