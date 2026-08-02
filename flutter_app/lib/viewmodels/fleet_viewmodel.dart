import 'package:flutter/material.dart';
import '../models/fleet_model.dart';
import '../models/cloud_document.dart';

class FleetViewModel extends ChangeNotifier {
  final List<Vehicle> _vehicles = [];
  final List<Driver> _drivers = [];
  final List<FuelLog> _fuelLogs = [];
  final List<ExpenseLog> _expenseLogs = [];
  final List<CloudDocument> _uploadedDocuments = [];

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
