import 'package:flutter/services.dart';
import '../models/chat_user.dart';

/// Handles all communication between Flutter and the Kotlin bridge.
class PlatformChannel {
  PlatformChannel._();

  static const _channel = MethodChannel('com.flutterchat.sdk/bridge');

  /// Tell Kotlin that Flutter's UI is mounted and ready to receive data.
  static Future<void> signalReady() async {
    try {
      await _channel.invokeMethod('flutterReady');
    } on PlatformException catch (e) {
      // Non-fatal — Kotlin may not be listening yet in dev mode
      debugPrint('[PlatformChannel] signalReady error: ${e.message}');
    }
  }

  /// Register a callback that fires when Kotlin sends user init data.
  static void onInitData(void Function(ChatUser user) callback) {
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'initData') {
        final map = Map<dynamic, dynamic>.from(call.arguments as Map);
        callback(ChatUser.fromMap(map));
      }
    });
  }

  /// Send an event back to React Native (e.g. chat closed, unread count).
  static Future<void> sendEvent(String event, [Map<String, dynamic>? data]) async {
    try {
      await _channel.invokeMethod('rnEvent', {
        'event': event,
        ...?data,
      });
    } on PlatformException catch (e) {
      debugPrint('[PlatformChannel] sendEvent error: ${e.message}');
    }
  }
}

// ignore: avoid_print
void debugPrint(String message) => print(message);
