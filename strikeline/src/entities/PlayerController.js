// Turns input into movement, look, and weapon actions for the human player.

import * as THREE from 'three';
import { BODY, MELEE } from '../config.js';
import { settings } from '../settings.js';
import { sound } from '../core/Sound.js';
import { applySpread } from '../combat/Combat.js';

const _fwd = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _origin = new THREE.Vector3();
const _muzzle = new THREE.Vector3();

export function zoomFov(baseFov, zoom) {
  const r = THREE.MathUtils.degToRad(baseFov) / 2;
  return THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(r) / zoom));
}

export class PlayerController {
  constructor(game, soldier, camera, viewmodel) {
    this.game = game;
    this.s = soldier;
    this.camera = camera;
    this.vm = viewmodel;
    this.eyeY = BODY.eye;
    this.camY = 0;
    this.punch = 0;
    this.swayT = 0;
    this.breath = 4;
    this.holdingBreath = false;
    this.sprintToggle = false;
    this.stepDist = 0;
    this.lookDX = 0;
    this.lookDY = 0;
    this.assistTarget = null;
    this.firedThisFrame = false;
  }

  onSpawn() {
    this.eyeY = BODY.eye;
    this.camY = this.s.pos.y;
    this.sprintToggle = false;
    this.breath = 4;
    this.punch = 0;
  }

  update(dt, inp) {
    const s = this.s;
    const game = this.game;
    const w = s.weapon;
    const def = w.def;
    const pad = game.input.lastDevice === 'pad';

    // ---------- Stance / sprint ----------
    if (inp.crouchPressed) {
      s.crouching = !s.crouching;
      this.sprintToggle = false;
    }
    const forwardIntent = inp.moveY > 0.35;
    if (inp.sprintPressed && forwardIntent) {
      this.sprintToggle = !this.sprintToggle;
      if (s.crouching) s.crouching = false;
    }
    let wantSprint = (this.sprintToggle || (inp.sprintHeld && !pad)) && forwardIntent && s.onGround;
    if (inp.sprintHeld && !pad && s.crouching && forwardIntent) s.crouching = false;
    if (inp.ads || inp.fire || s.crouching || w.reloading && def.id === 'sniper') wantSprint = false;
    if (!forwardIntent) this.sprintToggle = false;
    s.sprinting = wantSprint;

    // ---------- ADS ----------
    const canAds = inp.ads && !s.sprinting && s.switchTimer <= 0 && !w.reloading && s.meleeTimer <= MELEE.cooldown - 0.35;
    s.ads = THREE.MathUtils.clamp(s.ads + (canAds ? dt : -dt) / def.adsTime, 0, 1);
    const scoped = def.scope && s.ads > 0.9;

    // ---------- Look ----------
    let mul = 1 - s.ads * (1 - settings.adsSensitivity * (def.scope ? 0.55 : 1));
    // Aim assist: slow the reticle down while it's over an enemy (controller only).
    s.eye(_origin);
    s.forward(_fwd);
    this.assistTarget = game.combat.enemyUnderRay(_origin, _fwd, def.range, s, 0.35);
    if (pad && settings.aimAssist && this.assistTarget) mul *= 0.5;
    const inv = settings.invertY ? -1 : 1;
    const rate = 0.5 + settings.lookSensitivity * 0.45; // rad/s at full deflection
    let dYaw = -inp.padLookX * rate * mul * dt;
    let dPitch = -inp.padLookY * rate * 0.72 * mul * dt * inv;
    const ms = 0.0022 * (settings.mouseSensitivity / 5) * (1 - s.ads * (1 - settings.adsSensitivity * (def.scope ? 0.55 : 1)));
    dYaw -= inp.mouseDX * ms;
    dPitch -= inp.mouseDY * ms * inv;
    s.yaw += dYaw;
    s.pitch = THREE.MathUtils.clamp(s.pitch + dPitch, -1.45, 1.45);
    this.lookDX = dYaw;
    this.lookDY = dPitch;

    // ---------- Movement ----------
    let speed = s.sprinting ? BODY.sprintSpeed : s.crouching ? BODY.crouchSpeed : BODY.walkSpeed;
    speed = THREE.MathUtils.lerp(speed, Math.min(speed, BODY.adsSpeed), s.ads);
    const sy = Math.sin(s.yaw), cy = Math.cos(s.yaw);
    const fx = -sy, fz = -cy, rx = cy, rz = -sy;
    const tx = (fx * inp.moveY + rx * inp.moveX) * speed;
    const tz = (fz * inp.moveY + rz * inp.moveX) * speed;
    const acc = s.onGround ? 14 : 2.5;
    const k = Math.min(1, acc * dt);
    s.vel.x += (tx - s.vel.x) * k;
    s.vel.z += (tz - s.vel.z) * k;
    if (inp.jumpPressed && s.onGround) {
      if (s.crouching) s.crouching = false;
      else {
        s.vel.y = BODY.jumpVel;
        s.onGround = false;
      }
    }
    game.world.moveBody(s, dt);
    if (s.landed > 6) {
      sound.land();
      this.punch -= 0.04;
    }
    const hs = Math.hypot(s.vel.x, s.vel.z);
    if (s.onGround && hs > 1) {
      this.stepDist += hs * dt;
      const stride = s.sprinting ? 2.4 : 2.0;
      if (this.stepDist > stride) {
        this.stepDist = 0;
        if (!s.crouching) sound.footstep(s.sprinting ? 0.16 : 0.1);
      }
    }

    // ---------- Weapon actions ----------
    if (game.input.wantDigit >= 0) {
      if (s.switchTo(game.input.wantDigit)) sound.swap();
    } else if (inp.switchPressed && s.switchTimer <= 0 && s.meleeTimer <= 0) {
      if (s.switchTo(1 - s.cur)) sound.swap();
    }
    if (inp.reloadPressed && s.switchTimer <= 0 && s.weapon.startReload()) sound.reload(s.weapon.def.reloadTime);
    if (inp.meleePressed && s.meleeTimer <= 0 && s.switchTimer <= 0) {
      s.weapon.cancelReload();
      s.meleeTimer = MELEE.cooldown;
      s.sprinting = false;
      this.sprintToggle = false;
      this.vm.melee();
      sound.melee();
      game.input.rumble(80, 0.3, 0.3);
      const r = game.combat.melee(s);
      if (r) game.input.rumble(120, 0.8, 0.6);
    }

    this.firedThisFrame = false;
    const cw = s.weapon;
    const trigger = cw.def.auto ? inp.fire : inp.firePressed;
    const busy = s.switchTimer > 0 || cw.reloading || s.meleeTimer > MELEE.cooldown - 0.4 || s.sprinting;
    if (trigger && !busy && cw.cooldown <= 0) {
      if (cw.mag <= 0) {
        if (inp.firePressed) sound.dryFire();
        if (cw.startReload()) sound.reload(cw.def.reloadTime);
      } else {
        this.shoot(cw, inp);
      }
    }
    // Auto-reload an empty mag once the trigger is released.
    if (cw.mag === 0 && !inp.fire && !cw.reloading && cw.cooldown <= 0 && cw.startReload()) sound.reload(cw.def.reloadTime);

    // Hold breath while scoped (L3 / Shift).
    const wantBreath = scoped && (inp.sprintHeld) && this.breath > 0;
    this.holdingBreath = wantBreath;
    this.breath = wantBreath ? this.breath - dt : Math.min(4, this.breath + dt * (scoped ? 0.6 : 1.5));

    this.updateCamera(dt, scoped);
    this.updateViewmodel(dt, scoped);
  }

  shoot(w, inp) {
    const s = this.s;
    const game = this.game;
    const def = w.def;
    w.mag--;
    w.cooldown = def.fireInterval;
    s.lastShotTime = game.time;
    const ads = s.ads > 0.85;
    const moving = Math.min(1, Math.hypot(s.vel.x, s.vel.z) / BODY.walkSpeed);
    let spread = THREE.MathUtils.lerp(def.hipSpread, def.adsSpread, s.ads) + w.bloom;
    spread += def.moveSpread * moving * (1 - s.ads * 0.7);
    if (!s.onGround) spread += 0.05;
    if (s.crouching) spread *= 0.8;

    this.camera.getWorldDirection(_dir);
    applySpread(_dir, spread);
    _origin.copy(this.camera.position);
    // Tracer starts roughly at the on-screen muzzle.
    _muzzle.copy(_origin).addScaledVector(this.camera.getWorldDirection(_fwd), 0.9);
    const right = new THREE.Vector3(Math.cos(s.yaw), 0, -Math.sin(s.yaw));
    _muzzle.addScaledVector(right, 0.12 * (1 - s.ads)).y -= 0.1 * (1 - s.ads);
    game.combat.fire(s, _origin, _dir, { ads, muzzle: _muzzle });

    w.bloom = Math.min(def.maxBloom, w.bloom + def.bloomPerShot);
    const rk = ads ? 0.65 : 1;
    s.pitch = Math.min(1.45, s.pitch + def.recoilPitch * rk * (0.8 + Math.random() * 0.4));
    s.yaw += (Math.random() * 2 - 1) * def.recoilYaw * rk;
    this.punch += def.recoilPitch * 0.6;
    this.vm.fire(def.id === 'sniper' ? 1.5 : 1);
    game.playerMuzzleLight();
    sound.gunshot(def.sound, 0, 0);
    game.input.rumble(def.rumble.duration, def.rumble.weak, def.rumble.strong);
    this.firedThisFrame = true;
  }

  updateCamera(dt, scoped) {
    const s = this.s;
    const target = s.eyeHeight;
    this.eyeY += (target - this.eyeY) * Math.min(1, dt * 10);
    // Smooth out stair steps.
    if (s.pos.y > this.camY && s.pos.y - this.camY < 0.8) this.camY += (s.pos.y - this.camY) * Math.min(1, dt * 14);
    else this.camY = s.pos.y;
    this.punch += (0 - this.punch) * Math.min(1, dt * 10);

    let swayY = 0, swayP = 0;
    const def = s.weapon.def;
    if (def.scope && s.ads > 0.5) {
      this.swayT += dt;
      const amp = def.sway * (s.crouching ? 0.55 : 1) * (this.holdingBreath ? 0.08 : 1) * (1 + Math.hypot(s.vel.x, s.vel.z) * 0.4);
      swayY = Math.sin(this.swayT * 0.9) * amp + Math.sin(this.swayT * 2.3) * amp * 0.3;
      swayP = Math.sin(this.swayT * 1.4 + 1) * amp * 0.8;
    }
    const cam = this.camera;
    cam.position.set(s.pos.x, this.camY + this.eyeY, s.pos.z);
    cam.rotation.set(s.pitch + this.punch + swayP, s.yaw + swayY, 0, 'YXZ');
    const zoom = scoped ? def.adsZoom : THREE.MathUtils.lerp(1, def.scope ? 1.25 : def.adsZoom, s.ads);
    const fov = zoomFov(settings.fov, zoom) * (s.sprinting ? 1.06 : 1);
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov += (fov - cam.fov) * (scoped ? 1 : Math.min(1, dt * 20));
      cam.updateProjectionMatrix();
    }
  }

  updateViewmodel(dt, scoped) {
    const s = this.s;
    const w = s.weapon;
    this.vm.show(w.def.id);
    const reload = w.reloading ? 1 - w.reloadTimer / w.def.reloadTime : -1;
    const bolt = w.def.id === 'sniper' && w.cooldown > 0 ? 1 - w.cooldown / w.def.fireInterval : 0;
    this.vm.update(dt, {
      ads: s.ads,
      speed: Math.hypot(s.vel.x, s.vel.z),
      sprint: s.sprinting,
      reload,
      switching: s.switchTimer > 0 ? s.switchTimer / w.def.switchTime : 0,
      lookDX: this.lookDX,
      lookDY: this.lookDY,
      onGround: s.onGround,
      scoped,
      bolt,
    });
  }
}
