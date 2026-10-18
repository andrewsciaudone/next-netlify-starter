// Top-level game: owns the renderer, world, soldiers, match flow and menus.

import * as THREE from 'three';
import { TEAM, TEAM_INFO, MATCH, BOT_NAMES } from '../config.js';
import { settings, SETTINGS_SCHEMA, saveSettings, onSettingsChange } from '../settings.js';
import { Input } from '../core/Input.js';
import { sound } from '../core/Sound.js';
import { buildMapData } from '../world/MapData.js';
import { World } from '../world/World.js';
import { NavGrid } from '../world/NavGrid.js';
import { Soldier } from '../entities/Soldier.js';
import { SoldierModel } from '../entities/SoldierModel.js';
import { PlayerController } from '../entities/PlayerController.js';
import { Viewmodel } from '../entities/Viewmodel.js';
import { BotBrain } from '../ai/BotBrain.js';
import { Combat } from '../combat/Combat.js';
import { LOADOUTS, WEAPONS } from '../combat/weapons.js';
import { Effects } from '../fx/Effects.js';
import { Match } from './Match.js';
import { HUD, renderScoreboard } from '../ui/HUD.js';
import { Menus } from '../ui/Menus.js';
import { setPromptDevice, prompt } from '../ui/prompts.js';

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();

function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.state = 'title'; // title | playing | paused | ended
    this.time = 0;

    // ---------- Renderer / scene ----------
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = settings.shadows;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.autoClear = false;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xb9c6cf, 70, 190);
    this.camera = new THREE.PerspectiveCamera(settings.fov, 1, 0.05, 400);
    this.camera.rotation.order = 'YXZ';
    this.scene.add(this.camera);
    this.buildSky();
    this.buildLights();

    // ---------- World ----------
    this.map = buildMapData();
    this.world = new World(this.scene, this.map);
    this.nav = new NavGrid(this.world);
    this.computePerchWatch();

    // ---------- Systems ----------
    this.input = new Input(canvas);
    this.viewmodel = new Viewmodel();
    this.effects = new Effects(this.scene);
    this.combat = new Combat(this);
    this.match = new Match();
    this.hud = new HUD();
    this.menus = new Menus(document.getElementById('menu'));
    this.intel = [[], []];
    this.perchClaims = new Map();

    this.createSoldiers();

    this.input.onDeviceChange((d) => {
      setPromptDevice(d);
      this.menus.refreshPrompts();
      this.updateControllerStatus();
      if (this.menus.screen && this.menus.screen.deviceSensitive) this.menus.refresh();
    });
    addEventListener('gamepadconnected', () => this.updateControllerStatus());
    addEventListener('gamepaddisconnected', () => this.updateControllerStatus());
    onSettingsChange(() => {
      sound.applyVolume();
      if (this.renderer.shadowMap.enabled !== settings.shadows) {
        this.renderer.shadowMap.enabled = settings.shadows;
        this.scene.traverse((o) => o.material && (o.material.needsUpdate = true));
      }
    });

    canvas.addEventListener('click', () => {
      sound.unlock();
      if (this.state === 'playing' && !this.menus.isOpen) this.input.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
      if (!this.input.pointerLocked && this.state === 'playing' && this.input.lastDevice === 'kbm' && this.player.alive && !this.menus.isOpen) {
        this.pause();
      }
    });
    addEventListener('resize', () => this.resize());
    this.resize();

    this.hud.show(false);
    this.openMainMenu();
    this.last = performance.now();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  // ------------------------------------------------------------ Setup
  buildSky() {
    const geo = new THREE.SphereGeometry(300, 24, 12);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { top: { value: new THREE.Color(0x5d8fc4) }, bottom: { value: new THREE.Color(0xc9d3d9) } },
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader:
        'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(normalize(vP).y * 1.6, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, h), 1.0); }',
    });
    this.sky = new THREE.Mesh(geo, mat);
    this.scene.add(this.sky);
  }

  buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xd4e4ff, 0x5a5044, 1.5));
    const sun = new THREE.DirectionalLight(0xfff0d8, 2.4);
    sun.position.set(30, 60, 22);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const c = sun.shadow.camera;
    c.left = -62;
    c.right = 62;
    c.top = 45;
    c.bottom = -45;
    c.near = 1;
    c.far = 160;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    this.scene.add(sun);
    this.sun = sun;
    this.muzzleLight = new THREE.PointLight(0xffc070, 0, 9, 2);
    this.scene.add(this.muzzleLight);
  }

  // For each sniper perch, find a handful of far-away spots it can see (where to look).
  computePerchWatch() {
    this.perchWatch = this.map.perches.map((p) => {
      const eye = new THREE.Vector3(p.x, p.y + 1.6, p.z);
      const out = [];
      for (let t = 0; t < 400 && out.length < 10; t++) {
        const i = this.nav.randomNode();
        const x = this.nav.x[i], y = this.nav.y[i], z = this.nav.z[i];
        const d = Math.hypot(x - p.x, z - p.z);
        if (d < 18) continue;
        if (p.team === 0 && x < p.x + 5) continue;
        if (p.team === 1 && x > p.x - 5) continue;
        if (this.world.segmentClear(eye, _v.set(x, y + 1.2, z))) out.push({ x, y, z });
      }
      return out;
    });
  }

  createSoldiers() {
    this.soldiers = [];
    this.player = new Soldier('You', TEAM.BLUE, true);
    this.player.loadout = settings.loadout;
    this.player.model = new SoldierModel(this.player, this.scene, false);
    this.soldiers.push(this.player);
    this.controller = new PlayerController(this, this.player, this.camera, this.viewmodel);

    for (const team of [TEAM.BLUE, TEAM.RED]) {
      const names = BOT_NAMES[team];
      const count = team === TEAM.BLUE ? MATCH.teamSize - 1 : MATCH.teamSize;
      for (let i = 0; i < count; i++) {
        const s = new Soldier(names[i % names.length], team);
        const role = i < MATCH.snipers[team] ? 'sniper' : 'rifle';
        s.loadout = role === 'sniper' ? 'marksman' : 'assault';
        s.model = new SoldierModel(s, this.scene, team === this.player.team);
        s.brain = new BotBrain(s, this, role);
        this.soldiers.push(s);
      }
    }
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.viewmodel.setAspect(w / h);
  }

  updateControllerStatus() {
    const el = document.getElementById('pad-status');
    if (!el) return;
    const pad = this.input.getPad();
    el.innerHTML = pad
      ? `<span class="dot on"></span>Controller connected`
      : `<span class="dot"></span>No controller — press any button on your Xbox controller`;
  }

  // ------------------------------------------------------------ Menus
  logoHTML() {
    return `<div class="logo"><span>STRIKE</span>LINE</div>`;
  }

  openMainMenu() {
    this.state = 'title';
    this.hud.show(false);
    this.input.exitPointerLock();
    this.menus.open(
      {
        className: 'main',
        logo: this.logoHTML(),
        subtitle: `Team Deathmatch · 5 v 5 · ${this.map.name}`,
        items: () => [
          { label: 'Play', onSelect: () => this.openLoadout(true) },
          { label: 'Settings', onSelect: () => this.openSettings() },
          { label: 'Controls', onSelect: () => this.openControls() },
        ],
        footerHTML: () => `<div id="pad-status" class="pad-status"></div>`,
      },
      true,
    );
    this.updateControllerStatus();
  }

  loadoutCards(onPick, onFocusPick) {
    return LOADOUTS.map((lo) => {
      const p = WEAPONS[lo.primary], s = WEAPONS[lo.secondary];
      const stat = (label, v) => `<div class="stat"><span>${label}</span><div class="bar"><div style="width:${Math.round(v * 100)}%"></div></div></div>`;
      const dmg = Math.min(1, p.damage / 150), rof = Math.min(1, 0.1 / p.fireInterval), rng = Math.min(1, p.range / 300);
      const mob = p.id === 'sniper' ? 0.55 : 0.8;
      return {
        type: 'card',
        html: `<div class="card-title">${lo.name}</div>
          <div class="card-weapons"><b>${p.name}</b><small>${p.magSize}-round · ${p.auto ? 'full-auto' : 'bolt-action, 4x scope'}</small>
          <b>${s.name}</b><small>${s.magSize}-round · semi-auto</small></div>
          ${stat('Damage', dmg)}${stat('Fire rate', rof)}${stat('Range', rng)}${stat('Mobility', mob)}
          <p class="card-desc">${lo.desc}</p>`,
        onSelect: () => onPick(lo.id),
        onFocus: onFocusPick ? () => onFocusPick(lo.id) : null,
      };
    });
  }

  openLoadout(preMatch) {
    const idx = Math.max(0, LOADOUTS.findIndex((l) => l.id === settings.loadout));
    this.menus.open({
      className: 'loadout',
      title: 'Choose Loadout',
      subtitle: 'Your pistol is always your secondary weapon.',
      layout: 'cards',
      initialFocus: idx,
      selectLabel: preMatch ? 'Deploy' : 'Equip',
      items: () =>
        this.loadoutCards((id) => {
          settings.loadout = id;
          saveSettings();
          if (preMatch) this.startMatch();
          else this.menus.back();
        }),
      onBack: preMatch ? () => this.menus.back() : null,
    });
  }

  openSettings() {
    this.menus.open({
      className: 'settings',
      title: 'Settings',
      items: () => [
        ...SETTINGS_SCHEMA.map((f) => ({ type: 'setting', field: f })),
        { label: 'Back', onSelect: () => this.menus.back() },
      ],
    });
  }

  openControls() {
    const row = (a, b, c) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`;
    this.menus.open({
      className: 'controls',
      title: 'Controls',
      headerHTML: () => `<table class="controls-table">
        <tr><th>Action</th><th>Xbox Controller</th><th>Keyboard / Mouse</th></tr>
        ${row('Move', 'Left stick', 'W A S D')}
        ${row('Look', 'Right stick', 'Mouse')}
        ${row('Shoot', 'RT', 'Left click')}
        ${row('Aim / Scope', 'LT', 'Right click')}
        ${row('Sprint / Hold breath (scoped)', 'L3 (click left stick)', 'Shift')}
        ${row('Melee', 'R3 (click right stick)', 'V or middle click')}
        ${row('Jump', 'A', 'Space')}
        ${row('Crouch (toggle)', 'B', 'C / Ctrl')}
        ${row('Reload', 'X', 'R')}
        ${row('Switch weapon', 'Y / D-pad up', 'Q / 1 / 2 / wheel')}
        ${row('Scoreboard', 'View (hold)', 'Tab (hold)')}
        ${row('Pause', 'Menu', 'Esc / P')}
      </table>`,
      items: () => [{ label: 'Back', onSelect: () => this.menus.back() }],
    });
  }

  openPause() {
    this.menus.open(
      {
        className: 'pause',
        title: 'Paused',
        subtitle: () => `Blue ${this.match.scores[0]} — ${this.match.scores[1]} Red`,
        items: () => [
          { label: 'Resume', onSelect: () => this.resume() },
          { label: 'Change Loadout (next spawn)', onSelect: () => this.openLoadout(false) },
          { label: 'Settings', onSelect: () => this.openSettings() },
          { label: 'Controls', onSelect: () => this.openControls() },
          { label: 'Quit to Main Menu', onSelect: () => this.openMainMenu() },
        ],
        onBack: () => this.resume(),
      },
      true,
    );
  }

  openRespawn(killer, weaponId) {
    this.deployReady = false;
    const idx = Math.max(0, LOADOUTS.findIndex((l) => l.id === settings.loadout));
    const wname = weaponId === 'melee' ? 'melee' : WEAPONS[weaponId]?.name;
    this.menus.open(
      {
        className: 'respawn',
        title: killer ? `Killed by <span style="color:${TEAM_INFO[killer.team].css}">${killer.name}</span>` : 'You died',
        subtitle: wname ? `with ${wname}` : '',
        layout: 'cards',
        initialFocus: idx,
        selectLabel: 'Deploy',
        headerHTML: () => `<div class="respawn-timer" id="respawn-timer"></div>`,
        items: () =>
          this.loadoutCards(
            (id) => {
              settings.loadout = id;
              saveSettings();
              this.deployReady = true;
            },
            (id) => {
              settings.loadout = id;
            },
          ),
      },
      true,
    );
  }

  openEnd() {
    const m = this.match;
    const won = m.winner === this.player.team;
    const title = m.winner === -1 ? 'DRAW' : won ? 'VICTORY' : 'DEFEAT';
    const p = this.player;
    const kd = p.deaths ? (p.kills / p.deaths).toFixed(2) : p.kills.toFixed(2);
    this.menus.open(
      {
        className: `end ${won ? 'won' : 'lost'}`,
        title,
        subtitle: m.winner === -1 ? 'The teams are tied.' : `${TEAM_INFO[m.winner].name} team wins`,
        headerHTML: () => `
          <div class="end-score"><span class="b">${m.scores[0]}</span> — <span class="r">${m.scores[1]}</span></div>
          <div class="end-me">Your kills <b>${p.kills}</b> · Deaths <b>${p.deaths}</b> · K/D <b>${kd}</b></div>
          ${renderScoreboard(this.soldiers, m.scores)}`,
        items: () => [
          { label: 'Play Again', onSelect: () => this.openLoadout(true) },
          { label: 'Main Menu', onSelect: () => this.openMainMenu() },
        ],
      },
      true,
    );
  }

  // ------------------------------------------------------------ Match flow
  startMatch() {
    this.menus.close();
    this.match.reset();
    this.hud.reset();
    this.time = 0;
    this.intel = [[], []];
    this.perchClaims.clear();
    for (const s of this.soldiers) {
      s.kills = s.deaths = 0;
      s.alive = false;
      s.deathTime = 0;
    }
    for (const s of this.soldiers) this.spawn(s);
    this.state = 'playing';
    this.hud.show(true);
    this.spawnHintUntil = 8;
    if (this.input.lastDevice === 'kbm') this.input.requestPointerLock();
    sound.horn(true);
  }

  chooseSpawn(team) {
    const enemies = this.soldiers.filter((s) => s.alive && s.team !== team);
    let best = null, bestScore = -Infinity;
    for (const sp of this.map.spawns[team]) {
      let minD = 999;
      for (const e of enemies) minD = Math.min(minD, Math.hypot(e.pos.x - sp.x, e.pos.z - sp.z));
      const crowd = this.soldiers.some((s) => s.alive && Math.hypot(s.pos.x - sp.x, s.pos.z - sp.z) < 1.2) ? 50 : 0;
      const score = Math.min(minD, 40) + Math.random() * 8 - crowd;
      if (score > bestScore) {
        bestScore = score;
        best = sp;
      }
    }
    return best;
  }

  spawn(s) {
    const sp = this.chooseSpawn(s.team);
    const lo = s.isPlayer ? settings.loadout : s.loadout;
    s.spawn(sp.x, 0, sp.z, sp.yaw + (Math.random() - 0.5) * 0.3, lo);
    s.deathTime = 0;
    if (s.isPlayer) {
      this.controller.onSpawn();
      this.menus.close();
      this.hud.center('');
      this.spawnHintUntil = this.time + 6;
    } else s.brain.onSpawn();
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.exitPointerLock();
    this.openPause();
  }

  resume() {
    this.state = 'playing';
    if (this.player.alive) this.menus.close();
    else this.openRespawn(this.player.lastAttacker, null);
    if (this.input.lastDevice === 'kbm') this.input.requestPointerLock();
  }

  endMatch() {
    this.state = 'ended';
    this.input.exitPointerLock();
    this.hud.show(false);
    sound.horn(this.match.winner === this.player.team);
    this.openEnd();
  }

  // ------------------------------------------------------------ Events
  onKill(killer, victim, weaponId, headshot) {
    victim.alive = false;
    victim.deathTime = this.time;
    victim.deaths++;
    victim.vel.set(0, 0, 0);
    if (killer && killer !== victim) {
      killer.kills++;
      this.match.addKill(killer.team);
    }
    this.hud.killFeed(killer, victim, weaponId, headshot);
    if (victim.brain) victim.brain.releasePerch();
    if (killer && killer.isPlayer) {
      this.hud.popup(headshot ? `HEADSHOT <b>${victim.name}</b>` : `ENEMY DOWN <b>${victim.name}</b>`);
      this.input.rumble(140, 0.6, 0.4);
    }
    if (victim.isPlayer) {
      this.killer = killer;
      this.openRespawn(killer, weaponId);
      this.input.rumble(400, 1, 1);
    }
  }

  onPlayerDamaged(amount, attacker) {
    this.hud.damageFlash(amount);
    sound.hurt();
    const k = Math.min(1, amount / 60);
    this.input.rumble(180 + k * 150, 0.5 + k * 0.5, 0.3 + k * 0.7);
    if (attacker) {
      const p = this.player;
      const ang = Math.atan2(-(attacker.pos.x - p.pos.x), -(attacker.pos.z - p.pos.z));
      this.hud.damageDirection(-wrapAngle(ang - p.yaw));
    }
  }

  // Gunfire alerts enemy bots within radius.
  noise(shooter, radius) {
    for (const s of this.soldiers) {
      if (!s.brain || !s.alive || s.team === shooter.team) continue;
      if (s.pos.distanceTo(shooter.pos) < radius) s.brain.onNoise(shooter);
    }
  }

  reportEnemy(team, pos) {
    const list = this.intel[team];
    const last = list[list.length - 1];
    if (last && this.time - last.time < 0.5) return;
    list.push({ pos: pos.clone(), time: this.time });
    if (list.length > 8) list.shift();
  }

  distanceToPlayer(s) {
    return this.camera.position.distanceTo(_v.set(s.pos.x, s.pos.y + 1.5, s.pos.z));
  }

  playShotSound(s, kind) {
    const cam = this.camera;
    _v.set(s.pos.x, s.pos.y + 1.5, s.pos.z).sub(cam.position);
    const dist = _v.length();
    _w.set(1, 0, 0).applyQuaternion(cam.quaternion);
    const pan = dist > 0.1 ? _v.normalize().dot(_w) * 0.8 : 0;
    sound.gunshot(kind, Math.max(1, dist), pan);
  }

  // Enemy footsteps are an important audio cue; teammates are quieter.
  playFootstep(s) {
    const cam = this.camera;
    _v.set(s.pos.x, s.pos.y + 1, s.pos.z).sub(cam.position);
    const dist = _v.length();
    if (dist > 20) return;
    _w.set(1, 0, 0).applyQuaternion(cam.quaternion);
    const pan = _v.normalize().dot(_w) * 0.8;
    const gain = (s.team === this.player.team ? 0.05 : 0.14) * (1 - dist / 20) * (s.sprinting ? 1.4 : 1);
    sound.footstep(gain, pan);
  }

  playerMuzzleLight() {
    this.muzzleLight.position.copy(this.camera.position);
    this.muzzleLight.intensity = 25;
  }

  // ------------------------------------------------------------ Loop
  frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const inp = this.input.poll(dt);
    if (this.input.lastDevice === 'pad' && (inp.confirm || inp.firePressed)) sound.unlock();

    if (this.state === 'playing' && inp.pausePressed) {
      this.pause();
    } else if (this.menus.isOpen) {
      this.menus.handleInput(inp);
    }

    if (this.state === 'playing') this.update(dt, inp);
    else if (this.state === 'title') this.orbitCamera(dt);

    this.render();
  }

  // Step the simulation. Exposed so tests can fast-forward without rendering.
  simulate(dt, inp) {
    this.time += dt;
    this.match.update(dt);
    const p = this.player;
    if (p.alive && inp) this.controller.update(dt, inp);
    for (const s of this.soldiers) {
      if (s.brain && s.alive) s.brain.update(dt);
    }
    for (const s of this.soldiers) {
      if (s.alive) {
        const ev = s.tick(dt, this.time);
        if (ev === 'reloaded' && s.isPlayer) this.controller.vm.kick = 0;
      } else if (s.deathTime > 0 && this.time - s.deathTime >= MATCH.respawnDelay) {
        if (!s.isPlayer) this.spawn(s);
      }
      s.model.update(dt);
    }
    p.model.root.visible = !p.alive && p.deathTime > 0;
  }

  update(dt, inp) {
    const p = this.player;
    this.simulate(dt, p.alive && !this.menus.isOpen ? inp : this.emptyInput(inp));
    if (this.match.ended) {
      this.endMatch();
      return;
    }

    // Player respawn
    if (!p.alive && p.deathTime > 0) {
      const left = MATCH.respawnDelay - (this.time - p.deathTime);
      const el = document.getElementById('respawn-timer');
      if (left > 0) {
        if (el) el.innerHTML = `Respawning in <b>${Math.ceil(left)}</b>${this.deployReady ? ' · Ready' : ''}`;
      } else {
        this.spawn(p);
      }
      this.deathCam(dt);
    }

    this.effects.update(dt);
    this.muzzleLight.intensity = Math.max(0, this.muzzleLight.intensity - dt * 400);
    this.updateHUD(dt, inp);
  }

  emptyInput(inp) {
    return { ...inp, moveX: 0, moveY: 0, padLookX: 0, padLookY: 0, mouseDX: 0, mouseDY: 0, fire: false, firePressed: false, ads: false };
  }

  deathCam(dt) {
    const p = this.player;
    const cam = this.camera;
    const k = this.killer;
    const t = Math.min(1, (this.time - p.deathTime) * 1.5);
    const base = _v.set(p.pos.x, p.pos.y + 1.6 + t * 2.5, p.pos.z);
    cam.position.lerp(base, Math.min(1, dt * 4));
    if (k && k.alive) {
      const look = _w.set(k.pos.x, k.pos.y + 1.4, k.pos.z);
      const m = new THREE.Matrix4().lookAt(cam.position, look, cam.up);
      const q = new THREE.Quaternion().setFromRotationMatrix(m);
      cam.quaternion.slerp(q, Math.min(1, dt * 3));
    }
  }

  orbitCamera(dt) {
    this.orbitT = (this.orbitT || 0) + dt * 0.05;
    const r = 58;
    this.camera.position.set(Math.cos(this.orbitT) * r, 32, Math.sin(this.orbitT) * r * 0.75);
    this.camera.lookAt(0, 2, 0);
    if (this.camera.fov !== settings.fov) {
      this.camera.fov = settings.fov;
      this.camera.updateProjectionMatrix();
    }
  }

  updateHUD(dt, inp) {
    const hud = this.hud;
    const p = this.player;
    hud.update(dt);
    hud.setScores(this.match.scores, this.match.timeLeft);
    hud.scoreboard(inp.scoreboard, this.soldiers, this.match.scores);
    if (!p.alive) {
      hud.setCrosshair(0, false);
      hud.setScope(false, false, 0);
      hud.setRedDot(false);
      hud.setPrompts([]);
      this.viewmodel.root.visible = false;
      return;
    }
    const w = p.weapon;
    hud.setHealth(p.health);
    hud.setAmmo(w);
    const def = w.def;
    const scoped = def.scope && p.ads > 0.9;
    const moving = Math.min(1, Math.hypot(p.vel.x, p.vel.z) / 5);
    const spread = THREE.MathUtils.lerp(def.hipSpread, def.adsSpread, p.ads) + w.bloom + def.moveSpread * moving;
    const px = (Math.tan(spread) / Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2)) * (innerHeight / 2);
    hud.setCrosshair(px, p.ads < 0.5 && !p.sprinting, this.controller.assistTarget);
    hud.setScope(scoped, this.controller.holdingBreath, this.controller.breath);
    hud.setRedDot(def.id === 'rifle' && p.ads > 0.8);

    const prompts = [];
    if (w.mag <= Math.ceil(def.magSize * 0.25) && w.reserve > 0 && !w.reloading) prompts.push(['reload', w.mag === 0 ? 'Reload!' : 'Reload']);
    if (w.mag === 0 && w.reserve === 0) prompts.push(['switch', 'Out of ammo — switch weapon']);
    if (scoped) prompts.push(['breath', 'Hold breath']);
    if (this.time < this.spawnHintUntil) {
      prompts.push(['ads', 'Aim'], ['fire', 'Shoot'], ['sprint', 'Sprint'], ['switch', 'Switch'], ['melee', 'Melee']);
    }
    if (this.input.lastDevice === 'kbm' && !this.input.pointerLocked) prompts.unshift(['fire', 'Click to capture mouse']);
    hud.setPrompts(prompts);
  }

  render() {
    const r = this.renderer;
    r.clear();
    r.render(this.scene, this.camera);
    if (this.state !== 'title' && this.player.alive) {
      r.clearDepth();
      r.render(this.viewmodel.scene, this.viewmodel.camera);
    }
  }
}
