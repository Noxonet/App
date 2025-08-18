const { getDefaultConfig } = require("@react-native/metro-config");

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    sourceExts: ['tsx', 'ts', 'jsx', 'js', 'json'],
  },
};
