import { GAME_WIDTH, GAME_HEIGHT, GAME_CENTER_X, GAME_CENTER_Y } from '../config/GameConfig.js';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
        console.log('Settings Scene loaded');
    }

    init(data) {
        this.callerScene = data.callerScene;
    }

    create() {
        // Play click sound on any button click
        this.input.on('gameobjectdown', (pointer, gameObject) => {
        this.sound.play('click', { volume: 0.5 });
        });

        // Semi-transparent background
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5).setOrigin(0);

        // Pause menu container
        const menuContainer = this.add.container(GAME_CENTER_X, GAME_CENTER_Y);

        // Menu background
        const bg = this.add.rectangle(0, 0, 500, 250, 0x222222).setOrigin(0.5);
        menuContainer.add(bg);

        // Resume button or press ESC
        const RESUME_BUTTON = this.add.text(0, -100, 'Resume', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuContainer.add(RESUME_BUTTON);
        console.log('Caller scene:', this.callerScene); // Debug log to check caller scene
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop(); // Stop the pause scene
            this.scene.resume(this.callerScene); // Resume the game scene
        });
        RESUME_BUTTON.on('pointerdown', () => {
            this.scene.stop(); // Stop the pause scene
            this.scene.resume(this.callerScene); // Resume the game scene
        });

        // Settings options
        const MUSIC_TEXT = this.add.text(-150, -50 , 'Music', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const SFX_TEXT = this.add.text(150, -50, 'SFX', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const GLOBAL_VOLUME_TEXT = this.add.text(0, 50, 'Global Volume', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });   
        menuContainer.add(MUSIC_TEXT);
        menuContainer.add(SFX_TEXT);
        menuContainer.add(GLOBAL_VOLUME_TEXT);

        // TODO: Add toggles/sliders for each setting option and implement functionality to adjust game settings accordingly
    }
} 