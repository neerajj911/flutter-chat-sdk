import 'package:flutter/material.dart';
import 'package:flutter_chat_module/models/chat_user.dart';
import 'services/platform_channel.dart';
import 'screens/chat_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FlutterChatApp());
}

class FlutterChatApp extends StatefulWidget {
  const FlutterChatApp({super.key});

  @override
  State<FlutterChatApp> createState() => _FlutterChatAppState();
}

class _FlutterChatAppState extends State<FlutterChatApp> {
  ChatUser? _user;

  @override
  void initState() {
    super.initState();
    _initPlatformChannel();
  }

  Future<void> _initPlatformChannel() async {
    // Signal to Kotlin that Flutter is ready to receive data
    await PlatformChannel.signalReady();

    // Listen for user data sent from Kotlin bridge
    PlatformChannel.onInitData((user) {
      setState(() => _user = user);
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Chat',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0066FF)),
        useMaterial3: true,
      ),
      home: _user == null ? const _LoadingScreen() : ChatScreen(user: _user!),
    );
  }
}

class _LoadingScreen extends StatelessWidget {
  const _LoadingScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
// ci-fix
// granular-token
// new-token
// token-v3
// fix-release
// remove-release-step
// autolink
