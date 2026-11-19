/**
 * weather.js — Open-Meteo API Integration
 * Fetches current weather + 24h hourly forecast. No API key required.
 */

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetch current weather + 24h hourly forecast for given coordinates.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<WeatherData>}
 */
export async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'weather_code',
      'uv_index',
      'is_day',
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'weather_code',
    ].join(','),
    forecast_days: 2,
    timezone: 'auto',
    wind_speed_unit: 'kmh',
  });

  const url = `${BASE_URL}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  return parseWeatherResponse(raw);
}

/**
 * Parse raw Open-Meteo response into clean app data shape.
 * @param {object} raw
 * @returns {WeatherData}
 */
function parseWeatherResponse(raw) {
  const { current, hourly, timezone } = raw;

  // Current conditions
  const currentData = {
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    wmoCode: current.weather_code,
    uvIndex: current.uv_index ?? 0,
    isDay: current.is_day === 1,
    timezone,
  };

  // Hourly forecast: get next 24 hours from current time
  const now = new Date();
  const currentHour = now.getHours();

  // Find the index of the current hour in hourly data
  const times = hourly.time; // ISO strings like "2024-01-01T14:00"
  const nowISOPrefix = now.toISOString().slice(0, 13); // "2024-01-01T14"

  let startIndex = times.findIndex(t => t.startsWith(nowISOPrefix));
  if (startIndex === -1) startIndex = 0;

  const hourlyData = [];
  for (let i = startIndex; i < Math.min(startIndex + 24, times.length); i++) {
    hourlyData.push({
      time: times[i],
      temp: Math.round(hourly.temperature_2m[i]),
      precipProb: hourly.precipitation_probability[i] ?? 0,
      wmoCode: hourly.weather_code[i],
      isNow: i === startIndex,
    });
  }

  return {
    current: currentData,
    hourly: hourlyData,
    fetchedAt: Date.now(),
  };
}
