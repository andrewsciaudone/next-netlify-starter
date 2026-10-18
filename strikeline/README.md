# Strikeline

A small browser first-person shooter: **5v5 Team Deathmatch** (you + 4 AI teammates vs 5 AI enemies) on a compact urban map. Built with Three.js. All art is blocky low-poly geometry generated in code and all sounds are synthesized with the Web Audio API, so there are no external assets.

## Run it locally

Requirements: [Node.js](https://nodejs.org) 18 or newer, plus desktop Chrome or Edge.

```bash
cd strikeline
npm install
npm run dev
```

Then open **http://localhost:5173** in Chrome or Edge.

- **Xbox controller:** plug it in over USB or pair it over Bluetooth, then press any button while the page is focused (browsers only expose a gamepad after a button press). The main menu shows "Controller connected" once it's detected. Use `localhost`, not a LAN IP, because the Gamepad API needs a secure context.
- **Keyboard + mouse:** click the game to capture the mouse. Press Esc or P to pause.
- **Sound:** browsers only start audio after a click or key press. If you use only the controller and hear nothing, click the page once.

Production build: `npm run build` writes a static site to `strikeline/dist/` that any static host can serve. `npm run preview` serves that build locally.

## Rules

- Team Deathmatch. The first team to **30 kills** wins, otherwise the team with the most kills after **10 minutes**. Ties are a draw.
- You respawn **3 seconds** after dying, at your team's spawn zone (blue at the west end, red at the east end). Change your loadout on the respawn screen.
- Health regenerates after a few seconds without taking damage. Headshots do 2x damage. There is no friendly fire.

## Controls

| Action | Xbox controller | Keyboard / mouse |
|---|---|---|
| Move / Look | Left stick / Right stick | WASD / Mouse |
| Shoot | RT | Left click |
| Aim down sights / scope | LT | Right click |
| Sprint (toggle) · Hold breath while scoped | L3 | Shift (hold) |
| Melee | R3 | V / F / middle click |
| Jump | A | Space |
| Crouch (toggle) | B | C / Left Ctrl |
| Reload | X | R |
| Switch weapon | Y or D-pad up | Q / 1 / 2 / mouse wheel |
| Scoreboard | View (hold) | Tab (hold) |
| Pause | Menu | Esc / P |
| Menus | D-pad or left stick, A to select, B to go back | Arrow keys or mouse, Enter to select, Esc to go back |

The Settings menu covers look sensitivity, ADS sensitivity, stick deadzone, invert Y, aim assist, vibration, mouse sensitivity, FOV, volume, bot difficulty and shadows. Settings are saved in the browser's localStorage.

## Weapons

| Loadout | Primary | Secondary |
|---|---|---|
| Assault | **AR-7 Warden**: 30 rounds, full auto, moderate recoil | **P-12 Sidearm**: 12 rounds, semi-auto |
| Marksman | **LR-90 Longbow**: 5 rounds, bolt action, 4x scope with sway, one-shot kill to head or body when scoped, heavy damage penalty from the hip | **P-12 Sidearm** |

## Code layout

```
strikeline/
  index.html            HUD + menu containers
  src/
    main.js             entry point
    config.js           teams, match rules, movement, bot difficulty presets
    settings.js         user settings schema + persistence
    core/Input.js       gamepad (standard mapping) + keyboard/mouse -> one input state; rumble
    core/Sound.js       procedural Web Audio sound effects
    core/textures.js    procedural canvas textures
    world/MapData.js    the map as a list of boxes, plus spawns and sniper perches
    world/World.js      merged meshes, AABB collision / movement, raycasts
    world/NavGrid.js    height-field nav grid + A* pathfinding for bots
    entities/Soldier.js           shared state for player and bots (health, weapons, hitboxes)
    entities/SoldierModel.js      blocky third-person model + animation
    entities/PlayerController.js  player movement, look, aim assist, shooting
    entities/Viewmodel.js         first-person gun, drawn in its own pass
    ai/BotBrain.js      bot perception, aiming, cover, roaming, sniper perches
    combat/weapons.js   weapon stats, loadouts, ammo state
    combat/Combat.js    hitscan, melee, damage resolution
    fx/Effects.js       tracers, muzzle flashes, impacts
    game/Match.js       TDM scoring and timer
    game/Game.js        renderer, game loop, spawning, menus, events
    ui/HUD.js, ui/Menus.js, ui/prompts.js
```

Where to change things:

- **Map:** edit `world/MapData.js`. Everything is axis-aligned boxes standing on the ground, and `sym()` mirrors a feature to the other half so the map stays fair. Bot navigation is generated from the boxes automatically.
- **Weapons:** add an entry to `WEAPONS` and a loadout to `LOADOUTS` in `combat/weapons.js`, then give it a first-person model in `Viewmodel.js` and a third-person model in `buildGunMesh`.
- **Bot difficulty:** `DIFFICULTY` in `config.js` sets aim error, reaction time, turn speed and pauses between bursts.
- **Debugging:** the running game is exposed as `window.strikeline` in the browser console.
