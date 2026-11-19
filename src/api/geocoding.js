/**
 * geocoding.js — Reverse geocoding via Nominatim (OpenStreetMap)
 * Converts lat/lon into a human-readable city/district name.
 * No API key required. Free & open source.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Reverse geocode coordinates to a city/district name.
 * Returns "Jakarta" as fallback if the lookup fails.
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

    // Priority: city > town > county > state
    const name =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      'Lokasimu';

    // Strip "Kota " prefix for cleaner display
    return name.replace(/^Kota\s+/i, '');
  } catch {
    return 'Lokasimu';
  }
}
