/**
 * formatters.js — Data formatting utilities
 */

/**
 * Format temperature as string with degree symbol.
 * @param {number} temp
 * @returns {string} e.g. "28°"
 */
export function formatTemp(temp) {
  return `${Math.round(temp)}°`;
}

/**
 * Format wind speed in km/h.
 * @param {number} speed — km/h
 * @returns {string} e.g. "14 km/h"
 */
export function formatWind(speed) {
  return `${Math.round(speed)} km/h`;
}

/**
 * Format humidity as percentage.
 * @param {number} humidity
 * @returns {string} e.g. "72%"
 */
export function formatHumidity(humidity) {
  return `${Math.round(humidity)}%`;
}

/**
 * Format UV Index with qualitative label.
 * @param {number} uv
 * @returns {string} e.g. "5 (Sedang)"
 */
export function formatUV(uv) {
  const level = uv <= 2 ? 'Rendah'
    : uv <= 5 ? 'Sedang'
    : uv <= 7 ? 'Tinggi'
    : uv <= 10 ? 'Sangat Tinggi'
    : 'Ekstrem';
  return `${Math.round(uv)} (${level})`;
}

/**
 * Format an ISO datetime string to a short hour label (HH:00).
 * @param {string} isoString — e.g. "2024-01-15T14:00"
 * @returns {string} e.g. "14:00"
 */
export function formatHour(isoString) {
  const date = new Date(isoString);
  const h = date.getHours().toString().padStart(2, '0');
  return `${h}:00`;
}

/**
 * Format current date and time for the header display.
 * @param {Date} [date]
 * @returns {string} e.g. "Kam, 19 Nov · 14:05"
 */
export function formatHeaderTime(date = new Date()) {
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                      'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

  const day = dayNames[date.getDay()];
  const dateNum = date.getDate();
  const month = monthNames[date.getMonth()];
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');

  return `${day}, ${dateNum} ${month} · ${h}:${m}`;
}

/**
 * Calculate min and max temp from an array of hourly data for normalization.
 * @param {Array<{temp: number}>} hourlyData
 * @returns {{ min: number, max: number }}
 */
export function getTempRange(hourlyData) {
  const temps = hourlyData.map(h => h.temp);
  return {
    min: Math.min(...temps),
    max: Math.max(...temps),
  };
}

/**
 * Normalize a temperature value to 0–1 range.
 * @param {number} temp
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function normalizeTempToPercent(temp, min, max) {
  if (max === min) return 0.5;
  return (temp - min) / (max - min);
}
