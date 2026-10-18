// Blocky third-person soldier model with simple procedural animation.

import * as THREE from 'three';
import { TEAM_INFO } from '../config.js';

const geoCache = {};
function box(w, h, d) {
  const k = `${w}|${h}|${d}`;
  return (geoCache[k] ||= new THREE.BoxGeometry(w, h, d));
}

const matCache = {};
function mat(color) {
  return (matCache[color] ||= new THREE.MeshLambertMaterial({ color }));
}

function part(w, h, d, color, x, y, z, parent) {
  const m = new THREE.Mesh(box(w, h, d), mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}

function markerTexture(color) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(10, 14);
  ctx.lineTo(54, 14);
  ctx.lineTo(32, 50);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
let friendlyMarkerMat = null;

export function buildGunMesh(id, scale = 1) {
  const g = new THREE.Group();
  const dark = 0x23262a, mid = 0x3c4046, wood = 0x6b4a2b;
  if (id === 'sniper') {
    part(0.07, 0.09, 0.75, mid, 0, 0, -0.1, g);
    part(0.035, 0.035, 0.55, dark, 0, 0.01, -0.7, g);
    part(0.06, 0.06, 0.28, dark, 0, 0.08, -0.1, g);
    part(0.06, 0.12, 0.25, wood, 0, -0.04, 0.32, g);
  } else if (id === 'pistol') {
    part(0.045, 0.06, 0.2, dark, 0, 0, -0.05, g);
    part(0.04, 0.1, 0.05, dark, 0, -0.07, 0.03, g);
  } else {
    part(0.07, 0.1, 0.5, dark, 0, 0, -0.1, g);
    part(0.035, 0.035, 0.3, dark, 0, 0.01, -0.5, g);
    part(0.05, 0.14, 0.07, mid, 0, -0.1, -0.08, g);
    part(0.06, 0.09, 0.22, mid, 0, -0.01, 0.26, g);
  }
  g.scale.setScalar(scale);
  return g;
}

export class SoldierModel {
  constructor(soldier, scene, showMarker) {
    this.soldier = soldier;
    const info = TEAM_INFO[soldier.team];
    const uniform = info.color;
    const dark = info.dark;
    const skin = 0xc79a74;
    const boots = 0x2a2622;
    const pants = soldier.team === 0 ? 0x2c3a52 : 0x523029;

    this.root = new THREE.Group();
    this.legL = new THREE.Group();
    this.legR = new THREE.Group();
    this.legL.position.set(-0.13, 0.85, 0);
    this.legR.position.set(0.13, 0.85, 0);
    part(0.2, 0.75, 0.22, pants, 0, -0.38, 0, this.legL);
    part(0.22, 0.12, 0.3, boots, 0, -0.8, -0.04, this.legL);
    part(0.2, 0.75, 0.22, pants, 0, -0.38, 0, this.legR);
    part(0.22, 0.12, 0.3, boots, 0, -0.8, -0.04, this.legR);
    this.root.add(this.legL, this.legR);

    this.upper = new THREE.Group();
    this.upper.position.y = 0.85;
    part(0.52, 0.62, 0.3, uniform, 0, 0.31, 0, this.upper); // torso
    part(0.56, 0.36, 0.34, dark, 0, 0.4, 0, this.upper); // vest
    this.headG = new THREE.Group();
    this.headG.position.y = 0.77;
    part(0.26, 0.26, 0.26, skin, 0, 0, 0, this.headG);
    part(0.32, 0.14, 0.34, dark, 0, 0.13, 0, this.headG); // helmet
    part(0.2, 0.05, 0.02, 0x111111, 0, 0.03, -0.135, this.headG); // eyes band
    this.upper.add(this.headG);

    // Arms + gun pivot at the shoulders so they follow aim pitch.
    this.arms = new THREE.Group();
    this.arms.position.set(0, 0.55, 0);
    part(0.13, 0.13, 0.45, uniform, -0.26, -0.05, -0.18, this.arms);
    part(0.13, 0.13, 0.45, uniform, 0.26, -0.05, -0.18, this.arms);
    part(0.11, 0.11, 0.11, skin, 0.06, -0.06, -0.42, this.arms);
    this.gunHolder = new THREE.Group();
    this.gunHolder.position.set(0.12, -0.02, -0.42);
    this.arms.add(this.gunHolder);
    this.upper.add(this.arms);
    this.root.add(this.upper);

    if (showMarker) {
      friendlyMarkerMat ||= new THREE.SpriteMaterial({
        map: markerTexture(info.css),
        depthTest: false,
        transparent: true,
      });
      this.marker = new THREE.Sprite(friendlyMarkerMat);
      this.marker.scale.set(0.35, 0.35, 1);
      this.marker.position.y = 2.25;
      this.marker.renderOrder = 10;
      this.root.add(this.marker);
    }

    this.gunId = null;
    this.walkPhase = 0;
    this.deathAnim = 0;
    scene.add(this.root);
  }

  setGun(id) {
    if (this.gunId === id) return;
    this.gunId = id;
    this.gunHolder.clear();
    this.gunHolder.add(buildGunMesh(id, 1));
  }

  // World-space muzzle position (approximate).
  muzzle(out) {
    const s = this.soldier;
    const f = s.forward(out);
    const rx = Math.cos(s.yaw), rz = -Math.sin(s.yaw);
    const len = this.gunId === 'sniper' ? 1.05 : this.gunId === 'pistol' ? 0.6 : 0.85;
    return out.set(
      s.pos.x + f.x * len + rx * 0.14,
      s.pos.y + s.eyeHeight - 0.18 + f.y * len,
      s.pos.z + f.z * len + rz * 0.14,
    );
  }

  update(dt) {
    const s = this.soldier;
    const r = this.root;
    if (!s.alive) {
      if (s.deathTime > 0) {
        this.deathAnim = Math.min(1, this.deathAnim + dt * 3);
        r.rotation.x = -this.deathAnim * Math.PI * 0.5;
        r.position.y = s.pos.y + 0.15 * this.deathAnim;
      }
      r.visible = s.deathTime > 0;
      if (this.marker) this.marker.visible = false;
      return;
    }
    this.deathAnim = 0;
    r.visible = true;
    if (this.marker) this.marker.visible = true;
    r.rotation.set(0, s.yaw, 0);
    r.position.copy(s.pos);
    if (s.weapon) this.setGun(s.weapon.def.id);

    const speed = Math.hypot(s.vel.x, s.vel.z);
    this.walkPhase += dt * speed * 2.2;
    const swing = Math.sin(this.walkPhase) * Math.min(0.7, speed * 0.12);
    const crouch = s.crouching ? 1 : 0;
    this.legL.rotation.x = swing - crouch * 0.9;
    this.legR.rotation.x = -swing - crouch * 0.4;
    this.legL.position.y = this.legR.position.y = 0.85 - crouch * 0.28;
    this.upper.position.y = 0.85 - crouch * 0.5;
    this.upper.rotation.x = s.sprinting ? -0.2 : 0;
    this.arms.rotation.x = s.sprinting ? -0.6 : s.pitch;
    this.headG.rotation.x = s.pitch * 0.5;
  }

  dispose(scene) {
    scene.remove(this.root);
  }
}
