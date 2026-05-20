import { GAME_WIDTH, GAME_HEIGHT, GAME_CENTER_X, GAME_CENTER_Y } from "../config/GameConfig.js";
import { AudioManager } from "../systems/AudioManager.js";
import { SaveSystem } from "../systems/SaveSystem.js";

export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
        console.log('Pause Scene loaded');
    }

    create() {
        // Play click sound on any button click
        this.input.on('gameobjectdown', () => AudioManager.playSfx(this, 'click'));

        // Semi-transparent dark overlay covering the whole screen
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5).setOrigin(0);

        // ── MAIN MENU CONTAINER ───────────────────────────────
        // All the normal pause menu buttons live here.
        // We hide this container when the reset confirmation appears.
        const menuContainer = this.add.container(GAME_CENTER_X, GAME_CENTER_Y);

        // Menu background — tall enough for 5 buttons spaced 60px apart
        const bg = this.add.rectangle(0, 0, 300, 380, 0x222222).setOrigin(0.5);
        menuContainer.add(bg);

        // Resume button — also triggered by pressing ESC again
        const resumeButton = this.add.text(0, -130, 'Resume', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuContainer.add(resumeButton);

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop();           // Stop PauseScene
            this.scene.resume('GameScene');  // Unpause the game
            this.scene.resume('HudScene');   // Unpause the HUD
        });
        resumeButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('GameScene');
            this.scene.resume('HudScene');
        });

        // Settings button — opens SettingsScene as a nested modal on top of PauseScene
        const settingsButton = this.add.text(0, -60, 'Settings', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuContainer.add(settingsButton);

        settingsButton.on('pointerdown', () => {
            this.scene.pause(); // Keep PauseScene visible but frozen underneath SettingsScene
            this.scene.launch('SettingsScene', { callerScene: 'PauseScene' }).bringToTop('SettingsScene');
        });

        // Achievements button — opens AchievementsScene as a nested modal
        const achievementsButton = this.add.text(0, 10, 'Achievements', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuContainer.add(achievementsButton);

        achievementsButton.on('pointerdown', () => {
            this.scene.pause();
            this.scene.launch('AchievementsScene', { callerScene: 'PauseScene' }).bringToTop('AchievementsScene');
        });

        // Main Menu button — stops all game scenes and returns to the main menu
        const mainMenuButton = this.add.text(0, 80, 'Main Menu', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuContainer.add(mainMenuButton);

        mainMenuButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('HudScene');
            this.scene.stop();
            this.scene.start('MainMenuScene');
        });

        // Reset Game button — red text to signal danger, triggers a confirmation step
        const resetButton = this.add.text(0, 150, 'Reset Game', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#ff4444' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuContainer.add(resetButton);

        resetButton.on('pointerdown', () => {
            // Hide the normal menu and show the confirmation prompt instead
            menuContainer.setVisible(false);
            confirmContainer.setVisible(true);
        });

        // ── RESET CONFIRMATION CONTAINER ─────────────────────
        // This is hidden by default. It appears when the player clicks "Reset Game".
        const confirmContainer = this.add.container(GAME_CENTER_X, GAME_CENTER_Y);
        confirmContainer.setVisible(false); // Hidden until Reset Game is clicked

        // Confirmation box background
        const confirmBg = this.add.rectangle(0, 0, 320, 220, 0x330000).setOrigin(0.5);
        confirmContainer.add(confirmBg);

        // Warning text — two lines so it fits in the box
        const warningLine1 = this.add.text(0, -70, 'Reset all progress?', { fontFamily: 'Upheaval', fontSize: '22px', fill: '#ffffff' }).setOrigin(0.5);
        const warningLine2 = this.add.text(0, -35, 'This cannot be undone.', { fontFamily: 'Upheaval', fontSize: '18px', fill: '#ff9999' }).setOrigin(0.5);
        confirmContainer.add(warningLine1);
        confirmContainer.add(warningLine2);

        // "Yes, Reset" button — red, performs the destructive action
        const confirmYesButton = this.add.text(0, 30, 'Yes, Reset', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#ff4444' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        confirmContainer.add(confirmYesButton);

        confirmYesButton.on('pointerdown', () => {
            SaveSystem.reset();               // Wipe localStorage save data
            AudioManager.stopMusicNow();      // Stop music instantly
            this.scene.stop('GameScene');
            this.scene.stop('HudScene');
            this.scene.stop();
            this.scene.start('MainMenuScene'); // Boot fresh — SaveSystem.load() will return defaults
        });

        // "Cancel" button — grey, dismisses the confirmation and shows the menu again
        const confirmCancelButton = this.add.text(0, 90, 'Cancel', { fontFamily: 'Upheaval', fontSize: '24px', fill: '#aaaaaa' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        confirmContainer.add(confirmCancelButton);

        confirmCancelButton.on('pointerdown', () => {
            // Go back to the normal pause menu without touching any data
            confirmContainer.setVisible(false);
            menuContainer.setVisible(true);
        });
    }
}