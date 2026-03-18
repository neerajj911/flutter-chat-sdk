class ChatUser {
  final String id;
  final String name;
  final String email;

  const ChatUser({
    required this.id,
    required this.name,
    required this.email,
  });

  factory ChatUser.fromMap(Map<dynamic, dynamic> map) {
    return ChatUser(
      id: map['id']?.toString() ?? '',
      name: map['name']?.toString() ?? 'Unknown',
      email: map['email']?.toString() ?? '',
    );
  }

  Map<String, String> toMap() => {
        'id': id,
        'name': name,
        'email': email,
      };

  @override
  String toString() => 'ChatUser(id: $id, name: $name, email: $email)';
}

class ChatMessage {
  final String id;
  final String senderId;
  final String text;
  final DateTime timestamp;
  final bool isMe;

  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.text,
    required this.timestamp,
    required this.isMe,
  });
}
