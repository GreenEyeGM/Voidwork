import { MainMenuScene } from "./scenes/mainmenuscene.js";
import { GameSceneLV1 } from "./scenes/gamescenelv1.js";
import { AchievementsScene } from "./scenes/achievementsscene.js";
import { SettingsScene } from "./scenes/settingsscene.js";

const config = {
    type: Phaser.WEBGL,
    scene: [MainMenuScene,GameSceneLV1,SettingsScene,AchievementsScene],
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
