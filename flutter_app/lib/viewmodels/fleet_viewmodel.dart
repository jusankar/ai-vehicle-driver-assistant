import 'package:flutter/material.dart';
import '../models/fleet_model.dart';
import '../models/cloud_document.dart';

class FleetViewModel extends ChangeNotifier {
  final List<Vehicle> _vehicles = [
    Vehicle(
      plateNumber: "TN68AB1234",
      name: "Trichy Logistics #1",
      model: "Ashok Leyland 1615",
      manufacturer: "Ashok Leyland",
      purchaseDate: DateTime(2024, 3, 10),
      engineNumber: "AL-ENG-8821",
      chassisNumber: "AL-CHS-4432",
      insuranceExpiry: DateTime(2026, 8, 15),
      insuranceNo: "INS-AL-901",
      fitnessExpiry: DateTime(2027, 1, 10),
      fitnessNo: "FIT-AL-442",
      permitExpiry: DateTime(2026, 11, 20),
      permitNo: "PER-AL-002",
      roadTaxExpiry: DateTime(2026, 9, 15),
      roadTaxNo: "TAX-AL-331",
      pucExpiry: DateTime(2026, 8, 10),
      pucNo: "PUC-AL-665",
      fastagId: "FT-TN68AB1234",
      fastagBalance: 2450.0,
      currentOdometer: 85200.0,
      status: "Active",
      assignedDriverId: "drv_1",
      documents: [
        VehicleDocument(id: "doc_1", name: "Insurance Certificate.pdf", type: "Insurance", uploadedAt: "2026-05-14"),
        VehicleDocument(id: "doc_2", name: "National Road Permit.pdf", type: "Permit", uploadedAt: "2026-06-02"),
      ],
      expenses: [
        VehicleExpense(id: "ve_1", category: "Maintenance", amount: 4500.0, date: "2026-07-03", description: "Tyre puncture repair"),
        VehicleExpense(id: "ve_2", category: "Tolls", amount: 500.0, date: "2026-07-08", description: "NH-45 Plaza toll deduction"),
      ],
      serviceHistory: [
        ServiceRecord(id: "sr_1", date: "2026-05-10", type: "Scheduled Service", cost: 18500.0, provider: "TVS Ashok Leyland Trichy", odometer: 80000.0, details: "Engine oil change, filter replacement, wheel alignment, brake checking."),
      ],
      tripHistory: [
        TripRecord(id: "tr_1", date: "2026-07-12", from: "Trichy", to: "Chennai", distanceKm: 330.0, fuelUsedLiters: 95.0, driverName: "Rajesh Kumar"),
      ],
    ),
    Vehicle(
      plateNumber: "TN68CD5678",
      name: "Kaveri Cargo Express",
      model: "BharatBenz 2823R",
      manufacturer: "BharatBenz",
      purchaseDate: DateTime(2024, 7, 18),
      engineNumber: "BB-ENG-4410",
      chassisNumber: "BB-CHS-1290",
      insuranceExpiry: DateTime(2026, 7, 25),
      insuranceNo: "INS-BB-552",
      fitnessExpiry: DateTime(2026, 12, 5),
      fitnessNo: "FIT-BB-092",
      permitExpiry: DateTime(2027, 4, 15),
      permitNo: "PER-BB-991",
      roadTaxExpiry: DateTime(2026, 10, 10),
      roadTaxNo: "TAX-BB-223",
      pucExpiry: DateTime(2026, 7, 24),
      pucNo: "PUC-BB-881",
      fastagId: "FT-TN68CD5678",
      fastagBalance: 450.0,
      currentOdometer: 112000.0,
      status: "Maintenance",
      assignedDriverId: "drv_2",
      documents: [
        VehicleDocument(id: "doc_3", name: "Pollution Certificate.jpg", type: "PUC", uploadedAt: "2026-01-24"),
      ],
      expenses: [
        VehicleExpense(id: "ve_3", category: "Repairs", amount: 12000.0, date: "2026-07-07", description: "Engine oil change & system diagnostic"),
      ],
      serviceHistory: [
        ServiceRecord(id: "sr_2", date: "2026-07-07", type: "Repair Work", cost: 12000.0, provider: "Benz Service Salem", odometer: 111500.0, details: "Fuel injector flush, system computer update, engine oil renew."),
      ],
      tripHistory: [
        TripRecord(id: "tr_2", date: "2026-07-04", from: "Trichy", to: "Salem", distanceKm: 140.0, fuelUsedLiters: 45.0, driverName: "Amit Singh"),
      ],
    ),
    Vehicle(
      plateNumber: "KA01EF9012",
      name: "Deccan Highway King",
      model: "Tata Prima 5530.S",
      manufacturer: "Tata Motors",
      purchaseDate: DateTime(2025, 1, 15),
      engineNumber: "TT-ENG-0992",
      chassisNumber: "TT-CHS-8812",
      insuranceExpiry: DateTime(2026, 11, 30),
      insuranceNo: "INS-TT-441",
      fitnessExpiry: DateTime(2027, 3, 22),
      fitnessNo: "FIT-TT-331",
      permitExpiry: DateTime(2027, 9, 30),
      permitNo: "PER-TT-012",
      roadTaxExpiry: DateTime(2026, 12, 15),
      roadTaxNo: "TAX-TT-774",
      pucExpiry: DateTime(2026, 11, 10),
      pucNo: "PUC-TT-551",
      fastagId: "FT-KA01EF9012",
      fastagBalance: 5200.0,
      currentOdometer: 48500.0,
      status: "Active",
      assignedDriverId: "drv_3",
      documents: [
        VehicleDocument(id: "doc_4", name: "Fitness Certificate.pdf", type: "Fitness", uploadedAt: "2026-03-22"),
      ],
      expenses: [
        VehicleExpense(id: "ve_4", category: "Tolls", amount: 2800.0, date: "2026-07-11", description: "Fastag wallet recharge through bank"),
      ],
      serviceHistory: [
        ServiceRecord(id: "sr_3", date: "2026-04-12", type: "Scheduled Service", cost: 24000.0, provider: "Tata Motors Authorized Bangalore", odometer: 40000.0, details: "Suspension inspection, transmission fluid change, cabin filter change."),
      ],
      tripHistory: [
        TripRecord(id: "tr_3", date: "2026-07-10", from: "Bangalore", to: "Trichy", distanceKm: 350.0, fuelUsedLiters: 110.0, driverName: "Guru Prasath"),
      ],
    ),
    Vehicle(
      plateNumber: "MH12GH3456",
      name: "Western Express Hauler",
      model: "Mahindra Blazo X 35",
      manufacturer: "Mahindra & Mahindra",
      purchaseDate: DateTime(2024, 11, 20),
      engineNumber: "MH-ENG-3392",
      chassisNumber: "MH-CHS-0041",
      insuranceExpiry: DateTime(2026, 6, 12),
      insuranceNo: "INS-MH-881",
      fitnessExpiry: DateTime(2026, 9, 18),
      fitnessNo: "FIT-MH-771",
      permitExpiry: DateTime(2027, 2, 28),
      permitNo: "PER-MH-551",
      roadTaxExpiry: DateTime(2026, 11, 15),
      roadTaxNo: "TAX-MH-991",
      pucExpiry: DateTime(2026, 9, 10),
      pucNo: "PUC-MH-331",
      fastagId: "FT-MH12GH3456",
      fastagBalance: 1100.0,
      currentOdometer: 62000.0,
      status: "Active",
      assignedDriverId: "drv_4",
      documents: [
        VehicleDocument(id: "doc_5", name: "Road Tax receipt.pdf", type: "Road Tax", uploadedAt: "2025-11-15"),
      ],
      expenses: [
        VehicleExpense(id: "ve_5", category: "Repairs", amount: 6500.0, date: "2026-07-15", description: "Brake pad replacement"),
      ],
      serviceHistory: [
        ServiceRecord(id: "sr_4", date: "2026-07-15", type: "Brake Repair", cost: 6500.0, provider: "Mahindra Truck Plaza Pune", odometer: 61500.0, details: "Replaced front and rear brake pads, checked brake fluid water content."),
      ],
      tripHistory: [
        TripRecord(id: "tr_4", date: "2026-07-14", from: "Pune", to: "Mumbai", distanceKm: 150.0, fuelUsedLiters: 50.0, driverName: "Balaji Rao"),
      ],
    )
  ];

  final List<Driver> _drivers = [
    Driver(
      id: "drv_1",
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      licenseNumber: "DL-TN6820210001",
      licenseExpiry: DateTime(2028, 10, 14),
      assignedVehiclePlate: "TN68AB1234",
      joiningDate: DateTime(2022, 5, 10),
      salaryType: "Monthly",
      salaryRate: 18000.0,
      advance: 2500.0,
      dutyStatus: "OnDuty",
      attendanceStatus: "Present",
      attendanceHistory: [
        AttendanceRecord(date: DateTime(2026, 7, 16), status: "Present", startDuty: "08:15", endDuty: "18:00"),
        AttendanceRecord(date: DateTime(2026, 7, 17), status: "Present", startDuty: "08:00"),
      ],
      advanceHistory: [
        AdvanceRecord(id: "adv_1_1", date: DateTime(2026, 7, 5), amount: 3000.0, description: "Personal emergency", type: "advance"),
        AdvanceRecord(id: "adv_1_2", date: DateTime(2026, 7, 15), amount: 500.0, description: "Fuel bonus payback", type: "repayment"),
      ],
      documents: [
        DriverDocument(id: "ddoc_1_1", name: "Driving License Scan.pdf", type: "License", uploadedAt: DateTime(2022, 5, 10)),
        DriverDocument(id: "ddoc_1_2", name: "Aadhaar Card.pdf", type: "Aadhaar", uploadedAt: DateTime(2022, 5, 10)),
      ],
    ),
    Driver(
      id: "drv_2",
      name: "Amit Singh",
      phone: "+91 87654 32109",
      licenseNumber: "DL-UP1620190088",
      licenseExpiry: DateTime(2029, 5, 20),
      assignedVehiclePlate: "TN68CD5678",
      joiningDate: DateTime(2023, 1, 15),
      salaryType: "Daily",
      salaryRate: 650.0,
      advance: 0.0,
      dutyStatus: "OffDuty",
      attendanceStatus: "Leave",
      attendanceHistory: [
        AttendanceRecord(date: DateTime(2026, 7, 16), status: "Present", startDuty: "09:00", endDuty: "17:30"),
        AttendanceRecord(date: DateTime(2026, 7, 17), status: "Leave"),
      ],
      advanceHistory: [],
      documents: [
        DriverDocument(id: "ddoc_2_1", name: "DL_Amit_Singh.jpg", type: "License", uploadedAt: DateTime(2023, 1, 15)),
      ],
    ),
    Driver(
      id: "drv_3",
      name: "Guru Prasath",
      phone: "+91 76543 21098",
      licenseNumber: "DL-KA0120220045",
      licenseExpiry: DateTime(2030, 2, 11),
      assignedVehiclePlate: "KA01EF9012",
      joiningDate: DateTime(2023, 11, 1),
      salaryType: "PerTrip",
      salaryRate: 1200.0,
      advance: 1500.0,
      dutyStatus: "OffDuty",
      attendanceStatus: "None",
      attendanceHistory: [],
      advanceHistory: [
        AdvanceRecord(id: "adv_3_1", date: DateTime(2026, 7, 10), amount: 1500.0, description: "Festival advance", type: "advance"),
      ],
      documents: [],
    ),
    Driver(
      id: "drv_4",
      name: "Balaji Rao",
      phone: "+91 95432 10987",
      licenseNumber: "DL-MH1220200112",
      licenseExpiry: DateTime(2027, 12, 5),
      assignedVehiclePlate: "MH12GH3456",
      joiningDate: DateTime(2024, 6, 20),
      salaryType: "Monthly",
      salaryRate: 20000.0,
      advance: 4000.0,
      dutyStatus: "OnDuty",
      attendanceStatus: "Present",
      attendanceHistory: [
        AttendanceRecord(date: DateTime(2026, 7, 17), status: "Present", startDuty: "07:30"),
      ],
      advanceHistory: [
        AdvanceRecord(id: "adv_4_1", date: DateTime(2026, 7, 12), amount: 4000.0, description: "Rent advance payment", type: "advance"),
      ],
      documents: [],
    ),
  ];

  final List<FuelLog> _fuelLogs = [
    FuelLog(id: "fl_1", plateNumber: "TN68AB1234", date: DateTime(2026, 7, 2), liters: 180, amount: 16200, driverName: "Rajesh Kumar"),
    FuelLog(id: "fl_2", plateNumber: "KA01EF9012", date: DateTime(2026, 7, 5), liters: 220, amount: 19800, driverName: "Guru Prasath"),
    FuelLog(id: "fl_3", plateNumber: "MH12GH3456", date: DateTime(2026, 7, 10), liters: 150, amount: 13500, driverName: "Balaji Rao"),
    FuelLog(id: "fl_4", plateNumber: "TN68AB1234", date: DateTime(2026, 7, 14), liters: 160, amount: 14400, driverName: "Rajesh Kumar"),
    FuelLog(id: "fl_5", plateNumber: "TN68CD5678", date: DateTime(2026, 6, 25), liters: 200, amount: 18000, driverName: "Amit Singh")
  ];

  final List<ExpenseLog> _expenseLogs = [
    ExpenseLog(id: "ex_1", plateNumber: "TN68AB1234", date: DateTime(2026, 7, 3), amount: 4500, category: "Maintenance", description: "Tyre puncture repair"),
    ExpenseLog(id: "ex_2", plateNumber: "TN68CD5678", date: DateTime(2026, 7, 7), amount: 12000, category: "Repairs", description: "Engine oil change"),
    ExpenseLog(id: "ex_3", plateNumber: "KA01EF9012", date: DateTime(2026, 7, 11), amount: 2800, category: "Tolls", description: "Toll plaza recharge"),
    ExpenseLog(id: "ex_4", plateNumber: "MH12GH3456", date: DateTime(2026, 7, 15), amount: 6500, category: "Repairs", description: "Brake pad replacement")
  ];

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

  final List<CloudDocument> _uploadedDocuments = [
    CloudDocument(
      id: "cd_1",
      name: "truck_1_insurance_2026.pdf",
      documentType: "Insurance PDF",
      source: "PDF",
      uploadedAt: DateTime(2026, 7, 10, 10, 30),
      fileSize: "2.4 MB",
      storageUrl: "https://storage.googleapis.com/fleet-cloud-bucket/truck_1_insurance_2026.pdf",
      notes: "Annual premium renewed for Trichy Logistics #1",
    ),
    CloudDocument(
      id: "cd_2",
      name: "july_diesel_receipt.jpg",
      documentType: "Fuel Bills",
      source: "Gallery",
      uploadedAt: DateTime(2026, 7, 14, 15, 45),
      fileSize: "850 KB",
      storageUrl: "https://storage.googleapis.com/fleet-cloud-bucket/july_diesel_receipt.jpg",
      notes: "July diesel refill of Rs. 14,400 for TN68AB1234",
    ),
  ];

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
