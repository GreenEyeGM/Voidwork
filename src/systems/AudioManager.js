import { SaveSystem } from './SaveSystem.js';

const state = {
    musicVolume: 0.1,
    sfxVolume: 0.5,
    musicEnabled: true,
    currentMusic: null,
    playlist: [],
    playlistIndex: 0,
    scene: null,
};

function loadSettings() {
    const { settings } = SaveSystem.load();
    state.musicVolume  = settings.musicVolume  ?? 0.1;
    state.sfxVolume    = settings.sfxVolume    ?? 0.5;
    state.musicEnabled = settings.musicEnabled ?? true;
}

function persistSettings() {
    const gameState = SaveSystem.load();
    gameState.settings.musicVolume  = state.musicVolume;
    gameState.settings.sfxVolume    = state.sfxVolume;
    gameState.settings.musicEnabled = state.musicEnabled;
    SaveSystem.save(gameState);
}

function playTrack(key) {
    const scene = state.scene;
    if (!scene) return;

    const music = scene.sound.add(key, { volume: 0, mute: !state.musicEnabled });
    state.currentMusic = music;
    music.play();

    scene.tweens.add({ targets: music, volume: state.musicVolume, duration: 2000, ease: 'Linear' });

    const fadeDelay = Math.max(0, (music.duration - 3) * 1000);
    scene.time.delayedCall(fadeDelay, () => {
        if (state.currentMusic !== music) return; // track was replaced
        scene.tweens.add({
            targets: music,
            volume: 0,
            duration: 3000,
            ease: 'Linear',
            onComplete: () => {
                music.destroy();
                state.playlistIndex = (state.playlistIndex + 1) % state.playlist.length;
                if (state.playlistIndex === 0) {
                    state.playlist = Phaser.Utils.Array.Shuffle(state.playlist);
                }
                playTrack(state.playlist[state.playlistIndex]);
            }
        });
    });
}

export const AudioManager = {
    startMenuMusic(scene) {
        if (state.currentMusic) { state.currentMusic.destroy(); state.currentMusic = null; }
        loadSettings();
        state.scene = scene;
        state.playlist = ['mainMenu1', 'mainMenu2'];
        state.playlistIndex = 0;
        playTrack('mainMenu1');
    },

    startGameMusic(scene) {
        if (state.currentMusic) { state.currentMusic.destroy(); state.currentMusic = null; }
        loadSettings();
        state.scene = scene;
        state.playlist = Phaser.Utils.Array.Shuffle(['gameMusic1', 'gameMusic2', 'gameMusic3', 'gameMusic4', 'gameMusic5']);
        state.playlistIndex = 0;
        playTrack(state.playlist[0]);
    },

    stopMusicFadeOut() {
        if (!state.currentMusic) return;
        const scene = state.scene;
        const music = state.currentMusic;
        state.currentMusic = null;
        if (!scene || !music.isPlaying) { music.destroy(); return; }
        // Fade out over 1s, then destroy the sound object.
        // Only use this when the scene will stay alive long enough for the tween to finish.
        // For instant transitions (e.g. reset), use stopMusicNow() instead.
        // For graceful scene exits, use stopMusicFadeOut().
        scene.tweens.add({
            targets: music,
            volume: 0,
            duration: 10,
            ease: 'Linear',
            onComplete: () => music.destroy()
        });
    },

    // Stops and destroys the current music track immediately — no fade tween.
    // Use this before stopping scenes (e.g. Reset Game), because scene.stop()
    // destroys all tweens and the fade in stopMusicFadeOut() would never complete.
    stopMusicNow() {
        if (!state.currentMusic) return;
        const music = state.currentMusic;
        state.currentMusic = null; // Clear the reference so nothing else tries to use it
        music.stop();              // Stop playback immediately
        music.destroy();           // Free the sound from Phaser's sound manager
    },

    playSfx(scene, key) {
        scene.sound.play(key, { volume: state.sfxVolume });
    },

    setMusicVolume(v) {
        state.musicVolume = v;
        if (state.currentMusic && !state.currentMusic.mute) {
            state.currentMusic.setVolume(v);
        }
        persistSettings();
    },

    setSfxVolume(v) {
        state.sfxVolume = v;
        persistSettings();
    },

    toggleMusic() {
        state.musicEnabled = !state.musicEnabled;
        if (state.currentMusic) {
            state.currentMusic.mute = !state.musicEnabled;
        }
        persistSettings();
        return state.musicEnabled;
    },

    get musicEnabled() { return state.musicEnabled; },
    get musicVolume()  { return state.musicVolume; },
    get sfxVolume()    { return state.sfxVolume; },
};
