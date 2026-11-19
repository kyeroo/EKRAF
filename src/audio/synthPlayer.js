export class SynthPlayer {
  #context = null;
  #masterGain = null;
  #noiseGain = null;
  #noiseFilter = null;
  #noiseSource = null;
  #voices = new Set();
  #timer = null;
  #track = null;
  #startedAt = 0;
  #offset = 0;
  #nextStep = 0;
  #volume = 0.65;
  #atmosphere = 'none';
  #effectsEnabled = true;
  #playing = false;
  #onEnded;

  constructor(onEnded) {
    this.#onEnded = onEnded;
  }

  get isPlaying() {
    return this.#playing;
  }

  get currentTrack() {
    return this.#track;
  }

  get currentTime() {
    if (!this.#playing || !this.#context) return this.#offset;
    return Math.min(this.#track.duration, this.#offset + this.#context.currentTime - this.#startedAt);
  }

  async play(track, offset = 0) {
    if (!track) throw new Error('Tidak ada lagu untuk diputar.');
    const context = this.#ensureAudioGraph();
    if (this.#playing) this.pause();

    await context.resume();
    if (context.state !== 'running') {
      throw new Error('Audio belum dapat diputar. Periksa izin audio browser.');
    }

    this.#track = track;
    this.#offset = Math.max(0, Math.min(offset, track.duration));
    this.#startedAt = context.currentTime;
    this.#nextStep = Math.floor(this.#offset / this.#stepDuration());
    this.#playing = true;
    this.#applyAtmosphere();
    this.#scheduleAhead();
    this.#timer = setInterval(() => this.#scheduleAhead(), 180);
  }

  pause() {
    if (!this.#playing) return;
    this.#offset = this.currentTime;
    this.#playing = false;
    clearInterval(this.#timer);
    this.#timer = null;
    this.#applyAtmosphere();
    this.#stopVoices();
  }

  setVolume(value) {
    this.#volume = Math.max(0, Math.min(1, value));
    if (this.#masterGain && this.#context) {
      this.#masterGain.gain.setTargetAtTime(this.#volume, this.#context.currentTime, 0.04);
    }
  }

  setAtmosphere(type, enabled) {
    this.#atmosphere = type;
    this.#effectsEnabled = enabled;
    this.#applyAtmosphere();
  }

  dispose() {
    this.pause();
    if (this.#noiseSource) this.#noiseSource.stop();
    if (this.#context && this.#context.state !== 'closed') this.#context.close();
  }

  #ensureAudioGraph() {
    if (this.#context) return this.#context;

    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      throw new Error('Browser ini tidak mendukung Web Audio API.');
    }

    const context = new AudioContextConstructor();
    const masterGain = context.createGain();
    const masterFilter = context.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.value = 3200;
    masterGain.gain.value = this.#volume;
    masterGain.connect(masterFilter);
    masterFilter.connect(context.destination);

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let i = 0; i < channel.length; i++) channel[i] = Math.random() * 2 - 1;

    const noiseSource = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    noiseFilter.type = 'lowpass';
    noiseGain.gain.value = 0;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start();

    this.#context = context;
    this.#masterGain = masterGain;
    this.#noiseGain = noiseGain;
    this.#noiseFilter = noiseFilter;
    this.#noiseSource = noiseSource;
    this.#applyAtmosphere();
    return context;
  }

  #stepDuration() {
    return (60 / this.#track.tempo) * 2;
  }

  #scheduleAhead() {
    if (!this.#playing || !this.#context || !this.#track) return;

    const position = this.currentTime;
    if (position >= this.#track.duration) {
      this.#finish();
      return;
    }

    const context = this.#context;
    const stepDuration = this.#stepDuration();
    const scheduleThrough = position + 1.1;
    while (this.#offset + this.#nextStep * stepDuration < scheduleThrough) {
      const stepPosition = this.#nextStep * stepDuration;
      if (stepPosition >= this.#track.duration) break;

      const startAt = Math.max(
        context.currentTime + 0.025,
        this.#startedAt + stepPosition - this.#offset
      );
      const chord = this.#track.chords[this.#nextStep % this.#track.chords.length];
      this.#playChord(this.#track.rootMidi + chord, startAt, stepDuration * 1.35);
      this.#nextStep++;
    }
  }

  #playChord(rootMidi, startAt, duration) {
    const context = this.#context;
    const semitones = this.#track.quality === 'minor' ? [0, 3, 7] : [0, 4, 7];
    const levels = [0.09, 0.045, 0.03];
    const pans = [-0.2, 0, 0.2];

    semitones.forEach((semitone, index) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      const panner = context.createStereoPanner();
      const position = startAt - this.#startedAt + this.#offset;
      const voiceDuration = Math.max(0.35, Math.min(duration, this.#track.duration - position));
      const endAt = startAt + voiceDuration;
      const attackEnd = startAt + Math.min(0.22, voiceDuration * 0.25);
      const releaseStart = Math.max(attackEnd, endAt - 0.45);

      oscillator.type = 'sine';
      oscillator.frequency.value = 440 * (2 ** ((rootMidi + semitone - 69) / 12));
      panner.pan.value = pans[index];
      envelope.gain.setValueAtTime(0.0001, startAt);
      envelope.gain.linearRampToValueAtTime(levels[index], attackEnd);
      envelope.gain.setValueAtTime(levels[index], releaseStart);
      envelope.gain.exponentialRampToValueAtTime(0.0001, endAt);

      oscillator.connect(envelope);
      envelope.connect(panner);
      panner.connect(this.#masterGain);
      const voice = { oscillator, endAt };
      this.#voices.add(voice);
      oscillator.addEventListener('ended', () => this.#voices.delete(voice), { once: true });
      oscillator.start(startAt);
      oscillator.stop(endAt + 0.02);
    });
  }

  #applyAtmosphere() {
    if (!this.#noiseGain || !this.#noiseFilter || !this.#context) return;

    const gains = { rain: 0.025, wind: 0.012, none: 0 };
    const frequencies = { rain: 1100, wind: 420, none: 700 };
    this.#noiseFilter.frequency.setTargetAtTime(
      frequencies[this.#atmosphere] || frequencies.none,
      this.#context.currentTime,
      0.2
    );
    this.#noiseGain.gain.setTargetAtTime(
      this.#playing && this.#effectsEnabled ? (gains[this.#atmosphere] || 0) : 0,
      this.#context.currentTime,
      0.25
    );
  }

  #stopVoices() {
    if (!this.#context) return;
    const stopAt = this.#context.currentTime + 0.025;
    for (const voice of this.#voices) {
      if (voice.endAt > stopAt) voice.oscillator.stop(stopAt);
    }
    this.#voices.clear();
  }

  #finish() {
    this.#playing = false;
    this.#offset = 0;
    clearInterval(this.#timer);
    this.#timer = null;
    this.#applyAtmosphere();
    this.#stopVoices();
    this.#onEnded?.();
  }
}
