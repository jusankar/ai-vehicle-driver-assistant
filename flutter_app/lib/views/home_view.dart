import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import '../viewmodels/fleet_viewmodel.dart';
import '../viewmodels/chat_viewmodel.dart';
import '../models/cloud_document.dart';
import 'chat_view.dart';
import 'vehicle_management_views.dart';
import 'document_vault_view.dart';
import 'driver_management_views.dart';
import 'reports_view.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final fleetVM = context.watch<FleetViewModel>();
    final pages = [
      _HomeDashboardContent(
        onNavigateTab: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
      const VehicleListView(),
      const DriverListView(),
      const DocumentVaultView(),
      const ReportsView(),
      const ChatView(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (int index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.dashboard_outlined),
            selectedIcon: const Icon(Icons.dashboard),
            label: fleetVM.tr('nav_home'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.local_shipping_outlined),
            selectedIcon: const Icon(Icons.local_shipping),
            label: fleetVM.tr('nav_vehicles'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.badge_outlined),
            selectedIcon: const Icon(Icons.badge),
            label: fleetVM.tr('nav_drivers'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.folder_outlined),
            selectedIcon: const Icon(Icons.folder),
            label: fleetVM.tr('nav_vault'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.bar_chart_outlined),
            selectedIcon: const Icon(Icons.bar_chart),
            label: fleetVM.tr('nav_reports'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.auto_awesome_outlined),
            selectedIcon: const Icon(Icons.auto_awesome),
            label: fleetVM.tr('nav_ai_chat'),
          ),
        ],
      ),
    );
  }
}

class _HomeDashboardContent extends StatelessWidget {
  final Function(int) onNavigateTab;

  const _HomeDashboardContent({required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final fleetVM = context.watch<FleetViewModel>();
    final chatVM = context.watch<ChatViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'AI Vehicle Assistant',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          Consumer<FleetViewModel>(
            builder: (context, vm, child) {
              return TextButton.icon(
                onPressed: () => vm.toggleLanguage(),
                icon: const Icon(Icons.language, size: 18),
                label: Text(
                  vm.isTamil ? 'தமிழ்' : 'EN',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              );
            },
          ),
          Consumer<FleetViewModel>(
            builder: (context, vm, child) {
              return IconButton(
                icon: const Icon(Icons.tune_outlined),
                tooltip: vm.tr('Instance & AI Config', 'அமைப்புகள்'),
                onPressed: () {
                  _showConfigurationDialog(context, vm);
                },
              );
            },
          ),
          Consumer<FleetViewModel>(
            builder: (context, vm, child) {
              final notifCount = vm.getNotifications().length;
              return IconButton(
                icon: Badge(
                  label: Text('$notifCount'),
                  isLabelVisible: notifCount > 0,
                  child: const Icon(Icons.notifications_outlined),
                ),
                onPressed: () {
                  _showNotificationsDialog(context, vm);
                },
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hello Greeting Hero
              _buildHeaderCard(context, theme, fleetVM),
              const SizedBox(height: 16),

              // Fleet Portal Section
              Text(
                'Fleet Actions',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: theme.colorScheme.outlineVariant),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: CircleAvatar(
                    backgroundColor: theme.colorScheme.primaryContainer,
                    child: Icon(Icons.local_shipping, color: theme.colorScheme.primary),
                  ),
                  title: const Text('Fleet Operations Portal', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Manage compliance document vaults, spec logs, services, and trip records for your active trucks.'),
                  trailing: Icon(Icons.arrow_right_alt, color: theme.colorScheme.primary),
                  onTap: () => onNavigateTab(1),
                ),
              ),
              const SizedBox(height: 12),

              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: theme.colorScheme.outlineVariant),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: CircleAvatar(
                    backgroundColor: theme.colorScheme.tertiaryContainer,
                    child: Icon(Icons.badge_outlined, color: theme.colorScheme.tertiary),
                  ),
                  title: const Text('Driver & Attendance Roster', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Track active duty status, log daily attendance, issue advances, manage salary rate calculations, and upload compliance credentials.'),
                  trailing: Icon(Icons.arrow_right_alt, color: theme.colorScheme.tertiary),
                  onTap: () => onNavigateTab(2),
                ),
              ),
              const SizedBox(height: 12),

              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: theme.colorScheme.outlineVariant),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: CircleAvatar(
                    backgroundColor: theme.colorScheme.secondaryContainer,
                    child: Icon(Icons.cloud_done_outlined, color: theme.colorScheme.secondary),
                  ),
                  title: const Text('Central Cloud Document Vault', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('AES-256 cloud encrypted repository for Insurance, RC, Fitness, and salary receipts.'),
                  trailing: Icon(Icons.arrow_right_alt, color: theme.colorScheme.secondary),
                  onTap: () => onNavigateTab(3),
                ),
              ),
              const SizedBox(height: 12),

              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: theme.colorScheme.outlineVariant),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: CircleAvatar(
                    backgroundColor: Colors.purple.withOpacity(0.12),
                    child: const Icon(Icons.bar_chart, color: Colors.purple),
                  ),
                  title: const Text('Reports & Analytics', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Monthly operating cost analysis, fuel efficiency audit, driver salary ledger, and compliance expiries.'),
                  trailing: const Icon(Icons.arrow_right_alt, color: Colors.purple),
                  onTap: () => onNavigateTab(4),
                ),
              ),
              const SizedBox(height: 24),

              // KPI Bento Grid
              Text(
                'July Fleet Statistics',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildBentoGrid(context, fleetVM),
              const SizedBox(height: 24),

              // Quick Actions Row
              Text(
                'Quick Actions',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildQuickActions(context),
              const SizedBox(height: 24),

              // Recent Conversations
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Recent Assistant Chats',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: () => onNavigateTab(5),
                    child: const Text('Open Chat'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              _buildRecentConversations(context, chatVM, onNavigateTab),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => onNavigateTab(5),
        icon: const Icon(Icons.chat_bubble_outline),
        label: const Text('Ask Assistant'),
      ),
    );
  }

  Widget _buildHeaderCard(BuildContext context, ThemeData theme, FleetViewModel vm) {
    final vehicles = vm.vehicles;
    final totalCount = vehicles.length;
    final activeCount = vehicles.where((v) => v.status == 'Active').length;
    final maintenanceCount = vehicles.where((v) => v.status == 'Maintenance').length;

    List<String> issues = [];
    final now = DateTime.now();
    for (var v in vehicles) {
      if (v.insuranceExpiry != null) {
        final exp = v.insuranceExpiry!;
        final diffDays = exp.difference(now).inDays;
        if (diffDays <= 30 && diffDays >= 0) {
          issues.add('${v.plateNumber} ${vm.tr("Insurance expires in", "இன்சூரன்ஸ் முடிவு")} $diffDays ${vm.tr("days", "நாட்களில்")}');
        } else if (diffDays < 0) {
          issues.add('${v.plateNumber} ${vm.tr("Insurance EXPIRED", "இன்சூரன்ஸ் முடிந்தது")}');
        }
      }
      if (v.fitnessExpiry != null) {
        final exp = v.fitnessExpiry!;
        final diffDays = exp.difference(now).inDays;
        if (diffDays <= 30 && diffDays >= 0) {
          issues.add('${v.plateNumber} ${vm.tr("Fitness FC expires in", "FC முடிவு")} $diffDays ${vm.tr("days", "நாட்களில்")}');
        } else if (diffDays < 0) {
          issues.add('${v.plateNumber} ${vm.tr("Fitness FC EXPIRED", "FC முடிந்தது")}');
        }
      }
    }

    String bannerTitle = issues.isNotEmpty
        ? vm.tr('Fleet Attention Needed', 'வாகன கவனக் குறிப்பு')
        : vm.tr('Your Fleet is Healthy', 'உங்கள் வாகனப் படை சீராக உள்ளது');

    String bannerDetail = '';
    if (issues.isNotEmpty) {
      bannerDetail = vm.tr(
        'All $activeCount of $totalCount vehicles active. Attention needed: ${issues.join(", ")}.',
        '$activeCount / $totalCount வாகனங்கள் செயல்பாட்டில் உள்ளன. கவனத்திற்கு: ${issues.join(", ")}.'
      );
    } else if (maintenanceCount > 0) {
      bannerDetail = vm.tr(
        '$activeCount of $totalCount vehicles active, $maintenanceCount in maintenance.',
        '$activeCount வாகனங்கள் செயல்பாட்டில் உள்ளன, $maintenanceCount பராமரிப்பில் உள்ளன.'
      );
    } else {
      bannerDetail = vm.tr(
        'All $totalCount trucks active with up-to-date insurance & fitness certificates.',
        'அனைத்து $totalCount வாகனங்களும் இன்சூரன்ஸ் மற்றும் எஃப்.சி சான்றிதழ்களுடன் இயங்குகின்றன.'
      );
    }

    return Card(
      elevation: 0,
      color: theme.colorScheme.primaryContainer,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.auto_awesome, color: theme.colorScheme.primary),
                const SizedBox(width: 8),
                Text(
                  vm.tr('AI FLEET ASSISTANT', 'AI வாகன உதவியாளர்'),
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              bannerTitle,
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              bannerDetail,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onPrimaryContainer.withOpacity(0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBentoGrid(BuildContext context, FleetViewModel vm) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.4,
      children: [
        _buildBentoItem(
          context,
          'Diesel Filled',
          '${vm.getJulyFuelLiters().toStringAsFixed(0)} Liters',
          'July Total',
          Icons.local_gas_station,
          Colors.orange,
        ),
        _buildBentoItem(
          context,
          'Fuel Cost',
          'Rs. ${vm.getJulyFuelCost().toStringAsFixed(0)}',
          'Average Rs. 90/L',
          Icons.currency_rupee,
          Colors.green,
        ),
        _buildBentoItem(
          context,
          'Repairs/Tolls',
          'Rs. ${vm.getJulyExpenses().toStringAsFixed(0)}',
          '4 Logged Items',
          Icons.build_circle_outlined,
          Colors.blue,
        ),
        _buildBentoItem(
          context,
          'Active Drivers',
          '${vm.drivers.length} Drivers',
          '100% Assigned',
          Icons.people_outline,
          Colors.purple,
        ),
      ],
    );
  }

  Widget _buildBentoItem(BuildContext context, String title, String value, String sub, IconData icon, Color color) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: theme.colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: theme.textTheme.labelMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                Icon(icon, size: 20, color: color),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                Text(
                  sub,
                  style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurfaceVariant.withOpacity(0.7)),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              _showMockUploadDialog(context);
            },
            icon: const Icon(Icons.upload_file),
            label: const Text('Upload Receipt'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ChatView(startVoice: true)),
              );
            },
            icon: const Icon(Icons.mic),
            label: const Text('Voice Input'),
          ),
        ),
      ],
    );
  }

  Widget _buildRecentConversations(BuildContext context, ChatViewModel chatVM, Function(int) onNavigateTab) {
    final theme = Theme.of(context);
    final lastMessage = chatVM.messages.last;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: theme.colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(16),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: theme.colorScheme.secondaryContainer,
          child: Icon(Icons.auto_awesome, size: 18, color: theme.colorScheme.primary),
        ),
        title: const Text('Assistant Chat Session', style: TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(
          lastMessage.text,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: theme.textTheme.bodySmall,
        ),
        trailing: const Icon(Icons.chevron_right, size: 16),
        onTap: () => onNavigateTab(5),
      ),
    );
  }

  void _showNotificationsDialog(BuildContext context, FleetViewModel fleetVM) {
    showDialog(
      context: context,
      builder: (dialogCtx) {
        return Consumer<FleetViewModel>(
          builder: (context, vm, child) {
            final notifications = vm.getNotifications();
            return AlertDialog(
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.notifications_active, size: 20),
                      SizedBox(width: 8),
                      Text('Notifications', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    ],
                  ),
                  if (notifications.isNotEmpty)
                    TextButton(
                      onPressed: () {
                        vm.clearAllNotifications();
                      },
                      child: const Text('Clear All', style: TextStyle(fontSize: 12)),
                    ),
                ],
              ),
              content: SizedBox(
                width: double.maxFinite,
                child: notifications.isEmpty
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 24.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.check_circle_outline, color: Colors.green, size: 48),
                            SizedBox(height: 12),
                            Text('All Caught Up!', style: TextStyle(fontWeight: FontWeight.bold)),
                            SizedBox(height: 4),
                            Text('No active notifications or compliance alerts.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                      )
                    : SingleChildScrollView(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: notifications.map((notif) {
                            Color accentColor = Colors.blue;
                            IconData iconData = Icons.info_outline;
                            if (notif.type == 'alert') {
                              accentColor = Colors.red;
                              iconData = Icons.error_outline;
                            } else if (notif.type == 'warning') {
                              accentColor = Colors.amber.shade800;
                              iconData = Icons.warning_amber_rounded;
                            }

                            return Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: accentColor.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: accentColor.withOpacity(0.3)),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(iconData, color: accentColor, size: 22),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          notif.title,
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 13,
                                            color: accentColor,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          notif.message,
                                          style: const TextStyle(fontSize: 12, height: 1.3),
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          notif.date,
                                          style: const TextStyle(fontSize: 10, color: Colors.grey),
                                        ),
                                      ],
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.close, size: 16, color: Colors.grey),
                                    onPressed: () {
                                      vm.dismissNotification(notif.id);
                                    },
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogCtx),
                  child: const Text('Close'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showConfigurationDialog(BuildContext context, FleetViewModel vm) {
    final clientIdCtrl = TextEditingController(text: vm.instanceClientId);
    final apiKeyCtrl = TextEditingController(text: vm.apiKey);
    final modelNameCtrl = TextEditingController(text: vm.modelName);
    final baseUrlCtrl = TextEditingController(text: vm.baseUrl);
    String provider = vm.aiProvider;
    bool isTesting = false;
    String? testResultMsg;
    bool testSuccess = false;

    showDialog(
      context: context,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (stCtx, setStState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Row(
                children: [
                  const Icon(Icons.settings, color: Colors.purple),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      vm.tr('AI & Instance Configuration', 'AI & நிகழ்வு அமைப்பு'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      vm.tr('Client Instance ID (Data Persistence Scope)', 'கிளையண்ட் நிகழ்வு ஐடி'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    const SizedBox(height: 4),
                    TextField(
                      controller: clientIdCtrl,
                      decoration: const InputDecoration(
                        hintText: 'e.g. CLIENT_001, SOUTH_ZONE_FLEET',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),
                    const SizedBox(height: 12),

                    Text(
                      vm.tr('AI Provider', 'AI வழங்குநர்'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    const SizedBox(height: 4),
                    DropdownButtonFormField<String>(
                      value: provider,
                      items: const [
                        DropdownMenuItem(value: 'gemini', child: Text('⚡ Google Gemini AI')),
                        DropdownMenuItem(value: 'openai', child: Text('🤖 OpenAI (GPT-4o)')),
                        DropdownMenuItem(value: 'claude', child: Text('🧠 Anthropic Claude')),
                        DropdownMenuItem(value: 'custom', child: Text('🛠️ Custom AI / Local LLM')),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          setStState(() {
                            provider = val;
                            if (val == 'openai') modelNameCtrl.text = 'gpt-4o';
                            else if (val == 'claude') modelNameCtrl.text = 'claude-3-5-sonnet-20241022';
                            else if (val == 'gemini') modelNameCtrl.text = 'gemini-3.6-flash';
                          });
                        }
                      },
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),
                    const SizedBox(height: 12),

                    Text(
                      vm.tr('API Key', 'API சாவி'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    const SizedBox(height: 4),
                    TextField(
                      controller: apiKeyCtrl,
                      obscureText: true,
                      decoration: InputDecoration(
                        hintText: provider == 'gemini' ? 'Optional (Uses server key if blank)' : 'Enter API Key...',
                        border: const OutlineInputBorder(),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),
                    const SizedBox(height: 12),

                    Text(
                      vm.tr('Model Name', 'மாதிரி பெயர்'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    const SizedBox(height: 4),
                    TextField(
                      controller: modelNameCtrl,
                      decoration: const InputDecoration(
                        hintText: 'e.g. gemini-3.6-flash, gpt-4o',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),
                    const SizedBox(height: 12),

                    if (provider != 'gemini') ...[
                      Text(
                        vm.tr('Base URL (Optional Override)', 'தள முகவரி'),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                      const SizedBox(height: 4),
                      TextField(
                        controller: baseUrlCtrl,
                        decoration: const InputDecoration(
                          hintText: 'e.g. https://api.openai.com/v1',
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    if (testResultMsg != null) ...[
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: testSuccess ? Colors.green.shade50 : Colors.red.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: testSuccess ? Colors.green : Colors.red),
                        ),
                        child: Text(
                          testResultMsg!,
                          style: TextStyle(
                            fontSize: 12,
                            color: testSuccess ? Colors.green.shade900 : Colors.red.shade900,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    OutlinedButton.icon(
                      onPressed: isTesting ? null : () async {
                        setStState(() {
                          isTesting = true;
                          testResultMsg = null;
                        });
                        try {
                          final uri = Uri.parse('https://ais-dev-czqawmg62uwikhqbydfl6w-236723801382.asia-southeast1.run.app/api/chat/test');
                          final response = await http.post(
                            uri,
                            headers: {'Content-Type': 'application/json'},
                            body: jsonEncode({
                              'provider': provider,
                              'apiKey': apiKeyCtrl.text.trim(),
                              'modelName': modelNameCtrl.text.trim(),
                              'baseUrl': baseUrlCtrl.text.trim(),
                            }),
                          ).timeout(const Duration(seconds: 10));

                          if (response.statusCode == 200) {
                            final data = jsonDecode(response.body);
                            setStState(() {
                              testSuccess = data['success'] == true;
                              testResultMsg = data['success'] == true
                                  ? '✅ Connection Successful! Response: "${data['message']}"'
                                  : '❌ Error: ${data['error']}';
                            });
                          } else {
                            setStState(() {
                              testSuccess = false;
                              testResultMsg = '❌ HTTP ${response.statusCode} error testing connection';
                            });
                          }
                        } catch (err) {
                          setStState(() {
                            testSuccess = false;
                            testResultMsg = '❌ Connection failed: $err';
                          });
                        } finally {
                          setStState(() {
                            isTesting = false;
                          });
                        }
                      },
                      icon: isTesting ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.swap_calls, size: 16),
                      label: Text(vm.tr('btn_test_connection')),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogCtx),
                  child: Text(vm.tr('btn_cancel')),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple,
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () {
                    vm.updateAiConfig(
                      newClientId: clientIdCtrl.text,
                      newProvider: provider,
                      newApiKey: apiKeyCtrl.text,
                      newModelName: modelNameCtrl.text,
                      newBaseUrl: baseUrlCtrl.text,
                    );
                    Navigator.pop(dialogCtx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(vm.tr('⚙️ Configuration saved successfully!', '⚙️ அமைப்புகள் சேமிக்கப்பட்டன!')),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                  child: Text(vm.tr('btn_save_config')),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showMockUploadDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Upload Fleet Invoice / Document',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Select a document source to pick fuel bills, repair receipts, or compliance documents.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: CircleAvatar(
                backgroundColor: Colors.blue.withOpacity(0.15),
                child: const Icon(Icons.camera_alt, color: Colors.blue),
              ),
              title: const Text('Take Photo with Camera', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Capture receipt directly with camera'),
              onTap: () async {
                Navigator.pop(sheetContext);
                final picker = ImagePicker();
                final image = await picker.pickImage(source: ImageSource.camera);
                if (image != null && context.mounted) {
                  _processPickedFile(context, image.name, 'Camera Image', 'Fuel Bills');
                }
              },
            ),
            const SizedBox(height: 8),
            ListTile(
              leading: CircleAvatar(
                backgroundColor: Colors.green.withOpacity(0.15),
                child: const Icon(Icons.photo_library, color: Colors.green),
              ),
              title: const Text('Choose Image from Gallery', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Select receipt image from photo library'),
              onTap: () async {
                Navigator.pop(sheetContext);
                final picker = ImagePicker();
                final image = await picker.pickImage(source: ImageSource.gallery);
                if (image != null && context.mounted) {
                  _processPickedFile(context, image.name, 'Gallery Image', 'Service Bills');
                }
              },
            ),
            const SizedBox(height: 8),
            ListTile(
              leading: CircleAvatar(
                backgroundColor: Colors.orange.withOpacity(0.15),
                child: const Icon(Icons.picture_as_pdf, color: Colors.orange),
              ),
              title: const Text('Select PDF or Document File', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Browse PDF, Word, or Excel file from storage'),
              onTap: () async {
                Navigator.pop(sheetContext);
                final result = await FilePicker.platform.pickFiles(
                  type: FileType.custom,
                  allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'],
                );
                if (result != null && result.files.isNotEmpty && context.mounted) {
                  final file = result.files.first;
                  _processPickedFile(context, file.name, 'PDF File', 'Insurance PDF');
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _processPickedFile(BuildContext context, String fileName, String source, String docType) {
    final fleetVM = context.read<FleetViewModel>();
    final newDoc = CloudDocument(
      id: 'cd_${DateTime.now().millisecondsSinceEpoch}',
      name: fileName,
      documentType: docType,
      source: source,
      uploadedAt: DateTime.now(),
      fileSize: '1.2 MB',
      storageUrl: 'https://storage.googleapis.com/fleet-cloud-bucket/$fileName',
      notes: 'Uploaded via Quick Actions',
    );
    fleetVM.addCloudDocument(newDoc);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: Colors.green,
        content: Text('"$fileName" uploaded to Cloud Vault and parsed with Gemini AI!'),
      ),
    );
  }
}
