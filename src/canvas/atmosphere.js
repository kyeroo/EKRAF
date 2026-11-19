/**
 * atmosphere.js — Canvas Particle System for Atmospheric Effects
 * Renders rain, drizzle, storm particles + star field for night.
 * Uses requestAnimationFrame loop with clean start/stop lifecycle.
 */

export class AtmosphereCanvas {
  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {CanvasRenderingContext2D} */
  #ctx;
  /** @type {string} current vibe category */
  #vibe = 'clear-day';
  /** @type {number|null} RAF id */
  #animId = null;
  /** @type {Particle[]} */
  #particles = [];
  /** @type {number} */
  #lastTime = 0;

  constructor(canvasEl) {
    this.#canvas = canvasEl;
    this.#ctx = canvasEl.getContext('2d');
    this.#resize();
    window.addEventListener('resize', () => this.#resize());
  }

  /** Resize canvas to match window size */
  #resize() {
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;
    // Re-seed particles on resize
    if (this.#vibe) this.#seed();
  }

  /**
   * Set a new vibe and re-seed particles.
   * @param {string} vibe
   */
  setVibe(vibe) {
    this.#vibe = vibe;
    this.#seed();
  }

  /** Seed particle array based on current vibe */
  #seed() {
    this.#particles = [];
    const { width, height } = this.#canvas;
    const config = this.#getParticleConfig();

    if (!config) return;

    for (let i = 0; i < config.count; i++) {
      this.#particles.push(this.#createParticle(width, height, config, true));
    }
  }

  /** Create a single particle with randomized properties */
  #createParticle(w, h, cfg, initial = false) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : -10,
      speedX: cfg.speedX + (Math.random() - 0.5) * cfg.speedXVariance,
      speedY: cfg.speedY + Math.random() * cfg.speedYVariance,
      length: cfg.minLength + Math.random() * (cfg.maxLength - cfg.minLength),
      opacity: cfg.minOpacity + Math.random() * (cfg.maxOpacity - cfg.minOpacity),
      width: cfg.minWidth + Math.random() * (cfg.maxWidth - cfg.minWidth),
      color: cfg.color,
      type: cfg.type,
      twinkle: cfg.type === 'star' ? Math.random() * Math.PI * 2 : 0,
      twinkleSpeed: 0.02 + Math.random() * 0.03,
    };
  }

  /** Get particle configuration for the current vibe */
  #getParticleConfig() {
    const configs = {
      'rainy': {
        type: 'rain',
        count: 150,
        speedX: -2,
        speedXVariance: 2,
        speedY: 18,
        speedYVariance: 8,
        minLength: 15,
        maxLength: 30,
        minWidth: 1,
        maxWidth: 1.5,
        minOpacity: 0.3,
        maxOpacity: 0.7,
        color: 'rgba(147, 197, 253, VAL)',
      },
      'drizzle': {
        type: 'rain',
        count: 80,
        speedX: -0.5,
        speedXVariance: 1,
        speedY: 8,
        speedYVariance: 4,
        minLength: 6,
        maxLength: 12,
        minWidth: 0.8,
        maxWidth: 1.2,
        minOpacity: 0.25,
        maxOpacity: 0.5,
        color: 'rgba(186, 230, 253, VAL)',
      },
      'stormy': {
        type: 'rain',
        count: 220,
        speedX: -6,
        speedXVariance: 4,
        speedY: 25,
        speedYVariance: 10,
        minLength: 20,
        maxLength: 45,
        minWidth: 1.5,
        maxWidth: 2,
        minOpacity: 0.4,
        maxOpacity: 0.8,
        color: 'rgba(148, 163, 184, VAL)',
      },
      'clear-night': {
        type: 'star',
        count: 120,
        speedX: 0,
        speedXVariance: 0,
        speedY: 0,
        speedYVariance: 0,
        minLength: 1,
        maxLength: 3,
        minWidth: 1,
        maxWidth: 3,
        minOpacity: 0.4,
        maxOpacity: 1,
        color: 'rgba(224, 231, 255, VAL)',
      },
      'foggy': {
        type: 'fog',
        count: 8,
        speedX: 0.3,
        speedXVariance: 0.3,
        speedY: 0,
        speedYVariance: 0,
        minLength: 200,
        maxLength: 400,
        minWidth: 60,
        maxWidth: 120,
        minOpacity: 0.03,
        maxOpacity: 0.08,
        color: 'rgba(255, 255, 255, VAL)',
      },
    };

    return configs[this.#vibe] || null;
  }

  /** Animation loop */
  #loop(ts) {
    const dt = Math.min((ts - this.#lastTime) / 16.67, 3); // cap at 3 frames
    this.#lastTime = ts;

    const { width, height } = this.#canvas;
    this.#ctx.clearRect(0, 0, width, height);

    const cfg = this.#getParticleConfig();
    if (!cfg) {
      this.#animId = requestAnimationFrame(ts => this.#loop(ts));
      return;
    }

    this.#ctx.save();

    for (let i = 0; i < this.#particles.length; i++) {
      const p = this.#particles[i];

      if (p.type === 'rain') {
        this.#drawRain(p, cfg);
        p.x += p.speedX * dt;
        p.y += p.speedY * dt;
        // Reset if off screen
        if (p.y > height || p.x < -20 || p.x > width + 20) {
          Object.assign(p, this.#createParticle(width, height, cfg, false));
        }

      } else if (p.type === 'star') {
        p.twinkle += p.twinkleSpeed;
        const opacity = p.opacity * (0.6 + 0.4 * Math.sin(p.twinkle));
        this.#drawStar(p, opacity);

      } else if (p.type === 'fog') {
        this.#drawFog(p);
        p.x += p.speedX * dt;
        if (p.x > width + p.length) p.x = -p.length;
      }
    }

    this.#ctx.restore();
    this.#animId = requestAnimationFrame(ts => this.#loop(ts));
  }

  /** Draw a rain streak */
  #drawRain(p, cfg) {
    const opacity = p.opacity;
    const color = cfg.color.replace('VAL', opacity);

    this.#ctx.beginPath();
    this.#ctx.moveTo(p.x, p.y);
    this.#ctx.lineTo(p.x + p.speedX * 1.5, p.y + p.length);
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = p.width;
    this.#ctx.lineCap = 'round';
    this.#ctx.stroke();
  }

  /** Draw a twinkling star */
  #drawStar(p, opacity) {
    this.#ctx.beginPath();
    this.#ctx.arc(p.x, p.y, p.width / 2, 0, Math.PI * 2);
    this.#ctx.fillStyle = `rgba(224, 231, 255, ${opacity})`;
    this.#ctx.fill();

    // Glow for brighter stars
    if (p.width > 2) {
      this.#ctx.beginPath();
      this.#ctx.arc(p.x, p.y, p.width, 0, Math.PI * 2);
      this.#ctx.fillStyle = `rgba(199, 210, 254, ${opacity * 0.3})`;
      this.#ctx.fill();
    }
  }

  /** Draw fog particle (large blurry ellipse) */
  #drawFog(p) {
    const gradient = this.#ctx.createRadialGradient(
      p.x, p.y, 0,
      p.x, p.y, p.length / 2
    );
    gradient.addColorStop(0, `rgba(255,255,255,${p.opacity})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    this.#ctx.beginPath();
    this.#ctx.ellipse(p.x, p.y, p.length / 2, p.width / 2, 0, 0, Math.PI * 2);
    this.#ctx.fillStyle = gradient;
    this.#ctx.fill();
  }

  /** Start the animation loop */
  start() {
    if (this.#animId !== null) return;
    this.#lastTime = performance.now();
    this.#animId = requestAnimationFrame(ts => this.#loop(ts));
  }

  /** Stop the animation loop and clear canvas */
  stop() {
    if (this.#animId !== null) {
      cancelAnimationFrame(this.#animId);
      this.#animId = null;
    }
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }
}
