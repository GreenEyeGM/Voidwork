import { GAME_WIDTH } from "../config/GameConfig.js";

export class HudScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HudScene' });
        console.log('Hud Scene loaded');
    }
    
    create() {
        // // Add HUD icons
        const HUD_ICONS = [];
        // Formula : X = gameWidth - index * (iconWidth + padding) Y = 10 (fixed Y position)
        const START_X = GAME_WIDTH - (90 + 10)*4; // Start from the right edge with padding
        for (let i = 0; i < 4; i++) {
            let icon = this.add.sprite(START_X +(i*(90+10)), 10, 'HUDIcons', i).setInteractive({useHandCursor: true}).setOrigin(0,0);
            HUD_ICONS.push(icon);
        }

        // Add interactivity to the icons
        const ICON_ACTIONS = ["back", "settings", "achievements", "spaceship"];
        HUD_ICONS.forEach((icon, index) => {
            icon.name = ICON_ACTIONS[index]; // Assign a name to each icon for easier identification
            index++;
        });
        HUD_ICONS[0].on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('HudScene'); // Stop the HUD scene
            this.scene.start('MainMenuScene'); // Start the main menu scene
        });
    }
}