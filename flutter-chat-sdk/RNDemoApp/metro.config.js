const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro is configured to watch the local react-native-flutter-chat package
 * so changes there are reflected instantly without re-linking.
 */
const sdkPath = path.resolve(__dirname, '../react-native-flutter-chat');

const config = {
  watchFolders: [sdkPath],
  resolver: {
    extraNodeModules: {
      'react-native-flutter-chat': sdkPath,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
