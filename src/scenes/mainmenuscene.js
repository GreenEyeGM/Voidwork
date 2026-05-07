import { createBackground } from "../utils/Background.js";
import { GAME_WIDTH, GAME_CENTER_X, GAME_CENTER_Y } from "../config/GameConfig.js";

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
        console.log('MainMenu loaded');
    }
    
    create() {
        createBackground(this, 100, 75, 50);

        // Add title text
        let titleText = this.add.text(GAME_CENTER_X, 200, 'Voidwork', { fontFamily: 'Upheaval', fontSize: '64px'}).setOrigin(0.5, 0.5);
        
        //#region Add play button and text
        let playButton = this.add.sprite(GAME_CENTER_X + 32, 400, 'mainMenuButtons', 0).setInteractive({useHandCursor: true}).setOrigin(0.5);
        //let playTest = this.add.sprite(GAME_CENTER_X - 200, 400, 'testing', 0).setOrigin(0.5);
        
        // Add Text next to play button
        let playText = this.add.text(GAME_CENTER_X - 79, 400, 'Play', { fontFamily: 'Upheaval', fontSize: '32px' }).setOrigin(0, 0.5);

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
            console.log('Back button clicked, returning to main menu');
        });
        //#endregion
        
        //#region Add achievements button and text
        let achievementsButton = this.add.sprite(GAME_CENTER_X + 32, 480, 'mainMenuButtons', 6).setInteractive({useHandCursor: true}).setOrigin(0.5);
        
        // Add Text next to achievements button
        let achievementsText = this.add.text(GAME_CENTER_X - 231, 480, 'Achievements', { fontFamily: 'Upheaval', fontSize: '32px' }).setOrigin(0, 0.5);

        // Achievements button interactivity
        achievementsButton.on('pointerover', () => {
            achievementsButton.setFrame(7); // Hover state
        });

        achievementsButton.on('pointerout', () => {
            achievementsButton.setFrame(6); // Normal state
        });

        achievementsButton.on('pointerdown', () => {
            achievementsButton.setFrame(8); // Pressed state
            this.scene.start('AchievementsScene'); 
        });
        //#endregion

        //#region Add settings button and text
        let settingsButton = this.add.sprite(GAME_CENTER_X + 32, 560, 'mainMenuButtons', 5).setInteractive({useHandCursor: true}).setOrigin(0.5);
        
        // Add Text next to settings button
        let settingsText = this.add.text(GAME_CENTER_X - 149, 560, 'Settings', { fontFamily: 'Upheaval', fontSize: '32px' }).setOrigin(0, 0.5);

        // Settings button interactivity
        settingsButton.on('pointerover', () => {
            settingsButton.setFrame(4); // Hover state
        });

        settingsButton.on('pointerout', () => {
            settingsButton.setFrame(5); // Normal state
        });

        settingsButton.on('pointerdown', () => {
            settingsButton.setFrame(3); // Pressed state
            this.scene.start('SettingsScene'); 
        });
        //#endregion

        //Main Menu music
        this.sound.add('mainMenu1');
        this.sound.add('mainMenu2');
    }
}