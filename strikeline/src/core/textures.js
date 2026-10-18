// Small procedural canvas textures (greyscale, tinted by material color).

import * as THREE from 'three';

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')];
}

function speckle(ctx, size, n, alpha, light = true) {
  for (let i = 0; i < n; i++) {
    const v = light ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${Math.random() * alpha})`;
    const s = Math.random() * 2 + 0.5;
    ctx.fillRect(Math.random() * size, Math.random() * size, s, s);
  }
}

function finish(c, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

const cache = {};

export function getTexture(kind) {
  if (cache[kind]) return cache[kind];
  const size = 128;
  const [c, ctx] = canvas(size);
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(0, 0, size, size);
  if (kind === 'concrete') {
    speckle(ctx, size, 900, 0.18, false);
    speckle(ctx, size, 400, 0.25, true);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, size - 2, size, 2);
  } else if (kind === 'brick') {
    ctx.fillStyle = '#bdbdbd';
    ctx.fillRect(0, 0, size, size);
    const bh = 16, bw = 32;
    for (let row = 0; row < size / bh; row++) {
      const off = row % 2 ? bw / 2 : 0;
      for (let x = -bw; x < size + bw; x += bw) {
        const v = 200 + Math.random() * 40;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x + off + 1, row * bh + 1, bw - 2, bh - 2);
      }
    }
    speckle(ctx, size, 500, 0.15, false);
  } else if (kind === 'asphalt') {
    ctx.fillStyle = '#c8c8c8';
    ctx.fillRect(0, 0, size, size);
    speckle(ctx, size, 2500, 0.25, false);
    speckle(ctx, size, 800, 0.2, true);
  } else if (kind === 'crate') {
    ctx.fillStyle = '#cfcfcf';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#9a9a9a';
    for (let y = 0; y < size; y += 21) ctx.fillRect(0, y, size, 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#a8a8a8';
    ctx.strokeRect(5, 5, size - 10, size - 10);
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(size - 8, size - 8);
    ctx.stroke();
    speckle(ctx, size, 300, 0.15, false);
  } else if (kind === 'metal') {
    ctx.fillStyle = '#d0d0d0';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let x = 0; x < size; x += 16) ctx.fillRect(x, 0, 3, size);
    speckle(ctx, size, 300, 0.12, false);
  } else if (kind === 'window') {
    ctx.fillStyle = '#9aa4ad';
    ctx.fillRect(0, 0, size, size);
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, 'rgba(255,255,255,0.35)');
    g.addColorStop(0.5, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(8, 8, size - 16, size - 16);
    ctx.fillStyle = '#555';
    ctx.fillRect(0, 0, size, 8);
    ctx.fillRect(0, size - 8, size, 8);
    ctx.fillRect(0, 0, 8, size);
    ctx.fillRect(size - 8, 0, 8, size);
    ctx.fillRect(size / 2 - 3, 0, 6, size);
  }
  return (cache[kind] = finish(c, kind !== 'window'));
}

// Soft round glow used for muzzle flashes and impact puffs.
export function getGlowTexture() {
  if (cache.glow) return cache.glow;
  const [c, ctx] = canvas(64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,230,160,0.9)');
  g.addColorStop(1, 'rgba(255,160,40,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return (cache.glow = finish(c, false));
}

export function getStarTexture() {
  if (cache.star) return cache.star;
  const [c, ctx] = canvas(64);
  ctx.translate(32, 32);
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    const g = ctx.createLinearGradient(0, 0, 30, 0);
    g.addColorStop(0, 'rgba(255,250,220,1)');
    g.addColorStop(1, 'rgba(255,170,50,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(30 * (0.6 + Math.random() * 0.4), 0);
    ctx.lineTo(0, 4);
    ctx.fill();
  }
  const r = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
  r.addColorStop(0, 'rgba(255,255,240,1)');
  r.addColorStop(1, 'rgba(255,200,80,0)');
  ctx.fillStyle = r;
  ctx.fillRect(-16, -16, 32, 32);
  return (cache.star = finish(c, false));
}

export function getSmokeTexture() {
  if (cache.smoke) return cache.smoke;
  const [c, ctx] = canvas(64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,0.8)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return (cache.smoke = finish(c, false));
}

// Overwrite BoxGeometry UVs with world-space planar UVs so textures tile at a
// constant scale regardless of box size. Call after translating the geometry.
export function worldUVs(geo, scale = 2) {
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i));
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (ny > 0.5) uv.setXY(i, x / scale, z / scale);
    else if (nx > 0.5) uv.setXY(i, z / scale, y / scale);
    else uv.setXY(i, x / scale, y / scale);
  }
  uv.needsUpdate = true;
}
