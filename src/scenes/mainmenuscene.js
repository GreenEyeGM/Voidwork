import { createBackground } from "../utils/Background.js";
import { GAME_CENTER_X, GAME_CENTER_Y } from "../config/GameConfig.js";
import { AudioManager } from "../systems/AudioManager.js";

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }
    
    
    create() {
        createBackground(this, 100, 75, 50);

        // Play click sound on any button click
        this.input.on('gameobjectdown', () => AudioManager.playSfx(this, 'click'));

        AudioManager.startMenuMusic(this);

        // Add title text
        const titleText = this.add.text(GAME_CENTER_X, 200, 'Voidwork', { fontFamily: 'Upheaval', fontSize: '64px'}).setOrigin(0.5, 0.5);

        //#region Add play button and text
        const playButton = this.add.sprite(GAME_CENTER_X + 32, 400, 'mainMenuButtons', 0).setOrigin(0.5)
            .setInteractive({ hitArea: new Phaser.Geom.Circle(64, 64, 30), hitAreaCallback: Phaser.Geom.Circle.Contains, useHandCursor: true });

        // Add Text next to play button
        const playText = this.add.text(GAME_CENTER_X - 79, 400, 'Play', { fontFamily: 'Upheaval', fontSize: '32px' }).setOrigin(0, 0.5);

        // Play button interactivity
        playButton.on('pointerover', () => {
            playButton.setFrame(1); // Hover state
        });

        playButton.on('pointerout', () => {
            playButton.setFrame(0); // Normal state
        });

        playButton.on('pointerdown', () => {
            playButton.setFrame(2); // Pressed state
            this.scene.start('GameScene');
        });
        //#endregion
        
        //#region Add achievements button and text
        const achievementsButton = this.add.sprite(GAME_CENTER_X + 32, 480, 'mainMenuButtons', 6).setOrigin(0.5)
            .setInteractive({ hitArea: new Phaser.Geom.Circle(64, 64, 30), hitAreaCallback: Phaser.Geom.Circle.Contains, useHandCursor: true });

        // Add Text next to achievements button
        const achievementsText = this.add.text(GAME_CENTER_X - 231, 480, 'Achievements', { fontFamily: 'Upheaval', fontSize: '32px' }).setOrigin(0, 0.5);

        // Achievements button interactivity
        achievementsButton.on('pointerover', () => {
            achievementsButton.setFrame(7); // Hover state
        });

        achievementsButton.on('pointerout', () => {
            achievementsButton.setFrame(6); // Normal state
        });

        achievementsButton.on('pointerdown', () => {
            achievementsButton.setFrame(8); // Pressed state
            this.scene.pause();
            this.scene.launch('AchievementsScene', { callerScene: 'MainMenuScene' });
        });
        //#endregion

        //#region Add settings button and text
        const settingsButton = this.add.sprite(GAME_CENTER_X + 32, 560, 'mainMenuButtons', 5).setOrigin(0.5)
            .setInteractive({ hitArea: new Phaser.Geom.Circle(64, 64, 30), hitAreaCallback: Phaser.Geom.Circle.Contains, useHandCursor: true });

        // Add Text next to settings button
        const settingsText = this.add.text(GAME_CENTER_X - 149, 560, 'Settings', { fontFamily: 'Upheaval', fontSize: '32px' }).setOrigin(0, 0.5);

        // Settings button interactivity
        settingsButton.on('pointerover', () => {
            settingsButton.setFrame(4); // Hover state
        });

        settingsButton.on('pointerout', () => {
            settingsButton.setFrame(5); // Normal state
        });

        settingsButton.on('pointerdown', () => {
            settingsButton.setFrame(3); // Pressed state
            this.scene.pause('MainMenuScene'); // Stop the main menu scene
            this.scene.launch('SettingsScene', { callerScene: 'MainMenuScene' }); // Launch the settings menu
        });
        //#endregion
        
    }
}