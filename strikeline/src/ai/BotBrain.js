// Bot AI: perception, target selection, aiming with human-like error, path following,
// cover seeking and sniper perch holding. Drives a Soldier the same way input drives the player.

import * as THREE from 'three';
import { BODY, DIFFICULTY } from '../config.js';
import { settings } from '../settings.js';
import { applySpread } from '../combat/Combat.js';
import { sound } from '../core/Sound.js';

const _eye = new THREE.Vector3();
const _p = new THREE.Vector3();
const _q = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _muzzle = new THREE.Vector3();

function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
const rand = (a, b) => a + Math.random() * (b - a);

export class BotBrain {
  constructor(soldier, game, role) {
    this.s = soldier;
    this.game = game;
    this.role = role; // 'rifle' | 'sniper'
    this.reset();
  }

  get diff() {
    return DIFFICULTY[settings.difficulty] || DIFFICULTY.regular;
  }

  reset() {
    this.path = null;
    this.pathIdx = 0;
    this.goal = null;
    this.mode = this.role === 'sniper' ? 'toPerch' : 'roam';
    this.target = null;
    this.targetVisible = false;
    this.lastSeenPos = new THREE.Vector3();
    this.lastSeenTime = -99;
    this.reaction = 0;
    this.trackTime = 0;
    this.errYaw = 0;
    this.errPitch = 0;
    this.errGoalYaw = 0;
    this.errGoalPitch = 0;
    this.errTimer = 0;
    this.burstLeft = 0;
    this.burstPause = 0;
    this.thinkTimer = Math.random() * 0.25;
    this.waitTimer = 0;
    this.strafeDir = Math.random() < 0.5 ? -1 : 1;
    this.strafeTimer = 0;
    this.stuckTimer = 0;
    this.stuckCheckPos = new THREE.Vector3();
    this.stuckCount = 0;
    this.coverTimer = 0;
    this.repathTimer = 0;
    this.perch = null;
    this.perchHold = 0;
    this.lookYaw = this.s.yaw;
    this.lookPitch = 0;
    this.scanTimer = 0;
    this.investigate = null;
    this.moveX = 0;
    this.moveZ = 0;
    this.wantSprint = false;
    this.wantCrouch = false;
    this.wantJump = false;
    this.headshotBias = Math.random() < (this.role === 'sniper' ? 0.35 : 0.15);
  }

  onSpawn() {
    this.reset();
    if (this.game.perchClaims) this.releasePerch();
  }

  releasePerch() {
    const claims = this.game.perchClaims;
    for (const [k, v] of claims) if (v === this) claims.delete(k);
    this.perch = null;
  }

  onDamaged(attacker) {
    if (!attacker || !attacker.alive) return;
    if (!this.targetVisible) {
      // Turn toward the threat; perception will pick it up if visible.
      this.lastSeenPos.copy(attacker.pos);
      this.lastSeenTime = this.game.time;
      this.investigate = attacker.pos.clone();
      this.thinkTimer = 0;
      this.forceLook = attacker;
    }
  }

  onNoise(src) {
    if (this.targetVisible || !src.alive) return;
    if (this.mode === 'perch' && Math.random() < 0.7) {
      this.forceLook = src;
      return;
    }
    if (!this.investigate || Math.random() < 0.3) {
      this.investigate = src.pos.clone();
      this.lastSeenPos.copy(src.pos);
      this.lastSeenTime = this.game.time - 1.5;
    }
  }

  // ------------------------------------------------------------ Perception
  perceive() {
    const s = this.s;
    const game = this.game;
    const eye = s.eye(_eye);
    const fwdYaw = s.yaw;
    const viewRange = this.role === 'sniper' ? 140 : 75;
    let best = null, bestScore = Infinity;
    for (const e of game.soldiers) {
      if (!e.alive || e.team === s.team) continue;
      const dx = e.pos.x - s.pos.x, dz = e.pos.z - s.pos.z;
      const dist = Math.hypot(dx, dz, e.pos.y - s.pos.y);
      if (dist > viewRange) continue;
      const ang = Math.abs(wrapAngle(Math.atan2(-dx, -dz) - fwdYaw));
      const recentAttacker = s.lastAttacker === e && game.time - s.lastDamageTime < 2;
      const inFov = ang < 1.25 || dist < 5 || recentAttacker || (e === this.target && game.time - this.lastSeenTime < 1);
      if (!inFov) continue;
      // Crouched targets at long range are harder to spot.
      if (e.crouching && dist > 45 && Math.random() < 0.5) continue;
      const seen = game.world.segmentClear(eye, e.head(_p)) || game.world.segmentClear(eye, e.chest(_q));
      if (!seen) continue;
      let score = dist * (e === this.target ? 0.6 : 1) * (recentAttacker ? 0.5 : 1);
      if (score < bestScore) {
        bestScore = score;
        best = e;
      }
    }
    if (best) {
      if (best !== this.target || !this.targetVisible) {
        const fresh = best !== this.target || game.time - this.lastSeenTime > 1.5;
        if (fresh) {
          this.reaction = this.diff.reaction * rand(0.8, 1.3) * (this.role === 'sniper' ? 1.5 : 1);
          if (s.lastAttacker === best) this.reaction *= 0.6;
          this.trackTime = 0;
        }
      }
      this.target = best;
      this.targetVisible = true;
      this.lastSeenPos.copy(best.pos);
      this.lastSeenTime = game.time;
      game.reportEnemy(s.team, best.pos);
    } else {
      // Brief memory so targets don't flicker in and out at cover edges.
      const t = this.target;
      this.targetVisible = !!(t && t.alive && game.time - this.lastSeenTime < 0.6);
      if (t && !t.alive) this.target = null;
    }
  }

  // ------------------------------------------------------------ Movement helpers
  setPath(dest) {
    this.path = this.game.nav.findPath(this.s.pos, dest);
    this.pathIdx = 0;
    this.repathTimer = 0;
    return !!this.path;
  }

  followPath(dt, sprint = false) {
    const s = this.s;
    if (!this.path || this.pathIdx >= this.path.length) {
      this.moveX = this.moveZ = 0;
      return true;
    }
    const p = this.path[this.pathIdx];
    const dx = p.x - s.pos.x, dz = p.z - s.pos.z;
    const d = Math.hypot(dx, dz);
    const last = this.pathIdx === this.path.length - 1;
    if (d < (last ? 0.6 : 0.8) && Math.abs(p.y - s.pos.y) < 1.4) {
      this.pathIdx++;
      return this.pathIdx >= this.path.length;
    }
    this.moveX = dx / d;
    this.moveZ = dz / d;
    if (this.sidestep > 0) {
      this.sidestep -= dt;
      this.moveX = -dz / d;
      this.moveZ = dx / d;
    }
    this.wantSprint = sprint && d > 2;
    // Stuck detection
    this.stuckTimer += dt;
    if (this.stuckTimer > 1) {
      const moved = this.stuckCheckPos.distanceTo(s.pos);
      this.stuckCheckPos.copy(s.pos);
      this.stuckTimer = 0;
      if (moved < 0.35) {
        // Escalate: jump, re-path, sidestep, then give up on this goal.
        this.stuckCount++;
        this.wantJump = true;
        if (this.stuckCount === 2 && this.goal) this.setPath(this.goal);
        if (this.stuckCount === 3) this.sidestep = 0.6;
        if (this.stuckCount > 4) {
          this.path = null;
          this.goal = null;
          this.stuckCount = 0;
          return true;
        }
      } else this.stuckCount = 0;
    }
    return false;
  }

  goTo(dest, sprint = false) {
    this.goal = dest.clone ? dest.clone() : new THREE.Vector3(dest.x, dest.y, dest.z);
    this.stuckCount = 0;
    if (!this.setPath(this.goal)) {
      this.goal = null;
      return false;
    }
    this.sprintGoal = sprint;
    return true;
  }

  pickRoamGoal() {
    const game = this.game;
    const side = this.s.team === 0 ? 1 : -1; // +1 means enemy is at +X
    const intel = game.intel[this.s.team].filter((i) => game.time - i.time < 8);
    let dest;
    if (intel.length && Math.random() < 0.55) {
      const i = intel[(Math.random() * intel.length) | 0];
      dest = i.pos;
    } else {
      const node = game.nav.randomNode((x, y) => x * side > -18 && y < 0.6);
      dest = game.nav.point(node);
    }
    this.goTo(new THREE.Vector3(dest.x, dest.y, dest.z), Math.random() < 0.4);
  }

  pickPerch() {
    const game = this.game;
    this.releasePerch();
    const options = game.map.perches
      .map((p, i) => ({ p, i }))
      .filter(({ p, i }) => (p.team === this.s.team || p.team === -1) && !game.perchClaims.has(i));
    if (!options.length) {
      this.mode = 'roam';
      return;
    }
    // Prefer own-team perches.
    options.sort((a, b) => (b.p.team === this.s.team) - (a.p.team === this.s.team) + (Math.random() - 0.5) * 0.9);
    const { p, i } = options[0];
    game.perchClaims.set(i, this);
    this.holdTime = 0;
    this.perch = { ...p, index: i, watch: game.perchWatch[i] };
    this.mode = 'toPerch';
    if (!this.goTo(new THREE.Vector3(p.x, p.y, p.z), true)) this.mode = 'roam';
  }

  seekCover(threat) {
    const game = this.game;
    const s = this.s;
    const nodes = game.nav.nodesWithin(s.pos.x, s.pos.z, 11);
    const threatEye = threat.eye(new THREE.Vector3());
    let best = null, bestScore = Infinity;
    for (let n = 0; n < 50 && nodes.length; n++) {
      const i = nodes[(Math.random() * nodes.length) | 0];
      const x = game.nav.x[i], y = game.nav.y[i], z = game.nav.z[i];
      if (Math.abs(y - s.pos.y) > 1.5) continue;
      const dThreat = Math.hypot(x - threat.pos.x, z - threat.pos.z);
      if (dThreat < 6) continue;
      _p.set(x, y + 1.0, z);
      if (game.world.segmentClear(threatEye, _p)) continue;
      const score = Math.hypot(x - s.pos.x, z - s.pos.z) - dThreat * 0.15;
      if (score < bestScore) {
        bestScore = score;
        best = new THREE.Vector3(x, y, z);
      }
    }
    if (best && this.goTo(best, true)) {
      this.mode = 'cover';
      this.coverTimer = rand(3, 5);
      return true;
    }
    return false;
  }

  // ------------------------------------------------------------ Aim
  aimAt(dt, point, precise) {
    const s = this.s;
    const eye = s.eye(_eye);
    const dx = point.x - eye.x, dy = point.y - eye.y, dz = point.z - eye.z;
    const h = Math.hypot(dx, dz);
    const yaw = Math.atan2(-dx, -dz);
    const pitch = Math.atan2(dy, h);
    let ty = yaw, tp = pitch;
    if (precise) {
      ty += this.errYaw;
      tp += this.errPitch;
    }
    const rate = this.diff.turnRate * (this.role === 'sniper' && this.mode === 'perch' ? 0.7 : 1) * dt;
    const dyaw = wrapAngle(ty - s.yaw);
    s.yaw += THREE.MathUtils.clamp(dyaw, -rate, rate);
    s.pitch += THREE.MathUtils.clamp(tp - s.pitch, -rate, rate);
    return Math.abs(wrapAngle(yaw - s.yaw)) + Math.abs(pitch - s.pitch);
  }

  updateAimError(dt, dist) {
    this.errTimer -= dt;
    const t = this.target;
    if (this.errTimer <= 0) {
      this.errTimer = rand(0.15, 0.35);
      const tSpeed = t ? Math.hypot(t.vel.x, t.vel.z) : 0;
      let mag = this.diff.aimError * (this.role === 'sniper' && this.s.weapon.def.id === 'sniper' ? 0.7 : 1);
      mag *= 1 + 1.8 * Math.exp(-this.trackTime * 1.3);
      mag *= 1 + tSpeed * 0.07;
      if (t && t.crouching) mag *= 1.1;
      if (dist < 6) mag *= 1.6;
      const a = Math.random() * Math.PI * 2;
      const r = mag * (0.4 + Math.random() * 0.8);
      this.errGoalYaw = Math.cos(a) * r;
      this.errGoalPitch = Math.sin(a) * r * 0.7;
    }
    const k = Math.min(1, dt * 6);
    this.errYaw += (this.errGoalYaw - this.errYaw) * k;
    this.errPitch += (this.errGoalPitch - this.errPitch) * k;
  }

  tryShoot(dist, aimDelta) {
    const s = this.s;
    const w = s.weapon;
    const def = w.def;
    if (this.reaction > 0 || w.reloading || s.switchTimer > 0 || w.cooldown > 0) return;
    if (def.id === 'sniper' && this.trackTime < 1.3) return;
    if (aimDelta > (def.id === 'sniper' ? 0.04 : 0.12)) return;
    if (this.burstPause > 0) return;
    if (w.mag <= 0) {
      w.startReload();
      return;
    }
    // Fire
    w.mag--;
    w.cooldown = def.auto ? def.fireInterval : Math.max(def.fireInterval, def.id === 'pistol' ? 0.3 : 0);
    s.lastShotTime = this.game.time;
    s.forward(_dir);
    applySpread(_dir, def.id === 'sniper' ? 0.003 : def.hipSpread * 0.5);
    const eye = s.eye(_eye);
    s.model.muzzle(_muzzle);
    this.game.combat.fire(s, eye, _dir, { ads: true, muzzle: _muzzle });
    this.game.effects.muzzleFlash(_muzzle, def.id === 'sniper' ? 0.7 : 0.45);
    this.game.playShotSound(s, def.sound);
    if (def.auto) {
      this.burstLeft--;
      if (this.burstLeft <= 0) {
        this.burstLeft = (rand(3, 8) | 0);
        this.burstPause = this.diff.burstPause * rand(0.6, 1.4) * (dist > 30 ? 1.5 : 1);
      }
    } else if (def.id === 'pistol') {
      this.burstPause = rand(0.1, 0.35);
    }
  }

  // ------------------------------------------------------------ Main update
  update(dt) {
    const s = this.s;
    const game = this.game;
    if (!s.alive) return;
    this.moveX = this.moveZ = 0;
    this.wantSprint = false;
    this.wantJump = false;
    let crouch = false;

    this.thinkTimer -= dt;
    if (this.thinkTimer <= 0) {
      this.thinkTimer = 0.2 + Math.random() * 0.1;
      this.perceive();
    }
    if (this.burstPause > 0) this.burstPause -= dt;
    const w = s.weapon;

    if (this.targetVisible && this.target && this.target.alive) {
      // ---------------- Engage ----------------
      const t = this.target;
      const dist = s.pos.distanceTo(t.pos);
      this.trackTime += dt;
      if (this.reaction > 0) this.reaction -= dt;
      this.updateAimError(dt, dist);

      // Sniper bots switch to the sidearm up close.
      if (this.role === 'sniper') {
        if (dist < 11 && s.cur === 0) s.switchTo(1);
        else if (dist > 20 && s.cur === 1) s.switchTo(0);
      }
      const aimPoint = this.headshotBias && dist > 8 ? t.head(_q) : t.chest(_q);
      const delta = this.aimAt(dt, aimPoint, true);
      this.tryShoot(dist, delta);

      // Reload / low health -> get to cover.
      const hurt = s.health < 45 && game.time - s.lastDamageTime < 1.5;
      if (this.mode !== 'cover' && this.mode !== 'perch' && (hurt || (w.mag === 0 && dist > 8))) {
        if (w.mag === 0) w.startReload();
        if (!this.seekCover(t)) this.mode = 'fight';
      }

      if (this.mode === 'cover') {
        this.followPath(dt, true);
        crouch = !this.path || this.pathIdx >= this.path.length;
      } else if (this.mode === 'perch') {
        crouch = false; // stand up to shoot over the parapet
      } else if (this.role === 'sniper' && this.mode === 'toPerch' && s.cur === 0) {
        // Snipers en route hold still to take the shot, then keep heading for their perch.
        this.holdTime = (this.holdTime || 0) + dt;
        if (this.perch && Math.hypot(s.pos.x - this.perch.x, s.pos.z - this.perch.z) < 1.5) {
          this.mode = 'perch';
          this.perchHold = rand(35, 60);
        } else if (this.holdTime > 5 && this.perch) {
          if (this.followPath(dt, false)) this.goTo(new THREE.Vector3(this.perch.x, this.perch.y, this.perch.z));
        } else crouch = this.trackTime > 0.5 && dist > 25;
      } else {
        this.mode = 'fight';
        // Strafe and occasionally crouch while fighting.
        this.strafeTimer -= dt;
        if (this.strafeTimer <= 0) {
          this.strafeTimer = rand(0.5, 1.4);
          this.strafeDir = Math.random() < 0.5 ? -1 : 1;
          this.fightCrouch = Math.random() < 0.25;
          this.strafeStill = Math.random() < 0.25;
        }
        if (dist > 38 && this.role !== 'sniper') {
          // Close the distance.
          if (!this.path || this.repathTimer > 1.5) this.setPath(t.pos);
          this.repathTimer += dt;
          this.followPath(dt, false);
        } else if (!this.strafeStill && !this.fightCrouch) {
          const rx = Math.cos(s.yaw), rz = -Math.sin(s.yaw);
          this.moveX = rx * this.strafeDir;
          this.moveZ = rz * this.strafeDir;
          if (dist < 4) {
            this.moveX -= -Math.sin(s.yaw) * 0.6;
            this.moveZ -= -Math.cos(s.yaw) * 0.6;
          }
        }
        crouch = this.fightCrouch;
      }
    } else {
      this.reaction = Math.max(this.reaction, 0);
      this.trackTime = 0;
      if (w.mag < w.def.magSize * 0.4 && !w.reloading && w.reserve > 0) w.startReload();
      if (s.cur === 1 && this.role === 'sniper') s.switchTo(0);
      if (this.role !== 'sniper' && s.cur === 1) s.switchTo(0);

      const recent = game.time - this.lastSeenTime < 5;
      if (this.mode === 'cover') {
        this.followPath(dt, true);
        this.coverTimer -= dt;
        crouch = true;
        this.lookToward(dt, this.lastSeenPos, 1.2);
        if (this.coverTimer <= 0 && (s.health > 75 || this.coverTimer < -4) && !w.reloading) {
          this.mode = this.perch ? 'toPerch' : 'roam';
          this.path = null;
          if (this.perch) this.goTo(new THREE.Vector3(this.perch.x, this.perch.y, this.perch.z), true);
        }
      } else if (this.mode === 'perch') {
        this.holdPerch(dt);
        crouch = this.perchCrouch;
      } else if (this.mode === 'toPerch') {
        if (!this.perch) this.pickPerch();
        if (this.perch) {
          const arrived = this.followPath(dt, true);
          this.faceMovement(dt);
          if (arrived) {
            const d = Math.hypot(s.pos.x - this.perch.x, s.pos.z - this.perch.z);
            if (d < 1.5) {
              this.holdTime = 0;
              this.mode = 'perch';
              this.perchHold = rand(35, 60);
              this.scanTimer = 0;
            } else if (!this.goTo(new THREE.Vector3(this.perch.x, this.perch.y, this.perch.z), true)) this.pickPerch();
          }
        }
      } else if (this.investigate || (recent && this.mode === 'fight')) {
        const dest = this.investigate || this.lastSeenPos;
        if (!this.goal || this.goal.distanceTo(dest) > 3) this.goTo(dest, false);
        const arrived = this.followPath(dt, false);
        this.lookToward(dt, this.lastSeenPos, 1.6);
        if (arrived || game.time - this.lastSeenTime > 9) {
          this.investigate = null;
          this.mode = this.role === 'sniper' ? 'toPerch' : 'roam';
          this.goal = null;
          this.path = null;
          this.waitTimer = rand(0.5, 1.5);
        }
      } else {
        // ---------------- Roam ----------------
        this.mode = this.role === 'sniper' ? 'toPerch' : 'roam';
        if (this.waitTimer > 0) {
          this.waitTimer -= dt;
          this.scan(dt);
        } else if (!this.path) {
          this.pickRoamGoal();
        } else {
          const arrived = this.followPath(dt, this.sprintGoal);
          this.faceMovement(dt);
          if (arrived) {
            this.path = null;
            this.goal = null;
            this.waitTimer = rand(0.8, 2.5);
          }
        }
      }
      if (this.forceLook) {
        this.lookToward(dt, this.forceLook.pos, 1.5);
        if (Math.random() < dt * 1.5) this.forceLook = null;
      }
    }

    this.drive(dt, crouch);
  }

  holdPerch(dt) {
    const s = this.s;
    this.perchHold -= dt;
    this.scanTimer -= dt;
    if (this.scanTimer <= 0) {
      this.scanTimer = rand(2, 4.5);
      const watch = this.perch.watch;
      this.scanPoint = watch && watch.length ? watch[(Math.random() * watch.length) | 0] : null;
      this.perchCrouch = Math.random() < 0.3;
    }
    if (this.scanPoint) this.lookToward(dt, this.scanPoint, 1.0, true);
    if (this.perchHold <= 0 || Math.hypot(s.pos.x - this.perch.x, s.pos.z - this.perch.z) > 3) {
      this.pickPerch();
    }
  }

  lookToward(dt, p, speed = 1.5, withPitch = false) {
    const s = this.s;
    const eye = s.eye(_eye);
    const yaw = Math.atan2(-(p.x - eye.x), -(p.z - eye.z));
    const dy = wrapAngle(yaw - s.yaw);
    const r = this.diff.turnRate * 0.6 * speed * dt;
    s.yaw += THREE.MathUtils.clamp(dy, -r, r);
    const pitch = withPitch ? Math.atan2((p.y ?? eye.y) + 1.2 - eye.y, Math.hypot(p.x - eye.x, p.z - eye.z)) : 0;
    s.pitch += (pitch - s.pitch) * Math.min(1, dt * 3);
  }

  faceMovement(dt) {
    const s = this.s;
    if (Math.abs(this.moveX) + Math.abs(this.moveZ) < 0.1) return;
    const yaw = Math.atan2(-this.moveX, -this.moveZ);
    const dy = wrapAngle(yaw - s.yaw);
    const r = this.diff.turnRate * 1.2 * dt;
    s.yaw += THREE.MathUtils.clamp(dy, -r, r);
    s.pitch += (0 - s.pitch) * Math.min(1, dt * 4);
  }

  scan(dt) {
    this.scanTimer -= dt;
    if (this.scanTimer <= 0) {
      this.scanTimer = rand(0.7, 1.6);
      this.scanYaw = this.s.yaw + rand(-1.2, 1.2);
    }
    if (this.scanYaw !== undefined) {
      const dy = wrapAngle(this.scanYaw - this.s.yaw);
      const r = 2 * dt;
      this.s.yaw += THREE.MathUtils.clamp(dy, -r, r);
    }
  }

  // Apply desired movement to the soldier body.
  drive(dt, crouch) {
    const s = this.s;
    const w = s.weapon;
    s.crouching = crouch;
    const sprint = this.wantSprint && !this.targetVisible && !crouch;
    s.sprinting = sprint;
    let speed = sprint ? BODY.sprintSpeed : crouch ? BODY.crouchSpeed : BODY.walkSpeed;
    if (this.targetVisible) speed *= 0.75;
    const len = Math.hypot(this.moveX, this.moveZ);
    const tx = len > 0.01 ? (this.moveX / Math.max(1, len)) * speed : 0;
    const tz = len > 0.01 ? (this.moveZ / Math.max(1, len)) * speed : 0;
    const k = Math.min(1, (s.onGround ? 12 : 2) * dt);
    s.vel.x += (tx - s.vel.x) * k;
    s.vel.z += (tz - s.vel.z) * k;
    if (this.wantJump && s.onGround) {
      s.vel.y = BODY.jumpVel;
      s.onGround = false;
    }
    this.game.world.moveBody(s, dt);
    const hs = Math.hypot(s.vel.x, s.vel.z);
    if (s.onGround && hs > 2.6 && !crouch) {
      this.stepAcc = (this.stepAcc || 0) + hs * dt;
      if (this.stepAcc > (sprint ? 2.4 : 2.0)) {
        this.stepAcc = 0;
        this.game.playFootstep(s);
      }
    }
    if (w.reloading && w.reloadTimer > w.def.reloadTime - 0.02 && this.game.distanceToPlayer(s) < 12) {
      sound.reload(w.def.reloadTime);
    }
  }
}
