const { obfuscator } = require('javascript-obfuscator');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
        transform: [{ obfuscate: true }],
      },
    }),
  },
  resolver: {
    sourceExts: ['tsx', 'ts', 'jsx', 'js'],
  },
};