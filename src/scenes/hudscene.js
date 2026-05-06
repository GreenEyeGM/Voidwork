export class HudScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HudScene' });
        console.log('Hud Scene loaded');
    }

    preload () {
        this.load.spritesheet('HUDIcons', '../assets/images/HUD_Icons.png', { frameWidth: 90, frameHeight: 108 });
    }
    create() {
        let gameWidth = this.scale.width;
        let gameHeight = this.scale.height;
        // // Add HUD icons
        const hudIcons = [];
        // Formula : X = gameWidth - index * (iconWidth + padding) Y = 10 (fixed Y position)
        const startX = gameWidth - (90 + 10)*4; // Start from the right edge with padding
        for (let i = 0; i < 4; i++) {
            let icon = this.add.sprite(startX +(i*(90+10)), 10, 'HUDIcons', i).setInteractive({useHandCursor: true}).setOrigin(0,0);
            hudIcons.push(icon);
        }

        // Add interactivity to the icons
        const iconActions = ["back", "settings", "achievements", "spaceship"];
        hudIcons.forEach((icon, index) => {
            icon.name = iconActions[index]; // Assign a name to each icon for easier identification
            index++;
        });
        hudIcons[0].on('pointerdown', () => {
            this.scene.stop('GameSceneLV1');
            this.scene.stop('HudScene'); // Stop the HUD scene
            this.scene.start('MainMenuScene'); // Start the main menu scene
        });
    }
}