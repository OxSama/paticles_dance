import VisualizerEngine from '../src/core/VisualizerEngine';
import AudioCore from '../src/core/AudioCore';
import { tsParticles } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';

jest.mock('tsparticles-engine', () => ({
    tsParticles: { load: jest.fn() }
}));
jest.mock('tsparticles-slim', () => ({
    loadSlim: jest.fn()
}));

const makeParticle = () => ({
    velocity: { x: 0, y: 0 },
    size: { value: 5 },
    opacity: { value: 0.5 }
});

describe('VisualizerEngine', () => {
    let visualizer;
    let audioCore;
    let mockContainer;

    beforeEach(async () => {
        jest.clearAllMocks();

        mockContainer = {
            particles: { array: Array.from({ length: 8 }, makeParticle) },
            destroy: jest.fn()
        };
        tsParticles.load.mockResolvedValue(mockContainer);

        audioCore = new AudioCore();
        visualizer = new VisualizerEngine(audioCore, { containerId: 'particles-js' });
        await visualizer.ready;
    });

    afterEach(() => {
        if (visualizer) {
            visualizer.dispose();
        }
        if (audioCore) {
            audioCore.dispose();
        }
    });

    test('should initialize with default settings', () => {
        expect(visualizer.currentMode).toBe('particles');
        expect(visualizer.visualizerSettings.sensitivity).toBe(1);
        expect(visualizer.visualizerSettings.particleCount).toBe(50);
        expect(loadSlim).toHaveBeenCalled();
        expect(tsParticles.load).toHaveBeenCalledWith('particles-js', expect.any(Object));
    });

    test('should update settings and reload particles', async () => {
        await visualizer.updateSettings({
            sensitivity: 1.5,
            particleCount: 100
        });
        expect(visualizer.visualizerSettings.sensitivity).toBe(1.5);
        expect(visualizer.visualizerSettings.particleCount).toBe(100);
        expect(mockContainer.destroy).toHaveBeenCalled();
        const lastConfig = tsParticles.load.mock.calls.at(-1)[1];
        expect(lastConfig.particles.number.value).toBe(100);
    });

    test('should change visualization mode', async () => {
        await visualizer.setMode('wave');
        expect(visualizer.currentMode).toBe('wave');
        const lastConfig = tsParticles.load.mock.calls.at(-1)[1];
        expect(lastConfig.particles.move.direction).toBe('top');
    });

    test('should change color palette', async () => {
        await visualizer.setColorPalette('neon');
        expect(visualizer.visualizerSettings.palette).toBe('neon');
        const lastConfig = tsParticles.load.mock.calls.at(-1)[1];
        expect(lastConfig.particles.color.value).toContain('#FF00FF');
    });

    test('should calculate peak energy correctly', () => {
        const testData = new Uint8Array([128, 255, 64, 192]);
        const energy = visualizer.calculatePeakEnergy(testData);
        expect(energy).toBeGreaterThan(0);
        expect(energy).toBeLessThanOrEqual(1);
    });

    test('should drive particles from audio data', () => {
        const mockData = new Uint8Array(1024);
        for (let i = 0; i < mockData.length; i++) {
            mockData[i] = Math.floor(Math.random() * 256);
        }

        visualizer.updateParticles(mockData);

        for (const particle of mockContainer.particles.array) {
            expect(particle.opacity.value).toBeGreaterThanOrEqual(0.3);
            expect(particle.opacity.value).toBeLessThanOrEqual(1);
        }
    });

    test('should not touch config when driving an external container', async () => {
        const external = { particles: { array: [makeParticle()] }, destroy: jest.fn() };
        const externallyDriven = new VisualizerEngine(audioCore, { container: external });
        await externallyDriven.ready;

        const loadCalls = tsParticles.load.mock.calls.length;
        await externallyDriven.setMode('wave');
        expect(tsParticles.load.mock.calls.length).toBe(loadCalls);

        externallyDriven.dispose();
        expect(external.destroy).not.toHaveBeenCalled();
    });

    test('should dispose properly', () => {
        visualizer.dispose();
        expect(visualizer.animationFrameId).toBeNull();
        expect(mockContainer.destroy).toHaveBeenCalled();
    });
});
