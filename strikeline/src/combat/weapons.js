// Weapon definitions. Damage values are per hit; headshots multiply by headMult.

export const WEAPONS = {
  rifle: {
    id: 'rifle',
    name: 'AR-7 Warden',
    short: 'RIFLE',
    damage: 30,
    minDamage: 20,
    falloffStart: 30,
    falloffEnd: 65,
    headMult: 2,
    fireInterval: 0.095,
    auto: true,
    magSize: 30,
    reserve: 150,
    reloadTime: 2.1,
    hipSpread: 0.035,
    adsSpread: 0.004,
    moveSpread: 0.03,
    bloomPerShot: 0.007,
    maxBloom: 0.045,
    recoilPitch: 0.0105,
    recoilYaw: 0.0055,
    adsZoom: 1.35,
    adsTime: 0.18,
    switchTime: 0.45,
    range: 160,
    sound: 'rifle',
    rumble: { duration: 55, weak: 0.5, strong: 0.15 },
  },
  sniper: {
    id: 'sniper',
    name: 'LR-90 Longbow',
    short: 'SNIPER',
    damage: 150, // one-shot kill to head or body when scoped
    minDamage: 150,
    falloffStart: 999,
    falloffEnd: 1000,
    hipDamageMult: 0.4, // heavy penalty when firing from the hip
    hipFalloffEnd: 25, // and it drops off further with distance from the hip
    headMult: 2,
    fireInterval: 1.25, // bolt action
    auto: false,
    magSize: 5,
    reserve: 25,
    reloadTime: 3.0,
    hipSpread: 0.075,
    adsSpread: 0.0,
    moveSpread: 0.04,
    bloomPerShot: 0,
    maxBloom: 0,
    recoilPitch: 0.045,
    recoilYaw: 0.01,
    adsZoom: 4,
    adsTime: 0.32,
    switchTime: 0.6,
    scope: true,
    sway: 0.0065,
    range: 300,
    sound: 'sniper',
    rumble: { duration: 160, weak: 0.7, strong: 1.0 },
  },
  pistol: {
    id: 'pistol',
    name: 'P-12 Sidearm',
    short: 'PISTOL',
    damage: 34,
    minDamage: 22,
    falloffStart: 15,
    falloffEnd: 40,
    headMult: 2,
    fireInterval: 0.14,
    auto: false,
    magSize: 12,
    reserve: 60,
    reloadTime: 1.4,
    hipSpread: 0.025,
    adsSpread: 0.007,
    moveSpread: 0.018,
    bloomPerShot: 0.008,
    maxBloom: 0.03,
    recoilPitch: 0.022,
    recoilYaw: 0.006,
    adsZoom: 1.15,
    adsTime: 0.12,
    switchTime: 0.3,
    range: 100,
    sound: 'pistol',
    rumble: { duration: 45, weak: 0.35, strong: 0.1 },
  },
};

export const LOADOUTS = [
  {
    id: 'assault',
    name: 'Assault',
    primary: 'rifle',
    secondary: 'pistol',
    desc: 'Full-auto rifle for mid-range fights. Reliable and forgiving.',
  },
  {
    id: 'marksman',
    name: 'Marksman',
    primary: 'sniper',
    secondary: 'pistol',
    desc: 'Bolt-action rifle with 4x scope. One shot, one kill — if you aim.',
  },
];

// Runtime ammo/cooldown state for one weapon carried by one soldier.
export class WeaponState {
  constructor(id) {
    this.def = WEAPONS[id];
    this.mag = this.def.magSize;
    this.reserve = this.def.reserve;
    this.cooldown = 0;
    this.reloadTimer = 0;
    this.bloom = 0;
  }
  get reloading() {
    return this.reloadTimer > 0;
  }
  canReload() {
    return !this.reloading && this.mag < this.def.magSize && this.reserve > 0;
  }
  startReload() {
    if (!this.canReload()) return false;
    this.reloadTimer = this.def.reloadTime;
    return true;
  }
  cancelReload() {
    this.reloadTimer = 0;
  }
  update(dt) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.bloom = Math.max(0, this.bloom - dt * 0.12);
    if (this.reloadTimer > 0) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.reloadTimer = 0;
        const need = this.def.magSize - this.mag;
        const take = Math.min(need, this.reserve);
        this.mag += take;
        this.reserve -= take;
        return 'reloaded';
      }
    }
    return null;
  }
}

// Damage at a given distance. `ads` matters only for weapons with a hip-fire penalty.
export function damageAt(def, dist, ads) {
  let dmg = def.damage;
  if (dist > def.falloffStart) {
    const t = Math.min(1, (dist - def.falloffStart) / (def.falloffEnd - def.falloffStart));
    dmg = def.damage + (def.minDamage - def.damage) * t;
  }
  if (def.hipDamageMult && !ads) {
    const t = Math.min(1, dist / def.hipFalloffEnd);
    dmg *= def.hipDamageMult * (1 - 0.5 * t);
  }
  return dmg;
}
