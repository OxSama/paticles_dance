import { defaultParticleConfig } from './defaultConfig.js';

export const visualizationModes = {
    "particles": {
        name: "Particles Dance",
        description: "Particles move and react to the music's intensity",
        config: defaultParticleConfig
    },
    
    "wave": {
        name: "Wave Form",
        description: "Particles move in a wave pattern synced to the music",
        config: {
            ...defaultParticleConfig,
            particles: {
                ...defaultParticleConfig.particles,
                move: {
                    ...defaultParticleConfig.particles.move,
                    direction: "top",
                    straight: true
                }
            }
        }
    },
    
    "circular": {
        name: "Circular Motion",
        description: "Particles orbit around a central point, reacting to the music",
        config: {
            ...defaultParticleConfig,
            particles: {
                ...defaultParticleConfig.particles,
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    outModes: {
                        default: "out"
                    },
                    attract: {
                        enable: true,
                        rotate: {
                            x: 600,
                            y: 1200
                        }
                    }
                }
            }
        }
    },

    "pulse": {
        name: "Pulse",
        description: "Particles pulse with the beat of the music",
        config: {
            ...defaultParticleConfig,
            particles: {
                ...defaultParticleConfig.particles,
                opacity: {
                    value: { min: 0.1, max: 0.5 },
                    animation: {
                        enable: true,
                        speed: 1,
                        sync: true
                    }
                },
                size: {
                    value: { min: 0.1, max: 5 },
                    animation: {
                        enable: true,
                        speed: 40,
                        sync: true
                    }
                }
            }
        }
    }
};

export const defaultVisualizerSettings = {
    sensitivity: 1.0,
    particleCount: 50,
    colorMode: 'spectrum',
    palette: 'sunset', // same colors the old default spectrum used
    baseColor: '#ffffff',
    mode: 'particles'
};

// Helper function to get mode config
export function getModeConfig(mode) {
    return visualizationModes[mode]?.config || visualizationModes['particles'].config;
}

// Helper function to get available modes
export function getAvailableModes() {
    return Object.entries(visualizationModes).map(([key, mode]) => ({
        id: key,
        name: mode.name,
        description: mode.description
    }));
}