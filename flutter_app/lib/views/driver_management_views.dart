import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/fleet_model.dart';
import '../viewmodels/fleet_viewmodel.dart';

class DriverListView extends StatefulWidget {
  const DriverListView({super.key});

  @override
  State<DriverListView> createState() => _DriverListViewState();
}

class _DriverListViewState extends State<DriverListView> {
  String _searchQuery = '';
  String _statusFilter = 'All'; // 'All', 'OnDuty', 'OffDuty', 'Leave'

  @override
  Widget build(BuildContext context) {
    final fleetVM = context.watch<FleetViewModel>();
    final theme = Theme.of(context);

    // Filters
    final filteredDrivers = fleetVM.drivers.where((d) {
      final matchesSearch = d.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          d.phone.contains(_searchQuery) ||
          d.licenseNumber.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          d.assignedVehiclePlate.toLowerCase().contains(_searchQuery.toLowerCase());

      bool matchesStatus = true;
      if (_statusFilter == 'OnDuty') {
        matchesStatus = d.dutyStatus == 'OnDuty';
      } else if (_statusFilter == 'OffDuty') {
        matchesStatus = d.dutyStatus == 'OffDuty' && d.attendanceStatus != 'Leave';
      } else if (_statusFilter == 'Leave') {
        matchesStatus = d.attendanceStatus == 'Leave';
      }

      return matchesSearch && matchesStatus;
    }).toList();

    // Statistics
    final totalDrivers = fleetVM.drivers.length;
    final onDutyCount = fleetVM.drivers.where((d) => d.dutyStatus == 'OnDuty').length;
    final onLeaveCount = fleetVM.drivers.where((d) => d.attendanceStatus == 'Leave').length;
    final totalAdvances = fleetVM.drivers.fold<double>(0, (sum, d) => sum + d.advance);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Roster', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add),
            tooltip: 'Register Driver',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const DriverRegistrationForm()),
              );
            },
          )
        ],
      ),
      body: Column(
        children: [
          // Stat Counters Bento Grid
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: [
                _buildStatItem(context, 'Total', '$totalDrivers', Colors.blue),
                const SizedBox(width: 8),
                _buildStatItem(context, 'On Duty', '$onDutyCount', Colors.green),
                const SizedBox(width: 8),
                _buildStatItem(context, 'On Leave', '$onLeaveCount', Colors.amber),
                const SizedBox(width: 8),
                _buildStatItem(context, 'Advances', '₹${totalAdvances.toStringAsFixed(0)}', Colors.red),
              ],
            ),
          ),

          // Search and Filters
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search by name, license, or truck...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide(color: theme.colorScheme.outline),
                    ),
                    filled: true,
                    fillColor: theme.colorScheme.surfaceContainerLow,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: ['All', 'OnDuty', 'OffDuty', 'Leave'].map((filter) {
                    final isSelected = _statusFilter == filter;
                    String label = filter;
                    if (filter == 'OnDuty') label = 'On Duty';
                    if (filter == 'OffDuty') label = 'Off Duty';
                    if (filter == 'Leave') label = 'On Leave';

                    return ChoiceChip(
                      label: Text(label, style: const TextStyle(fontSize: 12)),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) setState(() => _statusFilter = filter);
                      },
                    );
                  }).toList(),
                )
              ],
            ),
          ),

          // Driver List
          Expanded(
            child: filteredDrivers.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.badge_outlined, size: 64, color: theme.colorScheme.outlineVariant),
                        const SizedBox(height: 16),
                        Text('No drivers found matching filters', style: theme.textTheme.bodyLarge),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filteredDrivers.length,
                    itemBuilder: (context, index) {
                      final driver = filteredDrivers[index];
                      return _buildDriverCard(context, driver, theme);
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const DriverRegistrationForm()),
          );
        },
        tooltip: 'Register Driver',
        child: const Icon(Icons.person_add),
      ),
    );
  }

  Widget _buildStatItem(BuildContext context, String label, String value, Color color) {
    final theme = Theme.of(context);
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface)),
          ],
        ),
      ),
    );
  }

  Widget _buildDriverCard(BuildContext context, Driver driver, ThemeData theme) {
    Color statusColor = Colors.grey;
    String statusLabel = 'Off Duty';

    if (driver.dutyStatus == 'OnDuty') {
      statusColor = Colors.green;
      statusLabel = 'On Duty';
    } else if (driver.attendanceStatus == 'Leave') {
      statusColor = Colors.orange;
      statusLabel = 'On Leave';
    } else if (driver.attendanceStatus == 'Absent') {
      statusColor = Colors.red;
      statusLabel = 'Absent';
    }

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        side: BorderSide(color: theme.colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(16),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: CircleAvatar(
          radius: 24,
          backgroundColor: theme.colorScheme.primaryContainer,
          child: Text(
            driver.name.substring(0, 1).toUpperCase(),
            style: TextStyle(fontWeight: FontWeight.bold, color: theme.colorScheme.onPrimaryContainer, fontSize: 18),
          ),
        ),
        title: Text(driver.name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.phone, size: 14, color: theme.colorScheme.outline),
                  const SizedBox(width: 4),
                  Text(driver.phone, style: theme.textTheme.labelMedium),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.local_shipping, size: 14, color: theme.colorScheme.outline),
                  const SizedBox(width: 4),
                  Text('Truck: ${driver.assignedVehiclePlate.isNotEmpty ? driver.assignedVehiclePlate : "None"}', style: theme.textTheme.labelMedium),
                ],
              ),
              if (driver.advance > 0) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.money, size: 14, color: Colors.red[400]),
                    const SizedBox(width: 4),
                    Text(
                      'Advance Balance: ₹${driver.advance.toStringAsFixed(0)}',
                      style: TextStyle(fontSize: 11, color: Colors.red[700], fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                statusLabel,
                style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11),
              ),
            ),
            const SizedBox(height: 4),
            const Icon(Icons.chevron_right, size: 18),
          ],
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => DriverDetailView(driver: driver)),
          );
        },
      ),
    );
  }
}

class DriverDetailView extends StatelessWidget {
  final Driver driver;
  const DriverDetailView({super.key, required this.driver});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: Text(driver.name, style: const TextStyle(fontWeight: FontWeight.bold)),
          bottom: const TabBar(
            tabs: [
              Tab(icon: Icon(Icons.person), text: 'Profile'),
              Tab(icon: Icon(Icons.punch_clock), text: 'Duty'),
              Tab(icon: Icon(Icons.currency_rupee), text: 'Finance'),
              Tab(icon: Icon(Icons.folder_shared), text: 'Docs'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildProfileTab(context, theme),
            _buildDutyTab(context, theme),
            _buildFinanceTab(context, theme),
            _buildDocsTab(context, theme),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileTab(BuildContext context, ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting Status Header
          Card(
            elevation: 0,
            color: theme.colorScheme.surfaceContainerHigh,
            shape: RoundedRectangleBorder(
              side: BorderSide(color: theme.colorScheme.outlineVariant),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: theme.colorScheme.primaryContainer,
                    child: const Icon(Icons.person, size: 32),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          driver.name,
                          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Joining Date: ${driver.joiningDate.toIso8601String().split('T')[0]}',
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: (driver.dutyStatus == 'OnDuty' ? Colors.green : Colors.grey).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      driver.dutyStatus == 'OnDuty' ? 'ON DUTY' : 'OFF DUTY',
                      style: TextStyle(
                        color: driver.dutyStatus == 'OnDuty' ? Colors.green : Colors.grey[700],
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Core details registry
          Text('Driver Registry Specifications', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              side: BorderSide(color: theme.colorScheme.outlineVariant),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  _buildSpecRow('Mobile Number', driver.phone),
                  const Divider(),
                  _buildSpecRow('Driving License', driver.licenseNumber),
                  const Divider(),
                  _buildSpecRow('License Expiry', driver.licenseExpiry.toIso8601String().split('T')[0]),
                  const Divider(),
                  _buildSpecRow('Assigned Truck', driver.assignedVehiclePlate.isNotEmpty ? driver.assignedVehiclePlate : 'None'),
                  const Divider(),
                  _buildSpecRow('Attendance Status', driver.attendanceStatus),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Daily Attendance logging panel
          Text('Mark Daily Attendance State', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              side: BorderSide(color: theme.colorScheme.outlineVariant),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Select attendance status for today:', style: TextStyle(fontSize: 12)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildAttendanceButton(context, 'Present', Colors.green, driver.attendanceStatus == 'Present'),
                      _buildAttendanceButton(context, 'Leave', Colors.orange, driver.attendanceStatus == 'Leave'),
                      _buildAttendanceButton(context, 'Absent', Colors.red, driver.attendanceStatus == 'Absent'),
                    ],
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildAttendanceButton(BuildContext context, String status, Color color, bool isSelected) {
    return ElevatedButton.icon(
      onPressed: () {
        context.read<FleetViewModel>().logAttendance(driver.id, status);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Attendance for ${driver.name} marked as $status')),
        );
      },
      style: ElevatedButton.styleFrom(
        backgroundColor: isSelected ? color : color.withOpacity(0.08),
        foregroundColor: isSelected ? Colors.white : color,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      ),
      icon: Icon(status == 'Present' ? Icons.check_circle : (status == 'Leave' ? Icons.beach_access : Icons.cancel), size: 16),
      label: Text(status),
    );
  }

  Widget _buildDutyTab(BuildContext context, ThemeData theme) {
    final today = DateTime(2026, 7, 17);
    final todayRecord = driver.attendanceHistory.firstWhere(
      (h) => h.date.year == today.year && h.date.month == today.month && h.date.day == today.day,
      orElse: () => AttendanceRecord(date: today, status: 'None'),
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Live Duty Controls
          Text('Live Shift Duty Controls', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              side: BorderSide(color: theme.colorScheme.outlineVariant),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: driver.dutyStatus == 'OnDuty'
                              ? null
                              : () {
                                  final timeStr = "${DateTime.now().hour.toString().padLeft(2, '0')}:${DateTime.now().minute.toString().padLeft(2, '0')}";
                                  context.read<FleetViewModel>().startDuty(driver.id, timeStr);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Duty started at $timeStr for ${driver.name}')),
                                  );
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.teal,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.play_arrow),
                          label: const Text('Start Duty', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: driver.dutyStatus != 'OnDuty'
                              ? null
                              : () {
                                  final timeStr = "${DateTime.now().hour.toString().padLeft(2, '0')}:${DateTime.now().minute.toString().padLeft(2, '0')}";
                                  context.read<FleetViewModel>().endDuty(driver.id, timeStr);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Duty ended at $timeStr for ${driver.name}')),
                                  );
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.redAccent,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.stop),
                          label: const Text('End Duty', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          const Text('Today Shift Start', style: TextStyle(fontSize: 11, color: Colors.grey)),
                          const SizedBox(height: 4),
                          Text(todayRecord.startDuty ?? '--:--', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ],
                      ),
                      Column(
                        children: [
                          const Text('Today Shift End', style: TextStyle(fontSize: 11, color: Colors.grey)),
                          const SizedBox(height: 4),
                          Text(todayRecord.endDuty ?? '--:--', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ],
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Attendance Log history
          Text('Attendance Log History', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          driver.attendanceHistory.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Text('No attendance history log found.', style: TextStyle(color: Colors.grey)),
                  ),
                )
              : ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: driver.attendanceHistory.length,
                  itemBuilder: (context, index) {
                    final h = driver.attendanceHistory[index];
                    Color chipColor = Colors.grey;
                    if (h.status == 'Present') chipColor = Colors.green;
                    if (h.status == 'Leave') chipColor = Colors.orange;
                    if (h.status == 'Absent') chipColor = Colors.red;

                    return Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        side: BorderSide(color: theme.colorScheme.outlineVariant),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: chipColor.withOpacity(0.12),
                          child: Icon(Icons.calendar_today, color: chipColor, size: 18),
                        ),
                        title: Text(h.date.toIso8601String().split('T')[0], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        subtitle: Text(
                          h.status == 'Present'
                              ? 'Start: ${h.startDuty ?? "08:00"} • End: ${h.endDuty ?? "In Shift"}'
                              : 'Attendance: ${h.status}',
                          style: const TextStyle(fontSize: 11),
                        ),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: chipColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(h.status, style: TextStyle(color: chipColor, fontWeight: FontWeight.bold, fontSize: 10)),
                        ),
                      ),
                    );
                  },
                )
        ],
      ),
    );
  }

  Widget _buildFinanceTab(BuildContext context, ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Salary structure configurations
          Text('Salary Structure', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              side: BorderSide(color: theme.colorScheme.outlineVariant),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Salary Type', style: TextStyle(fontSize: 11, color: Colors.grey)),
                          const SizedBox(height: 4),
                          Text('${driver.salaryType} Rate', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ],
                      ),
                      Text(
                        '₹${driver.salaryRate.toStringAsFixed(0)}',
                        style: TextStyle(fontWeight: FontWeight.bold, color: theme.colorScheme.primary, fontSize: 24),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Divider(),
                  const SizedBox(height: 8),
                  Text(
                    driver.salaryType == 'Monthly'
                        ? 'Monthly Salary: Retainer salary paid at the end of every calendar cycle.'
                        : (driver.salaryType == 'Daily'
                            ? 'Daily Wage Salary: Paid for days marked Present in the attendance register.'
                            : 'Per Trip Commission: Base commission paid per completed hauling route.'),
                    style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Advance ledger panel
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Salary Advances', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: Colors.red.withOpacity(0.08), borderRadius: BorderRadius.circular(8)),
                child: Text(
                  'Outstanding: ₹${driver.advance.toStringAsFixed(0)}',
                  style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 11),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              side: BorderSide(color: theme.colorScheme.outlineVariant),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _showAdvanceDialog(context, 'Issue Advance'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange.withOpacity(0.08),
                            foregroundColor: Colors.orange[800],
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.arrow_upward, size: 16),
                          label: const Text('Issue Advance', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _showAdvanceDialog(context, 'Log Repayment'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green.withOpacity(0.08),
                            foregroundColor: Colors.green[800],
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.arrow_downward, size: 16),
                          label: const Text('Log Repayment', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      )
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Advance history ledger
          Text('Advance Ledger Activity', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          driver.advanceHistory.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Text('No advance/repayment transactions found.', style: TextStyle(color: Colors.grey)),
                  ),
                )
              : ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: driver.advanceHistory.length,
                  itemBuilder: (context, index) {
                    final item = driver.advanceHistory[index];
                    final isAdvance = item.type == 'advance';

                    return Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        side: BorderSide(color: theme.colorScheme.outlineVariant),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: (isAdvance ? Colors.orange : Colors.green).withOpacity(0.12),
                          child: Icon(
                            isAdvance ? Icons.arrow_outward : Icons.arrow_downward,
                            color: isAdvance ? Colors.orange : Colors.green,
                            size: 16,
                          ),
                        ),
                        title: Text(item.description, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        subtitle: Text(item.date.toIso8601String().split('T')[0], style: const TextStyle(fontSize: 11)),
                        trailing: Text(
                          '${isAdvance ? "+" : "-"} ₹${item.amount.toStringAsFixed(0)}',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isAdvance ? Colors.red : Colors.green,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    );
                  },
                )
        ],
      ),
    );
  }

  void _showAdvanceDialog(BuildContext context, String actionType) {
    final amountController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(actionType, style: const TextStyle(fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: amountController,
                decoration: const InputDecoration(labelText: 'Amount (₹) *', border: OutlineInputBorder()),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descController,
                decoration: const InputDecoration(labelText: 'Reason / Description *', border: OutlineInputBorder()),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                final amt = double.tryParse(amountController.text.trim()) ?? 0.0;
                final desc = descController.text.trim();
                if (amt > 0 && desc.isNotEmpty) {
                  if (actionType == 'Issue Advance') {
                    context.read<FleetViewModel>().issueAdvance(driver.id, amt, desc);
                  } else {
                    context.read<FleetViewModel>().logRepayment(driver.id, amt, desc);
                  }
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Transaction successfully logged!')),
                  );
                }
              },
              child: const Text('Save'),
            )
          ],
        );
      },
    );
  }

  Widget _buildDocsTab(BuildContext context, ThemeData theme) {
    return Column(
      children: [
        // Driver Docs Banner
        Container(
          width: double.infinity,
          color: theme.colorScheme.secondaryContainer,
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.folder_shared, color: theme.colorScheme.secondary, size: 20),
                  const SizedBox(width: 8),
                  Text('COMPLIANCE DOCUMENT VAULT', style: TextStyle(fontWeight: FontWeight.bold, color: theme.colorScheme.secondary)),
                ],
              ),
              const SizedBox(height: 8),
              const Text(
                'Upload Aadhaar scans, medical certificates, training clearances or driving license receipts. Authenticated documents are backed up securely.',
                style: TextStyle(fontSize: 12),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () {
                  _showUploadSheet(context);
                },
                icon: const Icon(Icons.file_upload),
                label: const Text('Upload Driver Credentials'),
              ),
            ],
          ),
        ),

        Expanded(
          child: driver.documents.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.folder_off_outlined, size: 48, color: theme.colorScheme.outlineVariant),
                      const SizedBox(height: 12),
                      const Text('No uploaded compliance files', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: driver.documents.length,
                  itemBuilder: (context, index) {
                    final doc = driver.documents[index];
                    return Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        side: BorderSide(color: theme.colorScheme.outlineVariant),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      margin: const EdgeInsets.only(bottom: 10),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: theme.colorScheme.surfaceContainerHigh,
                          child: Icon(Icons.verified_user, color: theme.colorScheme.primary, size: 18),
                        ),
                        title: Text(doc.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        subtitle: Text('${doc.type} • ${doc.uploadedAt.toIso8601String().split('T')[0]}', style: const TextStyle(fontSize: 11)),
                        trailing: IconButton(
                          icon: const Icon(Icons.download, size: 18),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Downloading file to system storage...')),
                            );
                          },
                        ),
                      ),
                    );
                  },
                ),
        )
      ],
    );
  }

  void _showUploadSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (sheetCtx) {
        return SafeArea(
          child: Wrap(
            children: [
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('Select Document Source', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Take Picture from Camera'),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _simulateUpload(context, 'Camera');
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Pick from Device Gallery'),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _simulateUpload(context, 'Gallery');
                },
              ),
              ListTile(
                leading: const Icon(Icons.picture_as_pdf),
                title: const Text('Browse PDF Document'),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _simulateUpload(context, 'PDF');
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _simulateUpload(BuildContext context, String source) {
    final types = ['License', 'Aadhaar', 'Medical', 'Other'];
    String selectedType = 'License';

    showDialog(
      context: context,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Upload Specification', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Simulating upload from $source source.', style: const TextStyle(fontSize: 12)),
                  const SizedBox(height: 12),
                  const Text('Document Category *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                  DropdownButton<String>(
                    value: selectedType,
                    isExpanded: true,
                    items: types.map((t) {
                      return DropdownMenuItem<String>(value: t, child: Text(t));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => selectedType = val);
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(dialogCtx), child: const Text('Cancel')),
                ElevatedButton(
                  onPressed: () {
                    final filename = '${selectedType.toLowerCase()}_credential_${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}.pdf';
                    final newDoc = DriverDocument(
                      id: 'dd_${DateTime.now().millisecondsSinceEpoch}',
                      name: filename,
                      type: selectedType,
                      uploadedAt: DateTime.now(),
                    );
                    context.read<FleetViewModel>().addDriverDoc(driver.id, newDoc);
                    Navigator.pop(dialogCtx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Uploaded $filename to encrypted cloud bucket!')),
                    );
                  },
                  child: const Text('Upload'),
                )
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildSpecRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class DriverRegistrationForm extends StatefulWidget {
  const DriverRegistrationForm({super.key});

  @override
  State<DriverRegistrationForm> createState() => _DriverRegistrationFormState();
}

class _DriverRegistrationFormState extends State<DriverRegistrationForm> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _licenseController = TextEditingController();
  final _salaryRateController = TextEditingController();
  String _salaryType = 'Monthly';
  String _assignedVehicle = 'None';

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _licenseController.dispose();
    _salaryRateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final vehicles = context.read<FleetViewModel>().vehicles;

    return Scaffold(
      appBar: AppBar(title: const Text('Register New Driver', style: TextStyle(fontWeight: FontWeight.bold))),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Driver Full Name *', border: OutlineInputBorder()),
              validator: (v) => v == null || v.trim().isEmpty ? 'Driver name is required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _phoneController,
              decoration: const InputDecoration(labelText: 'Mobile Number *', border: OutlineInputBorder()),
              keyboardType: TextInputType.phone,
              validator: (v) => v == null || v.trim().isEmpty ? 'Mobile number is required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _licenseController,
              decoration: const InputDecoration(labelText: 'Driving License Number *', border: OutlineInputBorder()),
              textCapitalization: TextCapitalization.characters,
              validator: (v) => v == null || v.trim().isEmpty ? 'License number is required' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _salaryType,
              decoration: const InputDecoration(labelText: 'Salary Calculation Type *', border: OutlineInputBorder()),
              items: ['Monthly', 'Daily', 'PerTrip'].map((t) {
                return DropdownMenuItem(value: t, child: Text(t));
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _salaryType = val);
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _salaryRateController,
              decoration: const InputDecoration(labelText: 'Base Rate (₹) *', border: OutlineInputBorder()),
              keyboardType: TextInputType.number,
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Salary base rate is required';
                if (double.tryParse(v) == null) return 'Enter a valid number';
                return null;
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _assignedVehicle,
              decoration: const InputDecoration(labelText: 'Assign Vehicle', border: OutlineInputBorder()),
              items: [
                const DropdownMenuItem(value: 'None', child: Text('None / On Call')),
                ...vehicles.map((v) {
                  return DropdownMenuItem(value: v.plateNumber, child: Text('${v.plateNumber} (${v.name})'));
                })
              ],
              onChanged: (val) {
                if (val != null) setState(() => _assignedVehicle = val);
              },
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                if (_formKey.currentState!.validate()) {
                  final newDrv = Driver(
                    id: 'drv_${DateTime.now().millisecondsSinceEpoch}',
                    name: _nameController.text.trim(),
                    phone: _phoneController.text.trim(),
                    licenseNumber: _licenseController.text.trim().toUpperCase(),
                    licenseExpiry: DateTime.now().add(const Duration(days: 365 * 5)),
                    assignedVehiclePlate: _assignedVehicle == 'None' ? '' : _assignedVehicle,
                    joiningDate: DateTime.now(),
                    salaryType: _salaryType,
                    salaryRate: double.parse(_salaryRateController.text.trim()),
                    advance: 0.0,
                    dutyStatus: 'OffDuty',
                    attendanceStatus: 'None',
                    attendanceHistory: [],
                    advanceHistory: [],
                    documents: [],
                  );

                  context.read<FleetViewModel>().addDriver(newDrv);
                  Navigator.pop(context);

                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Driver ${newDrv.name} registered successfully!')),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Complete Driver Registration', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
