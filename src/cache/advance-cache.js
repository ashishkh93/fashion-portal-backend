class AdvancedCache {
  constructor(maxSize, ttl) {
    this.cache = new Map(); // In-memory storage
    this.maxSize = maxSize; // Maximum number of items in cache
    this.ttl = ttl; // Time to live in milliseconds
  }

  // Set item in cache with timestamp for TTL and LRU tracking
  set(key, value) {
    const now = Date.now();

    // If cache is full, evict the least recently used (LRU) item
    if (this.cache.size >= this.maxSize) {
      const lruKey = this.getLeastRecentlyUsedKey();
      this.cache.delete(lruKey);
    }

    // Store the item with timestamp
    this.cache.set(key, { value, timestamp: now });
  }

  // Get item from cache and update its access time for LRU
  get(key) {
    const cachedItem = this.cache.get(key);

    // Return null if item is not in cache or has expired
    if (!cachedItem || this.isExpired(cachedItem)) {
      this.cache.delete(key);
      return null;
    }

    // Update access time for LRU
    cachedItem.timestamp = Date.now();
    this.cache.set(key, cachedItem); // Re-insert to update order

    return cachedItem.value;
  }

  // Check if cache item is expired based on TTL
  isExpired(cachedItem) {
    return Date.now() - cachedItem.timestamp > this.ttl;
  }

  // Get least recently used key (first one in the Map)
  getLeastRecentlyUsedKey() {
    return this.cache.keys().next().value; // Since Map maintains insertion order
  }

  // Manually invalidate a cache key
  invalidate(key) {
    this.cache.delete(key);
  }

  // Clear the entire cache
  clear() {
    this.cache.clear();
  }
}

module.exports = { AdvancedCache };
