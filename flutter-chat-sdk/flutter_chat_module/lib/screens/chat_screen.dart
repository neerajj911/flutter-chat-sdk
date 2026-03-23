import 'dart:async';
import 'dart:developer' as dev;
import 'package:flutter/material.dart';
import '../models/chat_user.dart';
import '../services/platform_channel.dart' hide debugPrint;
import '../widgets/message_bubble.dart';
import '../widgets/message_input.dart';

class ChatScreen extends StatefulWidget {
  final ChatUser user;

  const ChatScreen({super.key, required this.user});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with WidgetsBindingObserver {
  final List<ChatMessage> _messages = [];
  final ScrollController _scrollController = ScrollController();
  Timer? _debugTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadDemoMessages();
    _startDebugTimer();
  }

  void _startDebugTimer() {
    _debugTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      dev.log(
        'Still active — user: ${widget.user.name} (${widget.user.id})',
        name: 'ChatScreen',
      );
    });
  }

  // Pause timer when app goes to background, resume when it comes back
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _startDebugTimer();
    } else if (state == AppLifecycleState.paused) {
      _debugTimer?.cancel();
    }
  }

  void _loadDemoMessages() {
    setState(() {
      _messages.addAll([
        ChatMessage(
          id: '1',
          senderId: 'support',
          text: 'Hi ${widget.user.name}! Welcome to chat support 👋',
          timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
          isMe: false,
        ),
        ChatMessage(
          id: '2',
          senderId: 'support',
          text: 'How can we help you today?',
          timestamp: DateTime.now().subtract(const Duration(minutes: 4)),
          isMe: false,
        ),
      ]);
    });
  }

  void _sendMessage(String text) {
    if (text.trim().isEmpty) return;

    setState(() {
      _messages.add(ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        senderId: widget.user.id,
        text: text.trim(),
        timestamp: DateTime.now(),
        isMe: true,
      ));
    });

    // Scroll to bottom
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<bool> _onWillPop() async {
    // Notify RN that chat was closed
    await PlatformChannel.sendEvent('chatClosed', {'userId': widget.user.id});
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      onPopInvoked: (_) => _onWillPop(),
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: const Color(0xFF0066FF),
          foregroundColor: Colors.white,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Chat Support',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              Text(
                widget.user.name,
                style: const TextStyle(
                    fontSize: 12, fontWeight: FontWeight.normal),
              ),
              Text(
                widget.user.email,
                style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.normal,
                    color: Color(0xFFCCDDFF)),
              ),
            ],
          ),
        ),
        body: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(vertical: 12),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  return MessageBubble(message: _messages[index]);
                },
              ),
            ),
            MessageInput(onSend: _sendMessage),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _debugTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    _scrollController.dispose();
    super.dispose();
  }
}
