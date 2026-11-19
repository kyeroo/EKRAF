/**
 * main.js — Entry Point & State Orchestration
 * Mesin Waktu Suasana
 */

import './style.css';

// API
import { fetchWeather } from './api/weather.js';
import { reverseGeocode } from './api/geocoding.js';

// Core
import { getVibeCategory, getGreeting, getRecommendations } from './core/vibeEngine.js';

// Canvas
import { AtmosphereCanvas } from './canvas/atmosphere.js';

// Components
import { renderCurrentWeather } from './components/currentWeather.js';
import { renderGreeting } from './components/greetingBar.js';
import { renderRecommendations } from './components/recommendations.js';
import { renderHourlyChart, setActiveForecastHour } from './components/hourlyChart.js';
import { initPlaylistPlayer, syncPlaylistForVibe } from './components/playlistPlayer.js';

// Utils
import { getCachedWeather, setCachedWeather } from './utils/storage.js';
import { formatHeaderTime } from './utils/formatters.js';
import { toast, show, hide, applyVibe } from './utils/dom.js';

/* ---------------------------------------------------------
   App State
   --------------------------------------------------------- */
const state = {
  coords: null,       // { lat, lon }
  cityName: 'Lokasimu',
  weatherData: null,  // parsed from API
  vibe: 'clear-day',
  isLoading: false,
  activeFilter: 'all',
  simulatedHour: null,
};
let lastRealClockHour = null;
let sliderAnimationFrame = null;

/* ---------------------------------------------------------
   Canvas instance
   --------------------------------------------------------- */
const canvas = new AtmosphereCanvas(document.getElementById('atmosphere-canvas'));

const PRESETS = [
  { name: 'Pagi Cerah', hour: 7 },
  { name: 'Siang Terik', hour: 13 },
  { name: 'Gerimis Sore', hour: 16 },
  { name: 'Malam Hujan', hour: 20 },
  { name: 'Tengah Malam', hour: 0 },
];

function getSimulatedWeather(hour) {
  const actual = state.weatherData.current;
  const scenario = hour >= 5 && hour <= 10
    ? { code: 0, delta: -2, feelsDelta: -1, humidity: 58, wind: 7, uv: 3 }
    : hour >= 11 && hour <= 14
      ? { code: 0, delta: 4, feelsDelta: 5, humidity: 48, wind: 11, uv: 8 }
      : hour >= 15 && hour <= 18
        ? { code: 51, delta: -2, feelsDelta: -2, humidity: 78, wind: 10, uv: 2 }
        : hour >= 19 && hour <= 22
          ? { code: 61, delta: -3, feelsDelta: -3, humidity: 88, wind: 14, uv: 0 }
          : { code: 0, delta: -4, feelsDelta: -3, humidity: 68, wind: 5, uv: 0 };

  const temp = actual.temp + scenario.delta;
  return {
    ...actual,
    temp,
    feelsLike: actual.feelsLike + scenario.feelsDelta,
    humidity: scenario.humidity,
    windSpeed: scenario.wind,
    uvIndex: scenario.uv,
    wmoCode: scenario.code,
    isDay: hour >= 5 && hour < 19,
  };
}

function updateTimeMachine(hour, isSimulation, sliderValue = hour) {
  const slider = document.getElementById('tm-slider');
  const label = document.getElementById('tm-time-label');
  const fill = document.getElementById('tm-track-fill');
  if (!slider || !label || !fill) return;

  slider.value = String(sliderValue);
  const visualValue = Number(slider.value);
  label.textContent = `${String(hour).padStart(2, '0')}:00`;
  fill.style.width = `${(visualValue / 23) * 100}%`;
  document.getElementById('tm-sim-badge').classList.toggle('hidden', !isSimulation);
  document.getElementById('tm-reset').classList.toggle('hidden', !isSimulation);

  const activePreset = PRESETS.find(preset => preset.hour === hour);
  document.querySelectorAll('.tm-preset').forEach(button => {
    const active = isSimulation && button.dataset.preset === activePreset?.name;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  setActiveForecastHour(hour);
}

function renderWeatherForHour(hour, current, isSimulation, sliderValue = hour) {
  const vibe = getVibeCategory(current.wmoCode, hour, current.isDay);
  state.vibe = vibe;
  applyVibe(vibe);
  canvas.setVibe(vibe);
  renderCurrentWeather(current, state.cityName);
  renderGreeting(getGreeting(vibe, state.cityName, hour, current.temp));
  renderRecommendations(getRecommendations(vibe, hour, current.temp), state.activeFilter);
  syncPlaylistForVibe(vibe, hour, isSimulation);
  if (!isSimulation) lastRealClockHour = hour;
  updateTimeMachine(hour, isSimulation, sliderValue);
}

function renderSelectedTime(hour, isSimulation = true, sliderValue = hour) {
  if (!state.weatherData) return;
  state.simulatedHour = isSimulation ? hour : null;
  const current = isSimulation ? getSimulatedWeather(hour) : state.weatherData.current;
  renderWeatherForHour(hour, current, isSimulation, sliderValue);
}

function cancelSliderAnimation() {
  if (sliderAnimationFrame !== null) {
    cancelAnimationFrame(sliderAnimationFrame);
    sliderAnimationFrame = null;
  }
}

function animateToHour(targetHour) {
  cancelSliderAnimation();
  const slider = document.getElementById('tm-slider');
  const startValue = Number(slider.value);
  const startTime = performance.now();
  const duration = 400;
  let lastRenderedHour = state.simulatedHour ?? Math.round(startValue);

  const animate = now => {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - ((1 - progress) ** 3);
    const sliderValue = startValue + (targetHour - startValue) * eased;
    const steppedValue = Math.round(sliderValue / 0.05) * 0.05;
    const hour = Math.round(steppedValue);

    if (hour !== lastRenderedHour || state.simulatedHour === null) {
      renderSelectedTime(hour, true, steppedValue);
      lastRenderedHour = hour;
    } else {
      updateTimeMachine(hour, true, steppedValue);
    }

    if (progress < 1) {
      sliderAnimationFrame = requestAnimationFrame(animate);
    } else {
      sliderAnimationFrame = null;
      renderSelectedTime(targetHour, true, targetHour);
    }
  };

  sliderAnimationFrame = requestAnimationFrame(animate);
}

/* ---------------------------------------------------------
   Geolocation
   --------------------------------------------------------- */

/**
 * Get user coordinates via browser Geolocation API.
 * @returns {Promise<{lat: number, lon: number}>}
 */
function getUserCoords() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung di browser ini.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        const messages = {
          1: 'Izin lokasi ditolak. Menggunakan Jakarta sebagai fallback.',
          2: 'Posisi tidak tersedia. Mencoba lagi...',
          3: 'Permintaan lokasi timeout. Menggunakan Jakarta.',
        };
        reject(new Error(messages[err.code] || 'Gagal mendapatkan lokasi.'));
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  });
}

/** Jakarta coordinates as fallback */
const JAKARTA_COORDS = { lat: -6.2088, lon: 106.8456 };

/* ---------------------------------------------------------
   Main App Flow
   --------------------------------------------------------- */

/**
 * Main initialization function.
 * Attempts geolocation → fetch weather → render everything.
 * @param {boolean} [forceRefresh] — bypass cache
 */
async function init(forceRefresh = false) {
  if (state.isLoading) return;
  state.isLoading = true;

  showLoadingState();

  try {
    // Step 1: Get coordinates
    let coords = state.coords;
    if (!coords) {
      try {
        coords = await getUserCoords();
        state.coords = coords;
      } catch (geoErr) {
        toast(geoErr.message, 'warning');
        coords = JAKARTA_COORDS;
        state.coords = coords;
        state.cityName = 'Jakarta';
      }
    }

    // Keep location lookup independent of the weather cache so the city is
    // still resolved on a cached first load.
    const cachedWeather = forceRefresh ? null : getCachedWeather();
    const shouldFetchWeather = !cachedWeather;
    const [weatherData, cityName] = await Promise.all([
      cachedWeather || fetchWeather(coords.lat, coords.lon),
      state.cityName === 'Lokasimu'
        ? reverseGeocode(coords.lat, coords.lon)
        : Promise.resolve(state.cityName),
    ]);

    state.cityName = cityName;
    if (shouldFetchWeather) {
      setCachedWeather(weatherData);
      if (forceRefresh) toast('Data cuaca diperbarui!', 'success');
    }

    state.weatherData = weatherData;

    // Step 3: Render the current time or retain the selected simulation.
    const hour = state.simulatedHour ?? new Date().getHours();
    const isSimulation = state.simulatedHour !== null;
    const current = isSimulation ? getSimulatedWeather(hour) : weatherData.current;
    renderWeatherForHour(hour, current, isSimulation);

    // Step 4: Render the forecast, which remains based on API data.
    renderHourlyChart(weatherData.hourly);
    setActiveForecastHour(hour);

    // Step 6: Show content
    showWeatherContent();

  } catch (err) {
    console.error('[main] Init error:', err);
    showErrorState(err.message);
  } finally {
    state.isLoading = false;
  }
}

/* ---------------------------------------------------------
   UI State Transitions
   --------------------------------------------------------- */

function showLoadingState() {
  show('loading-state');
  hide('weather-content');
  hide('error-state');
}

function showWeatherContent() {
  hide('loading-state');
  hide('error-state');
  show('weather-content');
}

function showErrorState(message) {
  hide('loading-state');
  hide('weather-content');
  show('error-state');
  const msgEl = document.getElementById('error-message');
  if (msgEl) msgEl.textContent = message || 'Terjadi kesalahan yang tidak diketahui.';
}

/* ---------------------------------------------------------
   Header Clock
   --------------------------------------------------------- */
function startClock() {
  const el = document.getElementById('current-time-display');
  if (!el) return;

  const update = () => {
    el.textContent = formatHeaderTime();
    const hour = new Date().getHours();
    if (state.weatherData && state.simulatedHour === null && hour !== lastRealClockHour) {
      syncPlaylistForVibe(state.vibe, hour);
      lastRealClockHour = hour;
    }
  };
  update();
  setInterval(update, 30_000); // update every 30 seconds
}

/* ---------------------------------------------------------
   Canvas startup
   --------------------------------------------------------- */
canvas.start();

/* ---------------------------------------------------------
   Event Bindings
   --------------------------------------------------------- */

// Refresh button
document.getElementById('btn-refresh')?.addEventListener('click', () => {
  init(true);
});

// Error state: Retry button
document.getElementById('btn-retry')?.addEventListener('click', () => {
  state.coords = null; // reset coords to retry geolocation
  init(true);
});

// Error state: Use Jakarta fallback
document.getElementById('btn-use-jakarta')?.addEventListener('click', () => {
  state.coords = JAKARTA_COORDS;
  state.cityName = 'Jakarta';
  init(true);
});

// Recommendation category tabs
document.querySelectorAll('.recs-tab').forEach(button => {
  button.addEventListener('click', () => {
    state.activeFilter = button.dataset.filter;
    document.querySelectorAll('.recs-tab').forEach(tab => {
      const active = tab === button;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    if (state.weatherData) {
      const hour = state.simulatedHour ?? new Date().getHours();
      const current = state.simulatedHour === null
        ? state.weatherData.current
        : getSimulatedWeather(hour);
      renderRecommendations(getRecommendations(state.vibe, hour, current.temp), state.activeFilter);
    }
  });
});

// Time machine slider and scenario presets
document.getElementById('tm-slider')?.addEventListener('input', event => {
  cancelSliderAnimation();
  const sliderValue = Number(event.currentTarget.value);
  const hour = Math.round(sliderValue);
  if (state.simulatedHour !== hour) renderSelectedTime(hour, true, sliderValue);
  else updateTimeMachine(hour, true, sliderValue);
});

document.querySelectorAll('.tm-preset').forEach(button => {
  button.addEventListener('click', () => {
    const preset = PRESETS.find(item => item.name === button.dataset.preset);
    if (preset) animateToHour(preset.hour);
  });
});

document.addEventListener('forecast-hour-select', event => {
  animateToHour(event.detail.hour);
});

document.getElementById('tm-reset')?.addEventListener('click', () => {
  if (!state.weatherData) return;
  cancelSliderAnimation();
  renderSelectedTime(new Date().getHours(), false);
});

/* ---------------------------------------------------------
   Auto-refresh every 10 minutes while page is visible
   --------------------------------------------------------- */
let autoRefreshTimer = null;

function scheduleAutoRefresh() {
  clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      init(); // will use cache if still fresh
    }
  }, 10 * 60 * 1000);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Refresh greeting text on tab focus (time may have changed)
    if (state.weatherData && state.vibe) {
      const hour = new Date().getHours();
      renderGreeting(getGreeting(state.vibe, state.cityName, hour, state.weatherData.current.temp));
    }
  }
});

/* ---------------------------------------------------------
   Boot
   --------------------------------------------------------- */
startClock();
scheduleAutoRefresh();
initPlaylistPlayer();
init();
