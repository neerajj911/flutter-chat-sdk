import { NativeModules, Platform } from 'react-native';
import type { OpenChatOptions } from './types';

const { FlutterChatModule } = NativeModules;

/**
 * Validates that the native module was linked correctly.
 * Returns false (no-op) on non-Android platforms instead of throwing.
 */
function assertNativeModule(): boolean {
  if (Platform.OS !== 'android') {
    console.warn(
      '[react-native-flutter-chat] iOS is not supported yet. ' +
      'openFlutterChat() is a no-op on this platform.'
    );
    return false;
  }

  if (!FlutterChatModule) {
    throw new Error(
      '[react-native-flutter-chat] Native module not found.\n' +
      'Make sure you have:\n' +
      '  1. Run "npm install react-native-flutter-chat" (postinstall patches Android files)\n' +
      '  2. Run "npx react-native run-android" to trigger autolinking\n' +
      '  3. Rebuild the app if it was already running\n'
    );
  }

  return true;
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
  if (!assertNativeModule()) return;

  const { id, name, email } = options;

  if (!id || !name || !email) {
    throw new Error(
      '[react-native-flutter-chat] openFlutterChat() requires id, name, and email.'
    );
  }

  FlutterChatModule.openChat({ id, name, email });
}

export type { OpenChatOptions, ChatUser, ChatConfig } from './types';
