module.exports = function (api) {
  api.cache(true)
  return {
    // `jsxImportSource: 'nativewind'` is what makes `className` exist on a
    // React Native component at all — without it every style silently does
    // nothing.
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: ['react-native-worklets/plugin'],
  }
}
