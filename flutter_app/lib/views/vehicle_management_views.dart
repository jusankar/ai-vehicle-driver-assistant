import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/fleet_model.dart';
import '../viewmodels/fleet_viewmodel.dart';

class VehicleListView extends StatefulWidget {
  const VehicleListView({super.key});

  @override
  State<VehicleListView> createState() => _VehicleListViewState();
}

class _VehicleListViewState extends State<VehicleListView> {
  String _searchQuery = '';
  String _selectedStatus = 'All';

  @override
  Widget build(BuildContext context) {
    final fleetVM = context.watch<FleetViewModel>();
    final theme = Theme.of(context);

    // Filter vehicles
    final filteredVehicles = fleetVM.vehicles.where((v) {
      final matchesSearch = v.plateNumber.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          v.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          v.model.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesStatus = _selectedStatus == 'All' || v.status == _selectedStatus;
      return matchesSearch && matchesStatus;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fleet Management', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'Register Vehicle',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const VehicleRegistrationForm()),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filters Row
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search by plate number, model...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide(color: theme.colorScheme.outline),
                    ),
                    filled: true,
                    fillColor: theme.colorScheme.surfaceContainerLow,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: ['All', 'Active', 'Maintenance', 'Inactive'].map((status) {
                    final isSelected = _selectedStatus == status;
                    return ChoiceChip(
                      label: Text(status),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) setState(() => _selectedStatus = status);
                      },
                    );
                  }).toList(),
                )
              ],
            ),
          ),

          // Vehicle List
          Expanded(
            child: filteredVehicles.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.local_shipping_outlined, size: 64, color: theme.colorScheme.outlineVariant),
                        const SizedBox(height: 16),
                        Text('No trucks found matching filters', style: theme.textTheme.bodyLarge),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filteredVehicles.length,
                    itemBuilder: (context, index) {
                      final vehicle = filteredVehicles[index];
                      return _buildVehicleCard(context, vehicle, theme);
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const VehicleRegistrationForm()),
          );
        },
        tooltip: 'Register Vehicle',
        child: const Icon(Icons.add_road),
      ),
    );
  }

  Widget _buildVehicleCard(BuildContext context, Vehicle vehicle, ThemeData theme) {
    Color statusColor = Colors.green;
    if (vehicle.status == 'Maintenance') {
      statusColor = Colors.orange;
    } else if (vehicle.status == 'Inactive') {
      statusColor = Colors.grey;
    }

    // Days until document expiries
    final today = DateTime(2026, 7, 17);
    int expiringCount = 0;
    if (vehicle.insuranceExpiry != null && vehicle.insuranceExpiry!.difference(today).inDays <= 30) expiringCount++;
    if (vehicle.fitnessExpiry != null && vehicle.fitnessExpiry!.difference(today).inDays <= 30) expiringCount++;
    if (vehicle.permitExpiry != null && vehicle.permitExpiry!.difference(today).inDays <= 30) expiringCount++;

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        side: BorderSide(color: theme.colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(16),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: theme.colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                vehicle.plateNumber,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onPrimaryContainer,
                  fontFamily: 'monospace',
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                vehicle.name,
                style: const TextStyle(fontWeight: FontWeight.bold),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('${vehicle.manufacturer} • ${vehicle.model}', style: theme.textTheme.bodySmall),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.speed, size: 14, color: theme.colorScheme.outline),
                  const SizedBox(width: 4),
                  Text('${vehicle.currentOdometer.toStringAsFixed(0)} km', style: theme.textTheme.labelSmall),
                  const SizedBox(width: 16),
                  Icon(Icons.toll, size: 14, color: theme.colorScheme.outline),
                  const SizedBox(width: 4),
                  Text('FASTag: Rs. ${vehicle.fastagBalance.toStringAsFixed(0)}', style: theme.textTheme.labelSmall),
                ],
              ),
              if (expiringCount > 0) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.warning, size: 14, color: theme.colorScheme.error),
                    const SizedBox(width: 4),
                    Text(
                      '$expiringCount documents expiring soon!',
                      style: TextStyle(color: theme.colorScheme.error, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ],
                ),
              ]
            ],
          ),
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, py: 4),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                vehicle.status,
                style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
            const SizedBox(height: 4),
            const Icon(Icons.chevron_right, size: 18),
          ],
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => VehicleDetailView(vehicle: vehicle)),
          );
        },
      ),
    );
  }
}

class VehicleDetailView extends StatelessWidget {
  final Vehicle vehicle;
  const VehicleDetailView({super.key, required this.vehicle});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final today = DateTime(2026, 7, 17);

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: Text(vehicle.plateNumber, style: const TextStyle(fontWeight: FontWeight.bold)),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Specs'),
              Tab(text: 'Docs Vault'),
              Tab(text: 'Expenses'),
              Tab(text: 'History'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildSpecsTab(context, theme),
            _buildDocsTab(context, theme, today),
            _buildExpensesTab(context, theme),
            _buildHistoryTab(context, theme),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecsTab(BuildContext context, ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Core Specifications', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
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
                  _buildSpecRow('Vehicle Name', vehicle.name),
                  const Divider(),
                  _buildSpecRow('Model', vehicle.model),
                  const Divider(),
                  _buildSpecRow('Manufacturer', vehicle.manufacturer),
                  const Divider(),
                  _buildSpecRow('Chassis Number', vehicle.chassisNumber),
                  const Divider(),
                  _buildSpecRow('Engine Number', vehicle.engineNumber),
                  const Divider(),
                  _buildSpecRow('Purchase Date', vehicle.purchaseDate.toIso8601String().split('T')[0]),
                  const Divider(),
                  _buildSpecRow('Odometer', '${vehicle.currentOdometer.toStringAsFixed(0)} km'),
                  const Divider(),
                  _buildSpecRow('FASTag ID', vehicle.fastagId),
                  const Divider(),
                  _buildSpecRow('FASTag Balance', 'Rs. ${vehicle.fastagBalance.toStringAsFixed(0)}'),
                ],
              ),
            ),
          ),
        ],
      ),
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

  Widget _buildDocsTab(BuildContext context, ThemeData theme, DateTime today) {
    final docsList = [
      {'title': 'Insurance Policy', 'no': vehicle.insuranceNo, 'expiry': vehicle.insuranceExpiry, 'type': 'Insurance'},
      {'title': 'Fitness Certificate', 'no': vehicle.fitnessNo, 'expiry': vehicle.fitnessExpiry, 'type': 'Fitness'},
      {'title': 'National Permit', 'no': vehicle.permitNo, 'expiry': vehicle.permitExpiry, 'type': 'Permit'},
      {'title': 'Road Tax Receipt', 'no': vehicle.roadTaxNo, 'expiry': vehicle.roadTaxExpiry, 'type': 'Road Tax'},
      {'title': 'Pollution (PUC)', 'no': vehicle.pucNo, 'expiry': vehicle.pucExpiry, 'type': 'PUC'},
    ];

    return Column(
      children: [
        // AI Upload Document Vault Banner
        Container(
          width: double.infinity,
          color: theme.colorScheme.primaryContainer,
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.auto_awesome, color: theme.colorScheme.primary, size: 20),
                  const SizedBox(width: 8),
                  Text('AI DOCUMENT VAULT', style: TextStyle(fontWeight: FontWeight.bold, color: theme.colorScheme.primary)),
                ],
              ),
              const SizedBox(height: 8),
              const Text(
                'Upload renewal documents, PUC certificates or toll receipts below. Gemini AI automatically parses, extracts expiry dates, and updates this registry in real-time.',
                style: TextStyle(fontSize: 12),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Picking document to parse with Gemini AI...')),
                  );
                },
                icon: const Icon(Icons.upload_file),
                label: const Text('Upload & Parse Renewal Document'),
              ),
            ],
          ),
        ),

        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: docsList.length,
            itemBuilder: (context, index) {
              final doc = docsList[index];
              final title = doc['title'] as String;
              final no = doc['no'] as String?;
              final expiry = doc['expiry'] as DateTime?;

              String subtitle = 'No document loaded';
              Color statusColor = theme.colorScheme.outline;
              int daysLeft = 0;

              if (no != null && expiry != null) {
                daysLeft = expiry.difference(today).inDays;
                subtitle = "No: $no\nExpires: ${expiry.toIso8601String().split('T')[0]}";
                if (daysLeft <= 0) {
                  subtitle += ' (EXPIRED)';
                  statusColor = Colors.red;
                } else if (daysLeft <= 30) {
                  subtitle += ' ($daysLeft days remaining)';
                  statusColor = Colors.amber;
                } else {
                  subtitle += ' ($daysLeft days remaining)';
                  statusColor = Colors.green;
                }
              }

              return Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: theme.colorScheme.outlineVariant),
                  borderRadius: BorderRadius.circular(12),
                ),
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: statusColor.withOpacity(0.15),
                    child: Icon(Icons.article, color: statusColor),
                  ),
                  title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
                  trailing: Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildExpensesTab(BuildContext context, ThemeData theme) {
    if (vehicle.expenses.isEmpty) {
      return const Center(child: Text('No expenses logged yet.'));
    }

    return Column(
      children: [
        ListTile(
          title: const Text('Expense Analysis', style: TextStyle(fontWeight: FontWeight.bold)),
          subtitle: const Text('Parsed from invoices, bills and toll plaza recharges.'),
          trailing: Text(
            'Total: Rs. ${vehicle.expenses.fold(0.0, (sum, item) => sum + item.amount).toStringAsFixed(0)}',
            style: TextStyle(fontWeight: FontWeight.bold, color: theme.colorScheme.primary, fontSize: 16),
          ),
        ),
        const Divider(),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: vehicle.expenses.length,
            itemBuilder: (context, index) {
              final exp = vehicle.expenses[index];
              return Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: theme.colorScheme.outlineVariant),
                  borderRadius: BorderRadius.circular(12),
                ),
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: theme.colorScheme.secondaryContainer,
                    child: Icon(
                      exp.category == 'Fuel' ? Icons.local_gas_station : Icons.build,
                      color: theme.colorScheme.primary,
                      size: 20,
                    ),
                  ),
                  title: Text(exp.category, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${exp.date} • ${exp.description}', style: const TextStyle(fontSize: 12)),
                  trailing: Text(
                    'Rs. ${exp.amount.toStringAsFixed(0)}',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryTab(BuildContext context, ThemeData theme) {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          const TabBar(
            tabs: [
              Tab(icon: Icon(Icons.construction), text: 'Service Logs'),
              Tab(icon: Icon(Icons.route), text: 'Trip Records'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildServiceHistoryList(theme),
                _buildTripHistoryList(theme),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildServiceHistoryList(ThemeData theme) {
    if (vehicle.serviceHistory.isEmpty) {
      return const Center(child: Text('No service history registered.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: vehicle.serviceHistory.length,
      itemBuilder: (context, index) {
        final service = vehicle.serviceHistory[index];
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            side: BorderSide(color: theme.colorScheme.outlineVariant),
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.only(bottom: 12),
          child: ExpansionTile(
            title: Text(service.type, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${service.date} • Rs. ${service.cost.toStringAsFixed(0)}'),
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSpecRow('Provider', service.provider),
                    _buildSpecRow('Odometer Reading', '${service.odometer.toStringAsFixed(0)} km'),
                    const SizedBox(height: 8),
                    const Text('Service Details:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    const SizedBox(height: 4),
                    Text(service.details, style: TextStyle(fontSize: 12, color: theme.colorScheme.onSurfaceVariant)),
                  ],
                ),
              )
            ],
          ),
        );
      },
    );
  }

  Widget _buildTripHistoryList(ThemeData theme) {
    if (vehicle.tripHistory.isEmpty) {
      return const Center(child: Text('No trip logs registered.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: vehicle.tripHistory.length,
      itemBuilder: (context, index) {
        final trip = vehicle.tripHistory[index];
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            side: BorderSide(color: theme.colorScheme.outlineVariant),
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Trip Date: ${trip.date}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('Driver: ${trip.driverName}', style: const TextStyle(fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Column(
                      children: [
                        Text('FROM', style: theme.textTheme.labelSmall),
                        Text(trip.from, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    const Icon(Icons.arrow_right_alt, size: 28),
                    Column(
                      children: [
                        Text('TO', style: theme.textTheme.labelSmall),
                        Text(trip.to, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Distance: ${trip.distanceKm} km', style: const TextStyle(fontSize: 13)),
                    Text('Fuel Used: ${trip.fuelUsedLiters} L', style: const TextStyle(fontSize: 13)),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class VehicleRegistrationForm extends StatefulWidget {
  const VehicleRegistrationForm({super.key});

  @override
  State<VehicleRegistrationForm> createState() => _VehicleRegistrationFormState();
}

class _VehicleRegistrationFormState extends State<VehicleRegistrationForm> {
  final _formKey = GlobalKey<FormState>();
  final _plateController = TextEditingController();
  final _nameController = TextEditingController();
  final _modelController = TextEditingController();
  final _manufacturerController = TextEditingController();
  final _engineController = TextEditingController();
  final _chassisController = TextEditingController();
  final _odometerController = TextEditingController();

  @override
  void dispose() {
    _plateController.dispose();
    _nameController.dispose();
    _modelController.dispose();
    _manufacturerController.dispose();
    _engineController.dispose();
    _chassisController.dispose();
    _odometerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Register New Vehicle', style: TextStyle(fontWeight: FontWeight.bold))),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _plateController,
              decoration: const InputDecoration(labelText: 'Plate Number * (e.g. TN68AB1234)', border: OutlineInputBorder()),
              validator: (v) => v == null || v.trim().isEmpty ? 'Plate number is required' : null,
              textCapitalization: TextCapitalization.characters,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Vehicle Nickname *', border: OutlineInputBorder()),
              validator: (v) => v == null || v.trim().isEmpty ? 'Nickname is required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _manufacturerController,
              decoration: const InputDecoration(labelText: 'Manufacturer * (e.g. BharatBenz)', border: OutlineInputBorder()),
              validator: (v) => v == null || v.trim().isEmpty ? 'Manufacturer is required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _modelController,
              decoration: const InputDecoration(labelText: 'Model Name * (e.g. 2823R)', border: OutlineInputBorder()),
              validator: (v) => v == null || v.trim().isEmpty ? 'Model name is required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _engineController,
              decoration: const InputDecoration(labelText: 'Engine Number *', border: OutlineInputBorder()),
              validator: (v) => v == null || v.trim().isEmpty ? 'Engine number is required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _chassisController,
              decoration: const InputDecoration(labelText: 'Chassis Number *', border: OutlineInputBorder()),
              validator: (v) => v == null || v.trim().isEmpty ? 'Chassis number is required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _odometerController,
              decoration: const InputDecoration(labelText: 'Current Odometer Reading (km) *', border: OutlineInputBorder()),
              keyboardType: TextInputType.number,
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Odometer reading is required';
                if (double.tryParse(v) == null) return 'Enter a valid number';
                return null;
              },
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                if (_formKey.currentState!.validate()) {
                  final newVeh = Vehicle(
                    plateNumber: _plateController.text.trim().toUpperCase(),
                    name: _nameController.text.trim(),
                    model: _modelController.text.trim(),
                    manufacturer: _manufacturerController.text.trim(),
                    purchaseDate: DateTime.now(),
                    engineNumber: _engineController.text.trim(),
                    chassisNumber: _chassisController.text.trim(),
                    fastagId: 'FT-${_plateController.text.trim().toUpperCase()}',
                    fastagBalance: 1500.0,
                    currentOdometer: double.parse(_odometerController.text.trim()),
                    status: 'Active',
                    assignedDriverId: 'drv_1',
                    documents: [],
                    expenses: [],
                    serviceHistory: [],
                    tripHistory: [],
                  );

                  context.read<FleetViewModel>().registerVehicle(newVeh);
                  Navigator.pop(context);

                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Vehicle ${newVeh.plateNumber} registered successfully!')),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Complete Registration', style: TextStyle(fontWeight: FontWeight.bold)),
            )
          ],
        ),
      ),
    );
  }
}
