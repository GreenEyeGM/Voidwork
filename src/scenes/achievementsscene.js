import { GAME_WIDTH, GAME_HEIGHT, GAME_CENTER_X, GAME_CENTER_Y } from '../config/GameConfig.js';

export class AchievementsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AchievementsScene' });
        console.log('Achievements Scene loaded');
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
        const bg = this.add.rectangle(0, 0, 750, 500, 0x222222).setOrigin(0.5);
        menuContainer.add(bg);

        // Resume button or press ESC
        const RESUME_BUTTON = this.add.text(-315, -225, 'Resume', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
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

        // Achievements list
        const PLAY_ICON = this.add.sprite(-280, -150, 'AchievementIcons', 0).setOrigin(0.5).setScale(0.4); // 
        menuContainer.add(PLAY_ICON);
        const PLAY_TEXT = this.add.text(-280, -100, 'Play the game', { fontFamily: 'Upheaval', fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        menuContainer.add(PLAY_TEXT);

        // Need to add more achievements here ...
    }
}