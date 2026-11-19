/**
 * storage.js — localStorage abstraction with TTL cache
 */

const CACHE_KEY = 'mws_weather_cache_v1';
const PREFS_KEY = 'mws_prefs_v1';
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Store weather data in cache with a timestamp.
 * @param {object} data
 */
export function setCachedWeather(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      savedAt: Date.now(),
    }));
  } catch (e) {
    // localStorage might be full or disabled
    console.warn('[storage] Could not save cache:', e);
  }
}

/**
 * Retrieve cached weather data if still fresh.
 * @param {number} [ttlMs] — max age in milliseconds
 * @returns {object|null}
 */
export function getCachedWeather(ttlMs = DEFAULT_TTL_MS) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const { data, savedAt } = JSON.parse(raw);
    const age = Date.now() - savedAt;

    if (age > ttlMs) return null; // expired
    return data;
  } catch {
    return null;
  }
}

/**
 * Save user preferences.
 * @param {object} prefs
 */
export function savePrefs(prefs) {
  try {
    const existing = getPrefs();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...existing, ...prefs }));
  } catch (e) {
    console.warn('[storage] Could not save prefs:', e);
  }
}

/**
 * Load user preferences.
 * @returns {object}
 */
export function getPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Clear all cached data.
 */
export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}
