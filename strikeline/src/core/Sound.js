// Procedural sound effects with the Web Audio API (no audio files needed).

import { settings } from '../settings.js';

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noise = null;
  }

  // Must be called from a user gesture at least once (browser autoplay policy).
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.applyVolume();
      // Shared white-noise buffer.
      const len = this.ctx.sampleRate * 2;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      // Simple echo send for big outdoor shots.
      this.echo = this.ctx.createDelay(1);
      this.echo.delayTime.value = 0.21;
      const fb = this.ctx.createGain();
      fb.gain.value = 0.32;
      const echoFilter = this.ctx.createBiquadFilter();
      echoFilter.type = 'lowpass';
      echoFilter.frequency.value = 1400;
      this.echo.connect(echoFilter);
      echoFilter.connect(fb);
      fb.connect(this.echo);
      echoFilter.connect(this.master);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  get ready() {
    return this.ctx && this.ctx.state === 'running';
  }

  applyVolume() {
    if (this.master) this.master.gain.value = (settings.volume / 10) * 0.8;
  }

  // Output chain: gain -> stereo pan -> master (+ optional echo send).
  out(gain, pan = 0, echo = 0) {
    const g = this.ctx.createGain();
    g.gain.value = gain;
    let node = g;
    if (this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      g.connect(p);
      node = p;
    }
    node.connect(this.master);
    if (echo > 0) {
      const e = this.ctx.createGain();
      e.gain.value = echo;
      g.connect(e);
      e.connect(this.echo);
    }
    return g;
  }

  noiseBurst(dest, { t = 0, dur = 0.1, type = 'bandpass', freq = 1000, q = 1, gain = 1, attack = 0.002 }) {
    const c = this.ctx;
    const now = c.currentTime + t;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gain, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    src.start(now, Math.random() * 1.5);
    src.stop(now + dur + 0.05);
  }

  tone(dest, { t = 0, dur = 0.1, type = 'sine', f0 = 440, f1 = f0, gain = 0.5, attack = 0.003 }) {
    const c = this.ctx;
    const now = c.currentTime + t;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, now);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), now + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gain, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g);
    g.connect(dest);
    o.start(now);
    o.stop(now + dur + 0.05);
  }

  // distance in metres (0 = the player), pan -1..1
  gunshot(kind, distance = 0, pan = 0) {
    if (!this.ready) return;
    const near = distance < 1;
    const att = near ? 1 : Math.min(1, 14 / (distance + 6));
    // Far shots lose their high end.
    const far = Math.min(1, distance / 80);
    if (kind === 'sniper') {
      const o = this.out(1.1 * att, pan, 0.45);
      this.noiseBurst(o, { dur: 0.06, type: 'highpass', freq: 2600 - far * 1800, gain: 1.4 });
      this.noiseBurst(o, { dur: 1.0, type: 'lowpass', freq: 700, gain: 1.0, attack: 0.004 });
      this.tone(o, { dur: 0.45, f0: 95, f1: 32, gain: 0.9 });
      if (near) {
        // Bolt cycle
        this.noiseBurst(o, { t: 0.55, dur: 0.05, type: 'bandpass', freq: 2500, q: 4, gain: 0.25 });
        this.noiseBurst(o, { t: 0.8, dur: 0.05, type: 'bandpass', freq: 1900, q: 4, gain: 0.3 });
      }
    } else if (kind === 'pistol') {
      const o = this.out(0.65 * att, pan, 0.12);
      this.noiseBurst(o, { dur: 0.09, type: 'bandpass', freq: 2200 - far * 1200, q: 0.7, gain: 1.2 });
      this.tone(o, { dur: 0.07, f0: 180, f1: 60, gain: 0.6 });
    } else {
      const o = this.out(0.6 * att, pan, 0.15);
      this.noiseBurst(o, { dur: 0.13, type: 'bandpass', freq: 1300 - far * 700, q: 0.6, gain: 1.3 });
      this.noiseBurst(o, { dur: 0.05, type: 'highpass', freq: 3500, gain: 0.4 * (1 - far) });
      this.tone(o, { dur: 0.09, f0: 140, f1: 45, gain: 0.7 });
    }
  }

  hitmarker(kill = false) {
    if (!this.ready) return;
    const o = this.out(0.35);
    this.tone(o, { dur: 0.05, type: 'triangle', f0: 1900, gain: 0.6 });
    if (kill) this.tone(o, { t: 0.06, dur: 0.12, type: 'triangle', f0: 1300, f1: 1250, gain: 0.5 });
  }

  hurt() {
    if (!this.ready) return;
    const o = this.out(0.6);
    this.noiseBurst(o, { dur: 0.15, type: 'lowpass', freq: 400, gain: 1 });
    this.tone(o, { dur: 0.18, f0: 110, f1: 55, gain: 0.6 });
  }

  reload(time) {
    if (!this.ready) return;
    const o = this.out(0.35);
    this.noiseBurst(o, { t: 0.1, dur: 0.05, type: 'bandpass', freq: 1600, q: 5, gain: 0.8 });
    this.noiseBurst(o, { t: time * 0.55, dur: 0.06, type: 'bandpass', freq: 1100, q: 5, gain: 0.9 });
    this.noiseBurst(o, { t: time * 0.9, dur: 0.05, type: 'bandpass', freq: 2400, q: 5, gain: 0.8 });
  }

  dryFire() {
    if (!this.ready) return;
    this.noiseBurst(this.out(0.3), { dur: 0.03, type: 'bandpass', freq: 3000, q: 6, gain: 0.8 });
  }

  swap() {
    if (!this.ready) return;
    this.noiseBurst(this.out(0.25), { dur: 0.08, type: 'bandpass', freq: 900, q: 3, gain: 0.8 });
  }

  melee() {
    if (!this.ready) return;
    this.noiseBurst(this.out(0.4), { dur: 0.18, type: 'bandpass', freq: 600, q: 1.5, gain: 0.8, attack: 0.05 });
  }

  footstep(gain = 0.12, pan = 0) {
    if (!this.ready) return;
    this.noiseBurst(this.out(gain, pan), { dur: 0.07, type: 'lowpass', freq: 500 + Math.random() * 200, gain: 1 });
  }

  land() {
    if (!this.ready) return;
    this.noiseBurst(this.out(0.25), { dur: 0.12, type: 'lowpass', freq: 300, gain: 1 });
  }

  ui(kind = 'move') {
    if (!this.ready) return;
    const o = this.out(0.18);
    if (kind === 'move') this.tone(o, { dur: 0.04, type: 'square', f0: 660, gain: 0.25 });
    else if (kind === 'select') {
      this.tone(o, { dur: 0.06, type: 'square', f0: 880, gain: 0.25 });
      this.tone(o, { t: 0.05, dur: 0.08, type: 'square', f0: 1320, gain: 0.2 });
    } else if (kind === 'back') this.tone(o, { dur: 0.07, type: 'square', f0: 440, f1: 330, gain: 0.25 });
  }

  horn(win = true) {
    if (!this.ready) return;
    const o = this.out(0.25);
    const notes = win ? [262, 330, 392] : [196, 233, 277];
    for (const f of notes) this.tone(o, { dur: 1.2, type: 'sawtooth', f0: f, gain: 0.18, attack: 0.05 });
  }
}

export const sound = new SoundSystem();
