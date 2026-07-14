import AudioCore from '../src/core/AudioCore';

describe('AudioCore', () => {
    let audioCore;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        audioCore = new AudioCore(['test-track.mp3']);
    });

    afterEach(() => {
        if (audioCore) {
            audioCore.dispose();
        }
    });

    test('should initialize with default state', () => {
        expect(audioCore.state.isPlaying).toBeFalsy();
        expect(audioCore.state.isPaused).toBeFalsy();
        expect(audioCore.state.isStopped).toBeTruthy();
    });

    test('should initialize with default audio controls', () => {
        expect(audioCore.audioControls.volume).toBe(1);
        expect(audioCore.audioControls.isMuted).toBeFalsy();
        expect(audioCore.audioControls.isLooping).toBeFalsy();
    });

    test('should stream the initial track through the audio element', () => {
        expect(audioCore.audio.src).toContain('test-track.mp3');
        expect(audioCore.audio.crossOrigin).toBe('anonymous');
    });

    test('should load a track by index', async () => {
        audioCore.playlist.tracks.push('second-track.mp3');
        const result = await audioCore.loadTrack(1, false);
        expect(result).toBeTruthy();
        expect(audioCore.audio.src).toContain('second-track.mp3');
    });

    test('should load an uploaded file via object URL', async () => {
        const file = new File(['dummy'], 'song.mp3', { type: 'audio/mp3' });
        const result = await audioCore.loadFile(file);
        expect(result).toBeTruthy();
        expect(URL.createObjectURL).toHaveBeenCalledWith(file);
        expect(audioCore.playlist.currentFile).toBe(file);
    });

    test('should load a URL directly', async () => {
        await audioCore.loadUrl('https://example.com/stream.mp3');
        expect(audioCore.audio.src).toContain('stream.mp3');
        expect(audioCore.playlist.currentFile).toBeNull();
    });

    test('should handle play state correctly', async () => {
        await audioCore.handlePlay();
        expect(audioCore.audio.play).toHaveBeenCalled();
        expect(audioCore.state.isPlaying).toBeTruthy();
        expect(audioCore.state.isPaused).toBeFalsy();
        expect(audioCore.state.isStopped).toBeFalsy();
    });

    test('should handle pause state correctly', async () => {
        await audioCore.handlePlay();
        audioCore.handlePause();
        expect(audioCore.state.isPlaying).toBeFalsy();
        expect(audioCore.state.isPaused).toBeTruthy();
    });

    test('should handle stop state correctly', async () => {
        await audioCore.handlePlay();
        audioCore.handleStop();
        expect(audioCore.state.isPlaying).toBeFalsy();
        expect(audioCore.state.isPaused).toBeFalsy();
        expect(audioCore.state.isStopped).toBeTruthy();
        expect(audioCore.audio.currentTime).toBe(0);
    });

    test('should apply volume through the gain node', () => {
        audioCore.audioControls.volume = 0.5;
        audioCore.updateVolume();
        expect(audioCore.gainNode.gain.value).toBe(0.5);
        expect(localStorage.getItem('audioVolume')).toBe('0.5');
    });

    test('should mute and unmute without losing the volume', () => {
        audioCore.audioControls.volume = 0.8;
        expect(audioCore.toggleMute()).toBe(true);
        expect(audioCore.gainNode.gain.value).toBe(0);
        expect(audioCore.toggleMute()).toBe(false);
        expect(audioCore.gainNode.gain.value).toBe(0.8);
    });

    test('should get average audio level', () => {
        const mockData = new Uint8Array([128, 255, 64, 192]);
        audioCore.data = mockData;
        const level = audioCore.getAverageAudioLevel();
        expect(level).toBeGreaterThanOrEqual(0);
        expect(level).toBeLessThanOrEqual(1);
    });
});
