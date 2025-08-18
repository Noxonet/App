// metro.config.js
const { getDefaultConfig } = require("@react-native/metro-config");
const JavaScriptObfuscator = require('javascript-obfuscator');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('./transformer-obfuscator.js'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: ['tsx', 'ts', 'jsx', 'js', 'json'],
  },
};
