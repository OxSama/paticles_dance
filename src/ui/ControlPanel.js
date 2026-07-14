import { controlPanelTemplate, trackInfoTemplate } from './templates.js';
import { formatTime, calculateProgress, percentageToTime } from '../utils/timeUtils.js';
import { visualizationModes } from '../config/visualModes.js';


const ANIMATION = {
    DURATION: 300,
    CLASSES: {
        SLIDE: 'control-panel-slide',
        HIDDEN: 'hidden',
        FADE: 'control-panel-fade'
    }
};

export default class ControlPanel {
    constructor(audioCore, visualizer) {
        this.audioCore = audioCore;
        this.visualizer = visualizer;
        this.elements = {};
        this.isVisible = false;

        this.boundEventHandlers = new Map();
        
        // this.setupStyles();
        // this.render();
        // this.bindElements();
        // this.setupEventListeners();
        // this.populateVisualizationModes();
        // this.initializeHiddenState();

        this.init();
    }

    init() {
        this.setupStyles();
        this.render();
        this.bindElements();
        this.setupEventListeners();
        this.populateVisualizationModes();
        this.initializeHiddenState();
    }

    setupStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .control-panel-slide {
                transform: translateX(0);
                opacity: 1;
                transition: all ${ANIMATION.DURATION}ms ease-out;
                position: fixed;
                top: 1rem;
                right: 1rem;
                margin: 0;
            }
            
            .control-panel-slide.hidden {
                transform: translateX(20px);
                opacity: 0;
                pointer-events: none;
            }
            
            .toggle-button-slide {
                transform: translateX(0);
                opacity: 1;
                transition: all ${ANIMATION.DURATION}ms ease-out;
            }
            
            .toggle-button-slide.hidden {
                transform: translateX(20px);
                opacity: 0;
            }
            
            @keyframes fadeIn {
                from { 
                    transform: translateX(20px);
                    opacity: 0;
                }
                to { 
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .control-panel-fade {
                animation: fadeIn ${ANIMATION.DURATION}ms ease-out forwards;
            }
            
            .toggle-button-slide:hover {
                transform: scale(1.1);
                transition: transform 0.2s ease-out;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    render() {
        this.renderToggleButton();
        this.renderControlPanel();
    }


    renderToggleButton() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'controlPanelToggle';
        toggleBtn.className = 'fixed top-4 right-4 bg-black bg-opacity-50 p-2 rounded-lg text-white z-20 hover:bg-opacity-70 backdrop-blur-sm toggle-button-slide';
        toggleBtn.innerHTML = '<i class="fas fa-cog text-xl"></i>';
        document.body.appendChild(toggleBtn);
    }

    renderControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.id = 'mainControlPanel';
        controlPanel.className = 'control-panel-slide fixed top-4 right-4 hidden';
        controlPanel.style.display = 'none';
        
        const modifiedTemplate = this.getModifiedTemplate();
        controlPanel.innerHTML = modifiedTemplate;
        document.body.appendChild(controlPanel);
    }

    getModifiedTemplate() {
        return controlPanelTemplate.replace(
            '<div class="flex flex-col space-y-4">',
            `<div class="flex flex-col space-y-4">
                <div class="flex justify-end">
                    <button id="closeControlPanel" class="hover:text-blue-400 transition-colors transform hover:scale-110 duration-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>`
        );
    }

    bindElements() {
        this.elements = {

            controlPanel: document.getElementById('mainControlPanel'),
            toggleButton: document.getElementById('controlPanelToggle'),
            closeButton: document.getElementById('closeControlPanel'),

            playPauseBtn: document.getElementById('playPauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            prevTrack: document.getElementById('prevTrack'),
            nextTrack: document.getElementById('nextTrack'),
            loopBtn: document.getElementById('loopBtn'),
            muteBtn: document.getElementById('muteBtn'),
            volumeControl: document.getElementById('volumeControl'),
            seekBar: document.getElementById('seekBar'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            vizMode: document.getElementById('vizMode'),
            sensitivity: document.getElementById('sensitivity'),
            particleCount: document.getElementById('particleCount'),
            colorMode: document.getElementById('colorMode'),
            baseColor: document.getElementById('baseColor'),
            colorPicker: document.getElementById('colorPicker'),
            audioFileInput: document.getElementById('audioFileInput'),
            audioUrlInput: document.getElementById('audioUrlInput'),
            loadUrlBtn: document.getElementById('loadUrlBtn'),
            trackInfo: document.querySelector('.track-info-container')
        };

        // Reflect the saved volume in the slider
        this.elements.volumeControl.value = this.audioCore.audioControls.volume * 100;
    }

    populateVisualizationModes() {
        const vizModeSelect = document.getElementById('vizMode');
        if (vizModeSelect) {
            Object.entries(visualizationModes).forEach(([key, mode]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = mode.name;
                vizModeSelect.appendChild(option);
            });
        }
    }

    setupEventListeners() {

        this.boundEventHandlers.set('transitionend', this.handleTransitionEnd.bind(this));
        this.boundEventHandlers.set('keydown', this.handleKeyPress.bind(this));

        // Add listeners with error handling
        this.safeAddEventListener(
            this.elements.controlPanel, 
            'transitionend', 
            this.boundEventHandlers.get('transitionend')
        );

        this.safeAddEventListener(
            document,
            'keydown',
            this.boundEventHandlers.get('keydown')
        );

        this.elements.controlPanel.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'transform' && !this.isVisible) {
                this.elements.controlPanel.style.display = 'none';
            }
        });

        this.elements.closeButton.addEventListener('click', () => this.hidePanel());
        this.elements.toggleButton.addEventListener('click', () => this.showPanel());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hidePanel();
            }
        });

        // Keep the play/pause icon in sync with the element, whatever triggered the change
        this.audioCore.audio.addEventListener('play', () => {
            this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        });
        this.audioCore.audio.addEventListener('pause', () => {
            this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        });
        this.audioCore.audio.addEventListener('timeupdate', () => {
            this.updateTimeDisplay(this.audioCore.currentTime, this.audioCore.duration);
        });

        this.elements.playPauseBtn.addEventListener('click', () => {
            if (this.audioCore.state.isPlaying) {
                this.audioCore.handlePause();
            } else {
                this.audioCore.handlePlay();
            }
        });

        this.elements.stopBtn.addEventListener('click', () => {
            this.audioCore.handleStop();
        });

        this.elements.muteBtn.addEventListener('click', () => {
            const muted = this.audioCore.toggleMute();
            this.elements.muteBtn.innerHTML =
                `<i class="fas fa-volume-${muted ? 'mute' : 'up'}"></i>`;
        });

        this.elements.loopBtn.addEventListener('click', () => {
            const looping = this.audioCore.toggleLoop();
            this.elements.loopBtn.classList.toggle('opacity-50', !looping);
        });

        this.elements.seekBar.addEventListener('input', (e) => {
            this.audioCore.seekTo(percentageToTime(e.target.value, this.audioCore.duration));
        });

        this.elements.audioFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.audioCore.loadFile(file);
                this.updateTrackInfo(file.name);
            }
        });

        this.elements.loadUrlBtn.addEventListener('click', async () => {
            const url = this.elements.audioUrlInput.value.trim();
            if (url) {
                await this.audioCore.loadUrl(url, true);
                this.updateTrackInfo(url.split('/').pop().split('?')[0] || url);
            }
        });

        this.elements.prevTrack.addEventListener('click', () => {
            this.audioCore.playlist.currentIndex = 
                (this.audioCore.playlist.currentIndex - 1 + this.audioCore.playlist.tracks.length) 
                % this.audioCore.playlist.tracks.length;
            this.audioCore.loadTrack(this.audioCore.playlist.currentIndex, true);
        });

        this.elements.nextTrack.addEventListener('click', () => {
            this.audioCore.playlist.currentIndex = 
                (this.audioCore.playlist.currentIndex + 1) 
                % this.audioCore.playlist.tracks.length;
            this.audioCore.loadTrack(this.audioCore.playlist.currentIndex, true);
        });

        this.elements.volumeControl.addEventListener('input', (e) => {
            this.audioCore.audioControls.volume = e.target.value / 100;
            this.audioCore.updateVolume();
        });

        this.elements.vizMode.addEventListener('change', (e) => {
            this.visualizer.setMode(e.target.value);
        });

        this.elements.sensitivity.addEventListener('input', (e) => {
            this.visualizer.updateSettings({ sensitivity: parseFloat(e.target.value) });
        });

        this.elements.particleCount.addEventListener('input', (e) => {
            this.visualizer.updateSettings({ particleCount: parseInt(e.target.value) });
        });

        this.elements.colorMode.addEventListener('change', (e) => {
            this.visualizer.updateSettings({ colorMode: e.target.value });
            this.elements.colorPicker.style.display = 
                e.target.value === 'solid' ? 'block' : 'none';
        });

        this.elements.colorPalette = document.getElementById('colorPalette');
        this.elements.colorPalette.addEventListener('change', (e) => {
            this.visualizer.setColorPalette(e.target.value);
        });
    }


    safeAddEventListener(element, event, handler) {
        try {
            if (element) {
                element.addEventListener(event, handler);
            }
        } catch (error) {
            console.error(`Error adding ${event} listener:`, error);
        }
    }

    handleTransitionEnd(e) {
        if (e.propertyName === 'transform' && !this.isVisible) {
            this.elements.controlPanel.style.display = 'none';
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Escape' && this.isVisible) {
            this.hidePanel();
        }
    }

    async hidePanel() {
        this.isVisible = false;
        const { controlPanel, toggleButton } = this.elements;

        controlPanel.classList.add(ANIMATION.CLASSES.HIDDEN);
        
        await this.wait(ANIMATION.DURATION);
        
        toggleButton.style.display = 'block';
        toggleButton.classList.remove(ANIMATION.CLASSES.HIDDEN);
        
        await this.wait(ANIMATION.DURATION);
        
        controlPanel.style.display = 'none';
    }

     showPanel() {
        this.isVisible = true;
        const { controlPanel, toggleButton } = this.elements;

        toggleButton.classList.add(ANIMATION.CLASSES.HIDDEN);
        
        controlPanel.style.minWidth = '300px';
        controlPanel.style.display = 'block';
        
        // Force reflow
        controlPanel.offsetHeight;
        
        controlPanel.classList.remove(ANIMATION.CLASSES.HIDDEN);
        
        this.wait(ANIMATION.DURATION);
        
        toggleButton.style.display = 'none';
        
        controlPanel.classList.add(ANIMATION.CLASSES.FADE);
        
        this.wait(ANIMATION.DURATION);
        
        controlPanel.classList.remove(ANIMATION.CLASSES.FADE);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initializeHiddenState() {
        const panel = document.getElementById('mainControlPanel');
        const toggleBtn = document.getElementById('controlPanelToggle');
        
        if (panel && toggleBtn) {
            // Hide panel initially
            panel.classList.add('hidden');
            panel.style.display = 'none';
            
            // Show toggle button initially
            toggleBtn.classList.remove('hidden');
            toggleBtn.style.display = 'block';
        }
    }

    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    updateTrackInfo(trackName) {
        if (this.elements.trackInfo) {
            this.elements.trackInfo.innerHTML = trackInfoTemplate(trackName);
        }
    }

    updateTimeDisplay(currentTime, duration) {
        this.elements.currentTime.textContent = formatTime(currentTime || 0);
        this.elements.duration.textContent = formatTime(duration || 0);
        this.elements.seekBar.value = calculateProgress(currentTime, duration);
    }
    
}