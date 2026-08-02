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
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.local_shipping_outlined),
            selectedIcon: Icon(Icons.local_shipping),
            label: 'Vehicles',
          ),
          NavigationDestination(
            icon: Icon(Icons.badge_outlined),
            selectedIcon: Icon(Icons.badge),
            label: 'Drivers',
          ),
          NavigationDestination(
            icon: Icon(Icons.folder_outlined),
            selectedIcon: Icon(Icons.folder),
            label: 'Vault',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_outlined),
            selectedIcon: Icon(Icons.bar_chart),
            label: 'Reports',
          ),
          NavigationDestination(
            icon: Icon(Icons.auto_awesome_outlined),
            selectedIcon: Icon(Icons.auto_awesome),
            label: 'AI Chat',
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
              _buildHeaderCard(context, theme),
              const SizedBox(height: 24),

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

  Widget _buildHeaderCard(BuildContext context, ThemeData theme) {
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
                  'AI FLEET ASSISTANT',
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
              'Your Fleet is Healthy',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'All 4 trucks active. 1 vehicle needs attention soon (TN68CD5678 Insurance expires in 8 days).',
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
