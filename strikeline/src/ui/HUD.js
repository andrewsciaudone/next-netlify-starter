// In-game heads-up display (DOM overlay).

import { TEAM_INFO, MATCH } from '../config.js';
import { prompt } from './prompts.js';

const $ = (id) => document.getElementById(id);

function fmtTime(t) {
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export class HUD {
  constructor() {
    this.root = $('hud');
    this.el = {
      blue: $('score-blue'), red: $('score-red'), timer: $('timer'), limit: $('score-limit'),
      health: $('health-fill'), healthNum: $('health-num'),
      weapon: $('weapon-name'), mag: $('ammo-mag'), reserve: $('ammo-reserve'),
      feed: $('killfeed'), cross: $('crosshair'), hit: $('hitmarker'),
      scope: $('scope'), reddot: $('reddot'), damage: $('damage-flash'), lowhp: $('lowhp'),
      center: $('center-msg'), popup: $('popup'), prompts: $('prompts'), board: $('scoreboard'),
      dirs: $('damage-dirs'), breath: $('breath'), breathFill: $('breath-fill'),
    };
    this.el.limit.textContent = `First to ${MATCH.scoreLimit}`;
    this.hitT = 0;
    this.damageT = 0;
    this.popupT = 0;
    this.lastPrompts = '';
    this.dirPool = [];
  }

  show(v) {
    this.root.classList.toggle('hidden', !v);
  }

  setScores(scores, timeLeft) {
    this.el.blue.textContent = scores[0];
    this.el.red.textContent = scores[1];
    this.el.timer.textContent = fmtTime(timeLeft);
    this.el.timer.classList.toggle('urgent', timeLeft < 60);
  }

  setHealth(h) {
    const pct = Math.max(0, h);
    this.el.health.style.width = `${pct}%`;
    this.el.health.classList.toggle('low', pct < 35);
    this.el.healthNum.textContent = Math.ceil(pct);
    this.el.lowhp.style.opacity = pct < 45 ? String((45 - pct) / 45) : '0';
  }

  setAmmo(w) {
    this.el.weapon.textContent = w.def.name;
    this.el.mag.textContent = w.mag;
    this.el.reserve.textContent = w.reserve;
    this.el.mag.classList.toggle('low', w.mag <= Math.ceil(w.def.magSize * 0.25));
  }

  // spread in radians -> crosshair gap in px
  setCrosshair(spreadPx, visible, onEnemy) {
    const c = this.el.cross;
    c.style.setProperty('--gap', `${Math.round(6 + spreadPx)}px`);
    c.classList.toggle('hidden', !visible);
    c.classList.toggle('enemy', !!onEnemy);
  }

  setScope(on, breathing, breath) {
    this.el.scope.classList.toggle('hidden', !on);
    this.el.breath.classList.toggle('hidden', !on);
    this.el.breathFill.style.width = `${(breath / 4) * 100}%`;
    this.el.breath.classList.toggle('active', breathing);
  }

  setRedDot(on) {
    this.el.reddot.classList.toggle('hidden', !on);
  }

  hitMarker(kill, head) {
    const h = this.el.hit;
    h.classList.remove('kill', 'head', 'show');
    void h.offsetWidth;
    if (kill) h.classList.add('kill');
    if (head) h.classList.add('head');
    h.classList.add('show');
    this.hitT = kill ? 0.35 : 0.18;
  }

  damageFlash(amount) {
    this.damageT = Math.min(1, this.damageT + amount / 60);
  }

  // angle: radians, 0 = in front, positive = to the right
  damageDirection(angle) {
    const d = document.createElement('div');
    d.className = 'dmg-dir';
    d.style.transform = `rotate(${angle}rad)`;
    this.el.dirs.appendChild(d);
    setTimeout(() => d.remove(), 1200);
  }

  killFeed(killer, victim, weapon, headshot) {
    const row = document.createElement('div');
    row.className = 'feed-row';
    const kname = killer ? killer.name : '';
    const kc = killer ? TEAM_INFO[killer.team].css : '#fff';
    const vc = TEAM_INFO[victim.team].css;
    const w = { rifle: 'AR-7', sniper: 'LR-90', pistol: 'P-12', melee: 'KNIFE' }[weapon] || weapon;
    row.innerHTML =
      `<span style="color:${kc}">${kname}</span>` +
      `<span class="feed-weapon">[${w}${headshot ? ' ✛' : ''}]</span>` +
      `<span style="color:${vc}">${victim.name}</span>`;
    if (killer?.isPlayer || victim.isPlayer) row.classList.add('me');
    this.el.feed.prepend(row);
    while (this.el.feed.children.length > 6) this.el.feed.lastChild.remove();
    setTimeout(() => row.classList.add('fade'), 5000);
    setTimeout(() => row.remove(), 6000);
  }

  popup(text) {
    const p = this.el.popup;
    p.innerHTML = text;
    p.classList.remove('show');
    void p.offsetWidth;
    p.classList.add('show');
  }

  center(html) {
    this.el.center.innerHTML = html || '';
    this.el.center.classList.toggle('hidden', !html);
  }

  setPrompts(list) {
    const html = list.map(([a, l]) => prompt(a, l)).join('');
    if (html !== this.lastPrompts) {
      this.el.prompts.innerHTML = html;
      this.lastPrompts = html;
    }
  }

  scoreboard(show, soldiers, scores) {
    const b = this.el.board;
    b.classList.toggle('hidden', !show);
    if (!show) return;
    b.innerHTML = renderScoreboard(soldiers, scores);
  }

  update(dt) {
    this.damageT = Math.max(0, this.damageT - dt * 1.5);
    this.el.damage.style.opacity = String(this.damageT);
    if (this.hitT > 0) {
      this.hitT -= dt;
      if (this.hitT <= 0) this.el.hit.classList.remove('show');
    }
  }

  reset() {
    this.el.feed.innerHTML = '';
    this.el.dirs.innerHTML = '';
    this.damageT = 0;
    this.center('');
  }
}

export function renderScoreboard(soldiers, scores) {
  let html = '<div class="board-cols">';
  for (const team of [0, 1]) {
    const info = TEAM_INFO[team];
    const rows = soldiers
      .filter((s) => s.team === team)
      .sort((a, b) => b.kills - a.kills || a.deaths - b.deaths)
      .map(
        (s) =>
          `<tr class="${s.isPlayer ? 'me' : ''}"><td>${s.name}</td><td>${s.kills}</td><td>${s.deaths}</td></tr>`,
      )
      .join('');
    html += `<div class="board-team" style="--team:${info.css}">
      <h3>${info.name} <span>${scores[team]}</span></h3>
      <table><tr><th>Name</th><th>K</th><th>D</th></tr>${rows}</table></div>`;
  }
  return html + '</div>';
}
