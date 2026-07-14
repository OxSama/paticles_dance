# Audio Particles Visualizer

A customizable audio visualization library that creates particle-based visualizations reacting to your music in real-time. Built on the Web Audio API and [tsparticles](https://particles.js.org/) v2.

## Features

- 🎵 Real-time frequency analysis (sub-bass / bass / mid / high bands)
- 📡 **Streaming playback** — audio starts playing immediately, like video, no full download needed
- 📁 Play from URLs or uploaded files
- 🎨 4 visualization modes: particles, wave, circular, pulse
- 🌈 5 color palettes: neon, sunset, aurora, retro, galaxy
- 🥁 Simple beat detection with pulse effects
- 🎛️ Optional built-in control panel
- ⚛️ Can drive an existing tsparticles container (plays nicely with react-particles)

## Installation

```bash
npm install audio-particles-visualizer tsparticles-engine tsparticles-slim
```

Or via CDN (tsparticles is bundled into the UMD build — one script tag is enough):

```html
<script src="https://unpkg.com/audio-particles-visualizer"></script>
```

## Quick Start

```html
<div id="particles-js"></div>
```

```javascript
const visualizer = new AudioVisualizer.default({
    container: '#particles-js',
    tracks: ['https://example.com/song.mp3'], // streamed, not downloaded up front
    settings: {
        sensitivity: 1.0,
        particleCount: 50
    }
});

// Must be triggered by a user gesture (browser autoplay policy)
playButton.addEventListener('click', () => visualizer.play());
```

With a bundler:

```javascript
import AudioVisualizer from 'audio-particles-visualizer';
```

### With the built-in control panel

```javascript
const visualizer = new AudioVisualizer.default({
    container: '#particles-js',
    showControls: true
});
```

The panel includes file upload, URL input, playback/seek/volume/loop controls and all
visualization settings. It is styled with [Tailwind CSS](https://tailwindcss.com) classes and
[Font Awesome](https://fontawesome.com) icons, so both must be loaded on the page:

```html
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.16/dist/tailwind.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
```

### Driving an existing tsparticles container (React example)

If your app already renders particles (e.g. with `react-particles`), hand the loaded
container to the visualizer and it will make *your* particles dance — your config stays
untouched:

```jsx
<Particles
    id="tsparticles"
    options={myOptions}
    loaded={async (container) => {
        const visualizer = new AudioVisualizer({
            particlesContainer: container,
            tracks: ['/music/track.mp3']
        });
    }}
/>
```

In this mode `setMode`, `setColorPalette`, and `particleCount` are no-ops — the host owns
the particle config; the library only drives movement, size, and opacity from the audio.

## API Reference

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| container | string/Element | — | Container element or selector (required unless particlesContainer is set) |
| particlesContainer | Container | — | Existing tsparticles container to drive |
| tracks | string[] | [] | Audio URLs, streamed and played in order |
| showControls | boolean | false | Render the built-in control panel (needs Tailwind + Font Awesome) |
| settings | object | see below | Visualization settings |

### Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| sensitivity | number | 1.0 | Audio reactivity (0.1–2.0) |
| particleCount | number | 50 | Number of particles |
| mode | string | 'particles' | Visualization mode |
| palette | string | 'sunset' | Color palette name |
| colorMode | string | 'spectrum' | 'spectrum', 'solid' or 'gradient' |
| baseColor | string | '#ffffff' | Base color for solid/gradient modes |

### Methods

```javascript
visualizer.play()                     // Start playback (returns Promise)
visualizer.pause()                    // Pause playback
visualizer.stop()                     // Stop playback
visualizer.seekTo(30)                 // Seek to 30s
visualizer.setVolume(0.5)             // Set volume (0-1)
visualizer.loadFile(file)             // Load a File (e.g. from <input type="file">)
visualizer.loadUrl(url, autoPlay)     // Stream an audio URL
visualizer.setMode('wave')            // Change visualization mode
visualizer.setColorPalette('sunset')  // Change color palette
visualizer.updateSettings({ sensitivity: 1.5, particleCount: 100 })
visualizer.dispose()                  // Clean up audio context and particles
await visualizer.ready                // Resolves once particles are created
```

### CORS note for remote audio

Audio is streamed through the Web Audio API, so remote files must be served with CORS
headers (`Access-Control-Allow-Origin`), or the analyser reads silence. Dropbox direct
links (`dl.dropboxusercontent.com`) and most CDNs send them.

## Modes

- `particles`: Classic particle movement
- `wave`: Upward wave motion
- `circular`: Orbiting motion around a central point
- `pulse`: Beat-reactive pulsing

## Color Palettes

- `neon`: Bright, cyberpunk-inspired colors
- `sunset`: Warm gradient colors
- `aurora`: Cool, northern lights colors
- `retro`: Synthwave aesthetic
- `galaxy`: Deep space colors

## Keyboard Shortcuts (with showControls)

- `Space`: Play/Pause
- `M`: Mute/Unmute
- `←/→`: Previous/Next track
- `Esc`: Close control panel

## Demo

Run a local server from the repo root and open `demo/index.html`:

```bash
npm run build
npx serve .
```

## Development

```bash
npm install
npm test        # jest
npm run build   # rollup → dist/
```

## Browser Support

Any browser with Web Audio API support (Chrome 49+, Firefox 52+, Safari 11+, Edge 79+).

## License

MIT © OxSama
