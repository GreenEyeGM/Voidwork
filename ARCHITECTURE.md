# ARCHITECTURE.md — Technical Deep Dive

For understanding *how* the game is built: class hierarchy, data flow, patterns, and design decisions.

---

## Table of Contents

1. [Scene Architecture](#scene-architecture)
2. [Layering Pattern (Overlay vs Modal)](#layering-pattern)
3. [Cross-Scene Communication](#cross-scene-communication)
4. [Object Hierarchy](#object-hierarchy)
5. [System Architecture](#system-architecture)
6. [Data Flow](#data-flow)
7. [Asset Registry](#asset-registry)
8. [Patterns & Best Practices](#patterns--best-practices)

---

## Scene Architecture

### Scene Dependency Graph

```
Preloader (runs once on boot)
    ↓
    Registers all assets (sprites, audio, fonts)
    ↓
MainMenuScene
    ├── (launch) GameScene + HudScene
    │   └── (pause) PauseScene
    │       ├── (launch) SettingsScene
    │       └── (launch) AchievementsScene
    ├── (launch) SettingsScene (from main menu)
    └── (launch) AchievementsScene (from main menu)
```

**Key principle:** MainMenuScene is the hub. All roads lead back to it. No scene directly launches MainMenuScene; scenes resume/shutdown to return to it.

---

### Preloader

**Responsibility:** Load all assets exactly once, register them under consistent keys.

```javascript
// src/scenes/Preloader.js
export default class Preloader extends Phaser.Scene {
  preload() {
    // Load spritesheets, audio, fonts
    this.load.spritesheet('mainMenuButtons', 'assets/sprites/mainMenuButtons.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    // ... more assets
  }

  create() {
    this.scene.start('MainMenuScene');
  }
}
```

**Pattern:** Every asset key used across scenes is registered here. If a new scene needs a sprite, add it to Preloader first.

---

### MainMenuScene

**Responsibility:** Game hub. Transitions to other scenes without destroying itself.

**Layout:**
- Background: procedural star field (via `createBackground()`)
- Buttons: Play, Settings, Achievements
- Music: plays `mainMenu1` on loop

**Scene transitions:**
- Play → launches GameScene + HudScene
- Settings → launches SettingsScene (modal, caller: 'MainMenuScene')
- Achievements → launches AchievementsScene (modal, caller: 'MainMenuScene')

**Pattern:** Use `this.scene.launch()` for overlays, `this.scene.start()` only to replace the entire scene (e.g., boot → menu).

---

### GameScene + HudScene (Parallel Overlay)

**GameScene responsibility:** Game loop, asteroid spawning, physics.

**HudScene responsibility:** Non-interactive UI overlay (resource counter, asteroid counter, buttons).

**Why parallel?** Keeps game logic separate from HUD rendering. Physics and events happen in GameScene; HUD just reads state and displays it.

**Launch pattern:**
```javascript
// In MainMenuScene.js
this.scene.launch('GameScene');
this.scene.launch('HudScene', { parentScene: this.scene.get('GameScene') });
this.scene.bringToTop('HudScene');
```

**Communication:** HudScene receives GameScene reference via `init(data)`, then:
- Listens to `GameScene.events.on('asteroidDestroyed', ...)` for updates
- Reads `GameScene.gameState` (minerals, alloys, etc.) directly
- Writes back via `GameScene.updateResources(...)` when buttons are clicked

---

### PauseScene (Modal Overlay)

**Responsibility:** Display pause menu (Resume, Settings, Achievements, Main Menu).

**Launch pattern:**
```javascript
// In GameScene or HudScene, on ESC key
this.scene.launch('PauseScene', { callerScene: this.scene.key });
this.scene.pause(); // Pause caller scene
```

**Close pattern:**
```javascript
// In PauseScene, on Resume or back
this.scene.stop();
const caller = this.scene.get(this.callerScene);
caller.scene.resume(this.callerScene);
```

**Key rule:** Modal scenes always receive `data.callerScene` so they know which scene to resume. Without it, they can't navigate back correctly.

---

### SettingsScene (Modal)

**Responsibility:** Display settings (volume slider, music toggle, auto-save delay).

**Launch locations:**
1. From MainMenuScene (as a standalone modal)
2. From PauseScene (as a nested modal)

**Pattern:** Same `callerScene` logic as PauseScene. When Settings closes, it resumes its caller (which might be MainMenuScene or PauseScene).

**Nested modals edge case:**
```
PauseScene (paused GameScene)
  └─> SettingsScene (paused PauseScene)
       └─> On close: resume PauseScene, then PauseScene on close resumes GameScene
```

---

### AchievementsScene (Modal)

**Responsibility:** Display achievement list, descriptions, unlock status.

**Same launch/resume pattern as SettingsScene.**

---

## Layering Pattern

### Overlay vs Modal

| Type | Launch Method | Pauses Caller? | Behavior | Example |
|------|---------------|----------------|----------|---------|
| **Overlay** | `launch().bringToTop()` | No | Runs in parallel, visible on top | HudScene |
| **Modal** | `launch().pause()` | Yes | Pauses caller, blocks interaction | PauseScene, SettingsScene |

**Overlay pattern (HudScene):**
```javascript
// GameScene creates the core game
this.scene.launch('HudScene');
this.scene.bringToTop('HudScene'); // Ensure HUD is on top

// HudScene can listen to GameScene events
this.parentScene.events.on('asteroidDestroyed', () => {
  this.updateDisplay();
});
```

**Modal pattern (PauseScene):**
```javascript
// When pause button clicked
this.scene.launch('PauseScene', { callerScene: 'GameScene' });
this.scene.pause(); // Block input to GameScene until modal closes
```

---

## Cross-Scene Communication

### Event System (Asteroid ↔ GameScene)

Asteroids are created in GameScene and emit events when destroyed or clicked:

```javascript
// Asteroid.js
handleClick() {
  this.health -= playerDamage;
  if (this.health <= 0) {
    this.scene.events.emit('asteroidDestroyed', {
      asteroidType: this.type,
      position: this.getCenter()
    });
  }
}

handleChunkClick() {
  this.scene.events.emit('collectResources', {
    minerals: this.minerals,
    alloys: this.alloys,
    position: this.getCenter()
  });
}
```

**In GameScene, listen:**
```javascript
this.events.on('asteroidDestroyed', (data) => {
  this.gameState.asteroidsDestroyed += 1;
  this.spawnNewAsteroid();
});

this.events.on('collectResources', (data) => {
  this.gameState.minerals += data.minerals;
  this.gameState.alloys += data.alloys;
  this.saveGame();
});
```

**Why events?** Objects don't know about scenes. Events decouple Asteroid from GameScene implementation.

---

### Direct Reference (HudScene ↔ GameScene)

HudScene reads GameScene state directly for performance (no event latency):

```javascript
// HudScene.js, in init(data)
this.gameScene = data.parentScene;

// In update()
this.mineralText.setText(this.gameScene.gameState.minerals);
this.alloyText.setText(this.gameScene.gameState.alloys);
```

**Why mixed?** 
- Events trigger actions (asteroid destroyed → update counter)
- Direct references for fast reads (on every frame, display current value)

---

### Modal ↔ Caller (via callerScene)

```javascript
// PauseScene.js
init(data) {
  this.callerScene = data.callerScene; // 'GameScene'
}

// On back/resume
resume() {
  this.scene.stop();
  const caller = this.scene.get(this.callerScene);
  caller.scene.resume(this.callerScene);
}
```

---

## Object Hierarchy

### Asteroid (Phaser.GameObjects.Sprite)

**Extends:** `Phaser.GameObjects.Sprite`

**Lifecycle:**
1. `constructor()` — Set type, health, velocity
2. `preUpdate()` — Apply drift/spin, wrap to screen edges
3. `handleClick()` — Reduce health, emit `asteroidDestroyed`, spawn chunks
4. `spawnChunks()` — Create child Chunk objects

**Key methods:**
```javascript
handleClick() { /* reduce health, emit event */ }
spawnChunks() { /* create 2–4 Chunk objects */ }
getFrame() { /* return correct spritesheet frame for type + health */ }
```

**Events emitted:**
- `this.scene.events.emit('asteroidDestroyed', data)`
- Emitted when health ≤ 0

---

### Chunk (Anonymous Phaser.GameObjects.Sprite)

**Created by:** Asteroid.spawnChunks()

**Lifecycle:**
1. Spawn at Asteroid position with random velocity
2. `setInteractive()` → clickable
3. `on('pointerdown')` → emit `collectResources`
4. Destroyed after collecting

**Emits:**
- `this.scene.events.emit('collectResources', { minerals, alloys, position })`

---

## System Architecture

### SaveSystem (SaveSystem.js)

**Responsibility:** Load/save game state to localStorage.

Exported as an **object** (not a class). See API.md for the full schema.

```javascript
export const SaveSystem = {
  load() {
    const data = localStorage.getItem('voidwork_save');
    return data ? JSON.parse(data) : this.getDefaultState();
  },

  save(gameState) {
    gameState.lastSavedAt = Date.now();
    localStorage.setItem('voidwork_save', JSON.stringify(gameState));
  },

  reset() {
    localStorage.removeItem('voidwork_save');
  },

  getDefaultState() {
    return {
      resources: { minerals: 0, alloys: 0 },
      spaceship: { level: 1, upgrades: {} },
      achievements: { /* ... */ },
      // ... see API.md for full schema
    };
  }
};
```

**Used by:** GameScene on boot and every resource change.

---

### AudioManager (AudioManager.js)

**Responsibility:** Single source of truth for all audio — music playback, SFX, volume, and mute state.

Exported as an **object singleton** with private internal state. Reads initial settings from `SaveSystem.load()` on first music start and persists changes back via `SaveSystem.save()`.

```javascript
export const AudioManager = {
  startMenuMusic(scene),     // destroys current track, starts mainMenu1/2 cycle
  startGameMusic(scene),     // destroys current track, starts shuffled game playlist
  stopMusicFadeOut(),        // graceful 1s fade out then destroy — use for normal scene exits
  stopMusicNow(),            // instant stop and destroy — use for reset/hard transitions
  playSfx(scene, key),       // plays a SFX key at sfxVolume
  setMusicVolume(v),         // live-updates current track + persists to SaveSystem
  setSfxVolume(v),           // persists to SaveSystem (applies to next playSfx call)
  toggleMusic(),             // mutes/unmutes current track + persists, returns new boolean state
};
```

**Key behaviour:** `startMenuMusic()` and `startGameMusic()` synchronously destroy any currently playing track before starting the new one — prevents music stacking on scene transitions.

**Used by:** All scenes for SFX via `playSfx()`; MainMenuScene and GameScene for music start; HudScene and PauseScene for stopping music on navigation to main menu.

---

### UpgradeSystem (UpgradeSystem.js)

**Responsibility:** Calculate upgrade costs, apply tier effects.

```javascript
export class UpgradeSystem {
  static getCost(upgradeType, currentLevel) {
    const base = UPGRADE_COSTS[upgradeType];
    return {
      minerals: Math.floor(base.minerals * Math.pow(1.5, currentLevel)),
      alloys: Math.floor(base.alloys * Math.pow(1.5, currentLevel))
    };
  }

  static canAfford(cost, gameState) {
    return gameState.resources.minerals >= cost.minerals &&
           gameState.resources.alloys >= cost.alloys;
  }

  static apply(upgrade, gameState) {
    // Reduce resources, increase upgrade level, apply effects
  }
}
```

---

### AchievementSystem (AchievementSystem.js)

**Responsibility:** Track milestones, unlock achievements, show toast notifications.

Exported as an **object** (not a class). Imports `ACHIEVEMENTS` from `AchievementConfig.js`.

```javascript
export const AchievementSystem = {
  // Returns array of newly-unlocked achievement keys. Call after every stat update.
  checkMilestones(gameState) { /* ... */ },

  // Marks achievements unlocked, plays SFX, shows staggered toast notifications.
  // scene is required — SFX and tweens need a live Phaser scene reference.
  unlockMultiple(keys, gameState, scene) { /* ... */ },

  // Shows a fading toast at the bottom of the screen for ~2.5s.
  showNotification(scene, achievementName) { /* ... */ }
};
```

---

## Data Flow

### Boot → MainMenu → Game (Happy Path)

```
1. index.html loads
   └─> Preloader starts (boot scene)
   
2. Preloader.create()
   └─> scene.start('MainMenuScene')
   
3. MainMenuScene.create()
   └─> Draws buttons, starts music
   └─> Player clicks Play
   
4. MainMenuScene 'play' button
   └─> scene.launch('GameScene')
   └─> scene.launch('HudScene', { parentScene: GameScene })
   └─> scene.bringToTop('HudScene')
   
5. GameScene.create()
   └─> Load save data from SaveSystem
   └─> Spawn asteroids
   └─> Start game loop
   
6. Player clicks asteroid
   └─> Asteroid.handleClick()
   └─> scene.events.emit('asteroidDestroyed')
   └─> GameScene listens, updates gameState, calls SaveSystem.save()
```

---

### Resource Collection (Detail)

```
1. Asteroid destroyed (health = 0)
   └─> Asteroid.spawnChunks() creates 2–4 Chunk objects
   
2. Chunk rendered on screen with random velocity
   └─> Chunk.setInteractive()
   └─> Chunk.on('pointerdown', () => { scene.events.emit('collectResources') })
   
3. Player clicks chunk
   └─> Chunk emits collectResources event
   └─> GameScene.events.on('collectResources', (data) => {
         gameState.minerals += data.minerals;
         gameState.alloys += data.alloys;
         SaveSystem.save(gameState);
         HudScene updates display (it reads gameState directly);
       })
   
4. HudScene.update()
   └─> Reads this.gameScene.gameState.minerals (direct reference, not event)
   └─> Renders fresh value to text
```

---

## Asset Registry

### Spritesheet Structure

**mainMenuButtons** (128×128 frames, 9 frames total):
```
Frame 0–2:  Play button (up, hover, down)
Frame 3–5:  Settings button (up, hover, down)
Frame 6–8:  Achievements button (up, hover, down)
```

**HUDIcons** (90×108 frames, 4 frames):
```
Frame 0:  Back button
Frame 1:  Settings icon
Frame 2:  Achievements icon
Frame 3:  Spaceship icon
```

**Asteroids** (128×128 frames, 18 frames, 6 rows × 3 columns):
```
Row 0–2:  Impure asteroids (variants 0–2)
Row 3–5:  Normal asteroids (variants 0–2)
Col 0:    Healthy
Col 1:    Cracked
Col 2:    Broken
```

**AchievementIcons** (328×328 frames, variable count):
```
Each achievement has a dedicated icon frame.
Organized by milestone type.
```

---

## Patterns & Best Practices

### Pattern: Scene-to-Sprite Communication via Events

✅ **Correct:**
```javascript
// Asteroid.js
this.scene.events.emit('asteroidDestroyed', { damage: 10 });

// GameScene.js
this.events.on('asteroidDestroyed', (data) => {
  console.log('Asteroid destroyed with damage:', data.damage);
});
```

❌ **Avoid:**
```javascript
// Asteroid.js, reaching back to GameScene
this.gameScene.handleAsteroidDestroy(); // breaks encapsulation
```

**Why:** Objects should emit events, not call methods on scenes directly. It keeps dependencies clean.

---

### Pattern: Constants from GameConfig

✅ **Correct:**
```javascript
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig.js';

const x = GAME_WIDTH / 2;
```

❌ **Avoid:**
```javascript
const x = 800 / 2; // hardcoded, breaks if game size changes
```

---

### Pattern: Modal Scenes with callerScene

✅ **Correct:**
```javascript
// PauseScene.js
init(data) {
  this.callerScene = data.callerScene; // 'GameScene'
}

// On close
this.scene.stop();
this.scene.resume(this.callerScene);
```

❌ **Avoid:**
```javascript
// PauseScene.js
this.scene.resume('GameScene'); // hardcoded, breaks if launched from elsewhere
```

---

### Pattern: Save After Every State Change

✅ **Correct:**
```javascript
// GameScene.js
this.gameState.minerals += 10;
SaveSystem.save(this.gameState); // persist immediately
```

❌ **Avoid:**
```javascript
this.gameState.minerals += 10;
// Hoping to save later... and then browser closes. Data lost.
```

---

### Pattern: Overlay vs Modal

✅ **Correct:**
```javascript
// HUD is an overlay (runs in parallel)
this.scene.launch('HudScene');

// Pause is a modal (blocks interaction)
this.scene.launch('PauseScene');
this.scene.pause(); // pause this scene until modal closes
```

❌ **Avoid:**
```javascript
// Launching HUD as a modal unnecessarily
this.scene.launch('HudScene');
this.scene.pause(); // wrong, HUD should not block gameplay
```

---

## Summary: Architecture Principles

1. **Single Responsibility:** Each scene has one job. GameScene = game loop. HudScene = display. PauseScene = pause menu.

2. **Events for Side Effects:** Objects emit events; scenes listen. Keeps objects dumb, scenes smart.

3. **Direct References for Reads:** HudScene reads GameScene.gameState directly for performance. No event latency for every frame.

4. **Modals Know Their Caller:** Modal scenes always receive `callerScene` so they can resume the right parent.

5. **Assets Registered Once:** Preloader registers everything. No dynamic loading mid-game.

6. **Save Immediately:** Every resource change triggers SaveSystem.save(). No batching, no "save on exit" hope.

7. **No Global State:** All state lives in GameScene.gameState or SaveSystem. No window.globals.

---

**Next:** Refer to PROJECT.md for a quick task overview, then DESIGN.md for concrete numbers.
