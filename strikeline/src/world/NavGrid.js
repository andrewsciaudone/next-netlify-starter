// Grid-based navigation for bots. The map is a height field (no overhangs), so each
// (x, z) cell has a single standable height. Nodes sit on a 1 m grid; edges connect
// neighbours that a soldier can walk between (step <= 0.5 m) or drop down (one-way).

const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];
const STEP = 0.5;
const MAX_DROP = 6;

class MinHeap {
  constructor() {
    this.k = [];
    this.v = [];
  }
  get size() {
    return this.k.length;
  }
  push(key, val) {
    const k = this.k, v = this.v;
    let i = k.length;
    k.push(key);
    v.push(val);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (k[p] <= key) break;
      k[i] = k[p];
      v[i] = v[p];
      i = p;
    }
    k[i] = key;
    v[i] = val;
  }
  pop() {
    const k = this.k, v = this.v;
    const top = v[0];
    const lk = k.pop(), lv = v.pop();
    if (k.length) {
      let i = 0;
      const n = k.length;
      for (;;) {
        let c = 2 * i + 1;
        if (c >= n) break;
        if (c + 1 < n && k[c + 1] < k[c]) c++;
        if (k[c] >= lk) break;
        k[i] = k[c];
        v[i] = v[c];
        i = c;
      }
      k[i] = lk;
      v[i] = lv;
    }
    return top;
  }
}

export class NavGrid {
  constructor(world, step = 1, res = 0.25) {
    this.world = world;
    const { minX, maxX, minZ, maxZ } = world.map.bounds;
    this.minX = minX;
    this.minZ = minZ;
    this.step = step;
    this.res = res;
    this.buildRaster(minX, maxX, minZ, maxZ);
    this.buildNodes(maxX, maxZ);
  }

  buildRaster(minX, maxX, minZ, maxZ) {
    const res = this.res;
    this.rw = Math.ceil((maxX - minX) / res);
    this.rh = Math.ceil((maxZ - minZ) / res);
    this.raster = new Float32Array(this.rw * this.rh);
    for (const b of this.world.boxes) {
      const gx0 = Math.max(0, Math.ceil((b.min[0] - minX) / res - 0.5));
      const gx1 = Math.min(this.rw - 1, Math.floor((b.max[0] - minX) / res - 0.5));
      const gz0 = Math.max(0, Math.ceil((b.min[2] - minZ) / res - 0.5));
      const gz1 = Math.min(this.rh - 1, Math.floor((b.max[2] - minZ) / res - 0.5));
      for (let z = gz0; z <= gz1; z++) {
        for (let x = gx0; x <= gx1; x++) {
          const i = z * this.rw + x;
          if (b.max[1] > this.raster[i]) this.raster[i] = b.max[1];
        }
      }
    }
  }

  hAt(x, z) {
    let gx = Math.floor((x - this.minX) / this.res);
    let gz = Math.floor((z - this.minZ) / this.res);
    if (gx < 0 || gz < 0 || gx >= this.rw || gz >= this.rh) return 99;
    return this.raster[gz * this.rw + gx];
  }

  // Standing height for a body of radius r (max over its footprint).
  footH(x, z, r) {
    const d = r * 0.7;
    return Math.max(
      this.hAt(x, z),
      this.hAt(x + r, z), this.hAt(x - r, z), this.hAt(x, z + r), this.hAt(x, z - r),
      this.hAt(x + d, z + d), this.hAt(x - d, z + d), this.hAt(x + d, z - d), this.hAt(x - d, z - d),
    );
  }

  // 0 = blocked, 1 = walkable both ways, 2 = drop (one-way, a -> b)
  segment(ax, ay, az, bx, bz, r = 0.38) {
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    const n = Math.max(1, Math.ceil(len / 0.2));
    let prev = ay;
    let drop = false;
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const y = this.footH(ax + dx * t, az + dz * t, r);
      if (y - prev > STEP) return 0;
      if (prev - y > STEP) {
        if (prev - y > MAX_DROP) return 0;
        drop = true;
      }
      prev = y;
    }
    return drop ? 2 : 1;
  }

  buildNodes(maxX, maxZ) {
    const s = this.step;
    this.gw = Math.floor((maxX - this.minX) / s);
    this.gh = Math.floor((maxZ - this.minZ) / s);
    const N = this.gw * this.gh;
    this.N = N;
    this.x = new Float32Array(N);
    this.y = new Float32Array(N);
    this.z = new Float32Array(N);
    this.valid = new Uint8Array(N);
    this.edges = new Uint8Array(N * 8);
    for (let gz = 0; gz < this.gh; gz++) {
      for (let gx = 0; gx < this.gw; gx++) {
        const i = gz * this.gw + gx;
        const x = this.minX + (gx + 0.5) * s;
        const z = this.minZ + (gz + 0.5) * s;
        const c = this.hAt(x, z);
        const f = this.footH(x, z, 0.5);
        this.x[i] = x;
        this.z[i] = z;
        this.y[i] = f;
        this.valid[i] = f - c <= 0.45 && f < 7.5 ? 1 : 0;
      }
    }
    for (let i = 0; i < N; i++) {
      if (!this.valid[i]) continue;
      const gx = i % this.gw, gz = (i / this.gw) | 0;
      for (let d = 0; d < 8; d++) {
        const nx = gx + DIRS[d][0], nz = gz + DIRS[d][1];
        if (nx < 0 || nz < 0 || nx >= this.gw || nz >= this.gh) continue;
        const j = nz * this.gw + nx;
        if (!this.valid[j]) continue;
        this.edges[i * 8 + d] = this.segment(this.x[i], this.y[i], this.z[i], this.x[j], this.z[j]);
      }
    }
    this.pruneUnreachable();
  }

  neighbor(i, d) {
    const gx = (i % this.gw) + DIRS[d][0];
    const gz = ((i / this.gw) | 0) + DIRS[d][1];
    return gz * this.gw + gx;
  }

  // Keep only nodes reachable from (and able to return to) the middle of the map.
  pruneUnreachable() {
    const seed = this.nearest(-44, 0, 0, true);
    const fwd = new Uint8Array(this.N);
    const stack = [seed];
    fwd[seed] = 1;
    while (stack.length) {
      const i = stack.pop();
      for (let d = 0; d < 8; d++) {
        if (!this.edges[i * 8 + d]) continue;
        const j = this.neighbor(i, d);
        if (!fwd[j]) {
          fwd[j] = 1;
          stack.push(j);
        }
      }
    }
    // Reverse reachability: build reverse adjacency on the fly.
    const back = new Uint8Array(this.N);
    back[seed] = 1;
    stack.push(seed);
    while (stack.length) {
      const j = stack.pop();
      for (let d = 0; d < 8; d++) {
        // A node i with an edge i -> j lies in the opposite direction from j.
        const gx = (j % this.gw) - DIRS[d][0], gz = ((j / this.gw) | 0) - DIRS[d][1];
        if (gx < 0 || gz < 0 || gx >= this.gw || gz >= this.gh) continue;
        const i = gz * this.gw + gx;
        if (!back[i] && this.edges[i * 8 + d]) {
          back[i] = 1;
          stack.push(i);
        }
      }
    }
    this.nodeList = [];
    for (let i = 0; i < this.N; i++) {
      if (this.valid[i] && !(fwd[i] && back[i])) this.valid[i] = 0;
      if (this.valid[i]) this.nodeList.push(i);
    }
    for (let i = 0; i < this.N; i++) {
      if (this.valid[i]) continue;
      for (let d = 0; d < 8; d++) this.edges[i * 8 + d] = 0;
    }
    for (const i of this.nodeList) {
      for (let d = 0; d < 8; d++) if (this.edges[i * 8 + d] && !this.valid[this.neighbor(i, d)]) this.edges[i * 8 + d] = 0;
    }
  }

  nearest(x, y, z, ignoreValid = false) {
    const gx0 = Math.floor((x - this.minX) / this.step);
    const gz0 = Math.floor((z - this.minZ) / this.step);
    let best = -1, bestScore = Infinity;
    for (let r = 0; r <= 5; r++) {
      for (let dz = -r; dz <= r; dz++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
          const gx = gx0 + dx, gz = gz0 + dz;
          if (gx < 0 || gz < 0 || gx >= this.gw || gz >= this.gh) continue;
          const i = gz * this.gw + gx;
          if (!ignoreValid && !this.valid[i]) continue;
          if (ignoreValid && this.y[i] > 0.1) continue;
          const score = Math.hypot(this.x[i] - x, this.z[i] - z) + Math.abs(this.y[i] - y) * 3;
          if (score < bestScore) {
            bestScore = score;
            best = i;
          }
        }
      }
      if (best >= 0 && r >= 1) break;
    }
    return best;
  }

  point(i) {
    return { x: this.x[i], y: this.y[i], z: this.z[i] };
  }

  randomNode(filter) {
    for (let t = 0; t < 60; t++) {
      const i = this.nodeList[(Math.random() * this.nodeList.length) | 0];
      if (!filter || filter(this.x[i], this.y[i], this.z[i])) return i;
    }
    return this.nodeList[(Math.random() * this.nodeList.length) | 0];
  }

  nodesWithin(x, z, r) {
    const out = [];
    const s = this.step;
    const gx0 = Math.max(0, Math.floor((x - r - this.minX) / s));
    const gx1 = Math.min(this.gw - 1, Math.floor((x + r - this.minX) / s));
    const gz0 = Math.max(0, Math.floor((z - r - this.minZ) / s));
    const gz1 = Math.min(this.gh - 1, Math.floor((z + r - this.minZ) / s));
    for (let gz = gz0; gz <= gz1; gz++) {
      for (let gx = gx0; gx <= gx1; gx++) {
        const i = gz * this.gw + gx;
        if (this.valid[i] && Math.hypot(this.x[i] - x, this.z[i] - z) <= r) out.push(i);
      }
    }
    return out;
  }

  // A* from world position to world position. Returns array of {x,y,z} or null.
  findPath(from, to) {
    const s = this.nearest(from.x, from.y, from.z);
    const g = this.nearest(to.x, to.y, to.z);
    if (s < 0 || g < 0) return null;
    if (s === g) return [this.point(g)];
    if (!this.gScore) {
      this.gScore = new Float32Array(this.N);
      this.parent = new Int32Array(this.N);
      this.mark = new Uint32Array(this.N);
      this.closed = new Uint32Array(this.N);
      this.gen = 0;
    }
    const gen = ++this.gen;
    const gs = this.gScore, par = this.parent, mark = this.mark, closed = this.closed;
    const gx = this.x[g], gz = this.z[g];
    const heap = new MinHeap();
    gs[s] = 0;
    par[s] = -1;
    mark[s] = gen;
    heap.push(0, s);
    let found = false;
    let iter = 0;
    while (heap.size && iter++ < 20000) {
      const i = heap.pop();
      if (closed[i] === gen) continue;
      closed[i] = gen;
      if (i === g) {
        found = true;
        break;
      }
      for (let d = 0; d < 8; d++) {
        const e = this.edges[i * 8 + d];
        if (!e) continue;
        const j = this.neighbor(i, d);
        if (closed[j] === gen) continue;
        const cost = (d < 4 ? 1 : 1.4142) * this.step + (e === 2 ? 2 : 0) + Math.abs(this.y[j] - this.y[i]) * 0.5;
        const ng = gs[i] + cost;
        if (mark[j] !== gen || ng < gs[j]) {
          mark[j] = gen;
          gs[j] = ng;
          par[j] = i;
          const h = Math.hypot(this.x[j] - gx, this.z[j] - gz);
          heap.push(ng + h, j);
        }
      }
    }
    if (!found) return null;
    const idx = [];
    for (let i = g; i !== -1; i = par[i]) idx.push(i);
    idx.reverse();
    return this.smooth(idx);
  }

  // Greedy string-pulling: skip intermediate nodes when a straight walk is possible.
  smooth(idx) {
    const out = [];
    let i = 0;
    while (i < idx.length - 1) {
      let j = Math.min(idx.length - 1, i + 14);
      for (; j > i + 1; j--) {
        const a = idx[i], b = idx[j];
        if (Math.abs(this.y[a] - this.y[b]) > 0.3) continue;
        if (this.segment(this.x[a], this.y[a], this.z[a], this.x[b], this.z[b], 0.42) === 1) break;
      }
      out.push(this.point(idx[j]));
      i = j;
    }
    return out;
  }
}
