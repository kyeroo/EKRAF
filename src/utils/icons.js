const ICON_PATHS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  cloud: '<path d="M20 16.2A4.8 4.8 0 0 0 18 7h-1.2A7 7 0 1 0 4 15.3"/>',
  rain: '<path d="M20 16.2A4.8 4.8 0 0 0 18 7h-1.2A7 7 0 1 0 4 15.3M8 16l-1 4m6-4-1 4m6-4-1 4"/>',
  moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
  fog: '<path d="M4 10h16M2 14h20M5 18h14M6 6h12"/>',
  storm: '<path d="M20 16.2A4.8 4.8 0 0 0 18 7h-1.2A7 7 0 1 0 4 15.3M13 13l-3 5h4l-3 5"/>',
  snow: '<path d="M12 2v20m-7.1-16 14.2 12M4.9 20 19.1 8m-17 4h20"/>',
  thermometer: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  food: '<path d="M3 2v7a4 4 0 0 0 4 4h1v9M7 2v5m4-5v5a4 4 0 0 1-4 4M19 22V2a5 5 0 0 0-5 5v4h5"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v5m0-8h.01"/>',
  success: '<path d="m5 12 4 4L19 6"/>',
  error: '<path d="m18 6-12 12M6 6l12 12"/>',
  warning: '<path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  play: '<path d="m7 4 14 8-14 8V4Z"/>',
  pause: '<path d="M8 5h3v14H8zM16 5h3v14h-3z"/>',
  previous: '<path d="M19 20 9 12l10-8v16ZM5 19V5"/>',
  next: '<path d="m5 4 10 8-10 8V4Zm14 15V5"/>',
  volume: '<path d="m11 5-6 5H2v4h3l6 5V5Zm4.5 3.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13"/>',
  weather: '<path d="M20 16.2A4.8 4.8 0 0 0 18 7h-1.2A7 7 0 1 0 4 15.3M8 18h.01M12 20h.01M16 18h.01"/>',
};

export function iconSvg(name, size = 16) {
  const path = ICON_PATHS[name] || ICON_PATHS.cloud;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
