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

These prevent other work from proceeding cleanly.

### Button Hitbox Bug

- [ ] Fix Main Menu buttons — interactive area extends beyond visible icon
  - Buttons: Play, Settings, Achievements
  - Current: clickable in a large square around icon
  - Target: clickable only on the icon itself (tighten hitbox)
  - Solution: Use `setSize(w, h)` after `setInteractive()` to match sprite dimensions
  - File: `src/scenes/MainMenuScene.js`
  > Note: Check if same issue exists in HUD buttons (Back, Settings, Achievements, Spaceship). Fix all at once.

---

## 🟡 High Priority (Unblock Other Work)

### Settings Scene — Functional Sliders

Settings UI scaffolding exists but sliders don't do anything. This unblocks Settings persistence.

- [ ] Volume slider (range: 0.0–1.0, controls `this.sound.volume`)
  - File: `src/scenes/SettingsScene.js`
  - Behavior: Drag horizontally, show numeric value (0–100%)
  - Save: Call `SaveSystem.save(gameState.settings)` on slider release
  - Spec: See DESIGN.md (Audio Design section)

- [ ] Music toggle (mute/unmute music tracks only, not SFX)
  - File: `src/scenes/SettingsScene.js`
  - Behavior: Toggle button, show "Music: ON/OFF"
  - Effect: When ON, music plays. When OFF, all music muted (`this.sound.mute = true` for music layer only)
  > Note: Need to clarify music vs SFX in sound manager. Phaser doesn't have audio groups by default; may need to tag music tracks separately in Preloader.
  - Save: Call `SaveSystem.save(gameState.settings.musicEnabled)`

- [ ] Auto-save delay slider (options: 1 min, 5 min, 10 min)
  - File: `src/scenes/SettingsScene.js`
  - UI: Radio buttons or dropdown (not a traditional slider; label it clearly)
  - Current default: 5 minutes (300,000 ms)
  - Behavior: Change affects future auto-saves, not retroactively
  - Save: Call `SaveSystem.save(gameState.settings.autoSaveDelay)`
  > Note: GameScene must read this value on boot and set its auto-save interval accordingly.

---

### Achievements Scene — Display & Functionality

UI scaffolding exists. Need to wire up achievement tracking and unlock notifications.

- [ ] Display full achievements list with icons and descriptions
  - File: `src/scenes/AchievementsScene.js`
  - Source: `AchievementIcons` spritesheet (from Preloader)
  - Data: Define achievement config with descriptions (name, description, icon frame, milestone target)
  - Example config:
    ```javascript
    const ACHIEVEMENTS = {
      firstStrike: {
        id: 'firstStrike',
        name: 'First Strike',
        description: 'Destroy 1 asteroid',
        iconFrame: 0,
        milestone: 'asteroidsDestroyed',
        target: 1
      },
      // ... more achievements
    };
    ```
  - Layout: Grid or list of achievement icons, show unlock status (locked/unlocked), description on hover/click
  > Note: See DESIGN.md (Achievements section) for full milestone list.

- [ ] Wire achievements to game state — unlock when milestone hit
  - File: `src/systems/AchievementSystem.js` (create if not exists)
  - Trigger points: GameScene events (`asteroidDestroyed`, `collectResources`, `upgradeApplied`, etc.)
  - Logic: After every stat update, call `AchievementSystem.checkMilestones(gameState)` to see if new achievements unlocked
  - Unlock behavior:
    1. Mark achievement `unlocked = true` in gameState
    2. Play `achievementUnlocked` SFX
    3. Show brief on-screen notification (text pop-up, 2–3 seconds)
    4. Call `SaveSystem.save(gameState)`
  - File: `src/systems/AchievementSystem.js`

- [ ] Implement achievement milestones (from DESIGN.md)
  - Asteroid milestones: 1, 10, 50, 200, 500, 1000
  - Resource milestones: 10, 100, 500, 1000
  - Spaceship level milestones: 5, 10
  - Special milestones: Prestige once, max Tier 1 upgrades, unlock all skill nodes
  - File: `src/systems/AchievementSystem.js` (or `src/config/AchievementConfig.js`)

---

## 🟠 Medium Priority (Core Gameplay)

### Spaceship System

Spaceship is the core progression mechanic.

- [ ] Add spaceship sprite to GameScene
  - File: `src/scenes/GameScene.js` (create() method)
  - Sprite: Use `HUDIcons` spritesheet, frame 3 (spaceship icon)
  - Position: Fixed on screen (top right, below the ship info UI)
  - Size: Medium (maybe 80×80 px)
  - Note: This is cosmetic; the real spaceship state is in `gameState.spaceship`

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
  - File: `src/systems/UpgradeSystem.js`

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
  - File: `src/lib/assets/audio/upgrade.mp3` (or .ogg)
  - Usage: Play when player buys an upgrade
  - Call site: `UpgradeSystem.apply()` or UpgradeScene after purchase
  - Code: `this.sound.play('upgrade', { volume: 0.8 })`

- [ ] Add skill tree unlock sound effect
  - File: `src/lib/assets/audio/skillTreeUnlock.mp3` (or .ogg)
  - Usage: Play when player unlocks a skill tree node
  - Call site: SkillTreeScene after unlock
  - Code: `this.sound.play('skillTreeUnlock', { volume: 0.8 })`

- [ ] Pause audio ducking — lower volume when paused
  - File: `src/scenes/PauseScene.js`
  - Current behavior: Unknown (check if audio continues at full volume)
  - Target: When pause modal launches, fade all audio to 0 (muted)
  - On pause:
    ```javascript
    this.scene.launch('PauseScene', { callerScene: 'GameScene' });
    this.scene.pause(); // Phaser pauses physics but not audio
    this.sound.mute = true; // or fade to 0 over 200ms
    ```
  - On resume:
    ```javascript
    this.sound.mute = false; // Restore audio
    ```
  > Note: Check if Phaser's `scene.pause()` auto-stops audio or if manual mute needed.

---

## 🟢 Lower Priority (Polish & Future)

### Spaceship Display & UI

- [ ] Settings button in HUD (Bottom Right, also visible in PauseScene)
  - File: `src/scenes/HudScene.js`
  - Icon: `HUDIcons` spritesheet, frame 1 (settings)
  - Position: Bottom right corner
  - Behavior: Click → launch SettingsScene with `callerScene: 'HudScene'`
  - Same icon should appear in PauseScene too
  - File: `src/scenes/PauseScene.js`

- [ ] Asteroid health bar (show current asteroid's HP above or below it)
  - File: `src/objects/Asteroid.js`
  - UI: Simple bar (Graphics object or image) floating above asteroid
  - Update: Every hit, reduce bar width proportionally
  - Display: Only show if asteroid health < max (or always visible)
  - Cosmetic: Hide when asteroid destroyed

### Game Scene Level 1

- [ ] Ensure 4–5 asteroids spawn consistently at game start
  - File: `src/scenes/GameScene.js` (create() method)
  - Current: Described as "4/5 Asteroids" in todo
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
  - Current: Likely repetitive code for Play/Settings/Achievements buttons
  - Refactor: Extract button creation to a helper function
  - Example:
    ```javascript
    createButton(x, y, spriteFrame, scene, callback) {
      const btn = this.add.sprite(x, y, 'mainMenuButtons', spriteFrame);
      btn.setInteractive();
      btn.on('pointerdown', callback);
      return btn;
    }
    ```

- [ ] Future use of `gfx` variable in Background.js
  - File: `src/utils/Background.js`
  - Current: `createBackground()` returns `gfx` (Graphics object)
  - Purpose: Store in case future updates want to manually clear/redraw/animate background
  - Action: Document return value; don't discard it in scene code
  - Example:
    ```javascript
    const bgGfx = createBackground(this, 'small', 'mid', 'large');
    // Keep bgGfx for future use if needed
    ```

---

## 🎯 Task Picking Guide

### For Quick Wins (< 1 hour)
- Button hitbox fix
- Add spaceship sprite to GameScene
- Audio ducking on pause

### For Feature Completeness (1–3 hours)
- Settings Scene sliders (all 3)
- Achievements display & unlock notifications
- Spaceship upgrades (core logic)

### For Big Features (3–8 hours)
- UpgradeScene modal (display + purchase)
- SkillTreeScene modal (display + unlock)
- Prestige system

### For Polish (1–2 hours each)
- Code deduplication in MainMenuScene
- Asteroid health bar
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

---

**Next Step:** Pick a task, read DESIGN.md for specs.
