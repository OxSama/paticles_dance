export default class AudioCore {
    constructor(tracks = []) {
        // Initialize audio context with fallback
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;

        // Persistent gain node so volume survives play/pause cycles
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // Streaming playback: an HTMLAudioElement buffers ahead like video,
        // so playback starts before the file is fully downloaded.
        // crossOrigin is required or the analyser reads silence on remote URLs.
        this.audio = new Audio();
        this.audio.crossOrigin = 'anonymous';
        this.audio.preload = 'auto';
        this.mediaSource = this.audioContext.createMediaElementSource(this.audio);
        this.mediaSource.connect(this.gainNode);

        // Initialize state
        this.state = {
            isPlaying: false,
            isPaused: false,
            isStopped: true
        };

        // Audio controls
        this.audioControls = {
            volume: 1,
            isMuted: false,
            previousVolume: 1,
            isLooping: false
        };

        // Playlist configuration
        this.playlist = {
            tracks,
            currentIndex: 0,
            currentFile: null
        };
        this.objectUrl = null;

        // Frequency data array
        this.data = new Uint8Array(this.analyser.frequencyBinCount);

        // Keep state in sync with the element (covers external pauses too)
        this.audio.addEventListener('play', () => {
            this.state.isPlaying = true;
            this.state.isPaused = false;
            this.state.isStopped = false;
        });
        this.audio.addEventListener('pause', () => {
            if (!this.state.isStopped) {
                this.state.isPlaying = false;
                this.state.isPaused = true;
            }
        });
        this.audio.addEventListener('ended', () => this.handleAudioEnd());

        // Load initial track if any were provided
        if (this.playlist.tracks.length) {
            this.loadTrack(this.playlist.currentIndex, false);
        }

        // Load saved volume settings
        this.loadSavedVolume();
        this.gainNode.gain.value = this.audioControls.volume;
    }

    /**
     * Load an uploaded File (e.g. from an <input type="file">)
     * @param {File} file
     * @returns {Promise<boolean>}
     */
    async loadFile(file) {
        try {
            if (this.objectUrl) {
                URL.revokeObjectURL(this.objectUrl);
            }
            this.objectUrl = URL.createObjectURL(file);
            this.playlist.currentFile = file;
            this.setSource(this.objectUrl);
            return true;
        } catch (error) {
            console.error('Error loading file:', error);
            return false;
        }
    }

    /**
     * Load a single audio URL (streams; no full download needed)
     * @param {string} url
     * @param {boolean} [autoPlay=false]
     */
    async loadUrl(url, autoPlay = false) {
        this.playlist.currentFile = null;
        this.setSource(url);
        if (autoPlay) {
            await this.handlePlay();
        }
        return true;
    }

    clearUploadedFile() {
        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl);
            this.objectUrl = null;
        }
        this.playlist.currentFile = null;
    }

    setSource(src) {
        this.handleStop();
        this.audio.src = src;
        this.audio.load();
    }

    loadSavedVolume() {
        const savedVolume = localStorage.getItem('audioVolume');
        if (savedVolume !== null) {
            this.audioControls.volume = parseFloat(savedVolume);
        }
    }

    /**
     * Load a playlist track by index
     * @param {number} trackIndex
     * @param {boolean} [autoPlay=true]
     */
    async loadTrack(trackIndex, autoPlay = true) {
        // If there's an uploaded file, use that instead of the playlist
        if (this.playlist.currentFile) {
            return this.loadFile(this.playlist.currentFile);
        }

        const url = this.playlist.tracks[trackIndex];
        if (!url) return false;

        this.setSource(url);
        if (autoPlay) {
            await this.handlePlay();
        }
        return true;
    }

    async handlePlay() {
        if (!this.audio.src) return;

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.state.isStopped = false;
        await this.audio.play();
    }

    handlePause() {
        if (this.state.isPlaying) {
            this.audio.pause();
        }
    }

    handleStop() {
        if (this.state.isPlaying || this.state.isPaused) {
            this.state.isPlaying = false;
            this.state.isPaused = false;
            this.state.isStopped = true;
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }

    handleAudioEnd() {
        if (this.audioControls.isLooping) {
            this.handlePlay();
        } else if (!this.playlist.currentFile && this.playlist.tracks.length > 1) {
            this.playlist.currentIndex =
                (this.playlist.currentIndex + 1) % this.playlist.tracks.length;
            this.loadTrack(this.playlist.currentIndex, true);
        } else {
            this.state.isPlaying = false;
            this.state.isPaused = false;
            this.state.isStopped = true;
        }
    }

    seekTo(time) {
        if (!this.audio.duration) return;
        this.audio.currentTime = Math.min(Math.max(0, time), this.audio.duration);
    }

    get currentTime() {
        return this.audio.currentTime;
    }

    get duration() {
        return this.audio.duration || 0;
    }

    updateVolume() {
        this.gainNode.gain.value = this.audioControls.isMuted ? 0 : this.audioControls.volume;
        localStorage.setItem('audioVolume', this.audioControls.volume.toString());
    }

    toggleMute() {
        this.audioControls.isMuted = !this.audioControls.isMuted;
        this.updateVolume();
        return this.audioControls.isMuted;
    }

    toggleLoop() {
        this.audioControls.isLooping = !this.audioControls.isLooping;
        return this.audioControls.isLooping;
    }

    getAverageAudioLevel() {
        if (!this.data) return 0;
        return Array.from(this.data).reduce((sum, val) => sum + val, 0) /
               (this.data.length * 256);
    }

    // Clean up method
    dispose() {
        this.audio.pause();
        this.audio.removeAttribute('src');
        this.clearUploadedFile();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    // Method to get current audio data for visualizer
    getAudioData() {
        this.analyser.getByteFrequencyData(this.data);
        return this.data;
    }
}
