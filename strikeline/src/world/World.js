// World geometry: builds merged meshes from map boxes and provides collision + raycasts.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MATERIALS } from './MapData.js';
import { getTexture, worldUVs } from '../core/textures.js';
import { BODY } from '../config.js';

const EPS = 1e-4;

export class World {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;
    this.boxes = map.boxes.filter((b) => !b.decor);
    this.group = new THREE.Group();
    scene.add(this.group);
    this.buildMeshes();
    this.buildDecor();
  }

  buildMeshes() {
    const byMat = {};
    for (const b of this.map.boxes) {
      const w = b.max[0] - b.min[0], h = b.max[1] - b.min[1], d = b.max[2] - b.min[2];
      const g = new THREE.BoxGeometry(w, h, d);
      g.translate((b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2);
      worldUVs(g, b.mat === 'crate' ? 1.4 : 2.5);
      (byMat[b.mat] ||= []).push(g);
    }
    for (const [mat, geos] of Object.entries(byMat)) {
      const def = MATERIALS[mat] || MATERIALS.concrete;
      const mesh = new THREE.Mesh(
        mergeGeometries(geos),
        new THREE.MeshLambertMaterial({ color: def.color, map: getTexture(def.tex) }),
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
      geos.forEach((g) => g.dispose());
    }

    // Ground
    const { minX, maxX, minZ, maxZ } = this.map.bounds;
    const gw = maxX - minX + 4, gd = maxZ - minZ + 4;
    const gtex = getTexture('asphalt').clone();
    gtex.needsUpdate = true;
    gtex.repeat.set(gw / 4, gd / 4);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(gw, gd),
      new THREE.MeshLambertMaterial({ color: 0x5d5f61, map: gtex }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.group.add(ground);
  }

  buildDecor() {
    // Windows on building faces (visual only).
    const winGeos = [];
    const sideGeos = [];
    for (const b of this.map.boxes) {
      if (!b.building) continue;
      const [x0, y0, z0] = b.min, [x1, y1, z1] = b.max;
      const faces = [
        { axis: 'z', at: z1 + 0.04, from: x0, to: x1 },
        { axis: 'z', at: z0 - 0.04, from: x0, to: x1 },
        { axis: 'x', at: x1 + 0.04, from: z0, to: z1 },
        { axis: 'x', at: x0 - 0.04, from: z0, to: z1 },
      ];
      for (const f of faces) {
        const len = f.to - f.from;
        const cols = Math.floor(len / 2.6);
        if (cols < 1) continue;
        const pad = (len - cols * 2.6) / 2;
        for (let fl = 0; y0 + 1.3 + fl * 2.9 + 1.4 < y1 - 0.3; fl++) {
          for (let c = 0; c < cols; c++) {
            if (b.tower && fl === 0) continue;
            const u = f.from + pad + 1.3 + c * 2.6;
            const y = y0 + 1.3 + fl * 2.9 + 0.7;
            const g = new THREE.BoxGeometry(f.axis === 'z' ? 1.2 : 0.06, 1.4, f.axis === 'z' ? 0.06 : 1.2);
            if (f.axis === 'z') g.translate(u, y, f.at);
            else g.translate(f.at, y, u);
            winGeos.push(g);
          }
        }
      }
      // Sidewalk slab around the base (very thin, no collision).
      const s = new THREE.BoxGeometry(x1 - x0 + 2.4, 0.04, z1 - z0 + 2.4);
      s.translate((x0 + x1) / 2, 0.02, (z0 + z1) / 2);
      worldUVs(s, 2);
      sideGeos.push(s);
    }
    if (winGeos.length) {
      const win = new THREE.Mesh(
        mergeGeometries(winGeos),
        new THREE.MeshLambertMaterial({ color: 0x6a7d8c, map: getTexture('window') }),
      );
      this.group.add(win);
    }
    if (sideGeos.length) {
      const side = new THREE.Mesh(
        mergeGeometries(sideGeos),
        new THREE.MeshLambertMaterial({ color: 0x8d8a84, map: getTexture('concrete') }),
      );
      side.receiveShadow = true;
      this.group.add(side);
    }

    // Spawn zone ground markings.
    this.map.spawnZones.forEach((z, team) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(z.x1 - z.x0, z.z1 - z.z0),
        new THREE.MeshBasicMaterial({
          color: team === 0 ? 0x2f6fe0 : 0xd8382a,
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
        }),
      );
      m.rotation.x = -Math.PI / 2;
      m.position.set((z.x0 + z.x1) / 2, 0.05, (z.z0 + z.z1) / 2);
      this.group.add(m);
    });

    // Painted centre line on the main street.
    const lines = [];
    for (let x = -36; x <= 36; x += 4) {
      if (Math.abs(x) < 10) continue;
      const g = new THREE.PlaneGeometry(2, 0.18);
      g.rotateX(-Math.PI / 2);
      g.translate(x, 0.03, x < 0 ? -4 : 4);
      lines.push(g);
    }
    const lineMesh = new THREE.Mesh(mergeGeometries(lines), new THREE.MeshBasicMaterial({ color: 0xc9b458 }));
    this.group.add(lineMesh);
  }

  // ---------------------------------------------------------------- Raycast
  // Returns distance to the first solid hit (ground included) or Infinity.
  raycast(ox, oy, oz, dx, dy, dz, maxDist, out) {
    let best = maxDist;
    let axis = -1;
    let hitSign = 0;
    if (dy < -1e-9) {
      const t = -oy / dy;
      if (t >= 0 && t < best) {
        best = t;
        axis = 1;
        hitSign = 1;
      }
    }
    const ix = 1 / dx, iy = 1 / dy, iz = 1 / dz;
    for (let i = 0; i < this.boxes.length; i++) {
      const b = this.boxes[i];
      const mn = b.min, mx = b.max;
      let t1 = (mn[0] - ox) * ix, t2 = (mx[0] - ox) * ix;
      let tmin = Math.min(t1, t2), tmax = Math.max(t1, t2), ax = 0;
      t1 = (mn[1] - oy) * iy;
      t2 = (mx[1] - oy) * iy;
      let lo = Math.min(t1, t2), hi = Math.max(t1, t2);
      if (lo > tmin) { tmin = lo; ax = 1; }
      if (hi < tmax) tmax = hi;
      if (tmin > tmax) continue;
      t1 = (mn[2] - oz) * iz;
      t2 = (mx[2] - oz) * iz;
      lo = Math.min(t1, t2);
      hi = Math.max(t1, t2);
      if (lo > tmin) { tmin = lo; ax = 2; }
      if (hi < tmax) tmax = hi;
      if (tmin > tmax || tmax < 0) continue;
      if (tmin < 0) tmin = 0; // origin inside box
      if (tmin < best) {
        best = tmin;
        axis = ax;
        hitSign = ax === 0 ? -Math.sign(dx) : ax === 1 ? -Math.sign(dy) : -Math.sign(dz);
      }
    }
    if (out) {
      out.dist = best;
      out.nx = axis === 0 ? hitSign : 0;
      out.ny = axis === 1 ? hitSign : 0;
      out.nz = axis === 2 ? hitSign : 0;
    }
    return axis >= 0 ? best : Infinity;
  }

  // True when the straight segment a->b is not blocked by world geometry.
  segmentClear(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-6) return true;
    return this.raycast(a.x, a.y, a.z, dx / len, dy / len, dz / len, len) === Infinity;
  }

  // ---------------------------------------------------------------- Physics
  overlaps(b, x, y, z, r, h) {
    return (
      x + r > b.min[0] + EPS && x - r < b.max[0] - EPS &&
      z + r > b.min[2] + EPS && z - r < b.max[2] - EPS &&
      y + h > b.min[1] + EPS && y < b.max[1] - EPS
    );
  }

  fits(x, y, z, r, h) {
    for (const b of this.boxes) if (this.overlaps(b, x, y, z, r, h)) return false;
    return true;
  }

  // Highest box top under the footprint that is at or below maxTop (0 = ground).
  supportHeight(x, z, r, maxTop) {
    let s = 0;
    for (const b of this.boxes) {
      if (b.max[1] > maxTop || b.max[1] <= s) continue;
      if (x + r > b.min[0] + EPS && x - r < b.max[0] - EPS && z + r > b.min[2] + EPS && z - r < b.max[2] - EPS) {
        s = b.max[1];
      }
    }
    return s;
  }

  resolveAxis(body, axis, canStep) {
    const p = body.pos;
    const r = body.radius, h = body.height;
    for (let iter = 0; iter < 3; iter++) {
      let moved = false;
      for (const b of this.boxes) {
        if (!this.overlaps(b, p.x, p.y, p.z, r, h)) continue;
        const rise = b.max[1] - p.y;
        if (canStep && rise <= BODY.stepHeight && this.fits(p.x, b.max[1], p.z, r, h)) {
          p.y = b.max[1];
          body.stepped = rise;
          moved = true;
          continue;
        }
        const i = axis === 'x' ? 0 : 2;
        const v = axis === 'x' ? body.vel.x : body.vel.z;
        const c = (b.min[i] + b.max[i]) / 2;
        const goMin = v > 0 ? true : v < 0 ? false : p[axis] < c;
        p[axis] = goMin ? b.min[i] - r - EPS * 2 : b.max[i] + r + EPS * 2;
        moved = true;
      }
      if (!moved) break;
    }
  }

  moveBody(body, dt) {
    const p = body.pos;
    const wasGround = body.onGround;
    body.stepped = 0;
    // Sub-step fast movement so we never tunnel through thin walls.
    const speed = Math.hypot(body.vel.x, body.vel.z) * dt;
    const steps = Math.max(1, Math.ceil(speed / 0.25));
    const sdt = dt / steps;
    for (let i = 0; i < steps; i++) {
      p.x += body.vel.x * sdt;
      this.resolveAxis(body, 'x', wasGround);
      p.z += body.vel.z * sdt;
      this.resolveAxis(body, 'z', wasGround);
    }
    const { minX, maxX, minZ, maxZ } = this.map.bounds;
    p.x = Math.min(maxX - body.radius, Math.max(minX + body.radius, p.x));
    p.z = Math.min(maxZ - body.radius, Math.max(minZ + body.radius, p.z));

    body.vel.y -= BODY.gravity * dt;
    const prevY = p.y;
    p.y += body.vel.y * dt;
    body.onGround = false;
    body.landed = 0;
    if (body.vel.y <= 0) {
      const sup = this.supportHeight(p.x, p.z, body.radius, prevY + 0.05);
      if (p.y <= sup) {
        if (!wasGround) body.landed = -body.vel.y;
        p.y = sup;
        body.vel.y = 0;
        body.onGround = true;
      } else if (wasGround && p.y - sup <= BODY.stepHeight + 0.05) {
        // Stick to the ground when walking down steps.
        p.y = sup;
        body.vel.y = 0;
        body.onGround = true;
      }
    } else {
      for (const b of this.boxes) {
        if (this.overlaps(b, p.x, p.y, p.z, body.radius, body.height) && b.min[1] >= prevY + body.height - 0.05) {
          p.y = b.min[1] - body.height - EPS;
          body.vel.y = 0;
        }
      }
    }
  }
}
