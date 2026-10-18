import { loadSettings } from './settings.js';
import { sound } from './core/Sound.js';
import { Game } from './game/Game.js';

loadSettings();

// Browsers only allow audio after a user gesture.
for (const ev of ['keydown', 'mousedown', 'pointerdown', 'touchstart']) {
  addEventListener(ev, () => sound.unlock(), { passive: true });
}

const game = new Game(document.getElementById('game'));
document.getElementById('loading').remove();

// Handy for debugging from the console.
window.strikeline = game;
