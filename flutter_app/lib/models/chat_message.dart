enum MessageSender { user, assistant }

class ChatMessage {
  final String id;
  final MessageSender sender;
  final String text;
  final DateTime timestamp;
  final bool isVoice;
  final String? attachmentPath;

  ChatMessage({
    required this.id,
    required this.sender,
    required this.text,
    required this.timestamp,
    this.isVoice = false,
    this.attachmentPath,
  });
}
