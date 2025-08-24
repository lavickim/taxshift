const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration for React Native CLI
 * https://facebook.github.io/metro/docs/configuration
 */
const config = {
  resolver: {
    alias: {
      'react-native-vector-icons': 'react-native-vector-icons',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);