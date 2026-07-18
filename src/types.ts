export interface VehicleDocument {
  id: string;
  name: string;
  type: 'Insurance' | 'Fitness' | 'Permit' | 'Road Tax' | 'PUC' | 'Fuel' | 'Service' | 'Trip' | 'FASTag' | 'Other';
  uploadedAt: string;
  url?: string;
}

export interface VehicleExpense {
  id: string;
  date: string;
  category: 'Fuel' | 'Maintenance' | 'Repairs' | 'Tolls' | 'Taxes' | 'Permit' | 'Insurance' | 'Fines' | 'Other';
  amount: number;
  description: string;
  receiptName?: string;
}

export interface ServiceRecord {
  id: string;
  date: string;
  type: string;
  provider: string;
  cost: number;
  odometer: number;
  details: string;
}

export interface TripRecord {
  id: string;
  date: string;
  from: string;
  to: string;
  distanceKm: number;
  fuelUsedLiters: number;
  driverName: string;
}

export interface Vehicle {
  plateNumber: string; // Unique Key
  name: string; // Friendly Name
  model: string;
  manufacturer: string;
  purchaseDate: string;
  engineNumber: string;
  chassisNumber: string;
  
  // Expiries & Certificate details
  insuranceNo?: string;
  insuranceExpiry: string; // YYYY-MM-DD
  insuranceProvider?: string;
  insuranceAmount?: number;
  
  fitnessNo?: string;
  fitnessExpiry: string; // YYYY-MM-DD
  
  permitNo?: string;
  permitExpiry?: string;
  permitType?: string;
  
  roadTaxReceiptNo?: string;
  roadTaxExpiry?: string;
  roadTaxAmount?: number;
  
  pucNo?: string;
  pucExpiry?: string;
  
  fastagId?: string;
  fastagBalance?: number;
  
  currentOdometer: number;
  status: 'Active' | 'Maintenance' | 'Inactive';
  assignedDriverId: string;

  // History & Scanned records
  documents: VehicleDocument[];
  expenses: VehicleExpense[];
  serviceHistory: ServiceRecord[];
  tripHistory: TripRecord[];
}

export interface DriverDocument {
  id: string;
  name: string;
  type: 'License' | 'Aadhaar' | 'Medical' | 'Other';
  uploadedAt: string;
}

export interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Leave' | 'Absent';
  startDuty?: string; // e.g. "08:00"
  endDuty?: string; // e.g. "17:00"
}

export interface AdvanceRecord {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'advance' | 'repayment';
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string; // YYYY-MM-DD
  assignedVehiclePlate: string;
  joiningDate: string; // YYYY-MM-DD
  salaryType: 'Monthly' | 'Daily' | 'PerTrip';
  salaryRate: number; // The rate
  advance: number; // Net advance outstanding
  dutyStatus: 'OffDuty' | 'OnDuty';
  attendanceStatus: 'Present' | 'Leave' | 'Absent' | 'None';
  attendanceHistory: AttendanceRecord[];
  advanceHistory: AdvanceRecord[];
  documents: DriverDocument[];
}

export interface FuelLog {
  id: string;
  plateNumber: string;
  date: string;
  liters: number;
  amount: number;
  driverName: string;
}

export interface ExpenseLog {
  id: string;
  plateNumber: string;
  date: string;
  amount: number;
  category: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'alert';
  read: boolean;
}

export interface CloudDocument {
  id: string;
  name: string;
  documentType: 'Insurance PDF' | 'Fuel Bills' | 'Service Bills' | 'Tyre Bills' | 'Battery Bills' | 'RC' | 'Fitness Certificate' | 'Driving License' | 'Salary Receipt';
  source: 'Camera' | 'Gallery' | 'PDF';
  uploadedAt: string;
  fileSize: string;
  storageUrl: string;
  fileData?: string;
  notes?: string;
}

export interface Reminder {
  id: string;
  title: string;
  category: 'Insurance' | 'Fitness' | 'Permit' | 'Road Tax' | 'PUC' | 'Service' | 'Tyres' | 'Battery' | 'License' | 'Salary';
  plateNumber?: string;
  driverId?: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Yearly' | 'Every X Days' | 'Every X Months' | 'Every X Years' | 'Every X Kilometers';
  frequencyValue?: number;
  nextDueDate?: string;
  nextDueOdometer?: number;
  lastTriggeredDate?: string;
  lastTriggeredOdometer?: number;
  status: 'Active' | 'Snoozed' | 'Completed' | 'Dismissed';
  notes?: string;
  createdAt?: string;
}

export interface FleetDatabase {
  vehicles: Vehicle[];
  drivers: Driver[];
  fuelLogs: FuelLog[];
  expenseLogs: ExpenseLog[];
  notifications: NotificationItem[];
  uploadedDocuments?: CloudDocument[];
  reminders?: Reminder[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isVoice?: boolean;
  docUrl?: string;
  docName?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: string;
}
