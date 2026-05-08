import { createBackground } from "../utils/Background.js";
import { Asteroid, getRandomAsteroidType } from '../objects/Asteroid.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        console.log('GameScene loaded');
    }
    
    create() {
        // Play click sound on any button click
        this.input.on('gameobjectdown', (pointer, gameObject) => {
        this.sound.play('click', { volume: 0.5 });
        });

        //Game music
        this.sound.play('gameMusic2', {volume: 0.1, loop: true});

        createBackground(this, 200, 100, 50);
        this.scene.launch('HudScene').bringToTop('HudScene'); // Launch the HUD scene on top of the game scene

        // ── RESOURCE COUNTERS ─────────────────────────────────
        // Starting values
        this.destroyedCount = 0;
        this.mineralCount = 0;
        this.alloyCount = 0;

        // Text style shared across all three counters
        const textStyle = {
            fontSize:   '18px',
            fill:       '#ffffff',
            fontFamily: 'Upheaval',
            stroke:     '#000000',  // black outline so it reads on any background
            strokeThickness: 4
        };

        // Create the three text objects, stacked on top left
        this.txtDestroyed = this.add.text(16, 16, 'Asteroids Destroyed: 0', textStyle);
        this.txtMinerals = this.add.text(16, 42, 'Minerals: 0', textStyle);
        this.txtAlloys = this.add.text(16, 68, 'Alloys: 0', textStyle);

        // ESC key to Pause the game
        this.input.keyboard.on('keydown-ESC', () => {
            console.log('ESC pressed, pausing game');
            this.scene.pause('GameScene');
            this.scene.pause('HudScene'); // Stop the HUD scene
            this.scene.launch('PauseScene'); // Launch the pause menu scene
        });
 
        // ── EVENTS ───────────────────────────────────────────
        // Asteroid.js emits 'asteroidDestroyed' when it dies
        this.events.on('asteroidDestroyed', () => {
            this.sound.play('asteroidDestroyed', { volume: 0.5 });
            this.destroyedCount++;
            this.txtDestroyed.setText(`Asteroids Destroyed: ${this.destroyedCount}`);
        });
 
        // Asteroid.js emits 'collectResources' when a chunk is clicked
        this.events.on('collectResources', (data) => {
            this.mineralCount += data.minerals;
            this.alloyCount += data.alloys;
            this.txtMinerals.setText(`Minerals: ${this.mineralCount}`);
            this.txtAlloys.setText(`Alloys: ${this.alloyCount}`);
        });
 
        // ── ASTEROIDS ─────────────────────────────────────────
        this.asteroidCount = 0;
        this.maxAsteroids  = 6;
 
        for (let i = 0; i < this.maxAsteroids; i++) {
            this.spawnAsteroid();
        }
 
        this.events.on('asteroidDestroyed', () => {
            this.asteroidCount--;
            this.time.delayedCall(3000, () => {
                this.spawnAsteroid();
            });
        });
 
        // Spawn initial 6 asteroids
        for (let i = 0; i < this.maxAsteroids; i++) {
            this.spawnAsteroid();
        }
 
        // When one dies, spawn a replacement after a delay
        this.events.on('asteroidDestroyed', () => {
            this.asteroidCount--;
            this.time.delayedCall(3000, () => {
                this.spawnAsteroid();
            });
        });

        // Debug log to check resource counts when collected
        this.events.on('collectResources', (data) => {
            this.sound.play('collectResources', { volume: 0.5 });
            console.log(`Total Minerals: ${this.mineralCount} | Total Alloys: ${this.alloyCount}`);
        });
 
        // ESC key to Pause the game
        this.input.keyboard.on('keydown-ESC', () => {
            console.log('ESC pressed, pausing game');
            this.scene.pause('GameScene');
            this.scene.pause('HudScene'); // Stop the HUD scene
            this.scene.launch('PauseScene'); // Launch the pause menu scene
        });
 
    }
 
    spawnAsteroid() {
    if (this.asteroidCount >= this.maxAsteroids) return;
    // Spawn from a random edge of the screen
    const W = this.scale.width;
    const H = this.scale.height;
    const x = Phaser.Math.Between(0, W);
    const y = Phaser.Math.Between(0, H);
    const type = getRandomAsteroidType();

    new Asteroid(this, x, y, type);
    this.asteroidCount++;
    }
}
