import { GAME_WIDTH, GAME_HEIGHT, GAME_CENTER_X, GAME_CENTER_Y } from '../config/GameConfig.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AudioManager } from '../systems/AudioManager.js';

const AUTO_SAVE_OPTIONS = [
    { label: '1 min',  value: 60000  },
    { label: '5 min',  value: 300000 },
    { label: '10 min', value: 600000 },
];

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    init(data) {
        this.callerScene = data.callerScene;
    }

    create() {
        const gameState = SaveSystem.load();
        this.settings = gameState.settings;

        this.input.on('gameobjectdown', () => AudioManager.playSfx(this, 'click'));
        this.input.keyboard.on('keydown-ESC', () => this.close());

        // ── OVERLAY + PANEL ───────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5).setOrigin(0);
        this.add.rectangle(GAME_CENTER_X, GAME_CENTER_Y, 540, 340, 0x222222).setOrigin(0.5);

        // ── HEADER ────────────────────────────────────────────
        const backBtn = this.add.text(GAME_CENTER_X - 245, GAME_CENTER_Y - 145, '< Back', {
            fontFamily: 'Upheaval', fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
        backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#ffffff' }));
        backBtn.on('pointerout',  () => backBtn.setStyle({ fill: '#aaaaaa' }));
        backBtn.on('pointerdown', () => this.close());

        this.add.text(GAME_CENTER_X, GAME_CENTER_Y - 145, 'Settings', {
            fontFamily: 'Upheaval', fontSize: '26px', fill: '#ffffff'
        }).setOrigin(0.5);

        // ── VOLUME SLIDER ─────────────────────────────────────
        this.add.text(GAME_CENTER_X - 245, GAME_CENTER_Y - 60, 'Volume', {
            fontFamily: 'Upheaval', fontSize: '22px', fill: '#ffffff'
        }).setOrigin(0, 0.5);

        const TRACK_X = GAME_CENTER_X - 50;
        const TRACK_Y = GAME_CENTER_Y - 60;
        const TRACK_W = 220;

        // Track background
        const track = this.add.rectangle(TRACK_X, TRACK_Y, TRACK_W, 8, 0x555555)
            .setOrigin(0, 0.5)
            .setInteractive({ useHandCursor: true });

        const initVol = AudioManager.musicVolume;

        // Filled portion
        const fill = this.add.rectangle(TRACK_X, TRACK_Y, TRACK_W * initVol, 8, 0x44ff88)
            .setOrigin(0, 0.5);

        // Thumb
        const thumb = this.add.rectangle(
            TRACK_X + TRACK_W * initVol, TRACK_Y, 14, 26, 0xffffff
        ).setOrigin(0.5);

        const volLabel = this.add.text(TRACK_X + TRACK_W + 12, TRACK_Y,
            `${Math.round(initVol * 100)}%`, {
                fontFamily: 'Upheaval', fontSize: '18px', fill: '#aaaaaa'
            }).setOrigin(0, 0.5);

        let dragging = false;

        const updateVolume = (worldX) => {
            const t = Phaser.Math.Clamp((worldX - TRACK_X) / TRACK_W, 0, 1);
            thumb.x = TRACK_X + t * TRACK_W;
            fill.setSize(TRACK_W * t, 8);
            volLabel.setText(`${Math.round(t * 100)}%`);
            AudioManager.setMusicVolume(parseFloat(t.toFixed(2)));
        };

        track.on('pointerdown', (ptr) => { dragging = true; updateVolume(ptr.x); });
        this.input.on('pointermove', (ptr) => { if (dragging) updateVolume(ptr.x); });
        this.input.on('pointerup',   () => { dragging = false; });

        // ── MUSIC TOGGLE ──────────────────────────────────────
        this.add.text(GAME_CENTER_X - 245, GAME_CENTER_Y + 20, 'Music', {
            fontFamily: 'Upheaval', fontSize: '22px', fill: '#ffffff'
        }).setOrigin(0, 0.5);

        const musicBtn = this.add.text(GAME_CENTER_X + 100, GAME_CENTER_Y + 20,
            AudioManager.musicEnabled ? 'ON' : 'OFF', {
                fontFamily: 'Upheaval', fontSize: '22px',
                fill: AudioManager.musicEnabled ? '#44ff88' : '#ff4444'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        musicBtn.on('pointerdown', () => {
            const enabled = AudioManager.toggleMusic();
            musicBtn.setText(enabled ? 'ON' : 'OFF');
            musicBtn.setStyle({ fill: enabled ? '#44ff88' : '#ff4444' });
        });

        // ── AUTO-SAVE DELAY ───────────────────────────────────
        this.add.text(GAME_CENTER_X - 245, GAME_CENTER_Y + 100, 'Auto-Save', {
            fontFamily: 'Upheaval', fontSize: '22px', fill: '#ffffff'
        }).setOrigin(0, 0.5);

        const autoSaveBtns = AUTO_SAVE_OPTIONS.map((opt, i) => {
            const selected = this.settings.autoSaveDelay === opt.value;
            return this.add.text(GAME_CENTER_X - 50 + i * 100, GAME_CENTER_Y + 100, opt.label, {
                fontFamily: 'Upheaval', fontSize: '20px',
                fill: selected ? '#44ff88' : '#aaaaaa'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        });

        autoSaveBtns.forEach((btn, i) => {
            btn.on('pointerdown', () => {
                this.settings.autoSaveDelay = AUTO_SAVE_OPTIONS[i].value;
                autoSaveBtns.forEach((b, j) => {
                    b.setStyle({ fill: j === i ? '#44ff88' : '#aaaaaa' });
                });
                this.saveSettings();
            });
        });
    }

    saveSettings() {
        const gameState = SaveSystem.load();
        gameState.settings.autoSaveDelay = this.settings.autoSaveDelay;
        SaveSystem.save(gameState);
    }

    close() {
        this.scene.stop();
        this.scene.resume(this.callerScene);
    }
}
