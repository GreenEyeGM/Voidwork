import { ACHIEVEMENTS } from '../config/AchievementConfig.js';
import { AudioManager } from './AudioManager.js';

// Returns the current value for a given milestone type from gameState.
function getMilestoneValue(gameState, milestone) {
    if (milestone === 'asteroidsDestroyed') return gameState.stats.asteroidsDestroyed;
    if (milestone === 'resourcesCollected') return gameState.stats.resourcesCollected;
    if (milestone === 'spaceshipLevel')     return gameState.spaceship.level;
    if (milestone === 'prestigeLevel')      return gameState.prestige.level;
    return 0;
}

export const AchievementSystem = {
    // Call this after every stat update. Returns an array of newly-unlocked achievement keys.
    checkMilestones(gameState) {
        const newlyUnlocked = [];

        for (const [key, config] of Object.entries(ACHIEVEMENTS)) {
            // Skip if already unlocked or missing from save
            if (!gameState.achievements[key] || gameState.achievements[key].unlocked) continue;

            const current = getMilestoneValue(gameState, config.milestone);
            if (current >= config.target) {
                newlyUnlocked.push(key);
            }
        }

        return newlyUnlocked;
    },

    // Marks achievements as unlocked, plays SFX, and shows an on-screen notification.
    // Call this with the result of checkMilestones() whenever the array is non-empty.
    unlockMultiple(keys, gameState, scene) {
        keys.forEach((key, index) => {
            gameState.achievements[key].unlocked = true;
            gameState.achievements[key].unlockedAt = Date.now();

            // Stagger notifications slightly so they don't all overlap
            scene.time.delayedCall(index * 600, () => {
                AudioManager.playSfx(scene, 'achievementUnlocked');
                this.showNotification(scene, ACHIEVEMENTS[key].name);
            });
        });
    },

    // Shows a brief toast notification at the bottom of the screen.
    showNotification(scene, achievementName) {
        const text = scene.add.text(
            scene.scale.width / 2,
            scene.scale.height - 80,
            `🏆 Achievement Unlocked: ${achievementName}`,
            {
                fontFamily: 'Upheaval',
                fontSize: '20px',
                fill: '#ffdd44',
                stroke: '#000000',
                strokeThickness: 4,
                backgroundColor: '#00000088',
                padding: { x: 14, y: 8 }
            }
        ).setOrigin(0.5).setAlpha(0).setDepth(100);

        // Fade in → hold → fade out → destroy
        scene.tweens.add({
            targets: text,
            alpha: 1,
            duration: 300,
            ease: 'Linear',
            onComplete: () => {
                scene.time.delayedCall(2000, () => {
                    scene.tweens.add({
                        targets: text,
                        alpha: 0,
                        duration: 500,
                        ease: 'Linear',
                        onComplete: () => text.destroy()
                    });
                });
            }
        });
    }
};
