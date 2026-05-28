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

// Preview tooltip dimensions — PREVIEW_H must be even so py - PREVIEW_H/2 stays on a whole pixel
const PREVIEW_W = 220;
const PREVIEW_H = 66;

// Main panel x bounds — used to clamp the tooltip so it never clips outside
const PANEL_LEFT  = GAME_CENTER_X - 360;  // 720 / 2
const PANEL_RIGHT = GAME_CENTER_X + 360;

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

        // ── HOVER PREVIEW PANEL ───────────────────────────────
        // One shared panel reused for all cells — repositioned and redrawn on each hover.
        // setDepth(10) keeps it on top of icons, labels, and the grid background.

        // Graphics object draws the box background and border/glow
        this.previewGfx = this.add.graphics().setDepth(10).setVisible(false);

        // Achievement name (cyan when unlocked, grey when locked)
        this.previewNameText = this.add.text(0, 0, '', {
            fontFamily: 'Upheaval',
            fontSize:   '14px',
            fill:       '#ffffff',
            align:      'center'
        }).setOrigin(0.5).setDepth(10).setVisible(false);

        // Achievement description (light grey when unlocked, dark grey when locked)
        // 13px minimum — Upheaval is a display font and becomes blurry below this size
        this.previewDescText = this.add.text(0, 0, '', {
            fontFamily: 'Upheaval',
            fontSize:   '13px',
            fill:       '#aaaaaa',
            align:      'center',
            wordWrap:   { width: PREVIEW_W - 20 }
        }).setOrigin(0.5).setDepth(10).setVisible(false);

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

            // Invisible zone covering the full cell — gives a comfortable hover target
            // (much larger than the ~59px icon alone)
            const hitZone = this.add.zone(cellX, cellY - 5, CELL_W - 10, CELL_H - 10)
                .setInteractive();

            hitZone.on('pointerover', () => this.showPreview(config, isUnlocked, cellX, cellY, row));
            hitZone.on('pointerout',  () => this.hidePreview());
        });

        // ── UNLOCK COUNT ──────────────────────────────────────
        const unlockedCount = Object.values(gameState.achievements).filter(a => a.unlocked).length;
        const total = achievementList.length;

        this.add.text(GAME_CENTER_X, GAME_CENTER_Y + 215, `${unlockedCount} / ${total} Unlocked`, {
            fontFamily: 'Upheaval', fontSize: '18px', fill: '#aaaaaa'
        }).setOrigin(0.5);
    }

    // ── SHOW PREVIEW ──────────────────────────────────────────
    // Draws the tooltip box and updates the text for the hovered achievement.
    // Rows 0–1: tooltip appears below the cell.
    // Row 2:    tooltip appears above the cell (avoids clipping the bottom of the panel).
    showPreview(config, isUnlocked, cellX, cellY, row) {

        // Vertical position — flip above for the bottom row
        // Math.round() on all coordinates so nothing lands on a half-pixel
        const py = Math.round(row < 2 ? cellY + 85 : cellY - 85);

        // Clamp horizontal position so the box never clips outside the main panel
        const px = Math.round(Phaser.Math.Clamp(cellX, PANEL_LEFT + PREVIEW_W / 2, PANEL_RIGHT - PREVIEW_W / 2));

        // Top-left corner of the box (Graphics draws from top-left)
        const left = Math.round(px - PREVIEW_W / 2);
        const top  = Math.round(py - PREVIEW_H / 2);

        this.previewGfx.clear();

        // Draw the dark filled background first so strokes appear on top
        this.previewGfx.fillStyle(0x1a1a1a, 0.97);
        this.previewGfx.fillRect(left, top, PREVIEW_W, PREVIEW_H);

        if (isUnlocked) {
            // Neon cyan glow — three concentric strokes that fade outward
            // Inner border: bright and crisp
            this.previewGfx.lineStyle(2, 0x00ffff, 1.0);
            this.previewGfx.strokeRect(left, top, PREVIEW_W, PREVIEW_H);

            // Middle ring: softer
            this.previewGfx.lineStyle(3, 0x00ffff, 0.35);
            this.previewGfx.strokeRect(left - 3, top - 3, PREVIEW_W + 6, PREVIEW_H + 6);

            // Outer ring: faint bloom
            this.previewGfx.lineStyle(4, 0x00ffff, 0.12);
            this.previewGfx.strokeRect(left - 7, top - 7, PREVIEW_W + 14, PREVIEW_H + 14);

        } else {
            // Locked — single muted grey border, no glow
            this.previewGfx.lineStyle(1, 0x444444, 1.0);
            this.previewGfx.strokeRect(left, top, PREVIEW_W, PREVIEW_H);
        }

        this.previewGfx.setVisible(true);

        // Name line — cyan for unlocked, dark grey for locked (name stays '???')
        this.previewNameText
            .setPosition(px, py - 14)
            .setText(isUnlocked ? config.name : '???')
            .setStyle({ fill: isUnlocked ? '#00ffff' : '#555555' })
            .setVisible(true);

        // Description line — light grey for unlocked, darker grey for locked
        // Locked achievements show the real description grayed out so the player
        // knows what they're working toward.
        this.previewDescText
            .setPosition(px, py + 12)
            .setText(config.description)
            .setStyle({ fill: isUnlocked ? '#cccccc' : '#444444' })
            .setVisible(true);
    }

    // ── HIDE PREVIEW ──────────────────────────────────────────
    hidePreview() {
        this.previewGfx.setVisible(false);
        this.previewNameText.setVisible(false);
        this.previewDescText.setVisible(false);
    }

    close() {
        this.scene.stop();
        this.scene.resume(this.callerScene);
    }
}
