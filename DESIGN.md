# DESIGN.md — Game Design & Balance Specifications

Design decisions, concrete numbers, and intended feel. This is the *why* and *how it should feel* — not task tracking.

---

## Game Feel & Philosophy

**Voidwork** is a low-stress, incremental idle game. Clicking should feel satisfying but not mandatory — the player can walk away and come back later. Animations should be snappy, not sluggish. Progression should feel steady but never forced.

**Target audience:** Casual players who enjoy watching numbers go up, strategy in resource allocation, and the satisfaction of unlocking achievements.

---

## Resource System

### Two Resources

**Minerals:**
- Abundance: Common
- Dropped by: Both asteroid types (Impure + Normal)
- Primary use: Spaceship upgrades, skill tree nodes

**Alloys:**
- Abundance: Rare
- Dropped by: Normal asteroids only (Impure asteroids drop 0 alloys)
- Primary use: Tier 3+ spaceship upgrades, prestige-gated skill nodes

### Yield Per Asteroid Type

**Impure Asteroid:**
- Health: 3 clicks (fixed for all variants)
- Minerals per destroy: 5–10
- Alloys per destroy: 0
- Chunks spawned: 2–3
- Speed: 20–50 px/s
- Spawn weight: 60% of spawns

**Normal Asteroid:**
- Health: 3 clicks (fixed for all variants)
- Minerals per destroy: 10–20
- Alloys per destroy: 5–10
- Chunks spawned: 2–3
- Speed: 20–50 px/s
- Spawn weight: 40% of spawns

**Rationale:** Normal asteroids are harder (more health, faster) but reward Alloys. This creates decision space: efficient clicking (many Impure asteroids) vs. efficiency (fewer Normal asteroids for rare drops).

---

## Spaceship Upgrade System

### Upgrade Tiers & Effects

Spaceship has 4 tiers. Each tier unlocks new upgrades with cumulative effects.

#### Tier 1 (Starting)
- **Mining Power:** Reduce clicks to destroy asteroid
  - Level 1: 3 clicks (default)
  - Level 2: 2 clicks
  - Level 3+: 1 click

- **Resource Multiplier:** Bonus % on each resource collect
  - Level 1: 0% (default)
  - Level 2: +5%
  - Level 3: +10%
  - Level 4: +15%
  - Level 5: +20%

#### Tier 2 (Unlocks at Spaceship Level 2)
- **Auto-Mine:** Passive DPS on nearest asteroid
  - Level 1: 1% of current mining power per second
  - Level 2: 2% per second
  - Level 3: 4% per second

#### Tier 3 (Unlocks at Spaceship Level 3)
- **Auto-Collect:** Chunks auto-collect after 3 seconds
  - Level 1: 50% chance to auto-collect
  - Level 2: 75% chance
  - Level 3: 100% auto-collect

- **Rare Multiplier:** Bonus % on alloy drops (Tier 3+)
  - Level 1: +10%
  - Level 2: +20%
  - Level 3: +30%

#### Tier 4 (Unlocks at Spaceship Level 4)
- **Efficiency Boost:** Reduce upgrade costs by %
  - Level 1: 5% cost reduction
  - Level 2: 10% reduction
  - Level 3: 20% reduction

- **Prestige Multiplier:** Bonus to all resources on prestige
  - Level 1: +25%
  - Level 2: +50%
  - Level 3: +100%

### Upgrade Cost Scaling

**Base costs (Level 1):**
```
Mining Power:      50 minerals + 0 alloys
Resource Multiplier: 40 minerals + 5 alloys
Auto-Mine:        100 minerals + 20 alloys
Auto-Collect:     150 minerals + 50 alloys
Rare Multiplier:  200 minerals + 100 alloys
Efficiency Boost: 250 minerals + 150 alloys
Prestige Multiplier: 500 minerals + 300 alloys
```

**Cost formula for level N:**
```
cost = base * (1.5 ^ (N - 1))  [rounded down]
```

**Example:**
```
Mining Power Level 1: 50 minerals
Mining Power Level 2: 50 * 1.5 = 75 minerals
Mining Power Level 3: 75 * 1.5 = 112 minerals (rounded down)
Mining Power Level 4: 112 * 1.5 = 168 minerals
```

**Max level:** 5 per upgrade. **No refunds.**

**Rationale:** Exponential scaling makes late-game progression meaningful while early game is accessible. Mixing minerals/alloys creates tough choices.

---

## Skill Tree System

### Nodes (Placeholder Specs, Design Phase)

The skill tree is separate from upgrades. Spending a skill point unlocks a node permanently.

**Planned node types:**

| Node | Cost (SP) | Effect | Tier |
|------|-----------|--------|------|
| Yield Boost I | 1 | +5% minerals & alloys | Early |
| Yield Boost II | 2 | +10% minerals & alloys | Mid |
| Efficiency I | 1 | -5% upgrade costs | Mid |
| Rarity Focus | 3 | +15% alloy drops | Late |
| Prestige Prep | 5 | +25% post-prestige multiplier | Late |
| Auto-Click | 2 | Passive 0.5 clicks/sec | Mid |

> **TBD:** Exact number of nodes (target: 12–20). Should skill tree have a level cap? Should unspent SP carry over between prestiges?

---

## Achievements

### Milestone-Based Unlocks

Achievements unlock when the player hits a stat threshold. Once unlocked, they stay unlocked (even after prestige, unless prestige resets them — TBD).

**Achievement Categories:**

#### Asteroid Milestones
- Destroy 1 asteroid → "First Strike"
- Destroy 10 asteroids → "Asteroid Hunter"
- Destroy 50 asteroids → "Space Cleaner"
- Destroy 200 asteroids → "Void Dominator"
- Destroy 500 asteroids → "Infinite Clicker"
- Destroy 1000 asteroids → "Legend of the Void"

#### Resource Milestones
- Collect 10 resources (minerals + alloys) → "Prospector"
- Collect 100 resources → "Hoarder"
- Collect 500 resources → "Wealth Keeper"
- Collect 1000 resources → "Resource Master"

#### Spaceship Milestones
- Reach spaceship level 5 → "Captain"
- Reach spaceship level 10 (post-prestige) → "Admiral"
- Max all Tier 1 upgrades → "Tier 1 Champion"

#### Special
- Prestige once → "New Beginning"
- Unlock all skill tree nodes → "Enlightened"

### Achievement Behavior

- **Icon & Description:** Each achievement has a spritesheet icon and a short description
- **Unlock notification:** Play `achievementUnlocked` SFX + brief text popup on screen
- **Persistence:** Stored in localStorage under `achievements[key].unlocked = true`
- **Prestige interaction:** TBD — do achievements reset? (Likely no, but need to decide)

---

## Prestige Mechanic

### One Prestige Level

Prestige resets the game field to a harder difficulty and resets spaceship level to 1 (but keeps achievements and skill tree).

> **TBD:** Do resources reset? Do upgrades reset? Does prestige give a permanent multiplier to future runs?

**Intended flow:**
1. Player reaches spaceship level X (threshold TBD, maybe 10+)
2. Prestige button appears → "Enter the Void's Next Layer"
3. Confirms choice
4. Field resets: asteroids spawn faster, have more health, drop +50% resources (prestige bonus)
5. Spaceship resets to level 1, all upgrades reset
6. Skill tree stays unlocked (nodes already learned)
7. Resources + achievements persist
8. New asteroids are harder, making grinding faster/more engaging

---

## Persistence (localStorage)

### Save Data Schema

All state persists in a single JSON object under `localStorage['voidwork_save']`.

**Full schema:**
```javascript
{
  // Resources (never reset except on total wipe)
  resources: {
    minerals: 1234,
    alloys: 567
  },

  // Spaceship state (resets on prestige)
  spaceship: {
    level: 5,
    upgrades: {
      miningPower: 2,              // current level
      resourceMultiplier: 3,
      autoMine: 1,
      autoCollect: 0,              // not yet unlocked
      rareMultiplier: 0,
      efficiencyBoost: 0,
      prestigeMultiplier: 0
    }
  },

  // Game statistics (never reset)
  stats: {
    asteroidsDestroyed: 42,
    resourcesCollected: 1234,
    totalResourcesEarned: 5000,   // cumulative across prestiges
    timePlayedMs: 3600000
  },

  // Achievements (never reset, even on prestige)
  achievements: {
    firstStrike: { unlocked: true, unlockedAt: 1620000000000 },
    asteroidHunter: { unlocked: true, unlockedAt: 1620000001000 },
    prospector: { unlocked: false, unlockedAt: null },
    // ... etc
  },

  // Skill tree (unlocked nodes persist across prestiges)
  skillTree: {
    nodesUnlocked: [1, 3, 5, 7],   // node IDs
    spentPoints: 4,
    totalPoints: 10                 // TBD: earn points how?
  },

  // Settings (persist across sessions)
  settings: {
    musicVolume: 0.1,              // 0.0–1.0 (controls music track volume via AudioManager)
    sfxVolume: 0.5,                // 0.0–1.0 (controls SFX volume via AudioManager)
    musicEnabled: true,
    autoSaveDelay: 300000          // ms (5 minutes)
  },

  // Prestige state
  prestige: {
    level: 0,                      // how many times prestiged
    timesPrestiged: 0,             // counter (might be same as level)
    lastPrestigeAt: null           // timestamp
  },

  // Metadata
  lastSavedAt: 1620000000000,
  gameVersion: "1.0.0"
}
```

### Auto-Save

- **Default interval:** 5 minutes (300,000 ms) — configurable in Settings
- **Options:** 1 min, 5 min, 10 min
- **Trigger:** Timer-based, fires periodically. Also fires on major events (upgrade, prestige, achievement unlock).
- **Behavior:** Overwrites previous save. No versioning, no backup slots.

### Reset Behavior

**Triggered by:** "Reset Game" button in PauseScene (requires confirmation).

**What resets:** Everything — resources, stats, achievements, spaceship, skill tree, prestige. The save key is removed from localStorage entirely and a fresh default state is written on next boot.

**What does NOT reset:** Nothing is preserved. This is a full wipe, equivalent to a new install.

**Flow:**
1. Player clicks "Reset Game" in PauseScene
2. Confirmation prompt appears: *"Reset all progress? This cannot be undone."*
3. Player clicks "Yes, Reset"
4. `SaveSystem.reset()` — removes `localStorage['voidwork_save']`
5. `AudioManager.stopMusicNow()` — instant silence before transition
6. All active scenes stopped
7. `scene.start('MainMenuScene')` — boot fresh as if launching for the first time

**UI design principle:** The reset button must be visually distinct (red text) and always require a two-step confirmation. There is no undo.

### Save/Load Behavior

**On game boot:**
1. Check localStorage for `voidwork_save`
2. If exists, load it → restore all state
3. If not, create default save (zeros out)

**On resource change:**
1. Update `gameState.resources`
2. Immediately call `SaveSystem.save(gameState)`

**On settings change:**
1. Update `gameState.settings`
2. Immediately call `SaveSystem.save(gameState)`

---

## Audio Design

### Music

**Main Menu:**
- Track: `mainMenu1` (fades into `mainMenu2` on completion, cycles)
- Volume: `musicVolume` from settings (default `0.1`), managed by `AudioManager`
- Fade in: 2s on start

**Gameplay:**
- Track: `gameMusic1`–`gameMusic5`, shuffled playlist
- Volume: `musicVolume` from settings (default `0.1`), managed by `AudioManager`
- Fade in: 2s, fade out: 3s before track ends, then next track plays
- Pause behavior: Fade to 0 (muted) when paused, restore on resume — TBD (not yet implemented)

### Sound Effects

| Event | SFX | Volume | Notes |
|-------|-----|--------|-------|
| Button click | `click` | 0.6 | All buttons in all scenes |
| Asteroid destroyed | `asteroidDestroyed` | 0.7 | Asteroid breaks into chunks |
| Resource collected | `collectResources` | 0.7 | Player clicks a chunk |
| Upgrade purchased | `upgrade` | 0.8 | New feature: wire up in UpgradeScene — `AudioManager.playSfx(scene, 'upgrade')` |
| Skill node unlocked | `skillTreeUnlock` | 0.8 | New feature: wire up in SkillTreeScene — `AudioManager.playSfx(scene, 'skillTreeUnlock')` |
| Achievement unlocked | `achievementUnlocked` | `sfxVolume` | Played by `AchievementSystem.unlockMultiple()` via `AudioManager.playSfx()` |

### Settings

- **Music volume slider:** Calls `AudioManager.setMusicVolume(v)` — applies live to current track and persists to SaveSystem
- **SFX volume slider:** Calls `AudioManager.setSfxVolume(v)` — applies to all future `playSfx()` calls
- **Music toggle:** Calls `AudioManager.toggleMusic()` — mutes/unmutes current track and persists
- **Pause audio:** When game pauses (ESC key), all audio fades to 0; resumes on unpause — TBD (not yet implemented)

---

## Difficulty & Progression

### Early Game (Spaceship Levels 1–3)
- Asteroids spawn every 2–3 seconds
- Health: 10–20 (Impure), 15–30 (Normal)
- Speed: Low–Medium
- Player is learning clicking mechanics and resource gathering

### Mid Game (Spaceship Levels 4–6)
- Asteroids spawn every 1.5–2 seconds
- Health: 15–30 (Impure), 25–40 (Normal)
- Speed: Medium–Fast
- Auto-mine unlocks, player begins passive income

### Late Game (Spaceship Levels 7+)
- Asteroids spawn every 1–1.5 seconds
- Health: 20–35 (Impure), 30–50 (Normal)
- Speed: Fast
- Auto-collect unlocks, clicking becomes optional

### Post-Prestige
- Asteroids spawn every 0.8–1 second
- Health: 25–40 (Impure), 35–60 (Normal)
- Speed: Very Fast
- Resource drops +50% (prestige multiplier applies)
- Intended to feel "faster, harder, rewarding"

> **TBD:** Exact spawn timing formula. Should it scale per spaceship level, or jump at prestige?

---

## User Experience (Feel)

### Feedback on Actions

✅ **Expected feedback:**
- Click asteroid → visual hit feedback (scale briefly, maybe a flash)
- Asteroid breaks → camera shake, SFX, particles (TBD: not yet implemented)
- Resource collect → number pops up, flies to counter, SFX
- Upgrade purchased → UI update (show new level), SFX, text confirmation
- Achievement unlocked → on-screen notification, SFX, added to list

### Pacing

- **Clicking pace:** Should feel responsive, not laggy. No delay between click and damage.
- **Spawn pace:** Not too fast (feels chaotic), not too slow (feels idle-y). Current: 2–3 second baseline.
- **Progression pace:** Player should feel "just about to afford the next upgrade" most of the time. If they're always sitting on enough resources, upgrades are too cheap.

### Visual Polish (Nice-to-Have)

- Asteroid cracking visual as health decreases (frame animation)
- Resource counter text pulses when resources collected
- Spaceship UI shows a little ship sprite (not just numbers) — positioned bottom centre of the GameScene canvas (`GAME_CENTER_X`, `GAME_HEIGHT - 60`), displayed at 80×80 px
- Skill tree nodes glow when unlockable

---

## Balance Tuning Notes

### If Players Are Clicking Too Much
- Increase auto-mine yield percentage
- Lower upgrade costs
- Increase asteroid spawn time (fewer asteroids = less pressing need to click)

### If Players Progress Too Fast
- Increase upgrade costs (multiply scaling factor)
- Decrease resource drops
- Add more upgrade tiers (4 → 6)

### If Prestige Feels Pointless
- Increase prestige multiplier (currently TBD +50%)
- Add prestige-exclusive skill tree nodes
- Make post-prestige asteroids drop 2× resources

---

## Open Design Questions (TBD)

- [ ] **Skill tree resource:** Earned how? (Separate from minerals/alloys? Milestone-based?)
- [ ] **Prestige resource reset:** Do resources reset on prestige, or persist?
- [ ] **Skill tree reset on prestige:** Do unlearned nodes reset, or stay learned?
- [ ] **Achievement persistence:** Do achievements reset on prestige?
- [ ] **Spaceship max level:** Is there a hard cap (e.g., level 100), or infinite growth?
- [ ] **Asteroid spawn formula:** Should difficulty scale per spaceship level, or only at prestige?
- [ ] **Exact spawn timings:** What's the baseline, and how does it scale?
- [ ] **Particle effects:** Should asteroids explode with particles? Chunks fly with motion trails?
- [ ] **Camera effects:** Should asteroid destruction cause screen shake?

---

**Next step:** Use these specs when implementing features. If you need to tweak a number, update this file first, then code.
