// Mock Web Audio API
class AudioContextMock {
    constructor() {
        this.state = 'suspended';
        this.destination = {};
    }

    createAnalyser() {
        return {
            connect: jest.fn(),
            disconnect: jest.fn(),
            fftSize: 2048,
            frequencyBinCount: 1024,
            getByteFrequencyData: jest.fn(array => {
                for (let i = 0; i < array.length; i++) {
                    array[i] = Math.floor(Math.random() * 256);
                }
            })
        };
    }

    createGain() {
        return {
            connect: jest.fn(),
            disconnect: jest.fn(),
            gain: { value: 1 }
        };
    }

    createMediaElementSource() {
        return {
            connect: jest.fn(),
            disconnect: jest.fn()
        };
    }

    resume() {
        this.state = 'running';
        return Promise.resolve();
    }

    suspend() {
        this.state = 'suspended';
        return Promise.resolve();
    }

    close() {
        this.state = 'closed';
        return Promise.resolve();
    }
}

global.AudioContext = AudioContextMock;
global.webkitAudioContext = AudioContextMock;

// jsdom doesn't implement media playback - emulate it, firing the real events
window.HTMLMediaElement.prototype.play = jest.fn(function () {
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
});
window.HTMLMediaElement.prototype.pause = jest.fn(function () {
    this.dispatchEvent(new Event('pause'));
});
window.HTMLMediaElement.prototype.load = jest.fn();

// jsdom lacks object URLs
global.URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
