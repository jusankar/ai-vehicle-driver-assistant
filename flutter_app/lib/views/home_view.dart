import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/fleet_viewmodel.dart';
import '../viewmodels/chat_viewmodel.dart';
import 'chat_view.dart';
import 'vehicle_management_views.dart';
import 'document_vault_view.dart';
import 'driver_management_views.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

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
          IconButton(
            icon: const Badge(
              label: Text('2'),
              child: Icon(Icons.notifications_outlined),
            ),
            onPressed: () {
              _showNotificationsDialog(context);
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

              // Fleet Portal Portal Section
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
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const VehicleListView()),
                    );
                  },
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
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const DriverListView()),
                    );
                  },
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
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const DocumentVaultView()),
                    );
                  },
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
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const ChatView()),
                      );
                    },
                    child: const Text('Open Chat'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              _buildRecentConversations(context, chatVM),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const ChatView()),
          );
        },
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

  Widget _buildRecentConversations(BuildContext context, ChatViewModel chatVM) {
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
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const ChatView()),
          );
        },
      ),
    );
  }

  void _showNotificationsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Notifications', style: TextStyle(fontWeight: FontWeight.bold)),
        content: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildNotificationTile(
                context,
                'Insurance Expiring Soon',
                'Vehicle TN68CD5678 insurance expires in 8 days (July 25, 2026). Please renew.',
                Colors.amber,
              ),
              const Divider(),
              _buildNotificationTile(
                context,
                'Fitness Certificate Due',
                'Vehicle MH12GH3456 fitness certificate is due for renewal soon.',
                Colors.blue,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          )
        ],
      ),
    );
  }

  Widget _buildNotificationTile(BuildContext context, String title, String body, Color accentColor) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.warning_amber_rounded, color: accentColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(body, style: theme.textTheme.bodySmall),
              ],
            ),
          )
        ],
      ),
    );
  }

  void _showMockUploadDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Upload Document / Invoice'),
        content: const Text('Choose a fuel receipt, tolls bill, or insurance document to parse with AI and automatically update your fleet records.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Document uploaded successfully. Parsing with Gemini AI...')),
              );
            },
            child: const Text('Pick Image/PDF'),
          ),
        ],
      ),
    );
  }
}
