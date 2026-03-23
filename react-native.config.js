module.exports = {
  dependency: {
    platforms: {
      android: {
        // When installed via GitHub, the android folder is nested inside the repo subfolder
        sourceDir: './flutter-chat-sdk/react-native-flutter-chat/android',
        packageImportPath: 'import com.flutterchat.sdk.FlutterChatPackage;',
        packageInstance: 'new FlutterChatPackage()',
      },
      ios: null,
    },
  },
};
