import { MainMenuScene } from "./scenes/MainMenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { AchievementsScene } from "./scenes/AchievementsScene.js";
import { SettingsScene } from "./scenes/SettingsScene.js";
import { HudScene } from "./scenes/HudScene.js";
import { PauseScene } from "./scenes/PauseMenuScene.js";
import { GAME_HEIGHT, GAME_WIDTH } from "./config/GameConfig.js";
import { Preloader } from "./scenes/Preloader.js";

const config = {
    type: Phaser.WEBGL,
    scene: [Preloader,MainMenuScene,SettingsScene,AchievementsScene,HudScene,GameScene,PauseScene],
    scale: {
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
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
    backgroundColor:'#210219',
    audio: {
        disableWebAudio: false,
        noAudio: false,
        mute: false,
        volume: 1,
        rate: 1
    },
};

const game = new Phaser.Game(config);
