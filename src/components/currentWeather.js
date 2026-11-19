/**
 * currentWeather.js — Renders the main weather hero card
 */

import { formatTemp, formatWind, formatHumidity, formatUV } from '../utils/formatters.js';
import { getWeatherIcon } from '../core/vibeEngine.js';
import { iconSvg } from '../utils/icons.js';
import { setHTML, setText } from '../utils/dom.js';

/**
 * Update all current weather DOM elements.
 * @param {object} current — parsed current weather data
 * @param {string} cityName
 */
export function renderCurrentWeather(current, cityName) {
  const { icon, label } = getWeatherIcon(current.wmoCode, current.isDay);

  setText('city-name', cityName);
  setText('current-temp', Math.round(current.temp));
  setHTML('condition-icon', iconSvg(icon, 28));
  setText('condition-text', label);
  setText('feels-like', formatTemp(current.feelsLike));
  setText('humidity', formatHumidity(current.humidity));
  setText('wind-speed', formatWind(current.windSpeed));
  setText('uv-index', formatUV(current.uvIndex));

  const feelsFill = document.getElementById('feels-fill');
  if (feelsFill) feelsFill.style.width = `${Math.max(0, Math.min(100, (current.feelsLike / 45) * 100))}%`;
  const humidityFill = document.getElementById('humidity-fill');
  if (humidityFill) humidityFill.style.width = `${Math.max(0, Math.min(100, current.humidity))}%`;
  const uvFill = document.getElementById('uv-arc-fill');
  if (uvFill) {
    const uv = Math.max(0, Math.min(11, current.uvIndex));
    uvFill.setAttribute('stroke-dasharray', `${(uv / 11) * 126} 126`);
  }
  const windStreaks = document.getElementById('wind-streaks');
  if (windStreaks) {
    const widths = [45, 60, 75].map(width => Math.min(100, width + current.windSpeed));
    windStreaks.querySelectorAll('.wind-streak').forEach((streak, index) => {
      streak.style.setProperty('--w', `${widths[index]}%`);
    });
  }

  // Update page title with current weather
  document.title = `${Math.round(current.temp)}° ${label} di ${cityName} · Mesin Waktu Suasana`;
}
