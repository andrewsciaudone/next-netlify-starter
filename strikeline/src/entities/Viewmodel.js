// First-person weapon + hands, rendered in a separate scene on top of the world.

import * as THREE from 'three';
import { getStarTexture } from '../core/textures.js';

const POSES = {
  rifle: { hip: [0.2, -0.2, -0.42], ads: [0, -0.155, -0.34], muzzleZ: -0.78 },
  sniper: { hip: [0.2, -0.2, -0.42], ads: [0, -0.08, -0.26], muzzleZ: -1.05 },
  pistol: { hip: [0.17, -0.17, -0.36], ads: [0, -0.036, -0.3], muzzleZ: -0.22 },
};

function m(color) {
  return new THREE.MeshLambertMaterial({ color });
}
function add(g, w, h, d, mat, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  g.add(mesh);
  return mesh;
}

function buildWeapon(id) {
  const g = new THREE.Group();
  const black = m(0x1e2124), grey = m(0x3a3f45), wood = m(0x6e4a2a), skin = m(0xc39570), glove = m(0x2b2f2a), sleeve = m(0x3d4a5e);
  if (id === 'rifle') {
    add(g, 0.06, 0.08, 0.42, black, 0, 0, -0.18); // receiver
    add(g, 0.025, 0.025, 0.3, grey, 0, 0.015, -0.52); // barrel
    add(g, 0.05, 0.05, 0.22, grey, 0, 0.0, -0.4); // handguard
    add(g, 0.04, 0.13, 0.07, grey, 0, -0.1, -0.16).rotation.x = 0.2; // magazine
    add(g, 0.05, 0.08, 0.2, grey, 0, -0.02, 0.1); // stock
    add(g, 0.035, 0.06, 0.035, black, 0, -0.07, -0.02); // grip
    // Reflex sight
    // Raised reflex sight so the rifle body sits low and doesn't hide targets when aiming.
    add(g, 0.006, 0.15, 0.03, black, -0.026, 0.115, -0.12);
    add(g, 0.006, 0.15, 0.03, black, 0.026, 0.115, -0.12);
    add(g, 0.056, 0.004, 0.004, black, 0, 0.19, -0.12);
    add(g, 0.056, 0.004, 0.004, black, 0, 0.12, -0.12);
    const dot = add(g, 0.006, 0.006, 0.002, new THREE.MeshBasicMaterial({ color: 0xff2020 }), 0, 0.155, -0.12);
    dot.visible = false; // the HUD draws the aim dot so it stays centred during recoil
    // Hands
    add(g, 0.06, 0.06, 0.09, glove, 0.0, -0.06, -0.38);
    add(g, 0.07, 0.07, 0.3, sleeve, 0.04, -0.1, -0.2).rotation.y = -0.3;
    add(g, 0.06, 0.07, 0.08, glove, 0.0, -0.08, -0.02);
    add(g, 0.08, 0.08, 0.3, sleeve, 0.06, -0.12, 0.12).rotation.y = -0.2;
    add(g, 0.03, 0.03, 0.03, skin, 0.03, -0.02, -0.38);
  } else if (id === 'sniper') {
    add(g, 0.06, 0.08, 0.5, wood, 0, -0.01, -0.12);
    add(g, 0.025, 0.025, 0.55, black, 0, 0.02, -0.62);
    add(g, 0.05, 0.05, 0.3, black, 0, 0.08, -0.15); // scope tube
    add(g, 0.065, 0.065, 0.04, black, 0, 0.08, -0.31);
    add(g, 0.06, 0.06, 0.04, black, 0, 0.08, 0.0);
    add(g, 0.02, 0.02, 0.06, grey, 0.04, 0.02, 0.02).name = 'bolt';
    add(g, 0.05, 0.12, 0.22, wood, 0, -0.05, 0.22);
    add(g, 0.06, 0.06, 0.09, glove, 0, -0.06, -0.33);
    add(g, 0.07, 0.07, 0.3, sleeve, 0.04, -0.1, -0.16).rotation.y = -0.3;
    add(g, 0.06, 0.07, 0.08, glove, 0, -0.08, 0.06);
    add(g, 0.08, 0.08, 0.3, sleeve, 0.06, -0.12, 0.2).rotation.y = -0.2;
  } else {
    add(g, 0.04, 0.05, 0.17, black, 0, 0, -0.06); // slide
    add(g, 0.036, 0.09, 0.045, grey, 0, -0.06, 0.0).rotation.x = 0.25;
    add(g, 0.008, 0.012, 0.008, black, 0, 0.03, -0.13);
    add(g, 0.06, 0.07, 0.07, glove, 0, -0.07, 0.01);
    add(g, 0.075, 0.075, 0.3, sleeve, 0.02, -0.1, 0.18).rotation.y = -0.1;
  }
  return g;
}

export class Viewmodel {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(66, 1, 0.01, 10);
    this.scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x4a4036, 2.0));
    const sun = new THREE.DirectionalLight(0xfff1dc, 1.6);
    sun.position.set(0.4, 1, 0.3);
    this.scene.add(sun);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.models = {};
    for (const id of Object.keys(POSES)) {
      const g = buildWeapon(id);
      g.visible = false;
      this.root.add(g);
      this.models[id] = g;
    }
    const flashMat = new THREE.SpriteMaterial({ map: getStarTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    this.flash = new THREE.Sprite(flashMat);
    this.flash.scale.setScalar(0.18);
    this.flash.visible = false;
    this.root.add(this.flash);
    this.flashT = 0;

    this.current = null;
    this.bob = 0;
    this.kick = 0;
    this.swayX = 0;
    this.swayY = 0;
    this.meleeT = 0;
  }

  setAspect(a) {
    this.camera.aspect = a;
    this.camera.updateProjectionMatrix();
  }

  show(id) {
    if (this.current === id) return;
    for (const [k, g] of Object.entries(this.models)) g.visible = k === id;
    this.current = id;
  }

  fire(strength = 1) {
    this.kick = Math.min(1.5, this.kick + strength);
    this.flashT = 0.05;
    this.flash.material.rotation = Math.random() * Math.PI;
  }

  melee() {
    this.meleeT = 0.35;
  }

  // st: { ads, speed, sprint, reload (0..1 or -1), switching (0..1), lookDX, lookDY, onGround, scoped, bolt }
  update(dt, st) {
    const g = this.models[this.current];
    if (!g) return;
    const pose = POSES[this.current];
    const a = st.ads;
    this.bob += dt * (st.sprint ? 13 : 9) * Math.min(1, st.speed / 5);
    const bobAmt = (st.onGround ? Math.min(1, st.speed / 5) : 0) * (1 - a * 0.85) * (st.sprint ? 1.8 : 1);
    this.kick = Math.max(0, this.kick - dt * 9);
    this.swayX += (-st.lookDX * 0.4 - this.swayX) * Math.min(1, dt * 8);
    this.swayY += (st.lookDY * 0.4 - this.swayY) * Math.min(1, dt * 8);

    let x = pose.hip[0] + (pose.ads[0] - pose.hip[0]) * a;
    let y = pose.hip[1] + (pose.ads[1] - pose.hip[1]) * a;
    let z = pose.hip[2] + (pose.ads[2] - pose.hip[2]) * a;
    x += Math.sin(this.bob) * 0.012 * bobAmt + this.swayX * (1 - a * 0.7);
    y += Math.abs(Math.cos(this.bob)) * 0.012 * bobAmt + this.swayY * (1 - a * 0.7);
    z += this.kick * 0.045;
    let rx = this.kick * 0.09 * (1 - a * 0.5), ry = 0, rz = 0;
    if (st.sprint) {
      x -= 0.05;
      y -= 0.04;
      ry = 0.75;
      rx -= 0.25;
    }
    if (st.reload >= 0) {
      const k = Math.sin(st.reload * Math.PI);
      y -= 0.08 * k;
      rx -= 0.5 * k;
      rz = 0.4 * k;
    }
    if (st.switching > 0) {
      y -= 0.3 * st.switching;
      rx -= 0.6 * st.switching;
    }
    if (this.meleeT > 0) {
      this.meleeT -= dt;
      const k = Math.sin((1 - this.meleeT / 0.35) * Math.PI);
      z -= 0.18 * k;
      x -= 0.12 * k;
      ry = 0.9 * k;
      rz = -0.6 * k;
    }
    if (st.bolt > 0) {
      const k = Math.sin(st.bolt * Math.PI);
      rz += 0.3 * k;
      y -= 0.02 * k;
    }
    g.position.set(x, y, z);
    g.rotation.set(rx, ry, rz);
    this.root.visible = !st.scoped;

    this.flash.position.set(x, y + 0.01, z + pose.muzzleZ);
    this.flashT -= dt;
    this.flash.visible = this.flashT > 0 && !st.scoped;
  }
}
