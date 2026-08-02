class Vehicle {
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

class FleetAppNotification {
  final String id;
  final String title;
  final String message;
  final String date;
  final String type; // 'alert', 'warning', 'info'
  bool isRead;

  FleetAppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.date,
    required this.type,
    this.isRead = false,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'message': message,
    'date': date,
    'type': type,
    'isRead': isRead,
  };
}
