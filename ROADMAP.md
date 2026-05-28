# ROADMAP.md — Active Development Tasks

Prioritized feature areas and concrete tasks. Use this to pick what to code next.

**Format:**
- `- [ ]` = not started
- `- [x]` = complete
- Grouped by feature area
- Context in parentheses for implementation details
- Note lines for gotchas/design decisions

---

## 🔴 Critical Blockers (Fix First)

*(All resolved — see Completed section.)*

---

## 🟡 High Priority (Unblock Other Work)

*(All resolved — see Completed section.)*

---

## 🟠 Medium Priority (Core Gameplay)

### Spaceship System

Spaceship is the core progression mechanic.

- [ ] Implement spaceship upgrade system
  - File: `src/systems/UpgradeSystem.js`
  - Core logic:
    1. Player clicks "Upgrade" button in HUD
    2. Opens UpgradeScene (modal overlay, like PauseScene)
    3. Display available upgrades with costs and current levels
    4. Player clicks an upgrade
    5. Check if affordable (`UpgradeSystem.canAfford()`)
    6. If yes: deduct resources, increase level, apply effects (`UpgradeSystem.apply()`)
    7. Play `upgrade` SFX
    8. Save game (`SaveSystem.save()`)
    9. Update display (show new level)
  - Spec: See DESIGN.md (Spaceship Upgrade System section) for costs and effects

- [ ] Spaceship upgrade effects — apply to gameplay
  - Mining Power (reduce clicks to destroy): Modify `Asteroid.js` to check current mining power level
    - Level 1: 3 clicks
    - Level 2: 2 clicks
    - Level 3+: 1 click
  - Resource Multiplier: Apply % bonus when collecting chunks
    - Check `gameState.spaceship.upgrades.resourceMultiplier`
    - Multiply minerals/alloys by (1 + multiplier * 0.05)
  - Auto-Mine: Passive DPS on nearest asteroid (implement in GameScene.update())
    - Check if upgrade level > 0
    - Each frame, deal 1% of current mining power as damage (level 1), 2% (level 2), etc.
  - Auto-Collect: Chunks auto-collect after 3 seconds
    - Modify `Chunk` behavior: if upgrade level > 0, auto-collect after timer
    - Level 1: 50% chance
    - Level 2: 75% chance
    - Level 3: 100% auto-collect
  - Rare Multiplier: Apply bonus to alloy drops (Tier 3+)
  - Efficiency Boost: Reduce upgrade costs by %
  - File: `src/objects/Asteroid.js`, `src/scenes/GameScene.js`, `src/systems/UpgradeSystem.js`

- [ ] Create UpgradeScene (modal to display upgrades)
  - File: `src/scenes/UpgradeScene.js` (create if not exists)
  - Pattern: Same as PauseScene — modal with `callerScene` in init()
  - Layout:
    - Title: "Spaceship Upgrades"
    - List of upgrades:
      - Name
      - Current level / max level
      - Cost (minerals + alloys)
      - Effect description
      - "Buy" button
    - Back button (resume caller)
  - Behavior:
    - On "Buy" click, check affordability, apply upgrade, refresh display
    - Show "Can't afford" message if insufficient resources
  - Data source: `UPGRADE_COSTS` config (from DESIGN.md)

---

### Skill Tree System

Skill tree is secondary progression (separate from spaceship upgrades).

- [ ] Create skill tree scene/overlay
  - File: `src/scenes/SkillTreeScene.js` (create if not exists)
  - Pattern: Modal overlay (callerScene logic)
  - Layout:
    - Title: "Skill Tree"
    - Node grid (target: 12–20 nodes arranged in tiers)
    - Show unlocked nodes (glowing) vs locked nodes (grayed out)
    - Show cost (in skill points) to unlock
    - Connection lines between related nodes
  - Behavior:
    - Click locked node → check if affordable
    - If yes: deduct skill point, unlock node, apply effect, save
    - If no: show "Insufficient skill points" message

- [ ] Define skill tree nodes and effects
  - Config file: `src/config/SkillTreeConfig.js` (or inline in SkillTreeScene.js)
  - Data structure:
    ```javascript
    const SKILL_NODES = {
      yieldBoostI: {
        id: 'yieldBoostI',
        name: 'Yield Boost I',
        cost: 1,          // skill points
        effect: { mineralBonus: 0.05 }, // +5%
        tier: 'early'
      },
      // ... more nodes
    };
    ```
  - Nodes: See DESIGN.md (Skill Tree System section) for node list
  > Note: Design TBD — earn skill points how? Reset on prestige?

- [ ] Wire skill tree to game state
  - File: `src/systems/SkillTree.js` (or inline)
  - Track: `gameState.skillTree.nodesUnlocked`, `spentPoints`, `totalPoints`
  - Apply effects: Each node should modify game behavior (bonuses to resources, costs, etc.)
  - Persistence: Save skill tree state to localStorage

---

### Audio — New SFX

- [ ] Add upgrade sound effect
  - File: `assets/audio/sfx/upgrade.mp3`
  - Usage: Play when player buys an upgrade
  - Call site: `UpgradeSystem.apply()` or UpgradeScene after purchase
  - Code: `AudioManager.playSfx(scene, 'upgrade')`

- [ ] Add skill tree unlock sound effect
  - File: `assets/audio/sfx/skillTreeUnlock.mp3`
  - Usage: Play when player unlocks a skill tree node
  - Call site: SkillTreeScene after unlock
  - Code: `AudioManager.playSfx(scene, 'skillTreeUnlock')`

- [ ] Pause audio ducking — lower volume when paused
  - File: `src/scenes/PauseMenuScene.js`
  - Target: Fade music volume down when PauseScene opens, restore on resume
  > Note: Check if Phaser's `scene.pause()` auto-stops audio or if manual mute needed.

---

## 🟢 Lower Priority (Polish & Future)

### Spaceship Display & UI

- [ ] Settings button in HUD (also visible in PauseScene)
  - File: `src/scenes/HudScene.js`
  - Icon: `HUDIcons` spritesheet, frame 1 (settings)
  - Behavior: Click → pause GameScene + HudScene, launch SettingsScene with `callerScene: 'HudScene'`; on HudScene `resume` event also resume GameScene
  - File: `src/scenes/PauseMenuScene.js`

### Game Scene Level 1

- [ ] Ensure 4–5 asteroids spawn consistently at game start
  - File: `src/scenes/GameScene.js` (create() method)
  - Behavior: Spawn on boot, then respawn as destroyed
  - Check: Spawn positions don't overlap, all visible on screen initially

### Prestige & Difficulty Scaling

- [ ] Implement prestige mechanic
  - File: `src/systems/PrestigeSystem.js` (create if not exists)
  - Trigger: Button in HUD or pause menu (TBD which)
  - Logic:
    1. Show confirmation: "Advance to Void Level 2? Asteroids will be harder."
    2. On confirm:
       - `gameState.prestige.level += 1`
       - `gameState.spaceship = reset to level 1` (TBD: keep upgrades?)
       - `gameState.resources *= 1.5` (prestige bonus; exact % in DESIGN.md)
       - Asteroid spawner difficulty increases (faster, more health, more drops)
       - Save game
       - Refresh scene or transition
  > Note: Exact specs TBD — what resets, what persists, prestige bonuses.

- [ ] Asteroid difficulty scaling
  - File: `src/objects/Asteroid.js` or `src/scenes/GameScene.js`
  - Formula: Health/Speed/Drop increases per prestige level (TBD exact formula)
  - Example: `health = baseHealth * (1 + prestige * 0.2)`
  - Spec: See DESIGN.md (Difficulty & Progression section)

---

## 📝 Code Polish

- [ ] Reduce duplication in MainMenuScene button setup
  - File: `src/scenes/MainMenuScene.js`
  - Refactor: Extract button creation to a helper function

- [ ] Future use of `gfx` variable in Background.js
  - File: `src/utils/Background.js`
  - Action: Ensure callers store the return value for potential future clearing/redrawing

---

## 🎯 Task Picking Guide

### For Quick Wins (< 1 hour)
- Audio ducking on pause
- Settings button in HUD

### For Feature Completeness (1–3 hours)
- Spaceship upgrades (core logic)

### For Big Features (3–8 hours)
- UpgradeScene modal (display + purchase)
- SkillTreeScene modal (display + unlock)
- Prestige system

### For Polish (1–2 hours each)
- Code deduplication in MainMenuScene
- Add new SFX files

---

## Completed Features ✅

(These can be deleted once pushed to main; git history retains them.)

- [x] Main Menu background (stars)
- [x] Main Menu buttons (Play, Settings, Achievements)
- [x] Settings Scene (UI scaffolding + back button)
- [x] Achievements Scene (UI scaffolding + back button)
- [x] GameScene core loop (click asteroids, spawn chunks)
- [x] HudScene overlay (asteroid counter, resource counter)
- [x] PauseScene modal (resume, buttons, menu transitions)
- [x] Asteroid system (2 types, health tiers, chunk spawning)
- [x] Audio (background music, click/destruction SFX)
- [x] Background utility function (no duplication)
- [x] Scene flow (Preloader → MainMenu → Game → Pause/Settings/Achievements)
- [x] Button hitbox fix — Main Menu (Circle r=30) and HUD (Rectangle 8,8,74,92)
- [x] Settings Scene functional sliders — volume, music toggle, auto-save delay (saves to localStorage)
- [x] Game music shuffled playlist — all 5 tracks with 2s fade in / 3s fade out between tracks
- [x] AudioManager refactor (`src/systems/AudioManager.js`) — centralised music + SFX, volume/mute state, SaveSystem integration
- [x] Fix music overlap on scene switch — scene transitions no longer stack tracks
- [x] Achievements Scene — display full list with icons, descriptions, and unlock status
- [x] Achievement system — wire milestones to game state, unlock on hit, toast notification + SFX
- [x] Achievement milestones — asteroid (1/10/50/200/500/1000), resource (10/100/500/1000), spaceship level, prestige, skill nodes
- [x] Reset Game button in PauseScene — confirmation prompt, red styling, irreversible warning
- [x] SaveSystem.reset() — clears localStorage and returns fresh default state
- [x] Fix: Asteroid counter increments by more than 1 after reset — stacked event listeners, fixed with events.off() before re-adding
- [x] Fix: Music doesn't stop on Reset Game confirm — added stopMusicNow() for instant stop before scene teardown
- [x] Spaceship sprite — bottom centre of GameScene (`GAME_CENTER_X`, `GAME_HEIGHT - 60`), 80×80 display
- [x] Asteroid health bar — two rectangles above each asteroid, green → orange → red as health drops
- [x] Achievement hover preview — floating tooltip per cell, neon cyan glow when unlocked, muted grey when locked

---

**Next Step:** Pick a task, read DESIGN.md for specs.
