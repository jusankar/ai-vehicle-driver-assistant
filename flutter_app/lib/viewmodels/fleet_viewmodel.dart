import 'package:flutter/material.dart';
import '../models/fleet_model.dart';
import '../models/cloud_document.dart';

class FleetViewModel extends ChangeNotifier {
  final List<Vehicle> _vehicles = [];
  final List<Driver> _drivers = [];
  final List<FuelLog> _fuelLogs = [];
  final List<ExpenseLog> _expenseLogs = [];
  final List<CloudDocument> _uploadedDocuments = [];

  String instanceClientId = 'CLIENT_DEFAULT';
  String aiProvider = 'gemini'; // 'gemini', 'openai', 'claude', 'custom'
  String apiKey = '';
  String modelName = 'gemini-3.6-flash';
  String baseUrl = '';

  String _language = 'en';
  String get language => _language;
  bool get isTamil => _language == 'ta';

  void toggleLanguage() {
    _language = (_language == 'en') ? 'ta' : 'en';
    notifyListeners();
  }

  void setLanguage(String lang) {
    if (lang == 'en' || lang == 'ta') {
      _language = lang;
      notifyListeners();
    }
  }

  void updateAiConfig({
    required String newClientId,
    required String newProvider,
    required String newApiKey,
    required String newModelName,
    required String newBaseUrl,
  }) {
    instanceClientId = newClientId.trim().isEmpty ? 'CLIENT_DEFAULT' : newClientId.trim();
    aiProvider = newProvider;
    apiKey = newApiKey.trim();
    modelName = newModelName.trim().isEmpty ? (newProvider == 'openai' ? 'gpt-4o' : 'gemini-3.6-flash') : newModelName.trim();
    baseUrl = newBaseUrl.trim();
    notifyListeners();
  }

  String tr(String enText, String taText) {
    return isTamil ? taText : enText;
  }

  List<Vehicle> get vehicles => _vehicles;
  List<Driver> get drivers => _drivers;
  List<FuelLog> get fuelLogs => _fuelLogs;
  List<ExpenseLog> get expenseLogs => _expenseLogs;

  void addFuelLog(FuelLog log) {
    _fuelLogs.insert(0, log);
    // Auto-update matched vehicle nested expenses as well
    final vIdx = _vehicles.indexWhere((v) => v.plateNumber == log.plateNumber);
    if (vIdx != -1) {
      _vehicles[vIdx].expenses.insert(0, VehicleExpense(
        id: "ve_" + DateTime.now().millisecondsSinceEpoch.toString(),
        category: "Fuel",
        amount: log.amount,
        date: log.date.toIso8601String().split('T')[0],
        description: "Diesel fuel fill: ${log.liters} Liters",
      ));
    }
    notifyListeners();
  }

  void addExpenseLog(ExpenseLog log) {
    _expenseLogs.insert(0, log);
    final vIdx = _vehicles.indexWhere((v) => v.plateNumber == log.plateNumber);
    if (vIdx != -1) {
      _vehicles[vIdx].expenses.insert(0, VehicleExpense(
        id: "ve_" + DateTime.now().millisecondsSinceEpoch.toString(),
        category: log.category,
        amount: log.amount,
        date: log.date.toIso8601String().split('T')[0],
        description: log.description,
      ));
    }
    notifyListeners();
  }

  void registerVehicle(Vehicle v) {
    _vehicles.insert(0, v);
    notifyListeners();
  }

  void reassignDriver(String plateNumber, String driverId) {
    final vehicleIndex = _vehicles.indexWhere((v) => v.plateNumber == plateNumber);
    final driverIndex = _drivers.indexWhere((d) => d.id == driverId);

    if (vehicleIndex != -1 && driverIndex != -1) {
      final oldVeh = _vehicles[vehicleIndex];
      _vehicles[vehicleIndex] = Vehicle(
        plateNumber: oldVeh.plateNumber,
        name: oldVeh.name,
        model: oldVeh.model,
        manufacturer: oldVeh.manufacturer,
        purchaseDate: oldVeh.purchaseDate,
        engineNumber: oldVeh.engineNumber,
        chassisNumber: oldVeh.chassisNumber,
        insuranceExpiry: oldVeh.insuranceExpiry,
        insuranceNo: oldVeh.insuranceNo,
        fitnessExpiry: oldVeh.fitnessExpiry,
        fitnessNo: oldVeh.fitnessNo,
        permitExpiry: oldVeh.permitExpiry,
        permitNo: oldVeh.permitNo,
        roadTaxExpiry: oldVeh.roadTaxExpiry,
        roadTaxNo: oldVeh.roadTaxNo,
        pucExpiry: oldVeh.pucExpiry,
        pucNo: oldVeh.pucNo,
        fastagId: oldVeh.fastagId,
        fastagBalance: oldVeh.fastagBalance,
        currentOdometer: oldVeh.currentOdometer,
        status: oldVeh.status,
        assignedDriverId: driverId,
        documents: oldVeh.documents,
        expenses: oldVeh.expenses,
        serviceHistory: oldVeh.serviceHistory,
        tripHistory: oldVeh.tripHistory,
      );

      final oldDrv = _drivers[driverIndex];
      _drivers[driverIndex] = Driver(
        id: oldDrv.id,
        name: oldDrv.name,
        phone: oldDrv.phone,
        licenseNumber: oldDrv.licenseNumber,
        licenseExpiry: oldDrv.licenseExpiry,
        assignedVehiclePlate: plateNumber,
        joiningDate: oldDrv.joiningDate,
        salaryType: oldDrv.salaryType,
        salaryRate: oldDrv.salaryRate,
        advance: oldDrv.advance,
        dutyStatus: oldDrv.dutyStatus,
        attendanceStatus: oldDrv.attendanceStatus,
        attendanceHistory: oldDrv.attendanceHistory,
        advanceHistory: oldDrv.advanceHistory,
        documents: oldDrv.documents,
      );

      notifyListeners();
    }
  }

  // Quick statistics
  double getJulyFuelCost() {
    return _fuelLogs
        .where((log) => log.date.year == 2026 && log.date.month == 7)
        .fold(0.0, (sum, item) => sum + item.amount);
  }

  double getJulyFuelLiters() {
    return _fuelLogs
        .where((log) => log.date.year == 2026 && log.date.month == 7)
        .fold(0.0, (sum, item) => sum + item.liters);
  }

  double getJulyExpenses() {
    return _expenseLogs
        .where((log) => log.date.year == 2026 && log.date.month == 7)
        .fold(0.0, (sum, item) => sum + item.amount);
  }

  final Set<String> _dismissedNotificationIds = {};

  void dismissNotification(String id) {
    _dismissedNotificationIds.add(id);
    notifyListeners();
  }

  void clearAllNotifications() {
    final current = getNotifications();
    for (final n in current) {
      _dismissedNotificationIds.add(n.id);
    }
    notifyListeners();
  }

  List<FleetAppNotification> getNotifications() {
    final List<FleetAppNotification> list = [];
    final today = DateTime(2026, 7, 17);

    for (final v in _vehicles) {
      if (v.insuranceExpiry != null) {
        final days = v.insuranceExpiry!.difference(today).inDays;
        if (days <= 30) {
          final id = 'notif_ins_${v.plateNumber}';
          if (!_dismissedNotificationIds.contains(id)) {
            list.add(FleetAppNotification(
              id: id,
              title: days <= 0 ? 'INSURANCE EXPIRED: ${v.plateNumber}' : 'Insurance Expiring: ${v.plateNumber}',
              message: 'Vehicle ${v.plateNumber} (${v.name}) insurance ${days <= 0 ? "EXPIRED on ${v.insuranceExpiry.toString().split(" ")[0]}" : "expires in $days days (${v.insuranceExpiry.toString().split(" ")[0]})"}. Please renew.',
              date: '2026-07-17',
              type: days <= 0 ? 'alert' : 'warning',
            ));
          }
        }
      }

      if (v.fitnessExpiry != null) {
        final days = v.fitnessExpiry!.difference(today).inDays;
        if (days <= 30) {
          final id = 'notif_fit_${v.plateNumber}';
          if (!_dismissedNotificationIds.contains(id)) {
            list.add(FleetAppNotification(
              id: id,
              title: days <= 0 ? 'FITNESS EXPIRED: ${v.plateNumber}' : 'Fitness Certificate Due: ${v.plateNumber}',
              message: 'Vehicle ${v.plateNumber} (${v.name}) fitness certificate ${days <= 0 ? "EXPIRED on ${v.fitnessExpiry.toString().split(" ")[0]}" : "due for renewal in $days days"}.',
              date: '2026-07-17',
              type: days <= 0 ? 'alert' : 'warning',
            ));
          }
        }
      }

      if (v.fastagBalance < 500) {
        final id = 'notif_ft_${v.plateNumber}';
        if (!_dismissedNotificationIds.contains(id)) {
          list.add(FleetAppNotification(
            id: id,
            title: 'Low FASTag Balance: ${v.plateNumber}',
            message: 'Vehicle ${v.plateNumber} FASTag balance is ₹${v.fastagBalance.toStringAsFixed(0)}. Recharge recommended.',
            date: '2026-07-17',
            type: 'warning',
          ));
        }
      }
    }

    for (final d in _drivers) {
      final days = d.licenseExpiry.difference(today).inDays;
      if (days <= 30) {
        final id = 'notif_lic_${d.id}';
        if (!_dismissedNotificationIds.contains(id)) {
          final licStr = d.licenseExpiry.toIso8601String().split('T')[0];
          list.add(FleetAppNotification(
            id: id,
            title: days <= 0 ? 'LICENSE EXPIRED: ${d.name}' : 'License Expiry: ${d.name}',
            message: 'Driver ${d.name} (${d.licenseNumber}) driving license ${days <= 0 ? "EXPIRED on $licStr" : "expires in $days days ($licStr)"}.',
            date: '2026-07-17',
            type: days <= 0 ? 'alert' : 'warning',
          ));
        }
      }
      if (d.advance > 10000) {
        final id = 'notif_adv_${d.id}';
        if (!_dismissedNotificationIds.contains(id)) {
          list.add(FleetAppNotification(
            id: id,
            title: 'High Driver Advance: ${d.name}',
            message: 'Driver ${d.name} has an unrecovered advance balance of ₹${d.advance.toStringAsFixed(0)}.',
            date: '2026-07-17',
            type: 'info',
          ));
        }
      }
    }

    return list;
  }

  List<CloudDocument> get uploadedDocuments => _uploadedDocuments;

  void addCloudDocument(CloudDocument doc) {
    _uploadedDocuments.insert(0, doc);
    notifyListeners();
  }

  void addDriver(Driver driver) {
    _drivers.add(driver);
    notifyListeners();
  }

  void startDuty(String driverId, String time) {
    final idx = _drivers.indexWhere((d) => d.id == driverId);
    if (idx != -1) {
      final driver = _drivers[idx];
      driver.dutyStatus = "OnDuty";
      driver.attendanceStatus = "Present";
      
      final today = DateTime(2026, 7, 17);
      final attIdx = driver.attendanceHistory.indexWhere((h) => 
        h.date.year == today.year && h.date.month == today.month && h.date.day == today.day);
      
      if (attIdx != -1) {
        driver.attendanceHistory[attIdx] = AttendanceRecord(
          date: today,
          status: "Present",
          startDuty: time,
          endDuty: driver.attendanceHistory[attIdx].endDuty,
        );
      } else {
        driver.attendanceHistory.add(AttendanceRecord(
          date: today,
          status: "Present",
          startDuty: time,
        ));
      }
      notifyListeners();
    }
  }

  void endDuty(String driverId, String time) {
    final idx = _drivers.indexWhere((d) => d.id == driverId);
    if (idx != -1) {
      final driver = _drivers[idx];
      driver.dutyStatus = "OffDuty";
      
      final today = DateTime(2026, 7, 17);
      final attIdx = driver.attendanceHistory.indexWhere((h) => 
        h.date.year == today.year && h.date.month == today.month && h.date.day == today.day);
      
      if (attIdx != -1) {
        driver.attendanceHistory[attIdx] = AttendanceRecord(
          date: today,
          status: driver.attendanceHistory[attIdx].status,
          startDuty: driver.attendanceHistory[attIdx].startDuty,
          endDuty: time,
        );
      } else {
        driver.attendanceHistory.add(AttendanceRecord(
          date: today,
          status: "Present",
          endDuty: time,
        ));
      }
      notifyListeners();
    }
  }

  void logAttendance(String driverId, String status) {
    final idx = _drivers.indexWhere((d) => d.id == driverId);
    if (idx != -1) {
      final driver = _drivers[idx];
      driver.attendanceStatus = status;
      if (status == "Leave" || status == "Absent") {
        driver.dutyStatus = "OffDuty";
      }
      
      final today = DateTime(2026, 7, 17);
      final attIdx = driver.attendanceHistory.indexWhere((h) => 
        h.date.year == today.year && h.date.month == today.month && h.date.day == today.day);
      
      if (attIdx != -1) {
        driver.attendanceHistory[attIdx] = AttendanceRecord(
          date: today,
          status: status,
          startDuty: status == "Present" ? (driver.attendanceHistory[attIdx].startDuty ?? "08:00") : null,
          endDuty: status == "Present" ? driver.attendanceHistory[attIdx].endDuty : null,
        );
      } else {
        driver.attendanceHistory.add(AttendanceRecord(
          date: today,
          status: status,
          startDuty: status == "Present" ? "08:00" : null,
        ));
      }
      notifyListeners();
    }
  }

  void issueAdvance(String driverId, double amount, String description) {
    final idx = _drivers.indexWhere((d) => d.id == driverId);
    if (idx != -1) {
      final driver = _drivers[idx];
      driver.advance += amount;
      driver.advanceHistory.insert(0, AdvanceRecord(
        id: 'adv_${DateTime.now().millisecondsSinceEpoch}',
        date: DateTime.now(),
        amount: amount,
        description: description,
        type: 'advance',
      ));
      notifyListeners();
    }
  }

  void logRepayment(String driverId, double amount, String description) {
    final idx = _drivers.indexWhere((d) => d.id == driverId);
    if (idx != -1) {
      final driver = _drivers[idx];
      driver.advance -= amount;
      if (driver.advance < 0) driver.advance = 0;
      driver.advanceHistory.insert(0, AdvanceRecord(
        id: 'adv_${DateTime.now().millisecondsSinceEpoch}',
        date: DateTime.now(),
        amount: amount,
        description: description,
        type: 'repayment',
      ));
      notifyListeners();
    }
  }

  void addAttendance({required String driverId, required String status, String? startDuty, String? endDuty}) {
    final idx = _drivers.indexWhere((d) => d.id == driverId);
    if (idx != -1) {
      final driver = _drivers[idx];
      driver.attendanceStatus = status;
      final today = DateTime.now();
      driver.attendanceHistory.insert(0, AttendanceRecord(
        date: today,
        status: status,
        startDuty: startDuty,
        endDuty: endDuty,
      ));
      notifyListeners();
    }
  }

  void addAdvance({required String driverId, required double amount, required String description, required String type}) {
    final idx = _drivers.indexWhere((d) => d.id == driverId);
    if (idx != -1) {
      final driver = _drivers[idx];
      if (type == 'advance') {
        driver.advance += amount;
      } else {
        driver.advance -= amount;
        if (driver.advance < 0) driver.advance = 0;
      }
      driver.advanceHistory.insert(0, AdvanceRecord(
        id: 'adv_${DateTime.now().millisecondsSinceEpoch}',
        date: DateTime.now(),
        amount: amount,
        description: description,
        type: type,
      ));
      notifyListeners();
    }
  }

  void addDriverDoc(String driverId, DriverDocument doc) {
    final idx = _drivers.indexWhere((d) => d.id == driverId);
    if (idx != -1) {
      _drivers[idx].documents.add(doc);
      notifyListeners();
    }
  }
}
