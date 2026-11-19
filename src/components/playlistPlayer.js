import { SynthPlayer } from '../audio/synthPlayer.js';
import { iconSvg } from '../utils/icons.js';
import { toast } from '../utils/dom.js';

const makeTrack = (title, artist, duration, tempo, rootMidi, chords, quality = 'major') => ({
  title,
  artist,
  duration,
  tempo,
  rootMidi,
  chords,
  quality,
});

const PLAYLISTS = {
  morning: {
    title: 'Acoustic Morning & Coffee',
    description: 'Tempo santai dan cerah untuk memulai hari.',
    atmosphere: 'wind',
    tracks: [
      makeTrack('Jendela Membuka Pagi', 'Arunika Senja', 184, 82, 60, [0, 5, 3, 4]),
      makeTrack('Kopi dan Cahaya', 'Nara Wening', 211, 88, 62, [0, 3, 5, 4]),
      makeTrack('Langkah Pertama', 'Rumi Laut', 196, 78, 57, [0, 4, 5, 3]),
    ],
  },
  afternoon: {
    title: 'Upbeat Indie & Focus Beats',
    description: 'Ritme ringan untuk menjaga fokus dan energi.',
    atmosphere: 'wind',
    tracks: [
      makeTrack('Kota Bergerak', 'Sora Pradana', 202, 104, 57, [0, 5, 3, 4]),
      makeTrack('Ruang untuk Ide', 'Kala Meridian', 188, 98, 60, [0, 3, 4, 5]),
      makeTrack('Satu Layar Lagi', 'Teras Utara', 217, 110, 55, [0, 4, 5, 3]),
    ],
  },
  drizzle: {
    title: 'Lo-Fi Rainy Window',
    description: 'Lapisan nada hangat untuk menemani gerimis.',
    atmosphere: 'rain',
    tracks: [
      makeTrack('Kaca Berkabut', 'Mira Hujan', 223, 72, 53, [0, 5, 3, 4], 'minor'),
      makeTrack('Lampu di Seberang', 'Senandika', 205, 68, 57, [0, 3, 6, 4], 'minor'),
      makeTrack('Rintik Pelan', 'Awan Kecil', 236, 76, 55, [0, 4, 5, 3], 'minor'),
    ],
  },
  rainy: {
    title: 'Midnight Jazz & Soft Piano',
    description: 'Harmoni lembut untuk malam yang lebih rileks.',
    atmosphere: 'rain',
    tracks: [
      makeTrack('Jalan Pulang', 'Bima Ardhana', 231, 66, 50, [0, 3, 5, 4], 'minor'),
      makeTrack('Jendela Tengah Malam', 'Laras Mahesa', 214, 70, 53, [0, 5, 4, 3], 'minor'),
      makeTrack('Nada Setelah Hujan', 'Raka Sembada', 242, 64, 48, [0, 4, 3, 5], 'minor'),
    ],
  },
  midnight: {
    title: 'Deep Sleep & Ambient Synth',
    description: 'Nada hening dengan perubahan yang perlahan.',
    atmosphere: 'none',
    tracks: [
      makeTrack('Ruang Tanpa Jam', 'Aksa Nirmala', 248, 56, 48, [0, 3, 5, 3], 'minor'),
      makeTrack('Biru Paling Sunyi', 'Niskala', 260, 52, 50, [0, 5, 3, 4], 'minor'),
      makeTrack('Cahaya Terakhir', 'Ruang Hening', 252, 58, 46, [0, 4, 3, 5], 'minor'),
    ],
  },
  focus: {
    title: 'Focused Frequencies',
    description: 'Pola stabil untuk sesi kerja dan belajar.',
    atmosphere: 'none',
    tracks: [
      makeTrack('Garis Konsentrasi', 'Titik Temu', 205, 92, 55, [0, 4, 5, 3]),
      makeTrack('Ritme Terukur', 'Studio Pagi', 218, 96, 57, [0, 3, 4, 5]),
      makeTrack('Selesaikan Satu Hal', 'Nada Karya', 199, 88, 53, [0, 5, 3, 4]),
    ],
  },
  relax: {
    title: 'Soft Space',
    description: 'Harmoni pelan untuk jeda dan istirahat.',
    atmosphere: 'wind',
    tracks: [
      makeTrack('Sore di Beranda', 'Purnama Kecil', 220, 64, 52, [0, 5, 3, 4], 'minor'),
      makeTrack('Napas yang Panjang', 'Rona Teduh', 238, 60, 50, [0, 3, 5, 4], 'minor'),
      makeTrack('Tempat untuk Pulang', 'Sela Arunika', 226, 68, 48, [0, 4, 3, 5], 'minor'),
    ],
  },
  energy: {
    title: 'Bright Momentum',
    description: 'Denyut cerah untuk menaikkan semangat.',
    atmosphere: 'wind',
    tracks: [
      makeTrack('Mulai Bergerak', 'Jalur Timur', 191, 112, 60, [0, 4, 5, 3]),
      makeTrack('Hari yang Terbuka', 'Sinar Kota', 207, 116, 57, [0, 5, 3, 4]),
      makeTrack('Langkah Lebih Jauh', 'Ruang Biru', 198, 108, 62, [0, 3, 4, 5]),
    ],
  },
};

const MOOD_PLAYLISTS = {
  focus: 'focus',
  relax: 'relax',
  energy: 'energy',
};

const MOOD_LABELS = {
  auto: 'Otomatis',
  focus: 'Fokus',
  relax: 'Santai',
  energy: 'Semangat',
};

let activeMood = 'auto';
let currentPlaylistKey = 'morning';
let currentTrackIndex = 0;
let lastAutoPlaylistKey = 'morning';
let effectsEnabled = true;
let progressTimer = null;

const synth = new SynthPlayer(() => moveTrack(1, true));

function getAutomaticPlaylistKey(vibe, hour, isSimulation) {
  if (isSimulation) {
    if (hour < 5 || hour >= 23) return 'midnight';
    if (hour >= 19) return 'rainy';
    if (hour >= 15) return 'drizzle';
    if (hour >= 11) return 'afternoon';
    return 'morning';
  }

  if (hour < 5 || hour >= 23) return 'midnight';
  if (vibe === 'rainy' || vibe === 'stormy') return hour >= 19 ? 'rainy' : 'drizzle';
  if (vibe === 'drizzle') return 'drizzle';
  if (hour >= 19) return 'rainy';
  if (hour >= 15) return 'drizzle';
  if (hour >= 11) return 'afternoon';
  return 'morning';
}

function formatTime(seconds) {
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function getCurrentPlaylist() {
  return PLAYLISTS[currentPlaylistKey];
}

function getCurrentTrack() {
  return getCurrentPlaylist().tracks[currentTrackIndex];
}

function renderPlaylist() {
  const playlist = getCurrentPlaylist();
  const tracks = document.getElementById('playlist-tracks');
  document.getElementById('playlist-mode-label').textContent = MOOD_LABELS[activeMood];
  document.getElementById('playlist-name').textContent = playlist.title;
  document.getElementById('playlist-description').textContent = playlist.description;
  tracks.innerHTML = playlist.tracks.map((track, index) => `
    <button class="playlist-track${index === currentTrackIndex ? ' selected' : ''}" type="button" data-track-index="${index}" aria-pressed="${index === currentTrackIndex}">
      <span class="playlist-track-icon">${iconSvg('music', 16)}</span>
      <span class="playlist-track-copy">
        <span class="playlist-track-title">${track.title}</span>
        <span class="playlist-track-artist">${track.artist}</span>
      </span>
      <span class="playlist-track-duration">${formatTime(track.duration)}</span>
      <span class="playlist-track-playing" aria-hidden="true">${iconSvg('music', 16)}</span>
    </button>
  `).join('');

  tracks.querySelectorAll('.playlist-track').forEach(button => {
    button.addEventListener('click', () => {
      currentTrackIndex = Number(button.dataset.trackIndex);
      renderPlaylist();
      startTrack(0);
    });
  });

  document.getElementById('player-current-title').textContent = getCurrentTrack().title;
  document.getElementById('player-current-artist').textContent = getCurrentTrack().artist;
  document.getElementById('player-track-position').textContent = `${String(currentTrackIndex + 1).padStart(2, '0')} / ${String(playlist.tracks.length).padStart(2, '0')}`;
  document.getElementById('player-track-duration').textContent = formatTime(getCurrentTrack().duration);
  updateProgress();
  updatePlaybackControls();
  synth.setAtmosphere(playlist.atmosphere, effectsEnabled);
}

function updateProgress() {
  const track = getCurrentTrack();
  const currentTime = Math.min(synth.currentTime, track.duration);
  const percent = (currentTime / track.duration) * 100;
  const fill = document.getElementById('player-progress-fill');
  const progress = document.getElementById('player-progress');
  if (fill) fill.style.width = `${percent}%`;
  if (progress) progress.setAttribute('aria-valuenow', String(Math.floor(percent)));
  document.getElementById('player-current-time').textContent = formatTime(currentTime);
}

function updatePlaybackControls() {
  const isPlaying = synth.isPlaying;
  const playButton = document.getElementById('player-play');
  const headerButton = document.getElementById('audio-pill');
  playButton.innerHTML = iconSvg(isPlaying ? 'pause' : 'play', 20);
  playButton.setAttribute('aria-label', isPlaying ? 'Jeda musik' : 'Putar musik');
  playButton.title = isPlaying ? 'Jeda' : 'Putar';
  headerButton.setAttribute('aria-pressed', String(isPlaying));
  headerButton.setAttribute('aria-label', isPlaying ? 'Jeda musik suasana' : 'Putar musik suasana');
  headerButton.title = isPlaying ? 'Jeda musik suasana' : 'Putar musik suasana';
  document.getElementById('playlist-widget').classList.toggle('is-playing', isPlaying);
}

async function startTrack(offset) {
  clearInterval(progressTimer);
  progressTimer = null;
  try {
    await synth.play(getCurrentTrack(), offset);
    updatePlaybackControls();
    clearInterval(progressTimer);
    progressTimer = setInterval(updateProgress, 200);
  } catch (error) {
    updatePlaybackControls();
    toast(error.message || 'Musik tidak dapat diputar.', 'error');
  }
}

function togglePlayback() {
  if (synth.isPlaying) {
    synth.pause();
    clearInterval(progressTimer);
    progressTimer = null;
    updateProgress();
    updatePlaybackControls();
    return;
  }

  const offset = synth.currentTrack === getCurrentTrack() ? synth.currentTime : 0;
  startTrack(offset);
}

function moveTrack(direction, autoplay = synth.isPlaying) {
  const wasPlaying = synth.isPlaying || autoplay;
  synth.pause();
  currentTrackIndex = (currentTrackIndex + direction + getCurrentPlaylist().tracks.length) % getCurrentPlaylist().tracks.length;
  renderPlaylist();
  if (wasPlaying) startTrack(0);
}

function setPlaylist(key) {
  if (key === currentPlaylistKey) {
    synth.setAtmosphere(getCurrentPlaylist().atmosphere, effectsEnabled);
    return;
  }

  const wasPlaying = synth.isPlaying;
  synth.pause();
  clearInterval(progressTimer);
  progressTimer = null;
  currentPlaylistKey = key;
  currentTrackIndex = 0;
  renderPlaylist();
  if (wasPlaying) startTrack(0);
}

export function initPlaylistPlayer() {
  document.querySelectorAll('.playlist-mood').forEach(button => {
    button.addEventListener('click', () => {
      activeMood = button.dataset.mood;
      document.querySelectorAll('.playlist-mood').forEach(moodButton => {
        const active = moodButton === button;
        moodButton.classList.toggle('active', active);
        moodButton.setAttribute('aria-pressed', String(active));
      });

      const key = activeMood === 'auto' ? lastAutoPlaylistKey : MOOD_PLAYLISTS[activeMood];
      setPlaylist(key);
    });
  });

  document.getElementById('player-play').addEventListener('click', togglePlayback);
  document.getElementById('audio-pill').addEventListener('click', togglePlayback);
  document.getElementById('player-previous').addEventListener('click', () => moveTrack(-1));
  document.getElementById('player-next').addEventListener('click', () => moveTrack(1));
  document.getElementById('player-volume').addEventListener('input', event => {
    synth.setVolume(Number(event.currentTarget.value));
  });
  document.getElementById('player-effects').addEventListener('click', event => {
    effectsEnabled = !effectsEnabled;
    event.currentTarget.setAttribute('aria-pressed', String(effectsEnabled));
    event.currentTarget.classList.toggle('active', effectsEnabled);
    document.querySelector('.player-effects-state').textContent = effectsEnabled ? 'Aktif' : 'Nonaktif';
    synth.setAtmosphere(getCurrentPlaylist().atmosphere, effectsEnabled);
  });

  document.getElementById('player-previous').innerHTML = iconSvg('previous', 18);
  document.getElementById('player-next').innerHTML = iconSvg('next', 18);
  document.getElementById('player-volume-icon').innerHTML = iconSvg('volume', 16);
  document.getElementById('player-effects-icon').innerHTML = iconSvg('weather', 16);
  document.getElementById('player-effects').setAttribute('aria-pressed', 'true');
  document.getElementById('player-effects').classList.add('active');
  renderPlaylist();
  window.addEventListener('pagehide', () => synth.dispose(), { once: true });
}

export function syncPlaylistForVibe(vibe, hour, isSimulation = false) {
  lastAutoPlaylistKey = getAutomaticPlaylistKey(vibe, hour, isSimulation);
  if (activeMood === 'auto') setPlaylist(lastAutoPlaylistKey);
}
