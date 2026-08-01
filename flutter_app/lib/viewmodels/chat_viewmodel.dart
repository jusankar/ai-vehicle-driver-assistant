import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/chat_message.dart';
import '../models/fleet_model.dart';
import 'fleet_viewmodel.dart';

class ChatViewModel extends ChangeNotifier {
  final List<ChatMessage> _messages = [
    ChatMessage(
      id: "init",
      sender: MessageSender.assistant,
      text: "Hello! I am your AI Vehicle & Driver Assistant. Ask me anything about your vehicles, drivers, expenses, or diesel consumption.",
      timestamp: DateTime.now(),
    )
  ];
  
  bool _isLoading = false;
  late final GenerativeModel _model;

  ChatViewModel({String apiKey = "YOUR_GEMINI_API_KEY"}) {
    // Initialize Google Generative AI
    _model = GenerativeModel(
      model: 'gemini-1.5-flash', // Replaced with latest supported in target environment
      apiKey: apiKey,
    );
  }

  List<ChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;

  Future<void> sendMessage(String text, FleetViewModel fleetVM, {bool isVoice = false}) async {
    if (text.trim().isEmpty) return;

    final userMessage = ChatMessage(
      id: DateTime.now().toString(),
      sender: MessageSender.user,
      text: text,
      timestamp: DateTime.now(),
      isVoice: isVoice,
    );

    _messages.add(userMessage);
    _isLoading = true;
    notifyListeners();

    try {
      // Prepare Fleet Context for LLM Grounding
      final dbContext = """
Current local date: 2026-07-17.
FLEET DATABASE STATUS:
Vehicles: ${jsonEncode(fleetVM.vehicles.map((v) => v.toJson()).toList())}
Drivers: ${jsonEncode(fleetVM.drivers.map((d) => d.toJson()).toList())}
Fuel Logs: ${jsonEncode(fleetVM.fuelLogs.map((f) => f.toJson()).toList())}
Expense Logs: ${jsonEncode(fleetVM.expenseLogs.map((e) => e.toJson()).toList())}
""";

      final systemInstruction = """
You are the AI core for "AI Vehicle & Driver Assistant", answering queries for commercial fleet owners.
Provide brief, highly readable, bulleted answers.
If the user asks to log/add fuel, expenses, or assign a driver, output a structured action block at the end:
[DATABASE_ACTION_START]
{
  "action": "ADD_FUEL" | "ADD_EXPENSE" | "ASSIGN_DRIVER",
  "payload": { ... }
}
[DATABASE_ACTION_END]
""";

      final response = await _model.generateContent([
        Content.system(systemInstruction),
        Content.text(dbContext),
        ..._messages.map((m) => m.sender == MessageSender.user 
            ? Content.text("User: " + m.text) 
            : Content.model([TextPart(m.text)])),
        Content.text("User: " + text)
      ]);

      final replyText = response.text ?? "I was unable to retrieve an answer.";
      
      // Parse database action if returned
      _parseDatabaseAction(replyText, fleetVM);

      _messages.add(ChatMessage(
        id: DateTime.now().toString(),
        sender: MessageSender.assistant,
        text: replyText.replaceAll(RegExp(r'\[DATABASE_ACTION_START\].*\[DATABASE_ACTION_END\]', dotAll: true), '').trim(),
        timestamp: DateTime.now(),
      ));
    } catch (e) {
      _messages.add(ChatMessage(
        id: DateTime.now().toString(),
        sender: MessageSender.assistant,
        text: "Error connecting to assistant: $e",
        timestamp: DateTime.now(),
      ));
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _parseDatabaseAction(String responseText, FleetViewModel fleetVM) {
    try {
      final regExp = RegExp(r'\[DATABASE_ACTION_START\]([\s\S]*?)\[DATABASE_ACTION_END\]');
      final match = regExp.firstMatch(responseText);
      if (match != null && match.group(1) != null) {
        final actionMap = jsonDecode(match.group(1)!.trim());
        final action = actionMap['action'];
        final payload = actionMap['payload'];

        if (action == 'ADD_FUEL') {
          fleetVM.addFuelLog(FuelLog(
            id: 'fl_' + DateTime.now().millisecondsSinceEpoch.toString(),
            plateNumber: payload['plateNumber'] ?? 'TN68AB1234',
            date: DateTime.tryParse(payload['date'] ?? '') ?? DateTime.now(),
            liters: (payload['liters'] as num?)?.toDouble() ?? 0.0,
            amount: (payload['amount'] as num?)?.toDouble() ?? 0.0,
            driverName: payload['driverName'] ?? 'Rajesh Kumar',
          ));
        } else if (action == 'ADD_EXPENSE') {
          fleetVM.addExpenseLog(ExpenseLog(
            id: 'ex_' + DateTime.now().millisecondsSinceEpoch.toString(),
            plateNumber: payload['plateNumber'] ?? 'TN68AB1234',
            date: DateTime.tryParse(payload['date'] ?? '') ?? DateTime.now(),
            amount: (payload['amount'] as num?)?.toDouble() ?? 0.0,
            category: payload['category'] ?? 'Others',
            description: payload['description'] ?? 'logged through AI',
          ));
        } else if (action == 'ASSIGN_DRIVER') {
          fleetVM.reassignDriver(payload['plateNumber'], payload['driverId']);
        }
      }
    } catch (e) {
      print("Failed parsing Flutter action callback: $e");
    }
  }

  void clearChat() {
    _messages.clear();
    _messages.add(ChatMessage(
      id: "init",
      sender: MessageSender.assistant,
      text: "Recent chat cleared! How can I help you manage your fleet today?",
      timestamp: DateTime.now(),
    ));
    notifyListeners();
  }
}
