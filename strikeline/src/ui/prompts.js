// Button glyphs for on-screen prompts, switching between Xbox controller and keyboard labels.

const ACTIONS = {
  fire: ['RT', 'LMB'],
  ads: ['LT', 'RMB'],
  reload: ['X', 'R'],
  switch: ['Y', 'Q'],
  melee: ['R3', 'V'],
  jump: ['A', 'Space'],
  crouch: ['B', 'C'],
  sprint: ['L3', 'Shift'],
  breath: ['L3', 'Shift'],
  pause: ['☰', 'Esc'],
  select: ['A', 'Enter'],
  back: ['B', 'Esc'],
  nav: ['✥', '↑↓'],
  adjust: ['◀▶', '←→'],
  scoreboard: ['⧉', 'Tab'],
  deploy: ['A', 'Enter'],
};

let device = 'kbm';
export function setPromptDevice(d) {
  device = d;
}
export function getPromptDevice() {
  return device;
}

export function glyph(action) {
  const [pad, key] = ACTIONS[action] || [action, action];
  if (device === 'pad') {
    const cls = { A: 'a', B: 'b', X: 'x', Y: 'y' }[pad];
    if (cls) return `<span class="btn btn-${cls}">${pad}</span>`;
    return `<span class="btn btn-misc">${pad}</span>`;
  }
  return `<span class="key">${key}</span>`;
}

export function prompt(action, label) {
  return `<span class="prompt">${glyph(action)}<span>${label}</span></span>`;
}
