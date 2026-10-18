// Unified input: Xbox controller (Gamepad API, standard mapping) + keyboard/mouse fallback.
// Each frame call poll(dt); read the resulting `state` object.

import { settings } from '../settings.js';

// Standard gamepad mapping indices.
export const PAD = {
  A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7,
  VIEW: 8, MENU: 9, L3: 10, R3: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15,
};

function emptyState() {
  return {
    moveX: 0, moveY: 0, // left stick / WASD, y+ = forward
    padLookX: 0, padLookY: 0, // right stick after deadzone + curve (-1..1)
    mouseDX: 0, mouseDY: 0, // raw pixels this frame
    fire: false, firePressed: false,
    ads: false,
    jumpPressed: false,
    crouchPressed: false,
    crouchHeld: false,
    sprintPressed: false, sprintHeld: false,
    reloadPressed: false,
    switchPressed: false,
    meleePressed: false,
    pausePressed: false,
    scoreboard: false,
    // Menu navigation (edge + auto-repeat)
    up: false, down: false, left: false, right: false,
    confirm: false, back: false,
  };
}

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.state = emptyState();
    this.keys = new Set();
    this.keyEdges = new Set();
    this.mouseButtons = new Set();
    this.mouseEdges = new Set();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.wheel = 0;
    this.prevPad = [];
    this.padIndex = -1;
    this.padName = '';
    this.lastDevice = 'kbm';
    this.repeat = {}; // nav auto-repeat timers
    this.listeners = new Set();

    addEventListener('keydown', (e) => {
      if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (!e.repeat) this.keyEdges.add(e.code);
      this.keys.add(e.code);
      this.setDevice('kbm');
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    addEventListener('mousedown', (e) => {
      this.mouseButtons.add(e.button);
      this.mouseEdges.add(e.button);
      this.setDevice('kbm');
    });
    addEventListener('mouseup', (e) => this.mouseButtons.delete(e.button));
    addEventListener('contextmenu', (e) => e.preventDefault());
    addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.canvas) {
        this.mouseDX += e.movementX;
        this.mouseDY += e.movementY;
        if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) this.setDevice('kbm');
      }
    });
    addEventListener('wheel', (e) => {
      this.wheel += Math.sign(e.deltaY);
    }, { passive: true });
    addEventListener('gamepadconnected', (e) => {
      this.padIndex = e.gamepad.index;
      this.padName = e.gamepad.id;
      this.setDevice('pad');
    });
    addEventListener('gamepaddisconnected', (e) => {
      if (e.gamepad.index === this.padIndex) {
        this.padIndex = -1;
        this.setDevice('kbm');
      }
    });
  }

  onDeviceChange(fn) {
    this.listeners.add(fn);
  }

  setDevice(d) {
    if (this.lastDevice === d) return;
    this.lastDevice = d;
    for (const fn of this.listeners) fn(d);
  }

  get pointerLocked() {
    return document.pointerLockElement === this.canvas;
  }

  requestPointerLock() {
    if (!this.pointerLocked && this.canvas.requestPointerLock) {
      try {
        const p = this.canvas.requestPointerLock();
        if (p && p.catch) p.catch(() => {});
      } catch {
        /* ignore */
      }
    }
  }

  exitPointerLock() {
    if (this.pointerLocked) document.exitPointerLock();
  }

  getPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (this.padIndex >= 0 && pads[this.padIndex]) return pads[this.padIndex];
    for (const p of pads) {
      if (p && p.connected) {
        this.padIndex = p.index;
        this.padName = p.id;
        return p;
      }
    }
    return null;
  }

  get hasPad() {
    return !!this.getPad();
  }

  rumble(duration, weak, strong) {
    if (!settings.vibration) return;
    const pad = this.getPad();
    const act = pad && pad.vibrationActuator;
    if (!act || !act.playEffect) return;
    try {
      const p = act.playEffect('dual-rumble', {
        startDelay: 0,
        duration,
        weakMagnitude: Math.min(1, weak),
        strongMagnitude: Math.min(1, strong),
      });
      if (p && p.catch) p.catch(() => {});
    } catch {
      /* ignore */
    }
  }

  // Radial deadzone with rescale, then a response curve for finer aim near center.
  static stick(x, y, dz, curve) {
    const mag = Math.hypot(x, y);
    if (mag < dz) return [0, 0];
    const m = Math.min(1, (mag - dz) / (1 - dz));
    const c = Math.pow(m, curve);
    return [(x / mag) * c, (y / mag) * c];
  }

  navRepeat(name, held, dt) {
    let r = this.repeat[name];
    if (!r) r = this.repeat[name] = { held: false, t: 0 };
    let fire = false;
    if (held && !r.held) {
      fire = true;
      r.t = 0.38;
    } else if (held) {
      r.t -= dt;
      if (r.t <= 0) {
        fire = true;
        r.t = 0.11;
      }
    }
    r.held = held;
    return fire;
  }

  poll(dt) {
    const s = emptyState();
    const k = this.keys;
    const ke = this.keyEdges;
    const kp = (...codes) => codes.some((c) => ke.has(c));
    const kh = (...codes) => codes.some((c) => k.has(c));

    // ---- Keyboard / mouse ----
    s.moveX = (kh('KeyD') ? 1 : 0) - (kh('KeyA') ? 1 : 0);
    s.moveY = (kh('KeyW') ? 1 : 0) - (kh('KeyS') ? 1 : 0);
    s.mouseDX = this.mouseDX;
    s.mouseDY = this.mouseDY;
    s.fire = this.pointerLocked && this.mouseButtons.has(0);
    s.firePressed = this.pointerLocked && this.mouseEdges.has(0);
    s.ads = this.pointerLocked && this.mouseButtons.has(2);
    s.jumpPressed = kp('Space');
    s.crouchPressed = kp('KeyC', 'ControlLeft');
    s.sprintHeld = kh('ShiftLeft', 'ShiftRight');
    s.reloadPressed = kp('KeyR');
    s.switchPressed = kp('KeyQ', 'Digit1', 'Digit2') || this.wheel !== 0;
    s.meleePressed = kp('KeyV', 'KeyF') || (this.pointerLocked && this.mouseEdges.has(1));
    s.pausePressed = kp('Escape', 'KeyP');
    s.scoreboard = kh('Tab');
    let navUp = kh('ArrowUp', 'KeyW');
    let navDown = kh('ArrowDown', 'KeyS');
    let navLeft = kh('ArrowLeft', 'KeyA');
    let navRight = kh('ArrowRight', 'KeyD');
    s.confirm = kp('Enter', 'Space');
    s.back = kp('Escape', 'Backspace');
    this.wantDigit = ke.has('Digit1') ? 0 : ke.has('Digit2') ? 1 : -1;

    // ---- Gamepad ----
    const pad = this.getPad();
    if (pad) {
      const b = (i) => !!(pad.buttons[i] && (pad.buttons[i].pressed || pad.buttons[i].value > 0.5));
      const val = (i) => (pad.buttons[i] ? pad.buttons[i].value : 0);
      const prev = this.prevPad;
      const pressed = (i) => b(i) && !prev[i];
      const ax = (i) => pad.axes[i] || 0;

      const dz = settings.deadzone;
      const [mx, my] = Input.stick(ax(0), ax(1), dz, 1.0);
      const [lx, ly] = Input.stick(ax(2), ax(3), dz, 1.8);
      let any = Math.abs(mx) + Math.abs(my) + Math.abs(lx) + Math.abs(ly) > 0;
      for (let i = 0; i < pad.buttons.length; i++) if (b(i)) any = true;
      if (any) this.setDevice('pad');

      if (Math.abs(mx) + Math.abs(my) > 0) {
        s.moveX = mx;
        s.moveY = -my;
      }
      s.padLookX = lx;
      s.padLookY = ly;
      s.fire = s.fire || val(PAD.RT) > 0.35;
      s.firePressed = s.firePressed || (val(PAD.RT) > 0.35 && !(prev.rt > 0.35));
      s.ads = s.ads || val(PAD.LT) > 0.35;
      s.jumpPressed ||= pressed(PAD.A);
      s.crouchPressed ||= pressed(PAD.B);
      s.sprintPressed ||= pressed(PAD.L3);
      s.sprintHeld ||= b(PAD.L3);
      s.reloadPressed ||= pressed(PAD.X);
      s.switchPressed ||= pressed(PAD.Y) || pressed(PAD.UP);
      s.meleePressed ||= pressed(PAD.R3);
      s.pausePressed ||= pressed(PAD.MENU);
      s.scoreboard ||= b(PAD.VIEW);
      s.confirm ||= pressed(PAD.A);
      s.back ||= pressed(PAD.B);
      navUp ||= b(PAD.UP) || ax(1) < -0.6;
      navDown ||= b(PAD.DOWN) || ax(1) > 0.6;
      navLeft ||= b(PAD.LEFT) || ax(0) < -0.6;
      navRight ||= b(PAD.RIGHT) || ax(0) > 0.6;
      s.padMenuPressed = pressed(PAD.MENU);

      this.prevPad = pad.buttons.map((_, i) => b(i));
      this.prevPad.rt = val(PAD.RT);
    } else {
      this.prevPad = [];
    }

    s.up = this.navRepeat('up', navUp, dt);
    s.down = this.navRepeat('down', navDown, dt);
    s.left = this.navRepeat('left', navLeft, dt);
    s.right = this.navRepeat('right', navRight, dt);

    // Normalize keyboard diagonal movement.
    const ml = Math.hypot(s.moveX, s.moveY);
    if (ml > 1) {
      s.moveX /= ml;
      s.moveY /= ml;
    }

    this.keyEdges.clear();
    this.mouseEdges.clear();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.wheel = 0;
    this.state = s;
    return s;
  }
}
