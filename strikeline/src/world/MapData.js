// Map layout: "Dockside Blocks" — a small urban TDM map.
// Everything is axis-aligned boxes standing on the ground (no overhangs), which keeps
// physics, raycasts and bot navigation simple. The layout is point-symmetric around the
// origin: every feature defined with sym() is mirrored to (-x, -z) for the red side.
// Blue spawns at -X, Red at +X.

export const MATERIALS = {
  wall: { color: 0x77706a, tex: 'concrete' },
  brick: { color: 0xa25a43, tex: 'brick' },
  brickB: { color: 0x8b6b58, tex: 'brick' },
  concrete: { color: 0xbab3a6, tex: 'concrete' },
  concreteDark: { color: 0x8e8a84, tex: 'concrete' },
  trim: { color: 0xcfc8ba, tex: 'concrete' },
  crate: { color: 0xa07c4a, tex: 'crate' },
  metal: { color: 0x5f7560, tex: 'metal' },
  barrier: { color: 0xb5b2a8, tex: 'concrete' },
  sand: { color: 0xa69a72, tex: 'concrete' },
  car: { color: 0x3c5568, tex: 'metal' },
  car2: { color: 0x8a3b2c, tex: 'metal' },
  carTop: { color: 0x2a3036, tex: 'metal' },
  stairs: { color: 0x9c968c, tex: 'concrete' },
};

export function buildMapData() {
  const boxes = [];

  function B(x0, z0, x1, z1, y0, y1, mat, opts = {}) {
    boxes.push({
      min: [Math.min(x0, x1), y0, Math.min(z0, z1)],
      max: [Math.max(x0, x1), y1, Math.max(z0, z1)],
      mat,
      ...opts,
    });
  }
  // Feature plus its point-mirrored copy.
  function sym(x0, z0, x1, z1, y0, y1, mat, opts) {
    B(x0, z0, x1, z1, y0, y1, mat, opts);
    B(-x0, -z0, -x1, -z1, y0, y1, mat, opts);
  }
  // A straight flight of stairs filling the footprint, rising in direction `dir`.
  function stairs(x0, z0, x1, z1, dir, height, mat = 'stairs') {
    const n = Math.ceil(height / 0.4);
    const rise = height / n;
    const ax = dir[1] === 'x';
    const lo = ax ? Math.min(x0, x1) : Math.min(z0, z1);
    const hi = ax ? Math.max(x0, x1) : Math.max(z0, z1);
    const run = (hi - lo) / n;
    for (let i = 0; i < n; i++) {
      const top = rise * (i + 1);
      // i = 0 is the lowest step; place it at the start side of the climb direction.
      const a = dir[0] === '+' ? lo + run * i : hi - run * (i + 1);
      const b = a + run;
      if (ax) B(a, z0, b, z1, 0, top, mat, { stair: true });
      else B(x0, a, x1, b, 0, top, mat, { stair: true });
    }
  }
  function symStairs(x0, z0, x1, z1, dir, height, mat) {
    stairs(x0, z0, x1, z1, dir, height, mat);
    const flip = (dir[0] === '+' ? '-' : '+') + dir[1];
    stairs(-x0, -z0, -x1, -z1, flip, height, mat);
  }

  // ---- Perimeter ----
  B(-48, 31, 48, 32, 0, 8, 'wall');
  B(-48, -32, 48, -31, 0, 8, 'wall');
  B(-48, -31, -47, 31, 0, 8, 'wall');
  B(47, -31, 48, 31, 0, 8, 'wall');

  // ---- Building A: sniper rooftop (blue side south / red side north) ----
  sym(-30, -26, -20, -14, 0, 5, 'brick', { building: true });
  symStairs(-32.2, -22.6, -30, -14.2, '-z', 5);
  sym(-32.2, -26, -30, -22.6, 0, 5, 'stairs'); // landing at roof height
  // Parapets (leave the landing side open)
  sym(-30, -14.3, -20, -14, 5, 6, 'trim');
  sym(-20.3, -26, -20, -14.3, 5, 6, 'trim');
  sym(-30, -22.4, -29.7, -14.3, 5, 6, 'trim');
  sym(-29.7, -26, -20.3, -25.7, 5, 6, 'trim');
  sym(-25, -20, -23, -18, 5, 6.3, 'metal'); // rooftop AC unit (cover)

  // ---- Other buildings (solid) ----
  sym(-34, 6, -24, 18, 0, 7, 'concrete', { building: true }); // B
  sym(-20, 13, -13, 31, 0, 6, 'brickB', { building: true }); // D
  sym(-18, -31, -12, -20, 0, 4, 'concrete', { building: true }); // E
  sym(-9, 18, -3, 31, 0, 5, 'brick', { building: true }); // F

  // ---- Central watchtower (contested sniper spot) ----
  B(-2.5, -2.5, 2.5, 2.5, 0, 7, 'concreteDark', { building: true, tower: true });
  symStairs(-2.5, 2.5, 8.3, 4.5, '-x', 7);
  sym(-0.5, 2.2, 2.5, 2.5, 7, 8, 'trim');
  sym(2.2, -2.2, 2.5, 2.2, 7, 8, 'trim');

  // ---- Cover: vehicles, crates, barriers ----
  sym(-22, 0, -18, 2, 0, 1.3, 'car');
  sym(-21.2, 0.2, -19, 1.8, 1.3, 2.0, 'carTop');
  sym(-36, -12, -34, -8, 0, 1.3, 'car2');
  sym(-35.8, -11.2, -34.2, -9.2, 1.3, 2.0, 'carTop');

  sym(-28, -4, -26.5, -2.5, 0, 1.5, 'crate');
  sym(-27.7, -3.7, -26.8, -2.8, 1.5, 2.4, 'crate');
  sym(-14, -9, -12.6, -7.6, 0, 1.2, 'crate');
  sym(-11, 4, -9.6, 5.4, 0, 1.2, 'crate');
  sym(-10, -12.4, -8.6, -11, 0, 1.2, 'crate');
  sym(-30, 24, -28.6, 25.4, 0, 1.2, 'crate');
  sym(-40, 20, -38.5, 21.5, 0, 1.5, 'crate');
  sym(-36, 27, -33, 29.5, 0, 2.6, 'metal'); // dumpster
  sym(-28, -30, -26.8, -28.8, 0, 1.2, 'crate');
  sym(-12, 22, -10.8, 23.2, 0, 1.2, 'crate');
  sym(-43, -15, -41.6, -13.6, 0, 1.2, 'crate');
  sym(-43, 13.6, -41.6, 15, 0, 1.2, 'crate');
  sym(-24, -10, -22.6, -8.6, 0, 1.2, 'crate');
  sym(-6, 13, -4.6, 14.4, 0, 1.2, 'crate');

  sym(-8, -9.3, -3, -8.9, 0, 1.1, 'barrier');
  sym(-36, -6, -35.5, -1, 0, 1.1, 'barrier');
  sym(-16, -3, -15.5, 3, 0, 1.0, 'barrier');
  sym(6, -9, 10, -8.5, 0, 1.0, 'sand');
  sym(-7, 6.5, -3, 7, 0, 1.0, 'sand');
  sym(-38, 1.5, -37.5, 6, 0, 1.1, 'barrier');

  // ---- Spawns ----
  const spawns = [[], []];
  for (const z of [-10, -5, 0, 5, 10]) spawns[0].push({ x: -44, z, yaw: -Math.PI / 2 });
  for (const z of [-8, -3, 3, 8]) spawns[0].push({ x: -40.5, z, yaw: -Math.PI / 2 });
  for (const s of spawns[0]) spawns[1].push({ x: -s.x, z: -s.z, yaw: Math.PI / 2 });

  // ---- Sniper perches (team = preferred owner, -1 = contested) ----
  const perches = [
    { x: -21.6, y: 5, z: -15.6, team: 0 },
    { x: -21.6, y: 5, z: -24.3, team: 0 },
    { x: 21.6, y: 5, z: 15.6, team: 1 },
    { x: 21.6, y: 5, z: 24.3, team: 1 },
    { x: 0, y: 7, z: 0, team: -1 },
  ];

  return {
    name: 'Dockside Blocks',
    bounds: { minX: -47, maxX: 47, minZ: -31, maxZ: 31 },
    boxes,
    spawns,
    perches,
    spawnZones: [
      { x0: -47, x1: -38, z0: -12, z1: 12 },
      { x0: 38, x1: 47, z0: -12, z1: 12 },
    ],
  };
}
