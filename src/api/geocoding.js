/**
 * geocoding.js — Reverse geocoding via Nominatim (OpenStreetMap)
 * Converts lat/lon into a human-readable city/district name.
 * No API key required. Free & open source.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Reverse geocode coordinates to a city/district name.
 * Returns a location-specific fallback if the lookup has no named result.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<string>} City name in Indonesian context
 */
export async function reverseGeocode(lat, lon) {
  try {
    const params = new URLSearchParams({
      lat: lat.toFixed(5),
      lon: lon.toFixed(5),
      format: 'json',
      zoom: 10,
      'accept-language': 'id,en',
    });

    const response = await fetch(`${NOMINATIM_BASE}?${params}`, {
      headers: {
        'User-Agent': 'MesinWaktuSuasana/1.0 (weather mood app)',
      },
    });

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();
    const addr = data.address || {};

    // Prefer a city or local district over a broader county or state.
    const name =
      addr.city ||
      addr.town ||
      addr.city_district ||
      addr.municipality ||
      addr.village ||
      addr.suburb ||
      addr.hamlet ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      data.display_name?.split(',')[0] ||
      `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

    // Strip "Kota " prefix for cleaner display
    return name.replace(/^Kota\s+/i, '');
  } catch {
    return 'Lokasimu';
  }
}
