export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
        console.log('MainMenu loaded');
    }

    preload(){
        // Load the font for the main menu
        this.load.font({
            key: 'Upheaval',
            url: '../assets/font/upheavtt.ttf',
            format: 'truetype',
            descriptors: { style: 'normal', weight: '400' }
        });

        // Load all the buttons with all three states (normal, hover, and pressed)
        this.load.spritesheet('mainMenuButtons', '../assets/images/Main_Menu_UI_Buttons.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        let gameWidth = this.cameras.main.width;
        let gameHeight = this.cameras.main.height;
        // Add void like color
        this.cameras.main.setBackgroundColor('#210219');
        
        // Add title text
        let titleText = this.add.text(gameWidth/2, 200, 'Voidwork', { fontFamily: 'Upheaval', fontSize: '64px'}).setOrigin(0.5, 0);
        
        //#region AddAsteroids

        let gfx = this.add.graphics();

        //Small Asteroids
        for (let asteroid = 0; asteroid < 100; asteroid++) {

        let y = Phaser.Math.Between(0, 768);
        let x = Phaser.Math.Between(0, 1024);

        gfx.fillStyle( 0xE9F564,  0.2 ).fillCircle(x, y, 3);
        gfx.fillStyle( 0xEAFF00,  0.05 ).fillCircle(x, y, 2);
        gfx.fillStyle( 0xFFFFFF,  1).fillCircle(x, y, 1);
         
        }

        //Mid Asteroids
        for (let asteroid = 0; asteroid < 75; asteroid++) {

        let y = Phaser.Math.Between(0, 768);
        let x = Phaser.Math.Between(0, 1024);

        gfx.fillStyle( 0xE9F564,  0.2 ).fillCircle(x, y, 4);
        gfx.fillStyle( 0xEAFF00,  0.05 ).fillCircle(x, y, 3);
        gfx.fillStyle( 0xFFFFFF,  1).fillCircle(x, y, 2);
         
        }

        //Large Asteroids
        for (let asteroid = 0; asteroid < 75; asteroid++) {

        let y = Phaser.Math.Between(0, 768);
        let x = Phaser.Math.Between(0, 1024);

        gfx.fillStyle( 0xE9F564,  0.2 ).fillCircle(x, y, 5);
        gfx.fillStyle( 0xEAFF00,  0.05 ).fillCircle(x, y, 4);
        gfx.fillStyle( 0xFFFFFF,  1).fillCircle(x, y, 3);
         
        }
        //#endregion
        
        //#region Add play button and text
        let playButton = this.add.sprite(gameWidth/2 + 32, 400, 'mainMenuButtons', 0).setInteractive().setOrigin(0.5);
        
        // Add Text next to play button
        let playText = this.add.text(gameWidth/2 - 79, 400, 'Play', { fontFamily: 'Upheaval', fontSize: '32px' }).setOrigin(0, 0.5);

        // Play button interactivity
        playButton.on('pointerover', () => {
            playButton.setFrame(1); // Hover state
        });

        playButton.on('pointerout', () => {
            playButton.setFrame(0); // Normal state
        });

        playButton.on('pointerdown', () => {
            playButton.setFrame(2); // Pressed state
        });

        // Play button functionality to start the game scene
        playButton.on('pointerdown', () => {
            this.scene.start('GameSceneLV1');
        });
        //#endregion
        
        //#region Add achievements button and text
        let achivementsButton = this.add.sprite(gameWidth/2 + 32, 480, 'mainMenuButtons', 0).setInteractive().setOrigin(0.5);
        
        // Add Text next to achievements button
        let achievementsText = this.add.text(gameWidth/2 - 231, 480, 'Achievements', { fontFamily: 'Upheaval', fontSize: '32px' }).setOrigin(0, 0.5);

        // Achievements button interactivity
        achivementsButton.on('pointerover', () => {
            achivementsButton.setFrame(7); // Hover state
        });

        achivementsButton.on('pointerout', () => {
            achivementsButton.setFrame(6); // Normal state
        });

        achivementsButton.on('pointerdown', () => {
            achivementsButton.setFrame(8); // Pressed state
        });

        // Achievements button functionality to start the achievements scene (to be implemented)
        achivementsButton.on('pointerdown', () => {
            // this.scene.start('AchievementsScene'); // Uncomment when AchievementsScene is implemented
        });
        //#endregion

        //#region Add settings button and text
        let settingsButton = this.add.sprite(gameWidth/2 + 32, 560, 'mainMenuButtons', 0).setInteractive().setOrigin(0.5);
        
        // Add Text next to settings button
        let settingsText = this.add.text(gameWidth/2 - 149, 560, 'Settings', { fontFamily: 'Upheaval', fontSize: '32px' }).setOrigin(0, 0.5);

        // Settings button interactivity
        settingsButton.on('pointerover', () => {
            settingsButton.setFrame(4); // Hover state
        });

        settingsButton.on('pointerout', () => {
            settingsButton.setFrame(5); // Normal state
        });

        settingsButton.on('pointerdown', () => {
            settingsButton.setFrame(3); // Pressed state
        });

        // Settings button functionality to start the settings scene (to be implemented)
        settingsButton.on('pointerdown', () => {
            // this.scene.start('SettingsScene'); // Uncomment when SettingsScene is implemented
        });

        //#endregion

    }
}