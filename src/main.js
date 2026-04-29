import { MainMenu } from "./scenes/mainmenu.js";

const config = {
    type: Phaser.WEBGL,
    scene: MainMenu,   
    scale: {
        width: 1024,
        height: 768,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor:'#210219'
};

const game = new Phaser.Game(config);
