// Controller-navigable menu screens (D-pad / left stick + A to select, B to go back).
// Mouse and keyboard work too.

import { settings, saveSettings } from '../settings.js';
import { prompt } from './prompts.js';
import { sound } from '../core/Sound.js';

export class Menus {
  constructor(root) {
    this.root = root;
    this.stack = [];
    this.screen = null;
    this.focus = 0;
    this.itemEls = [];
  }

  get isOpen() {
    return !!this.screen;
  }

  open(def, replace = false) {
    if (replace) this.stack = [];
    else if (this.screen) this.stack.push({ def: this.screen, focus: this.focus });
    this.screen = def;
    this.focus = def.initialFocus ?? 0;
    this.openedAt = performance.now();
    this.render();
  }

  back() {
    const prev = this.stack.pop();
    if (!prev) return false;
    this.screen = prev.def;
    this.focus = prev.focus;
    this.render();
    return true;
  }

  close() {
    this.stack = [];
    this.screen = null;
    this.root.innerHTML = '';
    this.root.classList.add('hidden');
  }

  refresh() {
    if (this.screen) this.render();
  }

  render() {
    const d = this.screen;
    this.root.classList.remove('hidden');
    this.root.className = `menu ${d.className || ''}`;
    const items = d.items();
    this.items = items;
    this.focus = Math.min(this.focus, items.length - 1);
    let html = '<div class="menu-panel">';
    if (d.logo) html += d.logo;
    if (d.title) html += `<h1 class="menu-title">${d.title}</h1>`;
    if (d.subtitle) html += `<div class="menu-sub">${typeof d.subtitle === 'function' ? d.subtitle() : d.subtitle}</div>`;
    if (d.headerHTML) html += d.headerHTML();
    html += `<div class="menu-items ${d.layout === 'cards' ? 'cards' : 'list'}">`;
    items.forEach((it, i) => {
      html += `<div class="menu-item ${it.type || 'button'} ${it.disabled ? 'disabled' : ''}" data-i="${i}">${this.itemHTML(it)}</div>`;
    });
    html += '</div>';
    if (d.footerHTML) html += d.footerHTML();
    html += `<div class="menu-prompts">${this.promptsHTML()}</div></div>`;
    this.root.innerHTML = html;
    this.itemEls = [...this.root.querySelectorAll('.menu-item')];
    this.itemEls.forEach((el, i) => {
      el.addEventListener('mouseenter', () => this.setFocus(i, false));
      el.addEventListener('click', (e) => {
        sound.unlock();
        this.setFocus(i, false);
        const it = this.items[i];
        if (it.type === 'setting') {
          const r = el.getBoundingClientRect();
          this.adjust(it, e.clientX < r.left + r.width * 0.55 && it.field.type === 'range' ? -1 : 1);
        } else this.select();
      });
    });
    this.setFocus(this.focus, false);
  }

  promptsHTML() {
    const d = this.screen;
    const list = [['nav', 'Navigate'], ['select', d.selectLabel || 'Select']];
    if (this.items?.some((i) => i.type === 'setting')) list.push(['adjust', 'Adjust']);
    if (d.onBack || this.stack.length) list.push(['back', 'Back']);
    return list.map(([a, l]) => prompt(a, l)).join('');
  }

  refreshPrompts() {
    const p = this.root.querySelector('.menu-prompts');
    if (p) p.innerHTML = this.promptsHTML();
  }

  itemHTML(it) {
    if (it.type === 'setting') {
      const f = it.field;
      const v = settings[f.key];
      let val;
      if (f.type === 'toggle') val = v ? 'On' : 'Off';
      else if (f.type === 'choice') val = f.labels[f.options.indexOf(v)] ?? v;
      else if (f.fmt) val = f.fmt(v);
      else val = Number.isInteger(f.step) ? v : v.toFixed(1);
      let bar = '';
      if (f.type === 'range') bar = `<div class="bar"><div style="width:${((v - f.min) / (f.max - f.min)) * 100}%"></div></div>`;
      return `<span class="label">${f.label}</span><span class="value"><span class="arrow">◀</span>${bar}<b>${val}</b><span class="arrow">▶</span></span>`;
    }
    if (it.html) return it.html;
    return `<span class="label">${it.label}</span>`;
  }

  setFocus(i, playSound = true) {
    if (!this.itemEls.length) return;
    i = (i + this.itemEls.length) % this.itemEls.length;
    if (i !== this.focus && playSound) sound.ui('move');
    this.focus = i;
    this.itemEls.forEach((el, j) => el.classList.toggle('focused', j === i));
    const it = this.items[i];
    if (it && it.onFocus) it.onFocus();
  }

  select() {
    const it = this.items[this.focus];
    if (!it || it.disabled) return;
    if (it.type === 'setting') {
      this.adjust(it, 1);
      return;
    }
    sound.ui('select');
    if (it.onSelect) it.onSelect();
  }

  adjust(it, dir) {
    const f = it.field;
    let v = settings[f.key];
    if (f.type === 'toggle') v = !v;
    else if (f.type === 'choice') {
      const i = f.options.indexOf(v);
      v = f.options[(i + dir + f.options.length) % f.options.length];
    } else {
      v = Math.round((v + f.step * dir) / f.step) * f.step;
      v = Math.min(f.max, Math.max(f.min, +v.toFixed(3)));
    }
    settings[f.key] = v;
    saveSettings();
    sound.ui('move');
    const el = this.itemEls[this.focus];
    if (el) el.innerHTML = this.itemHTML(it);
  }

  handleInput(inp) {
    if (!this.screen) return;
    // Ignore the press that opened this screen (e.g. Esc both unlocking the mouse and pausing).
    if (performance.now() - this.openedAt < 250) return;
    const cards = this.screen.layout === 'cards';
    const prevKey = cards ? 'left' : 'up';
    const nextKey = cards ? 'right' : 'down';
    if (inp[prevKey]) this.setFocus(this.focus - 1);
    if (inp[nextKey]) this.setFocus(this.focus + 1);
    const it = this.items[this.focus];
    if (!cards && it && it.type === 'setting') {
      if (inp.left) this.adjust(it, -1);
      if (inp.right) this.adjust(it, 1);
    }
    if (inp.confirm) this.select();
    else if (inp.back) {
      if (this.screen.onBack) {
        sound.ui('back');
        this.screen.onBack();
      } else if (this.back()) sound.ui('back');
    }
  }
}
