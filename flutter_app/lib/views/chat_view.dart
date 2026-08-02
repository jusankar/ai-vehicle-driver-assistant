import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import '../viewmodels/chat_viewmodel.dart';
import '../viewmodels/fleet_viewmodel.dart';
import '../models/chat_message.dart';

class ChatView extends StatefulWidget {
  final bool startVoice;
  const ChatView({super.key, this.startVoice = false});

  @override
  State<ChatView> createState() => _ChatViewState();
}

class _ChatViewState extends State<ChatView> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  late stt.SpeechToText _speech;
  bool _isListening = false;
  String _voiceText = "";

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    if (widget.startVoice) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _listen();
      });
    }
  }

  void _scrollToBottom() {
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

  void _listen() async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (val) => print('speech status: $val'),
        onError: (val) => print('speech error: $val'),
      );
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (val) => setState(() {
            _voiceText = val.recognizedWords;
            _controller.text = _voiceText;
          }),
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
      if (_controller.text.isNotEmpty) {
        _submitMessage(isVoice: true);
      }
    }
  }

  void _submitMessage({bool isVoice = false}) {
    final text = _controller.text;
    if (text.trim().isEmpty) return;
    
    _controller.clear();
    final chatVM = context.read<ChatViewModel>();
    final fleetVM = context.read<FleetViewModel>();
    
    chatVM.sendMessage(text, fleetVM, isVoice: isVoice);
    _scrollToBottom();
  }

  void _pickAndAnalyzeDocument() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'],
      );
      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        final fileName = file.name;
        final fileSize = (file.size / 1024).toStringAsFixed(1) + ' KB';
        
        _controller.text = 'Analyze document: "$fileName" ($fileSize). Extract key expenses, diesel liters, or vehicle plate numbers.';
        _submitMessage();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to pick document: $e')),
      );
    }
  }

  void _showServerSettingsDialog() {
    final chatVM = context.read<ChatViewModel>();
    final urlController = TextEditingController(text: chatVM.serverUrl);
    final keyController = TextEditingController(text: chatVM.apiKey);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.tune, color: Colors.blue),
            SizedBox(width: 8),
            Text('AI & Server Settings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Backend Server URL:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: urlController,
                decoration: InputDecoration(
                  hintText: 'https://ais-dev-...run.app or http://10.0.2.2:3000',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
              ),
              const SizedBox(height: 14),
              const Text(
                'Gemini API Key (Direct Device Fallback):',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: keyController,
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'Enter AIzaSy... API key',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
              ),
              const SizedBox(height: 10),
              const Text(
                'Enter your new Gemini API Key here to update mobile AI capabilities directly.',
                style: TextStyle(fontSize: 11, color: Colors.grey),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              chatVM.setServerUrl(urlController.text);
              if (keyController.text.trim().isNotEmpty) {
                chatVM.setApiKey(keyController.text.trim());
              }
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('AI settings updated successfully!')),
              );
            },
            child: const Text('Save Settings'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final chatVM = context.watch<ChatViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: theme.colorScheme.primaryContainer,
              child: Icon(Icons.auto_awesome, size: 16, color: theme.colorScheme.primary),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AI Fleet Assistant', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text('Online • Gemini 2.5 Flash', style: TextStyle(fontSize: 10, color: Colors.green)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune),
            tooltip: 'Server Settings',
            onPressed: _showServerSettingsDialog,
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Clear conversation',
            onPressed: () {
              chatVM.clearChat();
            },
          )
        ],
      ),
      body: Column(
        children: [
          // Message Thread
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16.0),
              itemCount: chatVM.messages.length,
              itemBuilder: (context, index) {
                final message = chatVM.messages[index];
                return _buildMessageBubble(context, message);
              },
            ),
          ),
          
          if (chatVM.isLoading)
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  const SizedBox(width: 12),
                  Text('Assistant is thinking...', style: theme.textTheme.bodySmall),
                ],
              ),
            ),

          // Bottom Entry Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              border: Border(top: BorderSide(color: theme.colorScheme.outlineVariant)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  // Attachment upload shortcut
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline),
                    tooltip: 'Attach PDF/Invoice',
                    onPressed: _pickAndAnalyzeDocument,
                  ),
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      maxLines: null,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _submitMessage(),
                      decoration: InputDecoration(
                        hintText: _isListening ? 'Listening...' : 'Ask about TN68AB1234, fuel logs...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(28),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: theme.colorScheme.surfaceContainerHighest,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  
                  // Speech / Voice trigger
                  GestureDetector(
                    onTap: _listen,
                    child: CircleAvatar(
                      backgroundColor: _isListening 
                          ? Colors.red 
                          : theme.colorScheme.primary,
                      foregroundColor: Colors.white,
                      child: Icon(_isListening ? Icons.mic_off : Icons.mic),
                    ),
                  ),
                  
                  const SizedBox(width: 8),
                  
                  // Text Submit
                  CircleAvatar(
                    backgroundColor: theme.colorScheme.primaryContainer,
                    foregroundColor: theme.colorScheme.onPrimaryContainer,
                    child: IconButton(
                      icon: const Icon(Icons.send),
                      onPressed: () => _submitMessage(),
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildMessageBubble(BuildContext context, ChatMessage message) {
    final theme = Theme.of(context);
    final isAssistant = message.sender == MessageSender.assistant;

    return Align(
      alignment: isAssistant ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6.0),
        padding: const EdgeInsets.all(14.0),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isAssistant 
              ? theme.colorScheme.surfaceContainerLow 
              : theme.colorScheme.primaryContainer,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isAssistant ? 0 : 16),
            bottomRight: Radius.circular(isAssistant ? 16 : 0),
          ),
          border: isAssistant 
              ? Border.all(color: theme.colorScheme.outlineVariant) 
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.text,
              style: TextStyle(
                color: isAssistant 
                    ? theme.colorScheme.onSurface 
                    : theme.colorScheme.onPrimaryContainer,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (message.isVoice)
                  Icon(
                    Icons.volume_up, 
                    size: 12, 
                    color: isAssistant ? theme.colorScheme.primary : theme.colorScheme.onPrimaryContainer.withOpacity(0.7)
                  ),
                if (message.isVoice) const SizedBox(width: 4),
                Text(
                  '12:00 PM', // Simulating brief time format
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: isAssistant 
                        ? theme.colorScheme.onSurfaceVariant.withOpacity(0.6) 
                        : theme.colorScheme.onPrimaryContainer.withOpacity(0.6),
                    fontSize: 9,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
