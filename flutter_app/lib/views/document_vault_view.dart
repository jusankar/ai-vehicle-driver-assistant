import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import '../models/cloud_document.dart';
import '../models/fleet_model.dart';
import '../viewmodels/fleet_viewmodel.dart';

class DocumentVaultView extends StatefulWidget {
  const DocumentVaultView({super.key});

  @override
  State<DocumentVaultView> createState() => _DocumentVaultViewState();
}

class _DocumentVaultViewState extends State<DocumentVaultView> {
  final _notesController = TextEditingController();
  String _selectedType = 'Insurance PDF';
  String _selectedSource = 'PDF';
  
  String? _pickedFileName;
  String? _pickedFileSize;
  bool _isUploading = false;
  double _uploadProgress = 0.0;

  final List<String> _documentTypes = [
    'Insurance PDF',
    'Fuel Bills',
    'Service Bills',
    'Tyre Bills',
    'Battery Bills',
    'RC',
    'Fitness Certificate',
    'Driving License',
    'Salary Receipt'
  ];

  final List<String> _uploadSources = ['PDF', 'Camera', 'Gallery'];

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    try {
      if (_selectedSource == 'Camera') {
        final picker = ImagePicker();
        final XFile? image = await picker.pickImage(source: ImageSource.camera);
        if (image != null) {
          final length = await image.length();
          setState(() {
            _pickedFileName = image.name;
            _pickedFileSize = (length / 1024).toStringAsFixed(1) + ' KB';
          });
        }
      } else if (_selectedSource == 'Gallery') {
        final picker = ImagePicker();
        final XFile? image = await picker.pickImage(source: ImageSource.gallery);
        if (image != null) {
          final length = await image.length();
          setState(() {
            _pickedFileName = image.name;
            _pickedFileSize = (length / 1024).toStringAsFixed(1) + ' KB';
          });
        }
      } else {
        FilePickerResult? result = await FilePicker.platform.pickFiles(
          type: FileType.custom,
          allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xls', 'xlsx'],
        );
        if (result != null && result.files.isNotEmpty) {
          final file = result.files.first;
          setState(() {
            _pickedFileName = file.name;
            _pickedFileSize = (file.size / 1024).toStringAsFixed(1) + ' KB';
          });
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('File picker error: $e')),
      );
    }
  }

  void _simulateUpload() async {
    if (_pickedFileName == null) {
      await _pickFile();
      if (_pickedFileName == null) return;
    }

    setState(() {
      _isUploading = true;
      _uploadProgress = 0.0;
    });

    for (int i = 1; i <= 5; i++) {
      await Future.delayed(const Duration(milliseconds: 300));
      setState(() {
        _uploadProgress = i * 0.2;
      });
    }

    final fleetVM = context.read<FleetViewModel>();
    final newDoc = CloudDocument(
      id: 'cd_${DateTime.now().millisecondsSinceEpoch}',
      name: _pickedFileName ?? 'document_${DateTime.now().millisecondsSinceEpoch}.pdf',
      documentType: _selectedType,
      source: _selectedSource,
      uploadedAt: DateTime.now(),
      fileSize: _pickedFileSize ?? '1.2 MB',
      storageUrl: 'https://storage.googleapis.com/fleet-cloud-bucket/doc_${DateTime.now().millisecondsSinceEpoch}',
      notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
    );

    fleetVM.addCloudDocument(newDoc);

    setState(() {
      _isUploading = false;
      _pickedFileName = null;
      _pickedFileSize = null;
      _notesController.clear();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: Colors.green,
        content: Text('"${newDoc.name}" uploaded & saved securely in Centralized Vault!'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final fleetVM = context.watch<FleetViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cloud Storage Vault', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withOpacity(0.15),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.lock_outline, size: 12, color: Color(0xFF10B981)),
                SizedBox(width: 4),
                Text('AES-256', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                elevation: 0,
                color: theme.colorScheme.primaryContainer.withOpacity(0.4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: theme.colorScheme.primary.withOpacity(0.2)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: theme.colorScheme.primary,
                        foregroundColor: theme.colorScheme.onPrimary,
                        child: const Icon(Icons.cloud_done_outlined),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Centralized Document Vault',
                              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold, color: theme.colorScheme.primary),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Upload regulatory files, driver receipts, and certificates securely to Google Cloud Storage.',
                              style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              Text('Commit New Document', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: theme.colorScheme.outlineVariant),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Document Type *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                                const SizedBox(height: 6),
                                DropdownButtonFormField<String>(
                                  value: _selectedType,
                                  isExpanded: true,
                                  decoration: InputDecoration(
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  items: _documentTypes.map((type) {
                                    return DropdownMenuItem(value: type, child: Text(type, style: const TextStyle(fontSize: 13)));
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) setState(() => _selectedType = val);
                                  },
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Source *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                                const SizedBox(height: 6),
                                DropdownButtonFormField<String>(
                                  value: _selectedSource,
                                  isExpanded: true,
                                  decoration: InputDecoration(
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  items: _uploadSources.map((source) {
                                    return DropdownMenuItem(value: source, child: Text(source, style: const TextStyle(fontSize: 13)));
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) {
                                      setState(() {
                                        _selectedSource = val;
                                        _pickedFileName = null;
                                        _pickedFileSize = null;
                                      });
                                    }
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surfaceContainerLow,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: theme.colorScheme.outlineVariant),
                        ),
                        child: Column(
                          children: [
                            if (_pickedFileName != null) ...[
                              const Icon(Icons.insert_drive_file, size: 40, color: Colors.green),
                              const SizedBox(height: 12),
                              Text(_pickedFileName!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13), textAlign: TextAlign.center),
                              const SizedBox(height: 4),
                              Text('Size: ${_pickedFileSize ?? "Unknown"}', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                              const SizedBox(height: 8),
                              TextButton(
                                onPressed: () => setState(() {
                                  _pickedFileName = null;
                                  _pickedFileSize = null;
                                }),
                                child: const Text('Change Selected File', style: TextStyle(color: Colors.red, fontSize: 12)),
                              )
                            ] else ...[
                              Icon(
                                _selectedSource == 'Camera'
                                    ? Icons.camera_alt_outlined
                                    : (_selectedSource == 'Gallery' ? Icons.photo_library_outlined : Icons.picture_as_pdf),
                                size: 40,
                                color: theme.colorScheme.primary,
                              ),
                              const SizedBox(height: 12),
                              Text('Select ${_selectedSource} file to attach', style: const TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              ElevatedButton.icon(
                                onPressed: _pickFile,
                                icon: Icon(_selectedSource == 'Camera' ? Icons.camera : Icons.attach_file),
                                label: Text(_selectedSource == 'Camera' ? 'Take Snapshot' : 'Browse File'),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      const Text('Add Indexing Tags / Notes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _notesController,
                        style: const TextStyle(fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'e.g. TN68AB1234 Chennai Toll receipt, July 2026',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 20),

                      _isUploading
                          ? Column(
                              children: [
                                LinearProgressIndicator(value: _uploadProgress, borderRadius: BorderRadius.circular(4)),
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Uploading block chunk to Cloud Storage...', style: theme.textTheme.labelSmall),
                                    Text('${(_uploadProgress * 100).toInt()}%', style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ],
                            )
                          : SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                onPressed: _simulateUpload,
                                icon: const Icon(Icons.cloud_upload),
                                label: const Text('Upload to secure Cloud Storage', style: TextStyle(fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: theme.colorScheme.primary,
                                  foregroundColor: theme.colorScheme.onPrimary,
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            )
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Cloud Storage History (${fleetVM.uploadedDocuments.length})', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const Icon(Icons.sync, size: 16, color: Colors.grey),
                ],
              ),
              const SizedBox(height: 12),
              
              fleetVM.uploadedDocuments.isEmpty
                  ? Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(color: theme.colorScheme.outlineVariant),
                      ),
                      child: const Padding(
                        padding: EdgeInsets.all(24.0),
                        child: Center(
                          child: Text('No regulatory documents uploaded to cloud storage yet.', style: TextStyle(color: Colors.grey, fontSize: 13)),
                        ),
                      ),
                    )
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: fleetVM.uploadedDocuments.length,
                      itemBuilder: (context, index) {
                        final doc = fleetVM.uploadedDocuments[index];
                        return Card(
                          elevation: 0,
                          margin: const EdgeInsets.only(bottom: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: theme.colorScheme.outlineVariant),
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: theme.colorScheme.surfaceContainerHighest,
                              foregroundColor: theme.colorScheme.primary,
                              child: const Icon(Icons.insert_drive_file_outlined),
                            ),
                            title: Text(doc.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: theme.colorScheme.primaryContainer,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(doc.documentType, style: TextStyle(fontSize: 9, color: theme.colorScheme.onPrimaryContainer, fontWeight: FontWeight.bold)),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(doc.fileSize, style: theme.textTheme.labelSmall?.copyWith(fontFamily: 'monospace')),
                                    const SizedBox(width: 8),
                                    Text(doc.source, style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.bold)),
                                  ],
                                ),
                                if (doc.notes != null) ...[
                                  const SizedBox(height: 6),
                                  Text('"${doc.notes}"', style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic)),
                                ]
                              ],
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.open_in_new, size: 18),
                              tooltip: 'Verify Secure Storage Url',
                              onPressed: () {
                                _showUrlVerificationDialog(context, doc);
                              },
                            ),
                          ),
                        );
                      },
                    ),
            ],
          ),
        ),
      ),
    );
  }

  void _showUrlVerificationDialog(BuildContext context, CloudDocument doc) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.verified, color: Colors.green),
            const SizedBox(width: 8),
            const Text('Compliance Verified', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Storage Provider', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
            const Text('Google Cloud Storage Bucket (GCS)'),
            const SizedBox(height: 12),
            const Text('Secure Storage Location:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
            SelectableText(
              doc.storageUrl,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Colors.blue),
            ),
            const SizedBox(height: 12),
            const Text('Encryption Algorithm:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
            const Text('AES-256 GCM block encryption'),
            const SizedBox(height: 12),
            const Text('Access Logs:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
            const Text('Audited & restricted to authorized compliance officers only.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Dismiss'),
          )
        ],
      ),
    );
  }
}

class AttendanceAdvancesView extends StatefulWidget {
  final String driverId;

  const AttendanceAdvancesView({Key? key, required this.driverId}) : super(key: key);

  @override
  State<AttendanceAdvancesView> createState() => _AttendanceAdvancesViewState();
}

class _AttendanceAdvancesViewState extends State<AttendanceAdvancesView> {
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  String _transactionType = 'advance'; // 'advance' or 'repayment'

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<FleetViewModel>(context);
    final driver = viewModel.drivers.firstWhere(
      (d) => d.id == widget.driverId,
      orElse: () => Driver(
        id: '',
        name: 'Unknown',
        phone: '',
        licenseNumber: '',
        licenseExpiry: DateTime.now(),
        assignedVehiclePlate: '',
        joiningDate: DateTime.now(),
        salaryType: 'Monthly',
        salaryRate: 0,
        advance: 0,
        dutyStatus: 'OffDuty',
        attendanceStatus: 'None',
        attendanceHistory: [],
        advanceHistory: [],
        documents: [],
      ),
    );

    if (driver.id.isEmpty) {
      return const Scaffold(
        body: Center(child: Text('Driver not found')),
      );
    }

    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹');

    return Scaffold(
      appBar: AppBar(
        title: Text('${driver.name} - Ledger & Attendance'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Summary card
              Card(
                elevation: 1,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          const Text('Salary rate', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          const SizedBox(height: 4),
                          Text(
                            '${currencyFormat.format(driver.salaryRate)} (${driver.salaryType})',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                        ],
                      ),
                      Container(height: 30, width: 1, color: Colors.grey.shade300),
                      Column(
                        children: [
                          const Text('Outstanding advance', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          const SizedBox(height: 4),
                          Text(
                            currencyFormat.format(driver.advance),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: driver.advance > 0 ? Colors.red : Colors.green,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Attendance History Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Attendance Log',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _showAddAttendanceDialog(context, viewModel, driver),
                    icon: const Icon(Icons.add, size: 16),
                    label: const Text('Mark Duty'),
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (driver.attendanceHistory.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(child: Text('No attendance history recorded', style: TextStyle(color: Colors.grey))),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: driver.attendanceHistory.length,
                  itemBuilder: (context, index) {
                    final record = driver.attendanceHistory[index];
                    Color statusColor = Colors.green;
                    if (record.status == 'Leave') statusColor = Colors.amber;
                    if (record.status == 'Absent') statusColor = Colors.red;

                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: statusColor.withOpacity(0.1),
                          child: Icon(
                            record.status == 'Present' ? Icons.check_circle : Icons.cancel,
                            color: statusColor,
                          ),
                        ),
                        title: Text(DateFormat('yyyy-MM-dd').format(record.date)),
                        subtitle: record.status == 'Present' && record.startDuty != null
                            ? Text('Duty Hours: ${record.startDuty} - ${record.endDuty}')
                            : Text('Status: ${record.status}'),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            record.status,
                            style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                      ),
                    );
                  },
                ),

              const SizedBox(height: 24),

              // Advances Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Cash Advances & Repayments',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _showAddAdvanceDialog(context, viewModel, driver),
                    icon: const Icon(Icons.payment, size: 16),
                    label: const Text('New Txn'),
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (driver.advanceHistory.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(child: Text('No advance transactions recorded', style: TextStyle(color: Colors.grey))),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: driver.advanceHistory.length,
                  itemBuilder: (context, index) {
                    final record = driver.advanceHistory[index];
                    final isAdvance = record.type == 'advance';

                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: (isAdvance ? Colors.red : Colors.green).withOpacity(0.1),
                          child: Icon(
                            isAdvance ? Icons.arrow_upward : Icons.arrow_downward,
                            color: isAdvance ? Colors.red : Colors.green,
                          ),
                        ),
                        title: Text(record.description),
                        subtitle: Text(DateFormat('yyyy-MM-dd').format(record.date)),
                        trailing: Text(
                          '${isAdvance ? "+" : "-"}${currencyFormat.format(record.amount)}',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isAdvance ? Colors.red : Colors.green,
                          ),
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAddAttendanceDialog(BuildContext context, FleetViewModel viewModel, Driver driver) {
    String selectedStatus = 'Present';
    final startController = TextEditingController(text: '08:00');
    final endController = TextEditingController(text: '18:00');

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Record Driver Duty'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                value: selectedStatus,
                decoration: const InputDecoration(labelText: 'Status'),
                items: ['Present', 'Leave', 'Absent'].map((status) {
                  return DropdownMenuItem(value: status, child: Text(status));
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    setDialogState(() {
                      selectedStatus = val;
                    });
                  }
                },
              ),
              if (selectedStatus == 'Present') ...[
                const SizedBox(height: 12),
                TextField(
                  controller: startController,
                  decoration: const InputDecoration(labelText: 'Start Duty Time (HH:MM)', hintText: '08:00'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: endController,
                  decoration: const InputDecoration(labelText: 'End Duty Time (HH:MM)', hintText: '18:00'),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                viewModel.addAttendance(
                  driverId: driver.id,
                  status: selectedStatus,
                  startDuty: selectedStatus == 'Present' ? startController.text : null,
                  endDuty: selectedStatus == 'Present' ? endController.text : null,
                );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Attendance recorded successfully')),
                );
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddAdvanceDialog(BuildContext context, FleetViewModel viewModel, Driver driver) {
    _amountController.clear();
    _descController.clear();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Record Advance/Repayment'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Expanded(
                    child: RadioListTile<String>(
                      title: const Text('Advance', style: TextStyle(fontSize: 12)),
                      value: 'advance',
                      groupValue: _transactionType,
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() {
                            _transactionType = val;
                          });
                        }
                      },
                    ),
                  ),
                  Expanded(
                    child: RadioListTile<String>(
                      title: const Text('Repayment', style: TextStyle(fontSize: 12)),
                      value: 'repayment',
                      groupValue: _transactionType,
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() {
                            _transactionType = val;
                          });
                        }
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Amount (INR)', prefixText: '₹ '),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _descController,
                decoration: const InputDecoration(labelText: 'Description', hintText: 'e.g. Food money, monthly return'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                final double amount = double.tryParse(_amountController.text) ?? 0;
                if (amount <= 0) return;

                viewModel.addAdvance(
                  driverId: driver.id,
                  amount: amount,
                  description: _descController.text,
                  type: _transactionType,
                );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Transaction recorded: $_transactionType of ₹$amount')),
                );
              },
              child: const Text('Record'),
            ),
          ],
        ),
      ),
    );
  }
}
