const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const sdkPath = path.resolve(__dirname, '../react-native-flutter-chat');

const config = {
  watchFolders: [sdkPath],
  resolver: {
    extraNodeModules: {
      'react-native-flutter-chat': sdkPath,
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
      'react': path.resolve(__dirname, 'node_modules/react'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
