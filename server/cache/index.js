import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 600, // 10 minutes default TTL
  checkperiod: 120,
  useClones: false,
});

export function get(key) {
  return cache.get(key);
}

export function set(key, value, ttl = 600) {
  return cache.set(key, value, ttl);
}

export function del(key) {
  return cache.del(key);
}

export function flush() {
  return cache.flushAll();
}