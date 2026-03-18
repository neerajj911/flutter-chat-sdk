import { NativeModules, Platform } from 'react-native';
import type { OpenChatOptions } from './types';

const { FlutterChatModule } = NativeModules;

/**
 * Validates that the native module was linked correctly.
 */
function assertNativeModule() {
  if (!FlutterChatModule) {
    throw new Error(
      '[react-native-flutter-chat] Native module not found.\n' +
      'Make sure you have:\n' +
      '  1. Added the SDK dependency in android/build.gradle\n' +
      '  2. Added FlutterChatPackage() in MainApplication.kt\n' +
      '  3. Re-run "npx react-native run-android"\n'
    );
  }

  if (Platform.OS !== 'android') {
    throw new Error(
      '[react-native-flutter-chat] iOS is not supported yet. Android only.'
    );
  }
}

/**
 * Opens the Flutter-powered chat screen as a full-screen activity.
 *
 * @example
 * import { openFlutterChat } from 'react-native-flutter-chat';
 *
 * openFlutterChat({ id: '123', name: 'John', email: 'john@gmail.com' });
 */
export function openFlutterChat(options: OpenChatOptions): void {
  assertNativeModule();

  const { id, name, email } = options;

  if (!id || !name || !email) {
    throw new Error(
      '[react-native-flutter-chat] openFlutterChat() requires id, name, and email.'
    );
  }

  FlutterChatModule.openChat({ id, name, email });
}

export type { OpenChatOptions, ChatUser, ChatConfig } from './types';
