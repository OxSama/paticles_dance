// Jest sets NODE_ENV=test; everywhere else keep ES modules so rollup can bundle
const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
      modules: isTest ? 'commonjs' : false
    }],
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
};