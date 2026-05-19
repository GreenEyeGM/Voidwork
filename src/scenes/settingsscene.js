import { GAME_WIDTH, GAME_HEIGHT, GAME_CENTER_X, GAME_CENTER_Y } from '../config/GameConfig.js';
import { SaveSystem } from '../systems/SaveSystem.js';

const MUSIC_KEYS = ['mainMenu1', 'mainMenu2', 'gameMusic1', 'gameMusic2', 'gameMusic3', 'gameMusic4', 'gameMusic5'];

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

        // Apply saved volume immediately
        this.sound.volume = this.settings.volume;
        this.applyMusicToggle();

        this.input.on('gameobjectdown', () => this.sound.play('click', { volume: 0.5 }));
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

        // Filled portion
        const fill = this.add.rectangle(TRACK_X, TRACK_Y, TRACK_W * this.settings.volume, 8, 0x44ff88)
            .setOrigin(0, 0.5);

        // Thumb
        const thumb = this.add.rectangle(
            TRACK_X + TRACK_W * this.settings.volume, TRACK_Y, 14, 26, 0xffffff
        ).setOrigin(0.5);

        const volLabel = this.add.text(TRACK_X + TRACK_W + 12, TRACK_Y,
            `${Math.round(this.settings.volume * 100)}%`, {
                fontFamily: 'Upheaval', fontSize: '18px', fill: '#aaaaaa'
            }).setOrigin(0, 0.5);

        let dragging = false;

        const updateVolume = (worldX) => {
            const t = Phaser.Math.Clamp((worldX - TRACK_X) / TRACK_W, 0, 1);
            thumb.x = TRACK_X + t * TRACK_W;
            fill.setSize(TRACK_W * t, 8);
            this.settings.volume = parseFloat(t.toFixed(2));
            this.sound.volume = this.settings.volume;
            volLabel.setText(`${Math.round(t * 100)}%`);
        };

        track.on('pointerdown', (ptr) => { dragging = true; updateVolume(ptr.x); });
        this.input.on('pointermove', (ptr) => { if (dragging) updateVolume(ptr.x); });
        this.input.on('pointerup',   () => { if (dragging) { dragging = false; this.saveSettings(); } });

        // ── MUSIC TOGGLE ──────────────────────────────────────
        this.add.text(GAME_CENTER_X - 245, GAME_CENTER_Y + 20, 'Music', {
            fontFamily: 'Upheaval', fontSize: '22px', fill: '#ffffff'
        }).setOrigin(0, 0.5);

        const musicBtn = this.add.text(GAME_CENTER_X + 100, GAME_CENTER_Y + 20,
            this.settings.musicEnabled ? 'ON' : 'OFF', {
                fontFamily: 'Upheaval', fontSize: '22px',
                fill: this.settings.musicEnabled ? '#44ff88' : '#ff4444'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        musicBtn.on('pointerdown', () => {
            this.settings.musicEnabled = !this.settings.musicEnabled;
            musicBtn.setText(this.settings.musicEnabled ? 'ON' : 'OFF');
            musicBtn.setStyle({ fill: this.settings.musicEnabled ? '#44ff88' : '#ff4444' });
            this.applyMusicToggle();
            this.saveSettings();
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

    applyMusicToggle() {
        MUSIC_KEYS.forEach(key => {
            const sound = this.sound.get(key);
            // @ts-ignore — Phaser 4 types omit BaseSound.mute but it exists at runtime
            if (sound) sound.mute = !this.settings.musicEnabled;
        });
    }

    saveSettings() {
        const gameState = SaveSystem.load();
        gameState.settings = this.settings;
        SaveSystem.save(gameState);
    }

    close() {
        this.scene.stop();
        this.scene.resume(this.callerScene);
    }
}
