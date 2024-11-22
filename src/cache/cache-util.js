const { AdvancedCache } = require('./advance-cache');
const cacheConfig = require('./cache-config');

// Create global cache instance
const cache = new AdvancedCache(cacheConfig.maxSize, cacheConfig.ttl);

const cacheUtil = {
  getFromCache: (key) => {
    return cache.get(key);
  },

  setInCache: (key, value) => {
    cache.set(key, value);
  },

  invalidateCache: (key) => {
    cache.invalidate(key);
  },
};

module.exports = cacheUtil;
