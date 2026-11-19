/**
 * hourlyChart.js — Renders the scrollable 24-hour forecast chart
 */

import { formatHour, getTempRange, normalizeTempToPercent } from '../utils/formatters.js';
import { getWeatherIcon } from '../core/vibeEngine.js';
import { clearEl, el } from '../utils/dom.js';
import { iconSvg } from '../utils/icons.js';

/**
 * Render the 24-hour scrollable forecast chart.
 * @param {Array<HourlySlot>} hourlyData
 */
export function renderHourlyChart(hourlyData) {
  const chart = document.getElementById('spline-slots');
  const svg = document.getElementById('spline-svg');
  if (!chart || !svg || !hourlyData?.length) return;

  clearEl(chart);

  const { min, max } = getTempRange(hourlyData);
  const slotWidth = 56;
  const chartWidth = hourlyData.length * slotWidth;
  const chartHeight = 88;
  const points = hourlyData.map((slot, index) => {
    const x = slotWidth * index + slotWidth / 2;
    const normalized = normalizeTempToPercent(slot.temp, min, max);
    return { x, y: chartHeight - 12 - normalized * (chartHeight - 30) };
  });
  const linePath = points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ');
  svg.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight}`);
  svg.setAttribute('width', chartWidth);
  svg.setAttribute('height', chartHeight);
  svg.innerHTML = `
    <path d="${linePath} L${chartWidth - slotWidth / 2},${chartHeight} L${slotWidth / 2},${chartHeight} Z" fill="rgba(var(--accent-rgb),0.08)"></path>
    <path d="${linePath}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    ${points.map(point => `<circle cx="${point.x}" cy="${point.y}" r="3" fill="var(--accent)"></circle>`).join('')}
  `;
  chart.style.width = `${chartWidth}px`;

  hourlyData.forEach((slot, idx) => {
    const { icon } = getWeatherIcon(slot.wmoCode, isHourDay(slot.time));
    const isNow = slot.isNow;

    const slotEl = el('div', {
      className: `spline-slot${isNow ? ' is-now' : ''}`,
      attrs: {
        role: 'listitem',
        'aria-label': `${formatHour(slot.time)}: ${slot.temp}°C, curah hujan ${slot.precipProb}%`,
        style: `animation: fade-in-up 0.3s ${idx * 0.03}s ease both`,
      },
    });

    slotEl.innerHTML = `
      <span class="spline-slot-time">${formatHour(slot.time)}</span>
      <span class="spline-slot-icon" aria-hidden="true">${iconSvg(icon, 18)}</span>
      <span class="spline-slot-temp">${slot.temp}°</span>
      <span class="spline-slot-precip" title="Peluang hujan">${slot.precipProb}% hujan</span>
    `;

    chart.appendChild(slotEl);
  });

  // Auto-scroll to current hour
  const nowEl = chart.querySelector('.is-now');
  if (nowEl) {
    // Small delay to let layout paint first
    requestAnimationFrame(() => {
      nowEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  }
}

/**
 * Determine if a given ISO hour string is daytime (6:00–18:59).
 * @param {string} isoString
 * @returns {boolean}
 */
function isHourDay(isoString) {
  const hour = new Date(isoString).getHours();
  return hour >= 6 && hour < 19;
}
