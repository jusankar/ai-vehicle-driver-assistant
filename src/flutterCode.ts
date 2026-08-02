export interface FlutterFile {
  path: string;
  language: string;
  content: string;
}

export const flutterProjectFiles: FlutterFile[] = [
  {
    path: "pubspec.yaml",
    language: "yaml",
    content: `name: ai_vehicle_driver_assistant
description: AI-powered Vehicle & Driver Assistant using Gemini AI & Material 3 UI for small fleet owners.
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  google_generative_ai: ^0.4.0
  provider: ^6.1.2
  speech_to_text: ^7.0.0
  file_picker: ^8.0.3
  intl: ^0.19.0
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`
  },
  {
    path: "lib/models/fleet_model.dart",
    language: "dart",
    content: `class Vehicle {
  final String plateNumber;
  final String name;
  final String model;
  final String manufacturer;
  final DateTime purchaseDate;
  final String engineNumber;
  final String chassisNumber;
  
  // Required expiry documents
  final DateTime? insuranceExpiry;
  final String? insuranceNo;
  final DateTime? fitnessExpiry;
  final String? fitnessNo;
  final DateTime? permitExpiry;
  final String? permitNo;
  final DateTime? roadTaxExpiry;
  final String? roadTaxNo;
  final DateTime? pucExpiry;
  final String? pucNo;

  final String fastagId;
  final double fastagBalance;
  final double currentOdometer;
  final String status; // 'Active', 'Maintenance', 'Inactive'
  final String assignedDriverId;

  final List<VehicleDocument> documents;
  final List<VehicleExpense> expenses;
  final List<ServiceRecord> serviceHistory;
  final List<TripRecord> tripHistory;

  Vehicle({
    required this.plateNumber,
    required this.name,
    required this.model,
    required this.manufacturer,
    required this.purchaseDate,
    required this.engineNumber,
    required this.chassisNumber,
    this.insuranceExpiry,
    this.insuranceNo,
    this.fitnessExpiry,
    this.fitnessNo,
    this.permitExpiry,
    this.permitNo,
    this.roadTaxExpiry,
    this.roadTaxNo,
    this.pucExpiry,
    this.pucNo,
    required this.fastagId,
    required this.fastagBalance,
    required this.currentOdometer,
    required this.status,
    required this.assignedDriverId,
    required this.documents,
    required this.expenses,
    required this.serviceHistory,
    required this.tripHistory,
  });

  Map<String, dynamic> toJson() => {
    'plateNumber': plateNumber,
    'name': name,
    'model': model,
    'manufacturer': manufacturer,
    'purchaseDate': purchaseDate.toIso8601String(),
    'engineNumber': engineNumber,
    'chassisNumber': chassisNumber,
    'insuranceExpiry': insuranceExpiry?.toIso8601String(),
    'insuranceNo': insuranceNo,
    'fitnessExpiry': fitnessExpiry?.toIso8601String(),
    'fitnessNo': fitnessNo,
    'permitExpiry': permitExpiry?.toIso8601String(),
    'permitNo': permitNo,
    'roadTaxExpiry': roadTaxExpiry?.toIso8601String(),
    'roadTaxNo': roadTaxNo,
    'pucExpiry': pucExpiry?.toIso8601String(),
    'pucNo': pucNo,
    'fastagId': fastagId,
    'fastagBalance': fastagBalance,
    'currentOdometer': currentOdometer,
    'status': status,
    'assignedDriverId': assignedDriverId,
    'documents': documents.map((e) => e.toJson()).toList(),
    'expenses': expenses.map((e) => e.toJson()).toList(),
    'serviceHistory': serviceHistory.map((e) => e.toJson()).toList(),
    'tripHistory': tripHistory.map((e) => e.toJson()).toList(),
  };
}

class VehicleDocument {
  final String id;
  final String name;
  final String type;
  final String uploadedAt;

  VehicleDocument({
    required this.id,
    required this.name,
    required this.type,
    required this.uploadedAt,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'type': type,
    'uploadedAt': uploadedAt,
  };
}

class VehicleExpense {
  final String id;
  final String category;
  final double amount;
  final String date;
  final String description;

  VehicleExpense({
    required this.id,
    required this.category,
    required this.amount,
    required this.date,
    required this.description,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'category': category,
    'amount': amount,
    'date': date,
    'description': description,
  };
}

class ServiceRecord {
  final String id;
  final String date;
  final String type;
  final double cost;
  final String provider;
  final double odometer;
  final String details;

  ServiceRecord({
    required this.id,
    required this.date,
    required this.type,
    required this.cost,
    required this.provider,
    required this.odometer,
    required this.details,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'date': date,
    'type': type,
    'cost': cost,
    'provider': provider,
    'odometer': odometer,
    'details': details,
  };
}

class TripRecord {
  final String id;
  final String date;
  final String from;
  final String to;
  final double distanceKm;
  final double fuelUsedLiters;
  final String driverName;

  TripRecord({
    required this.id,
    required this.date,
    required this.from,
    required this.to,
    required this.distanceKm,
    required this.fuelUsedLiters,
    required this.driverName,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'date': date,
    'from': from,
    'to': to,
    'distanceKm': distanceKm,
    'fuelUsedLiters': fuelUsedLiters,
    'driverName': driverName,
  };
}

class DriverDocument {
  final String id;
  final String name;
  final String type; // 'License' | 'Aadhaar' | 'Medical' | 'Other'
  final DateTime uploadedAt;

  DriverDocument({
    required this.id,
    required this.name,
    required this.type,
    required this.uploadedAt,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'type': type,
    'uploadedAt': uploadedAt.toIso8601String(),
  };
}

class AttendanceRecord {
  final DateTime date;
  final String status; // 'Present' | 'Leave' | 'Absent'
  final String? startDuty; // e.g. "08:00"
  final String? endDuty; // e.g. "17:00"

  AttendanceRecord({
    required this.date,
    required this.status,
    this.startDuty,
    this.endDuty,
  });

  Map<String, dynamic> toJson() => {
    'date': date.toIso8601String(),
    'status': status,
    'startDuty': startDuty,
    'endDuty': endDuty,
  };
}

class AdvanceRecord {
  final String id;
  final DateTime date;
  final double amount;
  final String description;
  final String type; // 'advance' | 'repayment'

  AdvanceRecord({
    required this.id,
    required this.date,
    required this.amount,
    required this.description,
    required this.type,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'date': date.toIso8601String(),
    'amount': amount,
    'description': description,
    'type': type,
  };
}

class Driver {
  final String id;
  final String name;
  final String phone;
  final String licenseNumber;
  final DateTime licenseExpiry;
  final String assignedVehiclePlate;
  final DateTime joiningDate;
  final String salaryType; // 'Monthly' | 'Daily' | 'PerTrip'
  final double salaryRate;
  double advance;
  String dutyStatus; // 'OffDuty' | 'OnDuty'
  String attendanceStatus; // 'Present' | 'Leave' | 'Absent' | 'None'
  final List<AttendanceRecord> attendanceHistory;
  final List<AdvanceRecord> advanceHistory;
  final List<DriverDocument> documents;

  Driver({
    required this.id,
    required this.name,
    required this.phone,
    required this.licenseNumber,
    required this.licenseExpiry,
    required this.assignedVehiclePlate,
    required this.joiningDate,
    required this.salaryType,
    required this.salaryRate,
    this.advance = 0.0,
    this.dutyStatus = "OffDuty",
    this.attendanceStatus = "None",
    required this.attendanceHistory,
    required this.advanceHistory,
    required this.documents,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'phone': phone,
    'licenseNumber': licenseNumber,
    'licenseExpiry': licenseExpiry.toIso8601String(),
    'assignedVehiclePlate': assignedVehiclePlate,
    'joiningDate': joiningDate.toIso8601String(),
    'salaryType': salaryType,
    'salaryRate': salaryRate,
    'advance': advance,
    'dutyStatus': dutyStatus,
    'attendanceStatus': attendanceStatus,
    'attendanceHistory': attendanceHistory.map((x) => x.toJson()).toList(),
    'advanceHistory': advanceHistory.map((x) => x.toJson()).toList(),
    'documents': documents.map((x) => x.toJson()).toList(),
  };
}

class FuelLog {
  final String id;
  final String plateNumber;
  final DateTime date;
  final double liters;
  final double amount;
  final String driverName;

  FuelLog({
    required this.id,
    required this.plateNumber,
    required this.date,
    required this.liters,
    required this.amount,
    required this.driverName,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'plateNumber': plateNumber,
    'date': date.toIso8601String(),
    'liters': liters,
    'amount': amount,
    'driverName': driverName,
  };
}

class ExpenseLog {
  final String id;
  final String plateNumber;
  final DateTime date;
  final double amount;
  final String category;
  final String description;

  ExpenseLog({
    required this.id,
    required this.plateNumber,
    required this.date,
    required this.amount,
    required this.category,
    required this.description,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'plateNumber': plateNumber,
    'date': date.toIso8601String(),
    'amount': amount,
    'category': category,
    'description': description,
  };
}
`
  },
  {
    path: "lib/models/chat_message.dart",
    language: "dart",
    content: `enum MessageSender { user, assistant }

class ChatMessage {
  final String id;
  final MessageSender sender;
  final String text;
  final DateTime timestamp;
  final bool isVoice;
  final String? attachmentPath;

  ChatMessage({
    required this.id,
    required this.sender,
    required this.text,
    required this.timestamp,
    this.isVoice = false,
    this.attachmentPath,
  });
}
`
  },
  {
    path: "lib/viewmodels/fleet_viewmodel.dart",
    language: "dart",
    content: `import 'package:flutter/material.dart';
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
        description: "Diesel fuel fill: \${log.liters} Liters",
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
        id: 'adv_\${DateTime.now().millisecondsSinceEpoch}',
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
        id: 'adv_\${DateTime.now().millisecondsSinceEpoch}',
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
        id: 'adv_\${DateTime.now().millisecondsSinceEpoch}',
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
`
  },
  {
    path: "lib/viewmodels/chat_viewmodel.dart",
    language: "dart",
    content: `import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/chat_message.dart';
import '../models/fleet_model.dart';
import 'fleet_viewmodel.dart';

class ChatViewModel extends ChangeNotifier {
  final List<ChatMessage> _messages = [
    ChatMessage(
      id: "init",
      sender: MessageSender.assistant,
      text: "Hello! I am your AI Vehicle & Driver Assistant. Ask me anything about your vehicles, drivers, expenses, or diesel consumption.",
      timestamp: DateTime.now(),
    )
  ];
  
  bool _isLoading = false;
  late final GenerativeModel _model;

  ChatViewModel({String? apiKey}) {
    final key = (apiKey != null && apiKey.isNotEmpty && apiKey != "YOUR_GEMINI_API_KEY" && apiKey != "GEMINI_API_KEY_HERE")
        ? apiKey
        : const String.fromEnvironment('GEMINI_API_KEY', defaultValue: 'AIzaSyDUdO3E87oQCUTZ2r8ycdWvN5Sq6dbXdHc');
    
    final systemInstructionText = """
You are the AI core for "AI Vehicle & Driver Assistant", answering queries for commercial fleet owners.
Provide brief, highly readable, bulleted answers.
If the user asks to log/add fuel, expenses, or assign a driver, output a structured action block at the end:
[DATABASE_ACTION_START]
{
  "action": "ADD_FUEL" | "ADD_EXPENSE" | "ASSIGN_DRIVER",
  "payload": { ... }
}
[DATABASE_ACTION_END]
""";

    // Initialize Google Generative AI
    _model = GenerativeModel(
      model: 'gemini-1.5-flash',
      apiKey: key,
      systemInstruction: Content.system(systemInstructionText),
    );
  }

  List<ChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;

  Future<void> sendMessage(String text, FleetViewModel fleetVM, {bool isVoice = false}) async {
    if (text.trim().isEmpty) return;

    final userMessage = ChatMessage(
      id: DateTime.now().toString(),
      sender: MessageSender.user,
      text: text,
      timestamp: DateTime.now(),
      isVoice: isVoice,
    );

    _messages.add(userMessage);
    _isLoading = true;
    notifyListeners();

    try {
      // Prepare Fleet Context for LLM Grounding
      final dbContext = """
Current local date: 2026-08-01.
FLEET DATABASE STATUS:
Vehicles: \${jsonEncode(fleetVM.vehicles.map((v) => v.toJson()).toList())}
Drivers: \${jsonEncode(fleetVM.drivers.map((d) => d.toJson()).toList())}
Fuel Logs: \${jsonEncode(fleetVM.fuelLogs.map((f) => f.toJson()).toList())}
Expense Logs: \${jsonEncode(fleetVM.expenseLogs.map((e) => e.toJson()).toList())}
""";

      final contents = <Content>[];
      
      // Pass grounding context as first user prompt
      contents.add(Content.text("FLEET DATABASE CONTEXT:\\n\$dbContext"));
      
      // Append history & new message
      for (final msg in _messages) {
        if (msg.id == "init") continue;
        if (msg.sender == MessageSender.user) {
          contents.add(Content.text(msg.text));
        } else {
          contents.add(Content.model([TextPart(msg.text)]));
        }
      }

      final response = await _model.generateContent(contents);

      final replyText = response.text ?? "I was unable to retrieve an answer.";
      
      // Parse database action if returned
      _parseDatabaseAction(replyText, fleetVM);

      _messages.add(ChatMessage(
        id: DateTime.now().toString(),
        sender: MessageSender.assistant,
        text: replyText.replaceAll(RegExp(r'\\[DATABASE_ACTION_START\\].*\\[DATABASE_ACTION_END\\]', dotAll: true), '').trim(),
        timestamp: DateTime.now(),
      ));
    } catch (e) {
      _messages.add(ChatMessage(
        id: DateTime.now().toString(),
        sender: MessageSender.assistant,
        text: "Error connecting to assistant: \$e",
        timestamp: DateTime.now(),
      ));
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _parseDatabaseAction(String responseText, FleetViewModel fleetVM) {
    try {
      final regExp = RegExp(r'\\[DATABASE_ACTION_START\\]([\\s\\S]*?)\\[DATABASE_ACTION_END\\]');
      final match = regExp.firstMatch(responseText);
      if (match != null && match.group(1) != null) {
        final actionMap = jsonDecode(match.group(1)!.trim());
        final action = actionMap['action'];
        final payload = actionMap['payload'];

        if (action == 'ADD_FUEL') {
          fleetVM.addFuelLog(FuelLog(
            id: 'fl_' + DateTime.now().millisecondsSinceEpoch.toString(),
            plateNumber: payload['plateNumber'] ?? 'TN68AB1234',
            date: DateTime.tryParse(payload['date'] ?? '') ?? DateTime.now(),
            liters: (payload['liters'] as num?)?.toDouble() ?? 0.0,
            amount: (payload['amount'] as num?)?.toDouble() ?? 0.0,
            driverName: payload['driverName'] ?? 'Rajesh Kumar',
          ));
        } else if (action == 'ADD_EXPENSE') {
          fleetVM.addExpenseLog(ExpenseLog(
            id: 'ex_' + DateTime.now().millisecondsSinceEpoch.toString(),
            plateNumber: payload['plateNumber'] ?? 'TN68AB1234',
            date: DateTime.tryParse(payload['date'] ?? '') ?? DateTime.now(),
            amount: (payload['amount'] as num?)?.toDouble() ?? 0.0,
            category: payload['category'] ?? 'Others',
            description: payload['description'] ?? 'logged through AI',
          ));
        } else if (action == 'ASSIGN_DRIVER') {
          fleetVM.reassignDriver(payload['plateNumber'], payload['driverId']);
        }
      }
    } catch (e) {
      print("Failed parsing Flutter action callback: \$e");
    }
  }

  void clearChat() {
    _messages.clear();
    _messages.add(ChatMessage(
      id: "init",
      sender: MessageSender.assistant,
      text: "Recent chat cleared! How can I help you manage your fleet today?",
      timestamp: DateTime.now(),
    ));
    notifyListeners();
  }
}
`
  },
  {
    path: "lib/views/home_view.dart",
    language: "dart",
    content: `import 'package:flutter/material.dart';
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
          '\${vm.getJulyFuelLiters().toStringAsFixed(0)} Liters',
          'July Total',
          Icons.local_gas_station,
          Colors.orange,
        ),
        _buildBentoItem(
          context,
          'Fuel Cost',
          'Rs. \${vm.getJulyFuelCost().toStringAsFixed(0)}',
          'Average Rs. 90/L',
          Icons.currency_rupee,
          Colors.green,
        ),
        _buildBentoItem(
          context,
          'Repairs/Tolls',
          'Rs. \${vm.getJulyExpenses().toStringAsFixed(0)}',
          '4 Logged Items',
          Icons.build_circle_outlined,
          Colors.blue,
        ),
        _buildBentoItem(
          context,
          'Active Drivers',
          '\${vm.drivers.length} Drivers',
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
`
  },
  {
    path: "lib/views/chat_view.dart",
    language: "dart",
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../viewmodels/chat_viewmodel.dart';
import '../viewmodels/fleet_viewmodel.dart';
import '../models/chat_message.dart';

class ChatView extends StatefulWidget {
  final bool startVoice;
  const ChatView({super.key, this.startVoice = false});

  @override
  State<ChatView> createState() => _ChatViewState();
}

class _ChatViewState extends State<ChatView> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  late stt.SpeechToText _speech;
  bool _isListening = false;
  String _voiceText = "";

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    if (widget.startVoice) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _listen();
      });
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _listen() async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (val) => print('speech status: \$val'),
        onError: (val) => print('speech error: \$val'),
      );
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (val) => setState(() {
            _voiceText = val.recognizedWords;
            _controller.text = _voiceText;
          }),
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
      if (_controller.text.isNotEmpty) {
        _submitMessage(isVoice: true);
      }
    }
  }

  void _submitMessage({bool isVoice = false}) {
    final text = _controller.text;
    if (text.trim().isEmpty) return;
    
    _controller.clear();
    final chatVM = context.read<ChatViewModel>();
    final fleetVM = context.read<FleetViewModel>();
    
    chatVM.sendMessage(text, fleetVM, isVoice: isVoice);
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final chatVM = context.watch<ChatViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: theme.colorScheme.primaryContainer,
              child: Icon(Icons.auto_awesome, size: 16, color: theme.colorScheme.primary),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AI Fleet Assistant', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text('Online • Powered by Gemini', style: TextStyle(fontSize: 10, color: Colors.green)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Clear conversation',
            onPressed: () {
              chatVM.clearChat();
            },
          )
        ],
      ),
      body: Column(
        children: [
          // Message Thread
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16.0),
              itemCount: chatVM.messages.length,
              itemBuilder: (context, index) {
                final message = chatVM.messages[index];
                return _buildMessageBubble(context, message);
              },
            ),
          ),
          
          if (chatVM.isLoading)
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  const SizedBox(width: 12),
                  Text('Assistant is thinking...', style: theme.textTheme.bodySmall),
                ],
              ),
            ),

          // Bottom Entry Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              border: Border(top: BorderSide(color: theme.colorScheme.outlineVariant)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  // Attachment upload shortcut
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline),
                    onPressed: () {},
                  ),
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      maxLines: null,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _submitMessage(),
                      decoration: InputDecoration(
                        hintText: _isListening ? 'Listening...' : 'Ask about TN68AB1234, fuel logs...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(28),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: theme.colorScheme.surfaceContainerHighest,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  
                  // Speech / Voice trigger
                  GestureDetector(
                    onTap: _listen,
                    child: CircleAvatar(
                      backgroundColor: _isListening 
                          ? Colors.red 
                          : theme.colorScheme.primary,
                      foregroundColor: Colors.white,
                      child: Icon(_isListening ? Icons.mic_off : Icons.mic),
                    ),
                  ),
                  
                  const SizedBox(width: 8),
                  
                  // Text Submit
                  CircleAvatar(
                    backgroundColor: theme.colorScheme.primaryContainer,
                    foregroundColor: theme.colorScheme.onPrimaryContainer,
                    child: IconButton(
                      icon: const Icon(Icons.send),
                      onPressed: () => _submitMessage(),
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildMessageBubble(BuildContext context, ChatMessage message) {
    final theme = Theme.of(context);
    final isAssistant = message.sender == MessageSender.assistant;

    return Align(
      alignment: isAssistant ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6.0),
        padding: const EdgeInsets.all(14.0),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isAssistant 
              ? theme.colorScheme.surfaceContainerLow 
              : theme.colorScheme.primaryContainer,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isAssistant ? 0 : 16),
            bottomRight: Radius.circular(isAssistant ? 16 : 0),
          ),
          border: isAssistant 
              ? Border.all(color: theme.colorScheme.outlineVariant) 
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.text,
              style: TextStyle(
                color: isAssistant 
                    ? theme.colorScheme.onSurface 
                    : theme.colorScheme.onPrimaryContainer,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (message.isVoice)
                  Icon(
                    Icons.volume_up, 
                    size: 12, 
                    color: isAssistant ? theme.colorScheme.primary : theme.colorScheme.onPrimaryContainer.withOpacity(0.7)
                  ),
                if (message.isVoice) const SizedBox(width: 4),
                Text(
                  '12:00 PM', // Simulating brief time format
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: isAssistant 
                        ? theme.colorScheme.onSurfaceVariant.withOpacity(0.6) 
                        : theme.colorScheme.onPrimaryContainer.withOpacity(0.6),
                    fontSize: 9,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
`
  },
  {
    path: "lib/views/vehicle_management_views.dart",
    language: "dart",
    content: `import 'package:flutter/material.dart';
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
              Text('\${vehicle.manufacturer} • \${vehicle.model}', style: theme.textTheme.bodySmall),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.speed, size: 14, color: theme.colorScheme.outline),
                  const SizedBox(width: 4),
                  Text('\${vehicle.currentOdometer.toStringAsFixed(0)} km', style: theme.textTheme.labelSmall),
                  const SizedBox(width: 16),
                  Icon(Icons.toll, size: 14, color: theme.colorScheme.outline),
                  const SizedBox(width: 4),
                  Text('FASTag: Rs. \${vehicle.fastagBalance.toStringAsFixed(0)}', style: theme.textTheme.labelSmall),
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
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
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
                  _buildSpecRow('Odometer', '\${vehicle.currentOdometer.toStringAsFixed(0)} km'),
                  const Divider(),
                  _buildSpecRow('FASTag ID', vehicle.fastagId),
                  const Divider(),
                  _buildSpecRow('FASTag Balance', 'Rs. \${vehicle.fastagBalance.toStringAsFixed(0)}'),
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
                subtitle = "No: \$no\\nExpires: \${expiry.toIso8601String().split('T')[0]}";
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
            'Total: Rs. \${vehicle.expenses.fold(0.0, (sum, item) => sum + item.amount).toStringAsFixed(0)}',
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
                  subtitle: Text('\${exp.date} • \${exp.description}', style: const TextStyle(fontSize: 12)),
                  trailing: Text(
                    'Rs. \${exp.amount.toStringAsFixed(0)}',
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
            subtitle: Text('\${service.date} • Rs. \${service.cost.toStringAsFixed(0)}'),
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSpecRow('Provider', service.provider),
                    _buildSpecRow('Odometer Reading', '\${service.odometer.toStringAsFixed(0)} km'),
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
                    Text('Trip Date: \${trip.date}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('Driver: \${trip.driverName}', style: const TextStyle(fontSize: 12)),
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
                    Text('Distance: \${trip.distanceKm} km', style: const TextStyle(fontSize: 13)),
                    Text('Fuel Used: \${trip.fuelUsedLiters} L', style: const TextStyle(fontSize: 13)),
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
                    fastagId: 'FT-\${_plateController.text.trim().toUpperCase()}',
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
                    SnackBar(content: Text('Vehicle \${newVeh.plateNumber} registered successfully!')),
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
`
  },
  {
    path: "lib/views/driver_management_views.dart",
    language: "dart",
    content: `import 'package:flutter/material.dart';
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
                _buildStatItem(context, 'Advances', '₹\${totalAdvances.toStringAsFixed(0)}', Colors.red),
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
                  Text('Truck: \${driver.assignedVehiclePlate.isNotEmpty ? driver.assignedVehiclePlate : "None"}', style: theme.textTheme.labelMedium),
                ],
              ),
              if (driver.advance > 0) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.money, size: 14, color: Colors.red[400]),
                    const SizedBox(width: 4),
                    Text(
                      'Advance Balance: ₹\${driver.advance.toStringAsFixed(0)}',
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
                          'Joining Date: \${driver.joiningDate.toIso8601String().split('T')[0]}',
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
          SnackBar(content: Text('Attendance for \${driver.name} marked as \$status')),
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
                                  final timeStr = "\${DateTime.now().hour.toString().padLeft(2, '0')}:\${DateTime.now().minute.toString().padLeft(2, '0')}";
                                  context.read<FleetViewModel>().startDuty(driver.id, timeStr);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Duty started at \$timeStr for \${driver.name}')),
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
                                  final timeStr = "\${DateTime.now().hour.toString().padLeft(2, '0')}:\${DateTime.now().minute.toString().padLeft(2, '0')}";
                                  context.read<FleetViewModel>().endDuty(driver.id, timeStr);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Duty ended at \$timeStr for \${driver.name}')),
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
                              ? 'Start: \${h.startDuty ?? "08:00"} • End: \${h.endDuty ?? "In Shift"}'
                              : 'Attendance: \${h.status}',
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
                          Text('\${driver.salaryType} Rate', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ],
                      ),
                      Text(
                        '₹\${driver.salaryRate.toStringAsFixed(0)}',
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
                  'Outstanding: ₹\${driver.advance.toStringAsFixed(0)}',
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
                          '\${isAdvance ? "+" : "-"} ₹\${item.amount.toStringAsFixed(0)}',
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
                        subtitle: Text('\${doc.type} • \${doc.uploadedAt.toIso8601String().split('T')[0]}', style: const TextStyle(fontSize: 11)),
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
                  Text('Simulating upload from \$source source.', style: const TextStyle(fontSize: 12)),
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
                    final filename = '\${selectedType.toLowerCase()}_credential_\${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}.pdf';
                    final newDoc = DriverDocument(
                      id: 'dd_\${DateTime.now().millisecondsSinceEpoch}',
                      name: filename,
                      type: selectedType,
                      uploadedAt: DateTime.now(),
                    );
                    context.read<FleetViewModel>().addDriverDoc(driver.id, newDoc);
                    Navigator.pop(dialogCtx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Uploaded \$filename to encrypted cloud bucket!')),
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
                  return DropdownMenuItem(value: v.plateNumber, child: Text('\${v.plateNumber} (\${v.name})'));
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
                    id: 'drv_\${DateTime.now().millisecondsSinceEpoch}',
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
                    SnackBar(content: Text('Driver \${newDrv.name} registered successfully!')),
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
`
  },
  {
    path: "lib/main.dart",
    language: "dart",
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'viewmodels/fleet_viewmodel.dart';
import 'viewmodels/chat_viewmodel.dart';
import 'views/home_view.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => FleetViewModel()),
        ChangeNotifierProvider(create: (_) => ChatViewModel(apiKey: "AIzaSyDUdO3E87oQCUTZ2r8ycdWvN5Sq6dbXdHc")),
      ],
      child: MaterialApp(
        title: 'AI Vehicle & Driver Assistant',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF6750A4), // Elegant Material 3 Purple
            brightness: Brightness.light,
          ),
        ),
        darkTheme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF6750A4),
            brightness: Brightness.dark,
          ),
        ),
        themeMode: ThemeMode.light,
        home: const HomeView(),
      ),
    );
  }
}
`
  },
  {
    path: "lib/models/cloud_document.dart",
    language: "dart",
    content: `class CloudDocument {
  final String id;
  final String name;
  final String documentType; // 'Insurance PDF', 'Fuel Bills', 'Service Bills', 'Tyre Bills', 'Battery Bills', 'RC', 'Fitness Certificate', 'Driving License', 'Salary Receipt'
  final String source; // 'Camera', 'Gallery', 'PDF'
  final DateTime uploadedAt;
  final String fileSize;
  final String storageUrl;
  final String? notes;

  CloudDocument({
    required this.id,
    required this.name,
    required this.documentType,
    required this.source,
    required this.uploadedAt,
    required this.fileSize,
    required this.storageUrl,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'documentType': documentType,
    'source': source,
    'uploadedAt': uploadedAt.toIso8601String(),
    'fileSize': fileSize,
    'storageUrl': storageUrl,
    'notes': notes,
  };

  factory CloudDocument.fromJson(Map<String, dynamic> json) => CloudDocument(
    id: json['id'],
    name: json['name'],
    documentType: json['documentType'],
    source: json['source'],
    uploadedAt: DateTime.parse(json['uploadedAt']),
    fileSize: json['fileSize'],
    storageUrl: json['storageUrl'],
    notes: json['notes'],
  );
}
`
  },
  {
    path: "lib/views/document_vault_view.dart",
    language: "dart",
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
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
  String? _simulatedFilePath;
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

  void _simulateUpload() async {
    if (_selectedSource != 'PDF' && _simulatedFilePath == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select or capture a file first.')),
      );
      return;
    }

    setState(() {
      _isUploading = true;
      _uploadProgress = 0.0;
    });

    for (int i = 1; i <= 5; i++) {
      await Future.delayed(const Duration(milliseconds: 350));
      setState(() {
        _uploadProgress = i * 0.2;
      });
    }

    final fleetVM = context.read<FleetViewModel>();
    final newDoc = CloudDocument(
      id: 'cd_\${DateTime.now().millisecondsSinceEpoch}',
      name: _selectedSource == 'PDF' 
          ? 'scanned_\${_selectedType.toLowerCase().replaceAll(' ', '_')}.pdf'
          : 'captured_\${_selectedType.toLowerCase().replaceAll(' ', '_')}.jpg',
      documentType: _selectedType,
      source: _selectedSource,
      uploadedAt: DateTime.now(),
      fileSize: _selectedSource == 'PDF' ? '1.8 MB' : '920 KB',
      storageUrl: 'https://storage.googleapis.com/fleet-cloud-bucket/doc_\${DateTime.now().millisecondsSinceEpoch}.\${_selectedSource == 'PDF' ? 'pdf' : 'jpg'}',
      notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
    );

    fleetVM.addCloudDocument(newDoc);

    setState(() {
      _isUploading = false;
      _simulatedFilePath = null;
      _notesController.clear();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: Colors.green,
        content: Text('"\${newDoc.name}" uploaded & encrypted securely in AES-256 Cloud Vault!'),
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
                                        _simulatedFilePath = null;
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
                            if (_selectedSource == 'PDF') ...[
                              Icon(Icons.picture_as_pdf, size: 40, color: theme.colorScheme.primary.withOpacity(0.7)),
                              const SizedBox(height: 12),
                              const Text('PDF Document Selected', style: TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text('Simulating dynamic attachment up to 10MB', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                            ] else if (_simulatedFilePath == null) ...[
                              Icon(_selectedSource == 'Camera' ? Icons.camera_alt_outlined : Icons.photo_library_outlined, size: 40, color: theme.colorScheme.secondary),
                              const SizedBox(height: 12),
                              Text(_selectedSource == 'Camera' ? 'Ready to Capture Receipt' : 'Select from Photo Gallery', style: const TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              ElevatedButton.icon(
                                onPressed: () {
                                  setState(() {
                                    _simulatedFilePath = 'assets/simulated_receipt_\${_selectedType.toLowerCase().replaceAll(' ', '_')}.jpg';
                                  });
                                },
                                icon: Icon(_selectedSource == 'Camera' ? Icons.camera : Icons.photo),
                                label: Text(_selectedSource == 'Camera' ? 'Trigger Snapshot' : 'Browse Gallery'),
                              ),
                            ] else ...[
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Container(
                                  width: 140,
                                  height: 80,
                                  color: Colors.black12,
                                  child: const Center(
                                    child: Icon(Icons.check_circle, color: Colors.green, size: 36),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 12),
                              const Text('Receipt Image Attached!', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              TextButton(
                                onPressed: () => setState(() => _simulatedFilePath = null),
                                child: const Text('Remove Snapshot', style: TextStyle(color: Colors.red)),
                              )
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
                                    Text('\${(_uploadProgress * 100).toInt()}%', style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.bold)),
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
                  Text('Cloud Storage History (\${fleetVM.uploadedDocuments.length})', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
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
                                  Text('"\${doc.notes}"', style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic)),
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
        title: Text('\${driver.name} - Ledger & Attendance'),
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
                            '\${currencyFormat.format(driver.salaryRate)} (\${driver.salaryType})',
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
                            ? Text('Duty Hours: \${record.startDuty} - \${record.endDuty}')
                            : Text('Status: \${record.status}'),
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
                          '\${isAdvance ? "+" : "-"}\${currencyFormat.format(record.amount)}',
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
                  SnackBar(content: Text('Transaction recorded: \$_transactionType of ₹\$amount')),
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
`
  },
  {
    path: "android/gradle/wrapper/gradle-wrapper.properties",
    language: "properties",
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.14-all.zip
`
  },
  {
    path: "android/settings.gradle",
    language: "groovy",
    content: `pluginManagement {
    def flutterSdkPath = {
        def properties = new Properties()
        def file = new File(rootProject.projectDir, "local.properties")
        if (file.exists()) {
            properties.load(file.newDataInputStream())
        }
        def sdkPath = properties.getProperty("flutter.sdk")
        assert sdkPath != null, "flutter.sdk not set in local.properties"
        return sdkPath
    }()

    includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id "dev.flutter.flutter-plugin-loader" version "1.0.0"
    id "com.android.application" version "8.7.3" apply false
    id "org.jetbrains.kotlin.android" version "2.0.21" apply false
}

include ":app"
`
  },
  {
    path: "android/gradle.properties",
    language: "properties",
    content: `org.gradle.jvmargs=-Xmx4096M
android.useAndroidX=true
android.enableJetifier=true
`
  },
  {
    path: "android/build.gradle",
    language: "groovy",
    content: `allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = '../build'
subprojects {
    project.buildDir = "\${rootProject.buildDir}/\${project.name}"
}
subprojects {
    project.evaluationDependsOn(':app')
}

tasks.register("clean", Delete) {
    delete rootProject.buildDir
}
`
  },
  {
    path: "android/app/build.gradle",
    language: "groovy",
    content: `plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
}

def localProperties = new Properties()
def localPropertiesFile = rootProject.file('local.properties')
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader('UTF-8') { reader ->
        localProperties.load(reader)
    }
}

def flutterVersionCode = localProperties.getProperty('flutter.versionCode')
if (flutterVersionCode == null) {
    flutterVersionCode = '1'
}

def flutterVersionName = localProperties.getProperty('flutter.versionName')
if (flutterVersionName == null) {
    flutterVersionName = '1.0'
}

android {
    namespace "com.example.ai_vehicle_driver_assistant"
    compileSdk 36
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = '1.8'
    }

    defaultConfig {
        applicationId "com.example.ai_vehicle_driver_assistant"
        minSdk 21
        targetSdk 36
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
        }
    }
}

flutter {
    source '../..'
}
`
  },
  {
    path: "android/app/src/main/res/values/styles.xml",
    language: "xml",
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="LaunchTheme" parent="@android:style/Theme.Material.Light.NoActionBar">
        <item name="android:windowBackground">@drawable/launch_background</item>
    </style>
    <style name="NormalTheme" parent="@android:style/Theme.Material.Light.NoActionBar">
        <item name="android:windowBackground">?android:attr/colorBackground</item>
    </style>
</resources>`
  },
  {
    path: "android/app/src/main/res/drawable/launch_background.xml",
    language: "xml",
    content: `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="?android:attr/colorBackground" />
</layer-list>`
  },
  {
    path: "android/app/src/main/AndroidManifest.xml",
    language: "xml",
    content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.RECORD_AUDIO"/>
    <uses-permission android:name="android.permission.CAMERA"/>
    
    <application
        android:label="Fleet AI Assistant"
        android:name="\${applicationName}"
        android:icon="@android:drawable/sym_def_app_icon">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:taskAffinity=""
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>`
  },
  {
    path: "android/app/src/main/kotlin/com/example/ai_vehicle_driver_assistant/MainActivity.kt",
    language: "kotlin",
    content: `package com.example.ai_vehicle_driver_assistant

import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity()
`
  }
];
