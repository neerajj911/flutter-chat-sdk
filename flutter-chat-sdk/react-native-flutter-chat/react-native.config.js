module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.flutterchat.sdk.FlutterChatPackage;',
        packageInstance: 'new FlutterChatPackage()',
      },
      ios: null,
    },
  },
};
