const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');

const packageJson = require('./package.json');

const babelOptions = {
  babelHelpers: 'runtime',
  exclude: 'node_modules/**',
  plugins: ['@babel/plugin-transform-runtime'],
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['last 2 versions', 'not dead']
      },
      modules: false
    }]
  ]
};

module.exports = [
  // UMD build (for browsers)
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/audio-visualizer.min.js',
        format: 'umd',
        name: 'AudioVisualizer',
        exports: 'named',
        plugins: [terser()],
        sourcemap: true
      },
      {
        file: 'dist/audio-visualizer.js',
        format: 'umd',
        name: 'AudioVisualizer',
        exports: 'named',
        sourcemap: true
      }
    ],
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      babel(babelOptions)
    ]
  },
  // ESM build (for bundlers) - tsparticles stays external, consumers provide it
  {
    input: 'src/index.js',
    external: ['tsparticles-engine', 'tsparticles-slim', /@babel\/runtime/],
    output: [
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      babel(babelOptions)
    ]
  }
];