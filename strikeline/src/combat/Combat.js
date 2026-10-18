// Hitscan shooting, melee and damage resolution (shared by player and bots).

import * as THREE from 'three';
import { damageAt } from './weapons.js';
import { MELEE } from '../config.js';
import { sound } from '../core/Sound.js';

const _o = new THREE.Vector3();
const _d = new THREE.Vector3();
const _hit = new THREE.Vector3();
const _n = new THREE.Vector3();
const _m = new THREE.Vector3();
const _rayOut = { dist: 0, nx: 0, ny: 0, nz: 0 };

// Ray vs AABB; returns entry distance or Infinity.
function rayBox(ox, oy, oz, ix, iy, iz, b, maxDist) {
  let t1 = (b[1] - ox) * ix, t2 = (b[4] - ox) * ix;
  let tmin = Math.min(t1, t2), tmax = Math.max(t1, t2);
  t1 = (b[2] - oy) * iy;
  t2 = (b[5] - oy) * iy;
  tmin = Math.max(tmin, Math.min(t1, t2));
  tmax = Math.min(tmax, Math.max(t1, t2));
  t1 = (b[3] - oz) * iz;
  t2 = (b[6] - oz) * iz;
  tmin = Math.max(tmin, Math.min(t1, t2));
  tmax = Math.min(tmax, Math.max(t1, t2));
  if (tmax < Math.max(0, tmin) || tmin > maxDist) return Infinity;
  return Math.max(0, tmin);
}

// Random direction inside a cone of half-angle `spread` around dir (in place).
export function applySpread(dir, spread) {
  if (spread <= 0) return dir;
  const a = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * spread;
  // Build an orthonormal basis around dir.
  const up = Math.abs(dir.y) < 0.99 ? _m.set(0, 1, 0) : _m.set(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(dir, up).normalize();
  const v = new THREE.Vector3().crossVectors(u, dir);
  dir.addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r).normalize();
  return dir;
}

export class Combat {
  constructor(game) {
    this.game = game;
  }

  // Closest enemy soldier hit by the ray (teammates are ignored - no friendly fire).
  raySoldiers(origin, dir, maxDist, shooter, inflate = 0) {
    const ix = 1 / dir.x, iy = 1 / dir.y, iz = 1 / dir.z;
    let best = null, bestD = maxDist;
    for (const s of this.game.soldiers) {
      if (!s.alive || s === shooter || (shooter && s.team === shooter.team)) continue;
      // Quick reject by distance from the ray.
      const tx = s.pos.x - origin.x, tz = s.pos.z - origin.z;
      const along = tx * dir.x + tz * dir.z;
      if (along < -1) continue;
      for (const hb of s.hitboxes(inflate)) {
        const t = rayBox(origin.x, origin.y, origin.z, ix, iy, iz, hb, bestD);
        if (t < bestD) {
          bestD = t;
          best = { soldier: s, part: hb[0], dist: t };
        }
      }
    }
    return best;
  }

  // What is under the crosshair (enemy not behind a wall)? Used for aim assist.
  enemyUnderRay(origin, dir, maxDist, shooter, inflate) {
    const hit = this.raySoldiers(origin, dir, maxDist, shooter, inflate);
    if (!hit) return null;
    const w = this.game.world.raycast(origin.x, origin.y, origin.z, dir.x, dir.y, dir.z, hit.dist);
    return w < hit.dist ? null : hit;
  }

  // Fire one hitscan round. `muzzle` is where the tracer starts.
  fire(shooter, origin, dir, { ads = false, muzzle = null, tracer = true } = {}) {
    const game = this.game;
    const def = shooter.weapon.def;
    const range = def.range;
    const wd = game.world.raycast(origin.x, origin.y, origin.z, dir.x, dir.y, dir.z, range, _rayOut);
    const wn = _n.set(_rayOut.nx, _rayOut.ny, _rayOut.nz);
    const sh = this.raySoldiers(origin, dir, Math.min(range, wd), shooter);
    let endDist = Math.min(wd, range);
    let result = null;
    if (sh && sh.dist < wd) {
      endDist = sh.dist;
      _hit.copy(origin).addScaledVector(dir, sh.dist);
      let dmg = damageAt(def, sh.dist, ads);
      if (sh.part === 'head') dmg *= def.headMult;
      game.effects.impact(_hit, _d.copy(dir).negate(), true);
      result = this.damage(sh.soldier, shooter, dmg, sh.part, def.id);
    } else if (wd < Infinity) {
      _hit.copy(origin).addScaledVector(dir, wd);
      game.effects.impact(_hit, wn, false);
    }
    if (tracer && muzzle && Math.random() < (shooter.isPlayer ? 0.35 : 0.6)) {
      _hit.copy(origin).addScaledVector(dir, Math.min(endDist, 200));
      game.effects.tracer(muzzle, _hit);
    }
    // Gunfire is loud: nearby enemy bots hear it.
    game.noise(shooter, def.id === 'sniper' ? 70 : 32);
    return result;
  }

  melee(attacker) {
    const game = this.game;
    const eye = attacker.eye(_o);
    const fwd = attacker.forward(_d);
    let best = null, bestD = MELEE.range;
    for (const s of game.soldiers) {
      if (!s.alive || s.team === attacker.team) continue;
      const c = s.chest(_m);
      const to = c.sub(eye);
      const dist = to.length();
      if (dist > bestD + 0.4) continue;
      to.normalize();
      if (to.dot(fwd) < Math.cos(MELEE.angle)) continue;
      const tgt = s.chest(new THREE.Vector3());
      if (!game.world.segmentClear(eye, tgt)) continue;
      best = s;
      bestD = dist;
    }
    if (best) return this.damage(best, attacker, MELEE.damage, 'body', 'melee');
    return null;
  }

  damage(victim, attacker, amount, part, weaponId) {
    const game = this.game;
    if (!victim.alive) return null;
    victim.health -= amount;
    victim.lastDamageTime = game.time;
    victim.lastAttacker = attacker;
    const killed = victim.health <= 0;
    const res = { victim, killed, part, amount };
    if (attacker && attacker.isPlayer) {
      game.hud.hitMarker(killed, part === 'head');
      sound.hitmarker(killed);
    }
    if (victim.isPlayer) {
      game.onPlayerDamaged(amount, attacker);
    } else if (victim.brain) {
      victim.brain.onDamaged(attacker);
    }
    if (killed) {
      victim.health = 0;
      game.onKill(attacker, victim, weaponId, part === 'head');
    }
    return res;
  }
}
