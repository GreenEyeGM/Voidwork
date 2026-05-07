import { MainMenuScene } from "./scenes/MainMenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { AchievementsScene } from "./scenes/AchievementsScene.js";
import { SettingsScene } from "./scenes/SettingsScene.js";
import { HudScene } from "./scenes/HudScene.js";
import { PauseScene } from "./scenes/PauseMenuScene.js";

const config = {
    type: Phaser.WEBGL,
    scene: [MainMenuScene,GameScene,SettingsScene,AchievementsScene,HudScene,PauseScene],
    scale: {
        width: 1024,
        height: 768,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    // Add void like color
    backgroundColor:'#210219'
    };

const game = new Phaser.Game(config);
