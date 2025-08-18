// transformer-obfuscator.js
const upstreamTransformer = require("metro-react-native-babel-transformer");
const JavaScriptObfuscator = require("javascript-obfuscator");

module.exports.transform = function ({ src, filename, options }) {
  // فقط فایل‌های js/ts/jsx/tsx را Obfuscate می‌کنیم
  const ext = filename.split('.').pop();
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
    const obfuscated = JavaScriptObfuscator.obfuscate(src, {
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      stringArrayEncoding: ['base64'],
    }).getObfuscatedCode();

    return upstreamTransformer.transform({
      src: obfuscated,
      filename,
      options,
    });
  }

  return upstreamTransformer.transform({ src, filename, options });
};
