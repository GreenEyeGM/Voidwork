const SAVE_KEY = 'voidwork_save';

const DEFAULTS = {
    settings: {
        volume: 1.0,
        musicEnabled: true,
        autoSaveDelay: 300000   // 5 minutes in ms
    }
};

export const SaveSystem = {
    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return structuredClone(DEFAULTS);
            // Merge saved data on top of defaults so new keys are always present
            const saved = JSON.parse(raw);
            return {
                ...structuredClone(DEFAULTS),
                ...saved,
                settings: { ...DEFAULTS.settings, ...(saved.settings ?? {}) }
            };
        } catch {
            return structuredClone(DEFAULTS);
        }
    },

    save(data) {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch { /* localStorage unavailable (private browsing, etc.) */ }
    }
};
