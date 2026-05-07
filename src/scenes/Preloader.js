import { GAME_WIDTH, GAME_HEIGHT, GAME_CENTER_X, GAME_CENTER_Y } from "../config/GameConfig.js";

export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
        console.log('Preloader Scene loaded');
    }
    
    preload() {
        //#region All assets that need to be loaded before the main menu goes here

        // Load the font used in the game (Upheaval) - https://www.dafont.com/upheaval.font
        this.load.font({
            key: 'Upheaval',
            url: '../assets/font/upheavtt.ttf',
            format: 'truetype',
            descriptors: { style: 'normal', weight: '400' }
        });
        // Load the logo
        this.load.image('logo', '../assets/images/voidwork_logo.png');
        // Load all the buttons for the main menu
        this.load.spritesheet('mainMenuButtons', '../assets/images/Main_Menu_UI_Buttons.png', { frameWidth: 128, frameHeight: 128 });
        // Load the music for the main menu
        this.load.audio('mainMenu1', '../assets/audio/music/voidwork_main_menu.mp3');
        this.load.audio('mainMenu2', '../assets/audio/music/voidwork_main_menu2.mp3');

        // For HUD icons
        this.load.spritesheet('HUDIcons', '../assets/images/HUD_Icons.png', { frameWidth: 90, frameHeight: 108 });

        // Load asteroids for Game Scene
        this.load.spritesheet('Asteroids', '../assets/images/asteroids.png', { frameWidth: 128, frameHeight: 128 });
        
        //#endregion
        // Name of the game, displayed on the loading screen
        this.add.text(GAME_CENTER_X, 120, 'Voidwork', { fontFamily: 'Upheaval', fontSize: '64px'}).setOrigin(0.5, 1);
        
        //#region Loading progress bar setup (Copied by other creators and improved)
        // --- Loading text ---
        const loadingText = this.add.text(GAME_CENTER_X, GAME_CENTER_Y - 60, 'Loading...', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // --- Progress bar background (the empty bar) ---
        const barBackground = this.add.rectangle(GAME_CENTER_X, GAME_CENTER_Y, 400, 30, 0x333333);

        // --- Progress bar fill (the moving part) ---
        // Starts at width 0, grows as assets load
        const progressBar = this.add.rectangle(
            GAME_CENTER_X - 200,  // anchored to left edge of background
            GAME_CENTER_Y,
            0,              // starts empty
            26,
            0x44ff88        // green fill — change to any color you like
        ).setOrigin(0, 0.5);

        // --- Percentage text ---
        const percentText = this.add.text(GAME_CENTER_X, GAME_CENTER_Y + 40, '0%', {
            fontSize: '18px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        // --- This fires continuously as each asset loads ---
        // 'value' is a number from 0 to 1
        this.load.on('progress', (value) => {
            progressBar.width = 400 * value;  // grow the bar
            percentText.setText(Math.floor(value * 100) + '%');
        });

        // --- This fires once when everything is done ---
        this.load.on('complete', () => {
            loadingText.setText('Ready!');
            percentText.setText('100%');

            // Small delay so the player sees "Ready!" before moving on
            this.time.delayedCall(500, () => {
                this.scene.start('MainMenuScene');
            });
        });
        //#endregion
        
    }

    create() {
    }
}