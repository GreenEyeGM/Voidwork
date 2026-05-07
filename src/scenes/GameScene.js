import { createBackground } from "../utils/Background.js";

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        console.log('GameScene loaded');
    }

    preload() {
        this.load.spritesheet('Asteroids', '../assets/images/asteroids.png', { frameWidth: 128, frameHeight: 128 });
    }
    
    create() {
        createBackground(this, 200, 100, 50);
        this.scene.launch('HudScene'); // Launch the HUD scene on top of the game scene

        // ── RESOURCE COUNTERS ─────────────────────────────────
        // Starting values
        this.destroyedCount = 0;
        this.mineralCount   = 0;
        this.alloyCount     = 0;

        // Text style shared across all three counters
        const textStyle = {
            fontSize:   '18px',
            fill:       '#ffffff',
            fontFamily: 'Arial',
            stroke:     '#000000',  // black outline so it reads on any background
            strokeThickness: 4
        };

        // Create the three text objects, stacked on top left
        this.txtDestroyed = this.add.text(16, 16, 'Asteroids Destroyed: 0', textStyle);
        this.txtMinerals  = this.add.text(16, 42, 'Minerals: 0',            textStyle);
        this.txtAlloys    = this.add.text(16, 68, 'Alloys: 0',              textStyle);

        // For testing purposes
        this.add.sprite(400,300, 'Asteroids', 4).setScale(0.5);

        // ESC key to Pause the game
        this.input.keyboard.on('keydown-ESC', () => {
            console.log('ESC pressed, pausing game');
            this.scene.pause('GameScene');
            this.scene.pause('HudScene'); // Stop the HUD scene
            this.scene.launch('PauseScene'); // Launch the pause menu scene
        });
        
    }
        
}
