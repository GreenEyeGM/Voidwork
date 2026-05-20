import { DEFAULT_ACHIEVEMENTS } from '../config/AchievementConfig.js';

const SAVE_KEY = 'voidwork_save';

const DEFAULTS = {
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
    achievements: DEFAULT_ACHIEVEMENTS,
    skillTree: {
        nodesUnlocked: [],
        spentPoints: 0,
        totalPoints: 0
    },
    settings: {
        musicVolume: 0.1,
        sfxVolume: 0.5,
        musicEnabled: true,
        autoSaveDelay: 300000
    },
    prestige: {
        level: 0,
        timesPrestiged: 0,
        lastPrestigeAt: null
    },
    lastSavedAt: null,
    gameVersion: '1.0.0'
};

export const SaveSystem = {
    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return structuredClone(DEFAULTS);
            const saved = JSON.parse(raw);
            // Deep merge: saved data wins, but missing keys fall back to defaults
            return {
                ...structuredClone(DEFAULTS),
                ...saved,
                resources:  { ...DEFAULTS.resources,  ...(saved.resources  ?? {}) },
                spaceship:  { ...DEFAULTS.spaceship,  ...(saved.spaceship  ?? {}),
                    upgrades: { ...DEFAULTS.spaceship.upgrades, ...(saved.spaceship?.upgrades ?? {}) }
                },
                stats:      { ...DEFAULTS.stats,      ...(saved.stats      ?? {}) },
                achievements: { ...structuredClone(DEFAULTS.achievements), ...(saved.achievements ?? {}) },
                skillTree:  { ...DEFAULTS.skillTree,  ...(saved.skillTree  ?? {}) },
                settings:   { ...DEFAULTS.settings,   ...(saved.settings   ?? {}) },
                prestige:   { ...DEFAULTS.prestige,   ...(saved.prestige   ?? {}) }
            };
        } catch {
            return structuredClone(DEFAULTS);
        }
    },

    save(data) {
        try {
            data.lastSavedAt = Date.now();
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch { /* localStorage unavailable (private browsing, etc.) */ }
    },

    // Wipes all save data — called when the player confirms "Reset Game".
    // After this, the next SaveSystem.load() will return fresh DEFAULTS.
    reset() {
        try {
            localStorage.removeItem(SAVE_KEY);
        } catch { /* localStorage unavailable */ }
    }
};
