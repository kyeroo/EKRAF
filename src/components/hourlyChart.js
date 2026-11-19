/**
 * hourlyChart.js — Renders the scrollable 24-hour forecast chart
 */

import { formatHour, getTempRange, normalizeTempToPercent } from '../utils/formatters.js';
import { getWeatherIcon } from '../core/vibeEngine.js';
import { clearEl, el } from '../utils/dom.js';
import { iconSvg } from '../utils/icons.js';

let activeForecastSlot = null;

function getHour(time) {
  return new Date(time).getHours();
}

export function setActiveForecastHour(hour) {
  const chart = document.getElementById('spline-slots');
  const wrapper = document.querySelector('.spline-chart-wrapper');
  if (!chart || !wrapper || !chart.children.length) return;

  const slots = [...chart.children];
  const target = slots.reduce((closest, slot) => {
    const slotHour = Number(slot.dataset.hour);
    const distance = Math.min(Math.abs(slotHour - hour), 24 - Math.abs(slotHour - hour));
    if (!closest || distance < closest.distance) return { slot, distance };
    return closest;
  }, null)?.slot;
  if (!target) return;

  const selectionChanged = target !== activeForecastSlot;
  slots.forEach(slot => {
    const active = slot === target;
    slot.classList.toggle('is-active', active);
    if (active) slot.setAttribute('aria-current', 'time');
    else slot.removeAttribute('aria-current');
  });

  const activeIndex = Number(target.dataset.index);
  document.querySelectorAll('.spline-point').forEach(point => {
    const active = Number(point.dataset.pointIndex) === activeIndex;
    point.classList.toggle('is-active', active);
  });
  if (!selectionChanged) return;
  activeForecastSlot = target;

  const slotRect = target.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();
  if (slotRect.left < wrapperRect.left || slotRect.right > wrapperRect.right) {
    const left = wrapper.scrollLeft + slotRect.left - wrapperRect.left
      - (wrapper.clientWidth - target.clientWidth) / 2;
    wrapper.scrollTo({
      left: Math.max(0, Math.min(left, wrapper.scrollWidth - wrapper.clientWidth)),
      behavior: 'smooth',
    });
  }
}

function selectForecastHour(slot) {
  document.dispatchEvent(new CustomEvent('forecast-hour-select', {
    detail: { hour: Number(slot.dataset.hour) },
  }));
}

/**
 * Render the 24-hour scrollable forecast chart.
 * @param {Array<HourlySlot>} hourlyData
 */
export function renderHourlyChart(hourlyData) {
  const chart = document.getElementById('spline-slots');
  const svg = document.getElementById('spline-svg');
  if (!chart || !svg || !hourlyData?.length) return;

  clearEl(chart);
  activeForecastSlot = null;

  const { min, max } = getTempRange(hourlyData);
  const slotWidth = 56;
  const chartWidth = hourlyData.length * slotWidth;
  const chartHeight = 120;
  const points = hourlyData.map((slot, index) => {
    const x = slotWidth * index + slotWidth / 2;
    const normalized = normalizeTempToPercent(slot.temp, min, max);
    return { x, y: chartHeight - 16 - normalized * (chartHeight - 64) };
  });
  const linePath = points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ');
  svg.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight}`);
  svg.setAttribute('width', chartWidth);
  svg.setAttribute('height', chartHeight);
  svg.innerHTML = `
    <path d="${linePath} L${chartWidth - slotWidth / 2},${chartHeight} L${slotWidth / 2},${chartHeight} Z" fill="rgba(var(--accent-rgb),0.08)"></path>
    <path d="${linePath}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    ${hourlyData.map((slot, index) => slot.isNow
      ? `<g class="spline-now-badge" transform="translate(${points[index].x}, 0)"><rect x="-15" y="4" width="30" height="16" rx="8"></rect><text x="0" y="15">NOW</text></g>`
      : '').join('')}
    ${points.map((point, index) => `<circle class="spline-point" data-point-index="${index}" cx="${point.x}" cy="${point.y}" r="3" fill="var(--accent)"></circle>`).join('')}
  `;
  chart.style.width = `${chartWidth}px`;

  hourlyData.forEach((slot, idx) => {
    const { icon } = getWeatherIcon(slot.wmoCode, isHourDay(slot.time));
    const isNow = slot.isNow;

    const slotEl = el('div', {
      className: `spline-slot${isNow ? ' is-now' : ''}`,
      attrs: {
        role: 'listitem',
        tabindex: '0',
        'aria-label': `${formatHour(slot.time)}: ${slot.temp}°C, curah hujan ${slot.precipProb}%`,
        'data-hour': getHour(slot.time),
        'data-index': idx,
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
    slotEl.addEventListener('click', () => selectForecastHour(slotEl));
    slotEl.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectForecastHour(slotEl);
      }
    });
  });

  const currentHour = hourlyData.find(slot => slot.isNow);
  if (currentHour) requestAnimationFrame(() => setActiveForecastHour(getHour(currentHour.time)));
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
