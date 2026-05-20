import { GAME_WIDTH, GAME_HEIGHT, GAME_CENTER_X, GAME_CENTER_Y } from '../config/GameConfig.js';
import { AudioManager } from '../systems/AudioManager.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { ACHIEVEMENTS } from '../config/AchievementConfig.js';

// Grid layout constants
const COLS        = 4;
const ICON_SCALE  = 0.18;   // 328px * 0.18 ≈ 59px icons
const CELL_W      = 168;
const CELL_H      = 130;
const GRID_X      = GAME_CENTER_X - (COLS * CELL_W) / 2 + CELL_W / 2;  // centre of first column
const GRID_Y      = GAME_CENTER_Y - 120;  // first row centre Y

export class AchievementsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AchievementsScene' });
    }

    init(data) {
        this.callerScene = data.callerScene;
    }

    create() {
        const gameState = SaveSystem.load();

        this.input.on('gameobjectdown', () => AudioManager.playSfx(this, 'click'));
        this.input.keyboard.on('keydown-ESC', () => this.close());

        // ── OVERLAY + PANEL ───────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0);
        this.add.rectangle(GAME_CENTER_X, GAME_CENTER_Y, 720, 480, 0x222222).setOrigin(0.5);

        // ── HEADER ────────────────────────────────────────────
        const backBtn = this.add.text(GAME_CENTER_X - 325, GAME_CENTER_Y - 210, '< Back', {
            fontFamily: 'Upheaval', fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#ffffff' }));
        backBtn.on('pointerout',  () => backBtn.setStyle({ fill: '#aaaaaa' }));
        backBtn.on('pointerdown', () => this.close());

        this.add.text(GAME_CENTER_X, GAME_CENTER_Y - 210, 'Achievements', {
            fontFamily: 'Upheaval', fontSize: '26px', fill: '#ffffff'
        }).setOrigin(0.5);

        // ── ACHIEVEMENT GRID ──────────────────────────────────
        const achievementList = Object.values(ACHIEVEMENTS);

        achievementList.forEach((config, index) => {
            const col = index % COLS;
            const row = Math.floor(index / COLS);

            const cellX = GRID_X + col * CELL_W;
            const cellY = GRID_Y + row * CELL_H;

            const isUnlocked = gameState.achievements[config.id]?.unlocked ?? false;

            // Icon — grey and dim if locked, full colour if unlocked
            const icon = this.add.image(cellX, cellY - 20, 'AchievementIcons', config.iconFrame)
                .setScale(ICON_SCALE)
                .setAlpha(isUnlocked ? 1 : 0.25);

            if (!isUnlocked) {
                // Grey tint for locked achievements
                icon.setTint(0x888888);
            }

            // Name label
            this.add.text(cellX, cellY + 42, isUnlocked ? config.name : '???', {
                fontFamily: 'Upheaval',
                fontSize:   '13px',
                fill:       isUnlocked ? '#ffffff' : '#666666',
                align:      'center',
                wordWrap:   { width: CELL_W - 10 }
            }).setOrigin(0.5, 0);
        });

        // ── UNLOCK COUNT ──────────────────────────────────────
        const unlockedCount = Object.values(gameState.achievements).filter(a => a.unlocked).length;
        const total = achievementList.length;

        this.add.text(GAME_CENTER_X, GAME_CENTER_Y + 215, `${unlockedCount} / ${total} Unlocked`, {
            fontFamily: 'Upheaval', fontSize: '18px', fill: '#aaaaaa'
        }).setOrigin(0.5);
    }

    close() {
        this.scene.stop();
        this.scene.resume(this.callerScene);
    }
}
