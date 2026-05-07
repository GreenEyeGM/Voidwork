import { GAME_WIDTH, GAME_HEIGHT } from "../config/GameConfig.js";

export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
        console.log('Pause Scene loaded');
    }

    create() {
        // Semi-transparent background
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5).setOrigin(0);

        // Pause menu container
        const menuContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

        // Menu background
        const bg = this.add.rectangle(0, 0, 300, 300, 0x222222).setOrigin(0.5);
        menuContainer.add(bg);

        // Resume button or press ESC
        const resumeButton = this.add.text(0, -90, 'Resume', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuContainer.add(resumeButton);
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop(); // Stop the pause scene
            this.scene.resume('GameScene'); // Resume the game scene
            this.scene.resume('HudScene'); // Relaunch the HUD scene
        });
        resumeButton.on('pointerdown', () => {
            this.scene.stop(); // Stop the pause scene
            this.scene.resume('GameScene'); // Resume the game scene
            this.scene.resume('HudScene'); // Relaunch the HUD scene
        });

        // Settings button
        const settingsButton = this.add.text(0, -30, 'Settings', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuContainer.add(settingsButton);
        
        settingsButton.on('pointerdown', () => {
            this.scene.launch('SettingsScene'); // Launch the settings scene on top of the pause menu
        });

        // Achievements button
        const achievementsButton = this.add.text(0, 30, 'Achievements', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuContainer.add(achievementsButton);
        
        achievementsButton.on('pointerdown', () => {
            this.scene.launch('AchievementsScene'); // Launch the achievements scene on top of the pause menu
        });

        // Main Menu button
        const mainMenuButton = this.add.text(0, 90, 'Main Menu', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuContainer.add(mainMenuButton);

        mainMenuButton.on('pointerdown', () => {
            this.scene.stop('GameScene'); // Stop the game scene
            this.scene.stop(); // Stop the pause scene
            this.scene.start('MainMenuScene'); // Start the main menu scene
        });

    }  
}