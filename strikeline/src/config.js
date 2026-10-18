// Global tuning constants. Most gameplay numbers live here or in combat/weapons.js.

export const TEAM = { BLUE: 0, RED: 1 };

export const TEAM_INFO = [
  { name: 'Blue', color: 0x2f6fe0, dark: 0x1b3a78, css: '#4f93ff' },
  { name: 'Red', color: 0xd8382a, dark: 0x7a1c14, css: '#ff5b4a' },
];

export const MATCH = {
  scoreLimit: 30,
  timeLimit: 600, // seconds
  respawnDelay: 3,
  teamSize: 5,
  // How many bots on each team carry a sniper rifle.
  snipers: [1, 2],
};

export const BODY = {
  radius: 0.35,
  height: 1.8,
  crouchHeight: 1.2,
  eye: 1.62,
  crouchEye: 1.05,
  stepHeight: 0.5,
  gravity: 22,
  jumpVel: 7.6,
  walkSpeed: 5.0,
  sprintSpeed: 7.6,
  crouchSpeed: 2.4,
  adsSpeed: 3.0,
  maxHealth: 100,
  regenDelay: 4.5,
  regenRate: 30,
};

export const MELEE = { range: 2.1, damage: 100, cooldown: 0.9, angle: 0.6 };

// Bot difficulty presets: aim error (radians), reaction time (s), turn rate (rad/s).
export const DIFFICULTY = {
  recruit: { label: 'Recruit', aimError: 0.065, reaction: 0.85, turnRate: 3.0, burstPause: 0.9 },
  regular: { label: 'Regular', aimError: 0.052, reaction: 0.6, turnRate: 4.2, burstPause: 0.65 },
  hardened: { label: 'Hardened', aimError: 0.034, reaction: 0.4, turnRate: 5.5, burstPause: 0.4 },
};

export const BOT_NAMES = [
  ['Falcon', 'Rook', 'Atlas', 'Mako'],
  ['Ember', 'Jackal', 'Vandal', 'Cinder', 'Brick'],
];
