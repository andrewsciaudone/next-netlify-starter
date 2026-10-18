// Shared soldier state for the player and bots: body, health, weapons, stats.

import * as THREE from 'three';
import { BODY } from '../config.js';
import { WeaponState, LOADOUTS } from '../combat/weapons.js';

let nextId = 1;

export class Soldier {
  constructor(name, team, isPlayer = false) {
    this.id = nextId++;
    this.name = name;
    this.team = team;
    this.isPlayer = isPlayer;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.radius = BODY.radius;
    this.yaw = 0;
    this.pitch = 0;
    this.crouching = false;
    this.sprinting = false;
    this.onGround = false;
    this.health = BODY.maxHealth;
    this.alive = false;
    this.kills = 0;
    this.deaths = 0;
    this.weapons = [];
    this.cur = 0;
    this.switchTimer = 0;
    this.meleeTimer = 0;
    this.lastDamageTime = -99;
    this.lastAttacker = null;
    this.deathTime = 0;
    this.loadout = 'assault';
    this.ads = 0; // 0..1 aim-down-sights blend
    this.brain = null;
    this.model = null;
    this.lastShotTime = -99;
  }

  get height() {
    return this.crouching ? BODY.crouchHeight : BODY.height;
  }

  get eyeHeight() {
    return this.crouching ? BODY.crouchEye : BODY.eye;
  }

  get weapon() {
    return this.weapons[this.cur];
  }

  eye(out = new THREE.Vector3()) {
    return out.set(this.pos.x, this.pos.y + this.eyeHeight, this.pos.z);
  }

  head(out = new THREE.Vector3()) {
    return out.set(this.pos.x, this.pos.y + (this.crouching ? 1.06 : 1.62), this.pos.z);
  }

  chest(out = new THREE.Vector3()) {
    return out.set(this.pos.x, this.pos.y + (this.crouching ? 0.75 : 1.15), this.pos.z);
  }

  forward(out = new THREE.Vector3()) {
    const cp = Math.cos(this.pitch);
    return out.set(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp);
  }

  // Axis-aligned hitboxes: [part, minX, minY, minZ, maxX, maxY, maxZ]
  hitboxes(inflate = 0) {
    const p = this.pos;
    const hs = 0.17 + inflate;
    const hy = p.y + (this.crouching ? 1.06 : 1.62);
    const bw = 0.32 + inflate;
    const top = p.y + (this.crouching ? 0.9 : 1.45);
    return [
      ['head', p.x - hs, hy - hs, p.z - hs, p.x + hs, hy + hs, p.z + hs],
      ['body', p.x - bw, p.y - inflate, p.z - bw, p.x + bw, top, p.z + bw],
    ];
  }

  spawn(x, y, z, yaw, loadoutId) {
    const lo = LOADOUTS.find((l) => l.id === loadoutId) || LOADOUTS[0];
    this.loadout = lo.id;
    this.pos.set(x, y, z);
    this.vel.set(0, 0, 0);
    this.yaw = yaw;
    this.pitch = 0;
    this.health = BODY.maxHealth;
    this.alive = true;
    this.crouching = false;
    this.sprinting = false;
    this.onGround = true;
    this.weapons = [new WeaponState(lo.primary), new WeaponState(lo.secondary)];
    this.cur = 0;
    this.switchTimer = 0.4;
    this.meleeTimer = 0;
    this.ads = 0;
    this.lastDamageTime = -99;
    this.lastAttacker = null;
    this.spawnTime = performance.now() / 1000;
  }

  switchTo(i) {
    if (i === this.cur || !this.weapons[i]) return false;
    this.weapon.cancelReload();
    this.cur = i;
    this.switchTimer = this.weapon.def.switchTime;
    this.ads = 0;
    return true;
  }

  // Timers, health regeneration. Returns weapon event (e.g. 'reloaded') if any.
  tick(dt, time) {
    this.switchTimer = Math.max(0, this.switchTimer - dt);
    this.meleeTimer = Math.max(0, this.meleeTimer - dt);
    if (this.alive && this.health < BODY.maxHealth && time - this.lastDamageTime > BODY.regenDelay) {
      this.health = Math.min(BODY.maxHealth, this.health + BODY.regenRate * dt);
    }
    let ev = null;
    for (let i = 0; i < this.weapons.length; i++) {
      const e = this.weapons[i].update(i === this.cur ? dt : 0);
      if (i === this.cur && e) ev = e;
    }
    // Inactive weapons still cool down.
    for (let i = 0; i < this.weapons.length; i++) if (i !== this.cur) this.weapons[i].cooldown = Math.max(0, this.weapons[i].cooldown - dt);
    return ev;
  }
}
