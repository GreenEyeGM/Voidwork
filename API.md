# API.md — Data Contracts & localStorage Schema

Reference for all persistent data structures, save format, and how to read/write game state.

---

## localStorage Overview

### Storage Key

```javascript
localStorage['voidwork_save']
```

### Format

JSON string. Parsed on boot, stringified on save.

```javascript
// Load
const saveData = JSON.parse(localStorage['voidwork_save']);

// Save
localStorage['voidwork_save'] = JSON.stringify(saveData);
```

### Usage in Code

```javascript
// Recommended: Use SaveSystem wrapper (not raw localStorage)
import { SaveSystem } from '../systems/SaveSystem.js';

const state = SaveSystem.load();      // Returns parsed object or default
SaveSystem.save(gameState);           // Stringifies and stores
```

---

## Complete Save Schema

Full type reference for the game state object:

```typescript
type VoidworkSave = {
  // ===== RESOURCES =====
  resources: {
    minerals: number;          // Primary resource (always >= 0)
    alloys: number;            // Secondary resource (always >= 0)
  };

  // ===== SPACESHIP & UPGRADES =====
  spaceship: {
    level: number;             // Current spaceship level (1–X, resets on prestige)
    upgrades: {
      miningPower: number;           // Level 0–5 (0 = not unlocked)
      resourceMultiplier: number;    // Level 0–5
      autoMine: number;              // Level 0–3 (tier 2+)
      autoCollect: number;           // Level 0–3 (tier 3+)
      rareMultiplier: number;        // Level 0–3 (tier 3+)
      efficiencyBoost: number;       // Level 0–3 (tier 4+)
      prestigeMultiplier: number;    // Level 0–3 (tier 4+)
    };
  };

  // ===== GAME STATISTICS =====
  stats: {
    asteroidsDestroyed: number;     // Never reset
    resourcesCollected: number;     // Total resources ever collected (never reset)
    totalResourcesEarned: number;   // Cumulative across all prestiges
    timePlayedMs: number;           // Total playtime in ms
  };

  // ===== ACHIEVEMENTS =====
  achievements: {
    [key: string]: {
      unlocked: boolean;            // true = achievement earned
      unlockedAt: number | null;    // Unix timestamp or null if not earned
    };
  };

  // ===== SKILL TREE =====
  skillTree: {
    nodesUnlocked: number[];        // Array of node IDs (e.g., [1, 3, 5])
    spentPoints: number;            // Skill points spent
    totalPoints: number;            // Total skill points earned
    // TBD: How to earn points?
  };

  // ===== SETTINGS =====
  settings: {
    volume: number;                 // 0.0–1.0 (controls this.sound.volume)
    musicEnabled: boolean;          // true = music on, false = music off
    sfxEnabled: boolean;            // true = SFX on, false = SFX off
    autoSaveDelay: number;          // ms between auto-saves (e.g., 300000 = 5 min)
  };

  // ===== PRESTIGE STATE =====
  prestige: {
    level: number;                  // How many times prestiged (0 = no prestige yet)
    timesPrestiged: number;         // Same as level (redundant, but clear)
    lastPrestigeAt: number | null;  // Unix timestamp of last prestige
  };

  // ===== METADATA =====
  lastSavedAt: number;              // Unix timestamp of last save
  gameVersion: string;              // e.g., "1.0.0" (for future migrations)
};
```

---

## Default State (New Game)

When a player loads for the first time (no save exists), initialize this:

```javascript
const DEFAULT_STATE = {
  resources: {
    minerals: 0,
    alloys: 0
  },

  spaceship: {
    level: 1,
    upgrades: {
      miningPower: 0,
      resourceMultiplier: 0,
      autoMine: 0,
      autoCollect: 0,
      rareMultiplier: 0,
      efficiencyBoost: 0,
      prestigeMultiplier: 0
    }
  },

  stats: {
    asteroidsDestroyed: 0,
    resourcesCollected: 0,
    totalResourcesEarned: 0,
    timePlayedMs: 0
  },

  achievements: {
    // Initialize all achievements as locked
    firstStrike: { unlocked: false, unlockedAt: null },
    asteroidHunter: { unlocked: false, unlockedAt: null },
    spaceCleanor: { unlocked: false, unlockedAt: null },
    // ... (see DESIGN.md for full list)
  },

  skillTree: {
    nodesUnlocked: [],
    spentPoints: 0,
    totalPoints: 0
  },

  settings: {
    volume: 0.8,
    musicEnabled: true,
    sfxEnabled: true,
    autoSaveDelay: 300000  // 5 minutes
  },

  prestige: {
    level: 0,
    timesPrestiged: 0,
    lastPrestigeAt: null
  },

  lastSavedAt: Date.now(),
  gameVersion: '1.0.0'
};
```

---

## Upgrade System Data Contract

### Upgrade Configuration

How upgrades are defined. Used by `UpgradeSystem.js` and `UpgradeScene.js`.

```javascript
const UPGRADE_COSTS = {
  miningPower: {
    baseCost: { minerals: 50, alloys: 0 },
    tier: 1
  },
  resourceMultiplier: {
    baseCost: { minerals: 40, alloys: 5 },
    tier: 1
  },
  autoMine: {
    baseCost: { minerals: 100, alloys: 20 },
    tier: 2
  },
  autoCollect: {
    baseCost: { minerals: 150, alloys: 50 },
    tier: 3
  },
  rareMultiplier: {
    baseCost: { minerals: 200, alloys: 100 },
    tier: 3
  },
  efficiencyBoost: {
    baseCost: { minerals: 250, alloys: 150 },
    tier: 4
  },
  prestigeMultiplier: {
    baseCost: { minerals: 500, alloys: 300 },
    tier: 4
  }
};

// Cost formula: base * (1.5 ^ (level - 1)), rounded down
function getCost(upgradeType, level) {
  const base = UPGRADE_COSTS[upgradeType].baseCost;
  const multiplier = Math.pow(1.5, level - 1);
  return {
    minerals: Math.floor(base.minerals * multiplier),
    alloys: Math.floor(base.alloys * multiplier)
  };
}

// Example: Mining Power level 3
// getCost('miningPower', 3)
// = base (50) * (1.5 ^ 2) = 50 * 2.25 = 112
// = { minerals: 112, alloys: 0 }
```

### Upgrade Effects

How upgrades modify gameplay. Reference when implementing effects:

```javascript
const UPGRADE_EFFECTS = {
  miningPower: {
    // Reduce clicks to destroy
    1: { clicksToDestroy: 3 },
    2: { clicksToDestroy: 2 },
    3: { clicksToDestroy: 1 },
    4: { clicksToDestroy: 1 },
    5: { clicksToDestroy: 1 }
  },

  resourceMultiplier: {
    // Bonus % on each resource collect
    1: { bonusPercent: 0 },   // No effect at level 0
    2: { bonusPercent: 5 },
    3: { bonusPercent: 10 },
    4: { bonusPercent: 15 },
    5: { bonusPercent: 20 }
  },

  autoMine: {
    // Passive DPS on nearest asteroid (% of current mining power per second)
    1: { dpsPercent: 1 },
    2: { dpsPercent: 2 },
    3: { dpsPercent: 4 },
    4: { dpsPercent: 4 },
    5: { dpsPercent: 4 }
  },

  autoCollect: {
    // Auto-collect chunks after 3 seconds
    1: { autoCollectChance: 50 },   // 50%
    2: { autoCollectChance: 75 },   // 75%
    3: { autoCollectChance: 100 },  // 100%
    4: { autoCollectChance: 100 },
    5: { autoCollectChance: 100 }
  },

  rareMultiplier: {
    // Bonus % on alloy drops
    1: { bonusPercent: 10 },
    2: { bonusPercent: 20 },
    3: { bonusPercent: 30 },
    4: { bonusPercent: 30 },
    5: { bonusPercent: 30 }
  },

  efficiencyBoost: {
    // Reduce upgrade costs by %
    1: { costReduction: 5 },
    2: { costReduction: 10 },
    3: { costReduction: 20 },
    4: { costReduction: 20 },
    5: { costReduction: 20 }
  },

  prestigeMultiplier: {
    // Bonus % to all resources on prestige
    1: { bonusPercent: 25 },
    2: { bonusPercent: 50 },
    3: { bonusPercent: 100 },
    4: { bonusPercent: 100 },
    5: { bonusPercent: 100 }
  }
};
```

---

## Achievement System Data Contract

### Achievement Configuration

How achievements are defined. Used by `AchievementSystem.js` and `AchievementsScene.js`.

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

  asteroidHunter: {
    id: 'asteroidHunter',
    name: 'Asteroid Hunter',
    description: 'Destroy 10 asteroids',
    iconFrame: 1,
    milestone: 'asteroidsDestroyed',
    target: 10
  },

  spaceCleaner: {
    id: 'spaceCleaner',
    name: 'Space Cleaner',
    description: 'Destroy 50 asteroids',
    iconFrame: 2,
    milestone: 'asteroidsDestroyed',
    target: 50
  },

  voidDominator: {
    id: 'voidDominator',
    name: 'Void Dominator',
    description: 'Destroy 200 asteroids',
    iconFrame: 3,
    milestone: 'asteroidsDestroyed',
    target: 200
  },

  infiniteClicker: {
    id: 'infiniteClicker',
    name: 'Infinite Clicker',
    description: 'Destroy 500 asteroids',
    iconFrame: 4,
    milestone: 'asteroidsDestroyed',
    target: 500
  },

  legendOfTheVoid: {
    id: 'legendOfTheVoid',
    name: 'Legend of the Void',
    description: 'Destroy 1000 asteroids',
    iconFrame: 5,
    milestone: 'asteroidsDestroyed',
    target: 1000
  },

  prospector: {
    id: 'prospector',
    name: 'Prospector',
    description: 'Collect 10 resources',
    iconFrame: 6,
    milestone: 'resourcesCollected',
    target: 10
  },

  hoarder: {
    id: 'hoarder',
    name: 'Hoarder',
    description: 'Collect 100 resources',
    iconFrame: 7,
    milestone: 'resourcesCollected',
    target: 100
  },

  wealthKeeper: {
    id: 'wealthKeeper',
    name: 'Wealth Keeper',
    description: 'Collect 500 resources',
    iconFrame: 8,
    milestone: 'resourcesCollected',
    target: 500
  },

  resourceMaster: {
    id: 'resourceMaster',
    name: 'Resource Master',
    description: 'Collect 1000 resources',
    iconFrame: 9,
    milestone: 'resourcesCollected',
    target: 1000
  },

  captain: {
    id: 'captain',
    name: 'Captain',
    description: 'Reach spaceship level 5',
    iconFrame: 10,
    milestone: 'spaceshipLevel',
    target: 5
  },

  newBeginning: {
    id: 'newBeginning',
    name: 'New Beginning',
    description: 'Prestige once',
    iconFrame: 11,
    milestone: 'prestigeLevel',
    target: 1
  }
};
```

### Achievement Unlock Trigger

How to detect if a milestone is met:

```javascript
export class AchievementSystem {
  static checkMilestones(gameState) {
    const unlocked = [];

    for (const [key, config] of Object.entries(ACHIEVEMENTS)) {
      // Skip already unlocked
      if (gameState.achievements[key].unlocked) continue;

      // Check if milestone target reached
      const currentValue = gameState.stats[config.milestone];
      if (currentValue >= config.target) {
        unlocked.push(key);
      }
    }

    return unlocked;
  }

  static unlockMultiple(achievementKeys, gameState) {
    achievementKeys.forEach(key => {
      gameState.achievements[key].unlocked = true;
      gameState.achievements[key].unlockedAt = Date.now();
      
      // Play SFX + show notification
      this.playUnlockSound();
      this.showNotification(ACHIEVEMENTS[key].name);
    });
  }
}
```

**Call site:** GameScene should call `AchievementSystem.checkMilestones()` after every stat update:

```javascript
// In GameScene, whenever resources collected:
this.gameState.stats.resourcesCollected += amount;

const newAchievements = AchievementSystem.checkMilestones(this.gameState);
if (newAchievements.length > 0) {
  AchievementSystem.unlockMultiple(newAchievements, this.gameState);
  SaveSystem.save(this.gameState);
}
```

---

## Skill Tree Data Contract

### Skill Node Configuration

How skill nodes are defined. Used by `SkillTreeScene.js` and `SkillTree.js`.

```javascript
const SKILL_NODES = {
  yieldBoostI: {
    id: 'yieldBoostI',
    name: 'Yield Boost I',
    description: '+5% minerals and alloys',
    cost: 1,               // Skill points to unlock
    effect: { mineralBonus: 0.05, alloyBonus: 0.05 },
    tier: 'early',
    position: { x: 100, y: 100 }  // For UI layout
  },

  yieldBoostII: {
    id: 'yieldBoostII',
    name: 'Yield Boost II',
    description: '+10% minerals and alloys',
    cost: 2,
    effect: { mineralBonus: 0.10, alloyBonus: 0.10 },
    tier: 'mid',
    position: { x: 250, y: 100 }
  },

  efficiencyI: {
    id: 'efficiencyI',
    name: 'Efficiency I',
    description: '-5% upgrade costs',
    cost: 1,
    effect: { costReduction: 0.05 },
    tier: 'mid',
    position: { x: 100, y: 250 }
  },

  rarityFocus: {
    id: 'rarityFocus',
    name: 'Rarity Focus',
    description: '+15% alloy drops',
    cost: 3,
    effect: { alloyBonus: 0.15 },
    tier: 'late',
    position: { x: 400, y: 100 }
  },

  prestigePrep: {
    id: 'prestigePrep',
    name: 'Prestige Prep',
    description: '+25% post-prestige multiplier',
    cost: 5,
    effect: { prestigeMultiplier: 0.25 },
    tier: 'late',
    position: { x: 250, y: 400 }
  },

  autoClick: {
    id: 'autoClick',
    name: 'Auto-Click',
    description: 'Passive 0.5 clicks/second',
    cost: 2,
    effect: { autoClicksPerSec: 0.5 },
    tier: 'mid',
    position: { x: 100, y: 150 }
  }

  // ... more nodes
};
```

### Skill Point Economy

TBD: How points are earned. Placeholder:

```javascript
// Possible: earn 1 point per prestige
// Possible: earn 1 point per 10 achievements
// Possible: fixed pool (10 total points, spend wisely)

// For now, assume total points = prestige level + 1
function getTotalSkillPoints(gameState) {
  return gameState.prestige.level + 1;  // TBD: exact formula
}
```

---

## Asteroid Data Contract

### Asteroid Type Configuration

How asteroid types define their properties. Reference in `Asteroid.js`:

```javascript
const ASTEROID_TYPES = {
  impure: {
    name: 'Impure',
    health: { min: 10, max: 20 },
    drop: { minerals: { min: 10, max: 20 }, alloys: { min: 0, max: 0 } },
    speed: { min: 80, max: 120 },
    spawnWeight: 60,  // 60% of all spawns
    frames: [
      [0, 7, 14],   // Variant 0: [healthy, cracked, broken]
      [1, 8, 15],   // Variant 1
      [2, 9, 16]    // Variant 2
    ]
  },

  normal: {
    name: 'Normal',
    health: { min: 15, max: 30 },
    drop: { minerals: { min: 15, max: 30 }, alloys: { min: 5, max: 15 } },
    speed: { min: 100, max: 150 },
    spawnWeight: 40,  // 40% of all spawns
    frames: [
      [3, 10, 17],  // Variant 0: [healthy, cracked, broken]
      [4, 11, 18],  // Variant 1
      [5, 12, 19]   // Variant 2
    ]
  }
};
```

### Random Asteroid Selection

How to pick a random asteroid type (weighted):

```javascript
function getRandomAsteroidType() {
  const roll = Phaser.Math.Between(1, 100);

  if (roll <= 60) {
    return 'impure';     // 1–60: 60% chance
  } else {
    return 'normal';     // 61–100: 40% chance
  }
}
```

---

## Save/Load Operations

### Loading Game State

Called on GameScene boot:

```javascript
// src/scenes/GameScene.js
create() {
  const saveData = SaveSystem.load();
  this.gameState = saveData;
  
  // Apply loaded state to gameplay
  this.updateDisplay();
}
```

### Saving Game State

Called after every meaningful change:

```javascript
// After resource collection
this.gameState.resources.minerals += amount;
SaveSystem.save(this.gameState);

// After upgrade
this.gameState.spaceship.upgrades.miningPower += 1;
SaveSystem.save(this.gameState);

// After prestige
this.gameState.prestige.level += 1;
SaveSystem.save(this.gameState);
```

### Auto-Save Timer

GameScene sets up an auto-save interval:

```javascript
// In GameScene.create()
const autoSaveDelay = this.gameState.settings.autoSaveDelay; // ms
this.time.addTimer({
  delay: autoSaveDelay,
  callback: () => SaveSystem.save(this.gameState),
  loop: true
});
```

---

## SaveSystem Implementation Reference

Template for `src/systems/SaveSystem.js`:

```javascript
export class SaveSystem {
  static STORAGE_KEY = 'voidwork_save';

  static load() {
    const json = localStorage.getItem(this.STORAGE_KEY);
    if (!json) return this.getDefaultState();
    try {
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to parse save data:', e);
      return this.getDefaultState();
    }
  }

  static save(gameState) {
    gameState.lastSavedAt = Date.now();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(gameState));
  }

  static clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getDefaultState() {
    return {
      resources: { minerals: 0, alloys: 0 },
      spaceship: { level: 1, upgrades: { /* ... */ } },
      stats: { asteroidsDestroyed: 0, resourcesCollected: 0, /* ... */ },
      achievements: { /* ... */ },
      skillTree: { nodesUnlocked: [], spentPoints: 0, totalPoints: 0 },
      settings: { volume: 0.8, musicEnabled: true, /* ... */ },
      prestige: { level: 0, timesPrestiged: 0, lastPrestigeAt: null },
      lastSavedAt: Date.now(),
      gameVersion: '1.0.0'
    };
  }
}
```

---

## Migration & Versioning

If save schema changes in the future, use `gameVersion` to detect old saves and migrate:

```javascript
static load() {
  const json = localStorage.getItem(this.STORAGE_KEY);
  if (!json) return this.getDefaultState();
  
  const data = JSON.parse(json);
  
  // Migrate old saves
  if (data.gameVersion === '1.0.0' && CURRENT_VERSION === '1.1.0') {
    data.newField = defaultValue;
    data.gameVersion = '1.1.0';
  }
  
  return data;
}
```

---

**Next:** Use this schema when implementing SaveSystem, UpgradeSystem, AchievementSystem, and SkillTree.
