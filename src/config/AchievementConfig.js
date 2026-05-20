// All achievement definitions. Add new achievements here — nowhere else.
// iconFrame maps to the AchievementIcons spritesheet (328×328 frames).
// milestone is the stat key used to check progress (see AchievementSystem.js).

export const ACHIEVEMENTS = {
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

// Default achievements state for SaveSystem — all locked at the start.
export const DEFAULT_ACHIEVEMENTS = Object.fromEntries(
    Object.keys(ACHIEVEMENTS).map(key => [key, { unlocked: false, unlockedAt: null }])
);
