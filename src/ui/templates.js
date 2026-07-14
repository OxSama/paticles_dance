export const controlPanelTemplate = `
    <div class="fixed top-4 right-4 bg-black bg-opacity-50 p-4 rounded-lg text-white z-20 backdrop-blur-sm">
        <div class="flex flex-col space-y-4">
            <!-- Audio Controls Section -->
            <div class="border-b border-gray-600 pb-4">
                <h3 class="text-sm font-medium mb-3">Audio Controls</h3>

                <!-- Audio Source -->
                <div class="mb-4">
                    <label class="block text-xs font-medium mb-1">Audio File</label>
                    <input type="file" id="audioFileInput" accept="audio/*"
                           class="block w-full text-xs text-gray-300">
                    <label class="block text-xs font-medium mt-2 mb-1">Or Audio URL</label>
                    <div class="flex space-x-2">
                        <input type="url" id="audioUrlInput" placeholder="https://..."
                               class="flex-grow rounded-md bg-gray-700 border-transparent text-sm px-2 py-1">
                        <button id="loadUrlBtn"
                                class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">Load</button>
                    </div>
                </div>

                <!-- Playback Controls -->
                <div class="flex items-center justify-between mb-4">
                    <button id="prevTrack" class="text-white hover:text-blue-400 transition-colors">
                        <i class="fas fa-backward"></i>
                    </button>
                    <button id="playPauseBtn" class="text-white hover:text-blue-400 transition-colors text-xl">
                        <i class="fas fa-play"></i>
                    </button>
                    <button id="stopBtn" class="text-white hover:text-blue-400 transition-colors">
                        <i class="fas fa-stop"></i>
                    </button>
                    <button id="nextTrack" class="text-white hover:text-blue-400 transition-colors">
                        <i class="fas fa-forward"></i>
                    </button>
                    <button id="loopBtn" class="text-white hover:text-blue-400 transition-colors opacity-50">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>

                <!-- Volume Controls -->
                <div class="flex items-center space-x-2">
                    <button id="muteBtn" class="text-white hover:text-blue-400 transition-colors">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <div class="flex-grow">
                        <input type="range" id="volumeControl" 
                               class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                               min="0" max="100" value="100">
                    </div>
                </div>

                <!-- Track Progress -->
                <div class="mt-2">
                    <div class="flex items-center space-x-2 text-xs">
                        <span id="currentTime">0:00</span>
                        <div class="flex-grow">
                            <input type="range" id="seekBar" 
                                   class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                   min="0" max="100" value="0">
                        </div>
                        <span id="duration">0:00</span>
                    </div>
                </div>
                <div class="track-info-container"></div>
            </div>

            <!-- Visualization Controls -->
            <div>
                <h3 class="text-sm font-medium mb-3">Visualization</h3>
                <div>
                    <label class="block text-sm font-medium">Mode</label>
                    <select id="vizMode" class="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0 text-sm">  
                    </select>
                </div>
                
                <div class="mt-3">
                    <label class="block text-sm font-medium">Sensitivity</label>
                    <input type="range" id="sensitivity" min="0.1" max="2" step="0.1" value="1" 
                           class="mt-1 block w-full">
                </div>
                
                <div class="mt-3">
                    <label class="block text-sm font-medium">Particle Count</label>
                    <input type="range" id="particleCount" min="20" max="200" value="50" 
                           class="mt-1 block w-full">
                </div>
                
                <div class="mt-3">
                    <label class="block text-sm font-medium">Color Mode</label>
                    <select id="colorMode" class="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0 text-sm">
                        <option value="spectrum">Spectrum</option>
                        <option value="solid">Solid</option>
                        <option value="gradient">Gradient</option>
                    </select>
                </div>
                
                <div id="colorPicker" class="mt-3 hidden">
                    <label class="block text-sm font-medium">Base Color</label>
                    <input type="color" id="baseColor" value="#ffffff" 
                           class="mt-1 block w-full h-8 rounded-md">
                </div>
                
                <div class="mt-3">
                    <label class="block text-sm font-medium">Color Palette</label>
                    <select id="colorPalette" class="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0 text-sm">
                        <option value="neon">Neon Dreams</option>
                        <option value="sunset">Sunset Vibes</option>
                        <option value="aurora">Aurora Lights</option>
                        <option value="retro">Retro Wave</option>
                        <option value="galaxy">Galaxy</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
`;


// export const toggleButtonTemplate = `
//     <button id="controlPanelToggle" class="fixed top-4 right-4 bg-black bg-opacity-50 p-2 rounded-lg text-white z-20 hover:bg-opacity-70 transition-all duration-200 backdrop-blur-sm hidden">
//         <i class="fas fa-cog text-xl"></i>
//     </button>
// `;


export const trackInfoTemplate = (trackName) => `
    <div class="flex flex-col items-center space-y-1">
        <p class="text-xs text-gray-300">Now Playing:</p>
        <p class="font-bold text-sm">${trackName}</p>
    </div>
`;

export const loadingTemplate = `
    <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
`;

export const statsTemplate = (stats) => `
    <div class="text-sm">
        <div>FPS: ${stats.fps}</div>
        <div>Particles: ${stats.particles}</div>
        <div>Audio Level: ${stats.audioLevel}%</div>
    </div>
`;