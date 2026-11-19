/**
 * currentWeather.js — Renders the main weather hero card
 */

import { formatTemp, formatWind, formatHumidity, formatUV } from '../utils/formatters.js';
import { getWeatherIcon } from '../core/vibeEngine.js';
import { iconSvg } from '../utils/icons.js';
import { animateContent, setHTML, setText } from '../utils/dom.js';

const counterFrames = new WeakMap();

function animateNumber(id, targetValue, format) {
  const element = document.getElementById(id);
  if (!element) return;

  const previousFrame = counterFrames.get(element);
  if (previousFrame) cancelAnimationFrame(previousFrame);

  const startValue = Number.parseFloat(element.textContent.replace(/[^\d.-]/g, ''));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!Number.isFinite(startValue) || prefersReducedMotion || startValue === targetValue) {
    element.textContent = format(targetValue, true);
    return;
  }

  const startTime = performance.now();
  const duration = 350;
  const tick = now => {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - ((1 - progress) ** 3);
    const value = startValue + (targetValue - startValue) * eased;
    element.textContent = format(value, progress === 1);
    if (progress === 1) {
      counterFrames.delete(element);
    } else {
      counterFrames.set(element, requestAnimationFrame(tick));
    }
  };
  counterFrames.set(element, requestAnimationFrame(tick));
}

/**
 * Update all current weather DOM elements.
 * @param {object} current — parsed current weather data
 * @param {string} cityName
 */
export function renderCurrentWeather(current, cityName) {
  const { icon, label } = getWeatherIcon(current.wmoCode, current.isDay);

  setText('city-name', cityName);
  animateNumber('current-temp', current.temp, (value, final) => final ? String(Math.round(value)) : value.toFixed(1));
  setHTML('condition-icon', iconSvg(icon, 28));
  setText('condition-text', label);
  animateNumber('feels-like', current.feelsLike, (value, final) => final ? formatTemp(value) : `${value.toFixed(1)}°`);
  animateNumber('humidity', current.humidity, (value, final) => final ? formatHumidity(value) : `${value.toFixed(1)}%`);
  animateNumber('wind-speed', current.windSpeed, (value, final) => final ? formatWind(value) : `${value.toFixed(1)} km/h`);
  const uvLevel = formatUV(current.uvIndex).replace(/^[\d.]+\s*/, '');
  animateNumber('uv-index', current.uvIndex, (value, final) => final ? formatUV(value) : `${value.toFixed(1)} ${uvLevel}`);

  const feelsFill = document.getElementById('feels-fill');
  if (feelsFill) feelsFill.style.width = `${Math.max(0, Math.min(100, (current.feelsLike / 45) * 100))}%`;
  const humidityFill = document.getElementById('humidity-fill');
  if (humidityFill) humidityFill.style.width = `${Math.max(0, Math.min(100, current.humidity))}%`;
  const windFill = document.getElementById('wind-fill');
  if (windFill) windFill.style.width = `${Math.max(0, Math.min(100, (current.windSpeed / 40) * 100))}%`;
  const uvFill = document.getElementById('uv-arc-fill');
  if (uvFill) {
    const uv = Math.max(0, Math.min(11, current.uvIndex));
    uvFill.setAttribute('stroke-dasharray', `${(uv / 11) * 126} 126`);
    uvFill.style.transition = 'stroke-dasharray 350ms ease';
  }
  // Update page title with current weather
  document.title = `${Math.round(current.temp)}° ${label} di ${cityName} · Mesin Waktu Suasana`;
}
