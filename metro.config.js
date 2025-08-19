const { getDefaultConfig } = require("@react-native/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  return {
    ...config,
    resolver: {
      ...config.resolver,
      extraNodeModules: {
        ...config.resolver.extraNodeModules,
        // ✅ هرجا react-native-paper اشتباه material-design-icons رو صدا بزنه
        // به MaterialCommunityIcons اصلی هدایت میشه
        "@react-native-vector-icons/material-design-icons":
          require.resolve("react-native-vector-icons/MaterialCommunityIcons"),
      },
    },
  };
})();