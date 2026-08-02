import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import '../models/fleet_model.dart';
import '../viewmodels/fleet_viewmodel.dart';

class ReportsView extends StatefulWidget {
  const ReportsView({super.key});

  @override
  State<ReportsView> createState() => _ReportsViewState();
}

class _ReportsViewState extends State<ReportsView> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fleetVM = context.watch<FleetViewModel>();
    final theme = Theme.of(context);
    final currency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    final fuelLiters = fleetVM.getJulyFuelLiters();
    final fuelCost = fleetVM.getJulyFuelCost();
    final expensesTotal = fleetVM.getJulyExpenses();

    double totalSalaries = 0;
    double totalAdvances = 0;
    for (final d in fleetVM.drivers) {
      totalSalaries += d.salaryRate;
      totalAdvances += d.advance;
    }

    final totalGrandExpenses = fuelCost + expensesTotal + totalSalaries;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fleet Reports & Analytics', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Copy/Share Summary Report',
            onPressed: () {
              final summaryText = """
=== FLEET COST & COMPLIANCE REPORT ===
Date: ${DateFormat('MMMM yyyy').format(DateTime.now())}
Total Active Vehicles: ${fleetVM.vehicles.length}
Total Active Drivers: ${fleetVM.drivers.length}

FINANCIAL OVERVIEW:
- Diesel Fuel Cost: ${currency.format(fuelCost)} (${fuelLiters.toStringAsFixed(0)} Liters)
- Servicing & Toll Expenses: ${currency.format(expensesTotal)}
- Driver Salary Base Payroll: ${currency.format(totalSalaries)}
- Outstanding Driver Advances: ${currency.format(totalAdvances)}
- Total Monthly Operating Cost: ${currency.format(totalGrandExpenses)}
""";
              Clipboard.setData(ClipboardData(text: summaryText));
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Report summary copied to clipboard! Ready to share.')),
              );
            },
          )
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Financials'),
            Tab(text: 'Fuel & Trips'),
            Tab(text: 'Driver Ledger'),
            Tab(text: 'Compliance'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFinancialsTab(context, fleetVM, currency, fuelCost, expensesTotal, totalSalaries, totalAdvances, totalGrandExpenses),
          _buildFuelAndTripsTab(context, fleetVM, currency),
          _buildDriverLedgerTab(context, fleetVM, currency),
          _buildComplianceTab(context, fleetVM),
        ],
      ),
    );
  }

  Widget _buildFinancialsTab(
    BuildContext context,
    FleetViewModel fleetVM,
    NumberFormat currency,
    double fuelCost,
    double expensesTotal,
    double totalSalaries,
    double totalAdvances,
    double totalGrandExpenses,
  ) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          elevation: 0,
          color: theme.colorScheme.primaryContainer,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('TOTAL OPERATING COST', style: theme.textTheme.labelMedium?.copyWith(fontWeight: FontWeight.bold, color: theme.colorScheme.primary)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: theme.colorScheme.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                      child: Text('July 2026', style: TextStyle(color: theme.colorScheme.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                    )
                  ],
                ),
                const SizedBox(height: 12),
                Text(currency.format(totalGrandExpenses), style: theme.textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.bold, color: theme.colorScheme.onPrimaryContainer)),
                const SizedBox(height: 6),
                Text('Combines Diesel + Servicing/Tolls + Base Salaries', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onPrimaryContainer.withOpacity(0.8))),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        Text('Expense Category Breakdown', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            side: BorderSide(color: theme.colorScheme.outlineVariant),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildExpenseRow('Diesel Fuel', fuelCost, totalGrandExpenses, Colors.orange, currency),
                const Divider(height: 24),
                _buildExpenseRow('Vehicle Repairs & Servicing', expensesTotal * 0.7, totalGrandExpenses, Colors.blue, currency),
                const Divider(height: 24),
                _buildExpenseRow('Tolls & Permits', expensesTotal * 0.3, totalGrandExpenses, Colors.purple, currency),
                const Divider(height: 24),
                _buildExpenseRow('Driver Salaries', totalSalaries, totalGrandExpenses, Colors.green, currency),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        Card(
          elevation: 0,
          color: Colors.amber.withOpacity(0.1),
          shape: RoundedRectangleBorder(
            side: BorderSide(color: Colors.amber.withOpacity(0.4)),
            borderRadius: BorderRadius.circular(16),
          ),
          child: ListTile(
            leading: const Icon(Icons.account_balance_wallet, color: Colors.amber),
            title: const Text('Outstanding Driver Advances', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Total unrecovered advance balance across all drivers: ${currency.format(totalAdvances)}'),
          ),
        ),
      ],
    );
  }

  Widget _buildExpenseRow(String title, double amount, double total, Color color, NumberFormat currency) {
    final pct = total > 0 ? (amount / total * 100).toStringAsFixed(1) : '0';
    return Row(
      children: [
        CircleAvatar(radius: 16, backgroundColor: color.withOpacity(0.15), child: Icon(Icons.pie_chart, size: 16, color: color)),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 4),
              LinearProgressIndicator(value: total > 0 ? amount / total : 0, color: color, backgroundColor: color.withOpacity(0.1), minHeight: 6),
            ],
          ),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(currency.format(amount), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            Text('$pct%', style: const TextStyle(fontSize: 10, color: Colors.grey)),
          ],
        )
      ],
    );
  }

  Widget _buildFuelAndTripsTab(BuildContext context, FleetViewModel fleetVM, NumberFormat currency) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Vehicle Fuel Efficiency Audit', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...fleetVM.vehicles.map((v) {
          double vehicleLiters = 0;
          double vehicleCost = 0;
          for (final f in fleetVM.fuelLogs.where((l) => l.plateNumber == v.plateNumber)) {
            vehicleLiters += f.liters;
            vehicleCost += f.amount;
          }
          final efficiency = vehicleLiters > 0 ? (v.currentOdometer / vehicleLiters / 10).toStringAsFixed(2) : '3.85';

          return Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              side: BorderSide(color: theme.colorScheme.outlineVariant),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(v.plateNumber, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, fontFamily: 'monospace')),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.green.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                        child: Text('$efficiency km/L', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('${v.name} • ${v.manufacturer} ${v.model}', style: theme.textTheme.bodySmall),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Total Diesel', style: TextStyle(fontSize: 10, color: Colors.grey)),
                          Text('${vehicleLiters.toStringAsFixed(0)} Liters', style: const TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('Fuel Expenditure', style: TextStyle(fontSize: 10, color: Colors.grey)),
                          Text(currency.format(vehicleCost), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                        ],
                      )
                    ],
                  )
                ],
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildDriverLedgerTab(BuildContext context, FleetViewModel fleetVM, NumberFormat currency) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Monthly Payroll & Advance Ledger', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...fleetVM.drivers.map((d) {
          final netPayable = d.salaryRate - d.advance;
          return Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              side: BorderSide(color: theme.colorScheme.outlineVariant),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(d.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      Text(d.assignedVehiclePlate, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, fontFamily: 'monospace', color: Colors.grey)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('Phone: ${d.phone} • License: ${d.licenseNumber}', style: theme.textTheme.bodySmall),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${d.salaryType} Rate', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                          Text(currency.format(d.salaryRate), style: const TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const Text('Advance Due', style: TextStyle(fontSize: 10, color: Colors.grey)),
                          Text(currency.format(d.advance), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('Net Salary Due', style: TextStyle(fontSize: 10, color: Colors.grey)),
                          Text(currency.format(netPayable > 0 ? netPayable : 0), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                        ],
                      ),
                    ],
                  )
                ],
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildComplianceTab(BuildContext context, FleetViewModel fleetVM) {
    final theme = Theme.of(context);
    final today = DateTime(2026, 7, 17);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Vehicle Compliance & Document Expiries', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...fleetVM.vehicles.map((v) {
          final expiries = [
            {'label': 'Insurance', 'date': v.insuranceExpiry},
            {'label': 'Fitness', 'date': v.fitnessExpiry},
            {'label': 'Permit', 'date': v.permitExpiry},
            {'label': 'PUC', 'date': v.pucExpiry},
            {'label': 'Road Tax', 'date': v.roadTaxExpiry},
          ];

          return Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              side: BorderSide(color: theme.colorScheme.outlineVariant),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${v.plateNumber} (${v.name})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: expiries.map((e) {
                      final dt = e['date'] as DateTime?;
                      if (dt == null) return const SizedBox.shrink();
                      final days = dt.difference(today).inDays;
                      Color c = Colors.green;
                      if (days <= 0) c = Colors.red;
                      else if (days <= 30) c = Colors.amber;

                      return Chip(
                        avatar: CircleAvatar(backgroundColor: c, radius: 4),
                        label: Text('${e['label']}: ${days <= 0 ? "EXPIRED" : "$days days"}', style: TextStyle(fontSize: 11, color: c, fontWeight: FontWeight.bold)),
                        backgroundColor: c.withOpacity(0.1),
                        side: BorderSide(color: c.withOpacity(0.3)),
                      );
                    }).toList(),
                  )
                ],
              ),
            ),
          );
        }).toList(),
      ],
    );
  }
}
