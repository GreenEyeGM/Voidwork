import { createBackground } from "../utils/Background.js";
import { Asteroid, getRandomAsteroidType } from '../objects/Asteroid.js';
import { AudioManager } from '../systems/AudioManager.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import { GAME_HEIGHT, GAME_CENTER_X } from '../config/GameConfig.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Load saved game state (or defaults for a new game)
        this.gameState = SaveSystem.load();

        // Play click SFX on any interactive object press
        this.input.on('gameobjectdown', () => AudioManager.playSfx(this, 'click'));

        AudioManager.startGameMusic(this);

        createBackground(this, 200, 100, 50);
        this.scene.launch('HudScene').bringToTop('HudScene');

        // ── SPACESHIP SPRITE ──────────────────────────────────
        // Show the player's spaceship at the bottom centre of the screen.
        // Purely cosmetic — the real spaceship data (level, upgrades) lives in gameState.spaceship.
        // setDepth(1) keeps it drawn on top of drifting asteroids.
        this.spaceshipSprite = this.add.image(GAME_CENTER_X, GAME_HEIGHT - 60, 'spaceship')
            .setDisplaySize(80, 80)  // scale the 296×296 source image down to 80×80
            .setDepth(1);

        // ── RESOURCE COUNTERS ─────────────────────────────────
        const textStyle = {
            fontSize:        '18px',
            fill:            '#ffffff',
            fontFamily:      'Upheaval',
            stroke:          '#000000',
            strokeThickness: 4
        };

        this.txtDestroyed = this.add.text(16, 16, `Asteroids Destroyed: ${this.gameState.stats.asteroidsDestroyed}`, textStyle);
        this.txtMinerals  = this.add.text(16, 42, `Minerals: ${this.gameState.resources.minerals}`, textStyle);
        this.txtAlloys    = this.add.text(16, 68, `Alloys: ${this.gameState.resources.alloys}`, textStyle);

        // ── ESC → PAUSE ───────────────────────────────────────
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause('GameScene');
            this.scene.pause('HudScene');
            this.scene.launch('PauseScene');
        });

        // ── EVENTS ───────────────────────────────────────────
        // Remove any leftover listeners from a previous session before adding new ones.
        // Phaser does NOT automatically clear these when a scene is stopped and relaunched,
        // so without this, each reset would stack another listener and double-count events.
        this.events.off('asteroidDestroyed');
        this.events.off('collectResources');

        this.events.on('asteroidDestroyed', () => {
            AudioManager.playSfx(this, 'asteroidDestroyed');

            this.gameState.stats.asteroidsDestroyed++;
            this.txtDestroyed.setText(`Asteroids Destroyed: ${this.gameState.stats.asteroidsDestroyed}`);

            this.checkAndUnlockAchievements();
            SaveSystem.save(this.gameState);

            // Respawn after a short delay
            this.asteroidCount--;
            this.time.delayedCall(3000, () => this.spawnAsteroid());
        });

        this.events.on('collectResources', (data) => {
            AudioManager.playSfx(this, 'collectResources');

            this.gameState.resources.minerals += data.minerals;
            this.gameState.resources.alloys   += data.alloys;
            this.gameState.stats.resourcesCollected += data.minerals + data.alloys;

            this.txtMinerals.setText(`Minerals: ${this.gameState.resources.minerals}`);
            this.txtAlloys.setText(`Alloys: ${this.gameState.resources.alloys}`);

            this.checkAndUnlockAchievements();
            SaveSystem.save(this.gameState);
        });

        // ── ASTEROIDS ─────────────────────────────────────────
        this.asteroidCount = 0;
        this.maxAsteroids  = 5;

        for (let i = 0; i < this.maxAsteroids; i++) {
            this.spawnAsteroid();
        }
    }

    // Checks for newly earned achievements and unlocks them.
    checkAndUnlockAchievements() {
        const newlyUnlocked = AchievementSystem.checkMilestones(this.gameState);
        if (newlyUnlocked.length > 0) {
            AchievementSystem.unlockMultiple(newlyUnlocked, this.gameState, this);
            SaveSystem.save(this.gameState);
        }
    }

    spawnAsteroid() {
        if (this.asteroidCount >= this.maxAsteroids) return;
        const W = this.scale.width;
        const H = this.scale.height;
        const x = Phaser.Math.Between(0, W);
        const y = Phaser.Math.Between(0, H);
        new Asteroid(this, x, y, getRandomAsteroidType());
        this.asteroidCount++;
    }
}
