// Pooled visual effects: tracers, muzzle flashes, impact puffs, blood.

import * as THREE from 'three';
import { getGlowTexture, getStarTexture, getSmokeTexture } from '../core/textures.js';

class Pool {
  constructor(n, make) {
    this.items = [];
    for (let i = 0; i < n; i++) this.items.push(make());
    this.i = 0;
  }
  next() {
    const it = this.items[this.i];
    this.i = (this.i + 1) % this.items.length;
    return it;
  }
}

export class Effects {
  constructor(scene) {
    this.scene = scene;

    const tracerGeo = new THREE.BoxGeometry(0.025, 0.025, 1);
    tracerGeo.translate(0, 0, 0.5); // extends along +Z, which lookAt() points at the target
    this.tracers = new Pool(48, () => {
      const m = new THREE.Mesh(
        tracerGeo,
        new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      m.visible = false;
      m.userData.life = 0;
      scene.add(m);
      return m;
    });

    const flashMat = new THREE.SpriteMaterial({ map: getStarTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    this.flashes = new Pool(16, () => {
      const s = new THREE.Sprite(flashMat.clone());
      s.visible = false;
      s.userData.life = 0;
      scene.add(s);
      return s;
    });

    this.puffs = new Pool(60, () => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: getSmokeTexture(), transparent: true, depthWrite: false, color: 0xbdb7aa }),
      );
      s.visible = false;
      s.userData = { life: 0, max: 1, vel: new THREE.Vector3(), grow: 1 };
      scene.add(s);
      return s;
    });

    this.sparks = new Pool(30, () => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: getGlowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      s.visible = false;
      s.userData = { life: 0 };
      scene.add(s);
      return s;
    });

    this.active = new Set();
    this.tmp = new THREE.Vector3();
  }

  tracer(from, to, color = 0xffe2a0) {
    const len = from.distanceTo(to);
    if (len < 1) return;
    const t = this.tracers.next();
    t.position.copy(from);
    t.lookAt(to);
    t.scale.set(1, 1, len);
    t.material.color.setHex(color);
    t.material.opacity = 0.8;
    t.userData.life = 0.06;
    t.userData.max = 0.06;
    t.userData.kind = 'tracer';
    t.visible = true;
    this.active.add(t);
  }

  muzzleFlash(pos, size = 0.5) {
    const f = this.flashes.next();
    f.position.copy(pos);
    f.scale.setScalar(size * (0.8 + Math.random() * 0.4));
    f.material.rotation = Math.random() * Math.PI;
    f.material.opacity = 1;
    f.userData.life = 0.05;
    f.userData.max = 0.05;
    f.userData.kind = 'flash';
    f.visible = true;
    this.active.add(f);
  }

  impact(pos, normal, blood = false) {
    const n = blood ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const p = this.puffs.next();
      p.position.copy(pos).addScaledVector(normal, 0.05);
      p.material.color.setHex(blood ? 0x8a1010 : 0xbdb7aa);
      p.material.opacity = blood ? 0.9 : 0.7;
      p.scale.setScalar(blood ? 0.25 : 0.2);
      const u = p.userData;
      u.vel.copy(normal).multiplyScalar(0.6 + Math.random() * 0.8);
      u.vel.x += (Math.random() - 0.5) * 0.8;
      u.vel.y += Math.random() * 0.6;
      u.vel.z += (Math.random() - 0.5) * 0.8;
      u.life = u.max = blood ? 0.35 : 0.6 + Math.random() * 0.3;
      u.grow = blood ? 1.5 : 1.2;
      u.kind = 'puff';
      p.visible = true;
      this.active.add(p);
    }
    if (!blood) {
      const s = this.sparks.next();
      s.position.copy(pos).addScaledVector(normal, 0.03);
      s.scale.setScalar(0.18);
      s.material.opacity = 1;
      s.userData.life = s.userData.max = 0.07;
      s.userData.kind = 'flash';
      s.visible = true;
      this.active.add(s);
    }
  }

  update(dt) {
    for (const o of this.active) {
      const u = o.userData;
      u.life -= dt;
      if (u.life <= 0) {
        o.visible = false;
        this.active.delete(o);
        continue;
      }
      const k = u.life / u.max;
      if (u.kind === 'puff') {
        o.position.addScaledVector(u.vel, dt);
        o.scale.multiplyScalar(1 + u.grow * dt);
        o.material.opacity = k * 0.7;
      } else {
        o.material.opacity = k;
      }
    }
  }
}
