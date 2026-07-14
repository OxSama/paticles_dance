import AudioCore from './core/AudioCore';
import VisualizerEngine, { COLOR_PALETTES } from './core/VisualizerEngine';
import UIController from './ui/UIController';
import { defaultVisualizerSettings } from './config/visualModes';

class AudioVisualizer {
    /**
     * Creates an audio visualizer instance
     * @param {Object} options - Configuration options
     * @param {string|Element} [options.container] - Container element or selector (library renders particles into it)
     * @param {Object} [options.particlesContainer] - An existing tsparticles Container instance to drive instead
     *                                                (e.g. from react-particles' loaded callback)
     * @param {string[]} [options.tracks] - Audio track URLs (streamed, played in order)
     * @param {boolean} [options.showControls] - Render the built-in control panel (requires Tailwind CSS + Font Awesome)
     * @param {Object} [options.settings] - Visualization settings
     */
    constructor(options = {}) {
        if (!options.container && !options.particlesContainer) {
            throw new Error('Either container or particlesContainer is required');
        }

        let containerId;
        if (!options.particlesContainer) {
            const container = typeof options.container === 'string'
                ? document.querySelector(options.container)
                : options.container;
            if (!container) {
                throw new Error(`Container not found: ${options.container}`);
            }
            // tsparticles addresses its target by element id
            if (!container.id) {
                container.id = 'audio-particles-visualizer';
            }
            containerId = container.id;
        }

        // Initialize components
        this.audioCore = new AudioCore(options.tracks || []);
        this.visualizer = new VisualizerEngine(this.audioCore, {
            containerId,
            container: options.particlesContainer
        });

        // Resolves once particles are created and the render loop is running
        this.ready = this.visualizer.ready;

        // Apply settings
        if (options.settings) {
            this.visualizer.updateSettings({
                ...defaultVisualizerSettings,
                ...options.settings
            });
        }

        if (options.showControls) {
            this.ui = new UIController(this.audioCore, this.visualizer);
        }
    }

    /**
     * Start audio playback
     * @returns {Promise<void>}
     */
    play() {
        return this.audioCore.handlePlay();
    }

    /**
     * Pause audio playback
     */
    pause() {
        this.audioCore.handlePause();
    }

    /**
     * Stop audio playback
     */
    stop() {
        this.audioCore.handleStop();
    }

    /**
     * Load an audio file (e.g. from a file input)
     * @param {File} file
     * @returns {Promise<boolean>}
     */
    loadFile(file) {
        return this.audioCore.loadFile(file);
    }

    /**
     * Load an audio URL (streams - starts playing before fully downloaded)
     * @param {string} url
     * @param {boolean} [autoPlay=false]
     * @returns {Promise<boolean>}
     */
    loadUrl(url, autoPlay = false) {
        return this.audioCore.loadUrl(url, autoPlay);
    }

    /**
     * Seek to a time in seconds
     * @param {number} time
     */
    seekTo(time) {
        this.audioCore.seekTo(time);
    }

    /**
     * Set audio volume
     * @param {number} value - Volume value (0-1)
     */
    setVolume(value) {
        if (value >= 0 && value <= 1) {
            this.audioCore.audioControls.volume = value;
            this.audioCore.updateVolume();
        }
    }

    /**
     * Set visualization mode
     * @param {string} mode - Visualization mode name
     */
    setMode(mode) {
        this.visualizer.setMode(mode);
    }

    /**
     * Set color palette
     * @param {string} palette - Color palette name
     */
    setColorPalette(palette) {
        this.visualizer.setColorPalette(palette);
    }

    /**
     * Update visualization settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        this.visualizer.updateSettings(settings);
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.audioCore.dispose();
        this.visualizer.dispose();
    }
}

// Export main class
export default AudioVisualizer;

// Export additional utilities for advanced usage
export {
    AudioCore,
    VisualizerEngine,
    COLOR_PALETTES,
    defaultVisualizerSettings
};
