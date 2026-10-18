// Team Deathmatch rules: score limit, time limit, winner.

import { MATCH } from '../config.js';

export class Match {
  constructor() {
    this.reset();
  }

  reset() {
    this.scores = [0, 0];
    this.timeLeft = MATCH.timeLimit;
    this.ended = false;
    this.winner = -1; // -1 = draw
  }

  addKill(team) {
    if (this.ended) return;
    this.scores[team]++;
    if (this.scores[team] >= MATCH.scoreLimit) this.finish();
  }

  update(dt) {
    if (this.ended) return;
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    if (this.timeLeft <= 0) this.finish();
  }

  finish() {
    this.ended = true;
    const [b, r] = this.scores;
    this.winner = b > r ? 0 : r > b ? 1 : -1;
  }
}
