// Persistent user settings (localStorage, best effort).

const KEY = 'strikeline.settings.v1';

export const SETTINGS_SCHEMA = [
  { key: 'lookSensitivity', label: 'Look Sensitivity', type: 'range', min: 1, max: 10, step: 0.5, def: 5 },
  { key: 'adsSensitivity', label: 'Aim (ADS) Sensitivity', type: 'range', min: 0.2, max: 1, step: 0.05, def: 0.6, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: 'deadzone', label: 'Stick Deadzone', type: 'range', min: 0.02, max: 0.35, step: 0.01, def: 0.12, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: 'invertY', label: 'Invert Look Y', type: 'toggle', def: false },
  { key: 'aimAssist', label: 'Aim Assist', type: 'toggle', def: true },
  { key: 'vibration', label: 'Controller Vibration', type: 'toggle', def: true },
  { key: 'mouseSensitivity', label: 'Mouse Sensitivity', type: 'range', min: 1, max: 10, step: 0.5, def: 5 },
  { key: 'fov', label: 'Field of View', type: 'range', min: 60, max: 100, step: 1, def: 75 },
  { key: 'volume', label: 'Volume', type: 'range', min: 0, max: 10, step: 1, def: 7 },
  { key: 'difficulty', label: 'Bot Difficulty', type: 'choice', options: ['recruit', 'regular', 'hardened'], labels: ['Recruit', 'Regular', 'Hardened'], def: 'regular' },
  { key: 'shadows', label: 'Shadows', type: 'toggle', def: true },
];

function defaults() {
  const s = {};
  for (const f of SETTINGS_SCHEMA) s[f.key] = f.def;
  s.loadout = 'assault';
  return s;
}

export const settings = defaults();

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) Object.assign(settings, JSON.parse(raw));
  } catch {
    /* storage unavailable - keep defaults */
  }
  return settings;
}

const listeners = new Set();
export function onSettingsChange(fn) {
  listeners.add(fn);
}

export function saveSettings() {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
  for (const fn of listeners) fn(settings);
}
