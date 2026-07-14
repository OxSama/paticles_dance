import { tsParticles } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';
import { shiftHue } from '../utils/colorUtils.js';
import {
    defaultVisualizerSettings,
    getModeConfig
} from '../config/visualModes.js';


export const COLOR_PALETTES = {
    neon: {
        name: "Neon Dreams",
        colors: [
            "#FF00FF", // Bright magenta
            "#00FFFF", // Cyan
            "#FF3F8C", // Pink
            "#7A04EB", // Purple
            "#0FF0FC"  // Electric blue
        ]
    },
    sunset: {
        name: "Sunset Vibes",
        colors: [
            "#FF6B6B", // Coral
            "#FFB067", // Light orange
            "#FFE66D", // Yellow
            "#4ECDC4", // Turquoise
            "#45B7D1"  // Sky blue
        ]
    },
    aurora: {
        name: "Aurora Lights",
        colors: [
            "#A8E6CF", // Mint
            "#DCEDC1", // Light green
            "#FFD3B6", // Peach
            "#FFAAA5", // Pink
            "#FF8B94"  // Coral
        ]
    },
    retro: {
        name: "Retro Wave",
        colors: [
            "#FF2A6D", // Hot pink
            "#05D9E8", // Neon blue
            "#005678", // Deep blue
            "#01012B", // Dark blue
            "#D1F7FF"  // Light cyan
        ]
    },
    galaxy: {
        name: "Galaxy",
        colors: [
            "#5D12D2", // Deep purple
            "#B931FC", // Bright purple
            "#FF5EDC", // Pink
            "#FFA9F9", // Light pink
            "#FFE5FF"  // Pale pink
        ]
    }
};

export default class VisualizerEngine {
    /**
     * @param {AudioCore} audioCore
     * @param {Object} [options]
     * @param {string} [options.containerId] - Element id to render into (library creates the particles)
     * @param {Object} [options.container] - An existing tsparticles Container instance to drive
     *                                       (e.g. from react-particles). Mode/palette/count changes
     *                                       are disabled in this case - the host owns the config.
     */
    constructor(audioCore, options = {}) {
        this.audioCore = audioCore;
        this.containerId = options.containerId || 'particles-js';
        this.container = options.container || null;
        this.ownsContainer = !options.container;

        // Visualization settings
        this.visualizerSettings = { ...defaultVisualizerSettings };

        // Current visualization mode
        this.currentMode = this.visualizerSettings.mode;

        // Animation frame ID for cleanup
        this.animationFrameId = null;

        // Resolves once particles are created and the loop is running
        this.ready = this.init();
    }

    async init() {
        if (this.ownsContainer) {
            await loadSlim(tsParticles);
            this.container = await tsParticles.load(this.containerId, this.buildConfig());
        }
        this.startVisualization();
    }

    buildConfig() {
        return this.applyCurrentSettings(getModeConfig(this.currentMode));
    }

    getParticles() {
        const particles = this.container?.particles;
        // ponytail: tsparticles v2 exposes the live array as `array`; fall back for minor-version drift
        return particles?.array ?? particles?._array ?? [];
    }

    startVisualization() {
        if (!this.animationFrameId) {
            this.loop();
        }
    }

    stopVisualization() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    loop = () => {
        if (this.audioCore.state.isPlaying) {
            const audioData = this.audioCore.getAudioData();
            this.updateParticles(audioData);
        }

        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    updateParticles(audioData) {
        const particles = this.getParticles();
        if (!particles.length) return;

        // Split frequency data into four ranges for more detailed analysis
        const subBassRange = audioData.slice(0, Math.floor(audioData.length * 0.05));  // 0-5%
        const bassRange = audioData.slice(Math.floor(audioData.length * 0.05), Math.floor(audioData.length * 0.2));  // 5-20%
        const midRange = audioData.slice(Math.floor(audioData.length * 0.2), Math.floor(audioData.length * 0.6));  // 20-60%
        const highRange = audioData.slice(Math.floor(audioData.length * 0.6));  // 60-100%

        // Calculate energy levels with peak detection
        const subBassEnergy = this.calculatePeakEnergy(subBassRange);
        const bassEnergy = this.calculatePeakEnergy(bassRange);
        const midEnergy = this.calculatePeakEnergy(midRange);
        const highEnergy = this.calculatePeakEnergy(highRange);

        // Calculate dynamic movement parameters
        const overallEnergy = (subBassEnergy + bassEnergy + midEnergy + highEnergy) / 4;
        const beatDetected = subBassEnergy > 0.8 || bassEnergy > 0.8; // Simple beat detection

        const bands = [
            { energy: subBassEnergy, maxSize: 30, minSize: 8, pulseOnBeat: true },   // Sub-bass (deep rumble)
            { energy: bassEnergy, maxSize: 25, minSize: 6, pulseOnBeat: true },      // Bass
            { energy: midEnergy, maxSize: 15, minSize: 4, pulseOnBeat: false },      // Mid-range
            { energy: highEnergy, maxSize: 10, minSize: 2, pulseOnBeat: false }      // High-range
        ];

        particles.forEach((particle, index) => {
            const band = bands[index % 4]; // Divide particles into 4 frequency groups
            this.adjustParticle(particle, {
                ...band,
                speed: overallEnergy,
                beatDetected
            });
        });
    }

    calculatePeakEnergy(range) {
        const average = this.calculateAverage(range);
        const peak = Math.max(...range);
        return (average + peak) / (2 * 256); // Normalized between 0 and 1
    }

    adjustParticle(particle, config) {
        const {
            energy,
            speed,
            maxSize,
            minSize,
            pulseOnBeat,
            beatDetected
        } = config;

        // Smooth acceleration using exponential moving average
        const acceleration = 0.15 * this.visualizerSettings.sensitivity;
        const targetSpeed = speed * 3 * this.visualizerSettings.sensitivity;

        // Update velocity with smooth transition
        particle.velocity.x += (Math.random() * 2 - 1) * (targetSpeed - Math.abs(particle.velocity.x)) * acceleration;
        particle.velocity.y += (Math.random() * 2 - 1) * (targetSpeed - Math.abs(particle.velocity.y)) * acceleration;

        // Apply velocity limits
        const maxVelocity = 5 * this.visualizerSettings.sensitivity;
        particle.velocity.x = Math.max(Math.min(particle.velocity.x, maxVelocity), -maxVelocity);
        particle.velocity.y = Math.max(Math.min(particle.velocity.y, maxVelocity), -maxVelocity);

        // Size pulsing based on energy and beats
        const baseSize = minSize + (maxSize - minSize) * energy;
        let targetSize = baseSize;

        if (pulseOnBeat && beatDetected) {
            targetSize *= 1.5; // Pulse effect on beat
        }

        // Smooth size transition
        particle.size.value += (targetSize - particle.size.value) * 0.1;

        // Dynamic opacity based on energy
        if (particle.opacity) {
            particle.opacity.value = 0.3 + energy * 0.7;
        }
    }

    async updateVisualization() {
        if (!this.ownsContainer) return; // host owns the config

        if (this.container) {
            this.container.destroy();
        }
        this.container = await tsParticles.load(this.containerId, this.buildConfig());
    }

    applyCurrentSettings(config) {
        return {
            ...config,
            particles: {
                ...config.particles,
                number: {
                    ...config.particles.number,
                    value: this.visualizerSettings.particleCount
                },
                color: {
                    value: this.getParticleColors()
                },
                links: {
                    ...config.particles.links,
                    color: this.getLinkColor(config)
                }
            }
        };
    }

    // Settings updates
    updateSettings(newSettings) {
        this.visualizerSettings = {
            ...this.visualizerSettings,
            ...newSettings
        };
        return this.updateVisualization();
    }

    setMode(mode) {
        this.currentMode = mode;
        return this.updateVisualization();
    }

    setColorPalette(paletteName) {
        if (COLOR_PALETTES[paletteName]) {
            return this.updateSettings({ palette: paletteName });
        }
    }

    getParticleColors() {
        switch (this.visualizerSettings.colorMode) {
            case 'solid':
                return this.visualizerSettings.baseColor;
            case 'gradient':
                return [
                    this.visualizerSettings.baseColor,
                    shiftHue(this.visualizerSettings.baseColor, 60),
                    shiftHue(this.visualizerSettings.baseColor, 120)
                ];
            default: // spectrum: use the selected palette
                return COLOR_PALETTES[this.visualizerSettings.palette].colors;
        }
    }

    getLinkColor(config) {
        if (this.visualizerSettings.colorMode === 'spectrum') {
            return COLOR_PALETTES[this.visualizerSettings.palette].colors[0];
        }
        return config.particles.links?.color ?? '#ffffff';
    }

    calculateAverage(array) {
        return array.length ?
            array.reduce((sum, value) => sum + value, 0) / array.length : 0;
    }

    // Cleanup
    dispose() {
        this.stopVisualization();
        if (this.ownsContainer && this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}
