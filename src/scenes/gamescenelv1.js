import { createBackground } from "../utils/background.js";

export class GameSceneLV1 extends Phaser.Scene {
    constructor() {
        super({ key: 'GameSceneLV1' });
        console.log('GameScene Level 1 loaded');
    }


    create() {
        createBackground(this, 200, 100, 50);
    }
}