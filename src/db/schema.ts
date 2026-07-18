import { pgTable, varchar, date, numeric, integer, timestamp, boolean, text, serial, customType } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Custom vector type for pgvector
export const pgVector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(768)'; // 768 dimensions for gemini-embedding-2-preview
  },
  toDriver(value: number[]) {
    // pgvector format: '[0.1, 0.2, ...]'
    return `[${value.join(',')}]`;
  },
  fromDriver(value: unknown) {
    if (typeof value === 'string') {
      return value.slice(1, -1).split(',').map(Number);
    }
    return value as number[];
  }
});

// 1. DRIVERS TABLE
export const drivers = pgTable("drivers", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  licenseNumber: varchar("license_number", { length: 50 }).notNull().unique(),
  licenseExpiry: date("license_expiry").notNull(),
  assignedVehiclePlate: varchar("assigned_vehicle_plate", { length: 20 }),
  joiningDate: date("joining_date").notNull().default("2026-03-15"),
  salaryType: varchar("salary_type", { length: 30 }).notNull().default("Monthly"), // "Monthly", "Daily", "PerTrip"
  salaryRate: numeric("salary_rate", { precision: 12, scale: 2 }).notNull().default("18000.00"),
  advance: numeric("advance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  dutyStatus: varchar("duty_status", { length: 30 }).notNull().default("OffDuty"), // "OffDuty", "OnDuty"
  attendanceStatus: varchar("attendance_status", { length: 30 }).notNull().default("None") // "Present", "Leave", "Absent", "None"
});

// 2. VEHICLES TABLE
export const vehicles = pgTable("vehicles", {
  plateNumber: varchar("plate_number", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }).notNull(),
  purchaseDate: date("purchase_date").notNull(),
  engineNumber: varchar("engine_number", { length: 50 }).notNull().unique(),
  chassisNumber: varchar("chassis_number", { length: 50 }).notNull().unique(),
  
  // Expiry Dates & Certificate Numbers
  insuranceNo: varchar("insurance_no", { length: 50 }),
  insuranceExpiry: date("insurance_expiry").notNull(),
  insuranceProvider: varchar("insurance_provider", { length: 100 }),
  insuranceAmount: numeric("insurance_amount", { precision: 12, scale: 2 }),
  
  fitnessNo: varchar("fitness_no", { length: 50 }),
  fitnessExpiry: date("fitness_expiry").notNull(),
  
  permitNo: varchar("permit_no", { length: 50 }),
  permitExpiry: date("permit_expiry"),
  permitType: varchar("permit_type", { length: 50 }),
  
  roadTaxReceiptNo: varchar("road_tax_receipt_no", { length: 50 }),
  roadTaxExpiry: date("road_tax_expiry"),
  roadTaxAmount: numeric("road_tax_amount", { precision: 12, scale: 2 }),
  
  pucNo: varchar("puc_no", { length: 50 }),
  pucExpiry: date("puc_expiry"),
  
  fastagId: varchar("fastag_id", { length: 50 }),
  fastagBalance: numeric("fastag_balance", { precision: 12, scale: 2 }).default("0.00"),
  
  currentOdometer: integer("current_odometer").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("Active"),
  assignedDriverId: varchar("assigned_driver_id", { length: 50 })
});

// 3. VEHICLE DOCUMENTS TABLE
export const vehicleDocuments = pgTable("vehicle_documents", {
  id: varchar("id", { length: 50 }).primaryKey(),
  plateNumber: varchar("plate_number", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  url: text("url")
});

// 4. VEHICLE EXPENSES TABLE
export const vehicleExpenses = pgTable("vehicle_expenses", {
  id: varchar("id", { length: 50 }).primaryKey(),
  plateNumber: varchar("plate_number", { length: 20 }).notNull(),
  date: date("date").notNull(),
  category: varchar("category", { length: 30 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  receiptName: varchar("receipt_name", { length: 255 })
});

// 5. SERVICE HISTORY TABLE
export const serviceHistory = pgTable("service_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  plateNumber: varchar("plate_number", { length: 20 }).notNull(),
  date: date("date").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 150 }).notNull(),
  cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
  odometer: integer("odometer").notNull(),
  details: text("details").notNull()
});

// 6. TRIP HISTORY TABLE
export const tripHistory = pgTable("trip_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  plateNumber: varchar("plate_number", { length: 20 }).notNull(),
  date: date("date").notNull(),
  fromLocation: varchar("from_location", { length: 100 }).notNull(),
  toLocation: varchar("to_location", { length: 100 }).notNull(),
  distanceKm: numeric("distance_km", { precision: 8, scale: 2 }).notNull(),
  fuelUsedLiters: numeric("fuel_used_liters", { precision: 8, scale: 2 }).notNull(),
  driverName: varchar("driver_name", { length: 100 }).notNull()
});

// 7. GLOBAL FUEL LOGS
export const fuelLogs = pgTable("fuel_logs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  plateNumber: varchar("plate_number", { length: 20 }).notNull(),
  date: date("date").notNull(),
  liters: numeric("liters", { precision: 8, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  driverName: varchar("driver_name", { length: 100 }).notNull()
});

// 8. SYSTEM ALERTS & NOTIFICATIONS
export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: varchar("title", { length: 150 }).notNull(),
  message: text("message").notNull(),
  date: date("date").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("info"),
  read: boolean("read").notNull().default(false)
});

// 9. KNOWLEDGE BASE EMBEDDINGS (pgvector table for RAG)
export const kbEmbeddings = pgTable("kb_embeddings", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  category: varchar("category", { length: 50 }).notNull().default("general"),
  embedding: pgVector("embedding").notNull()
});

// 10. REMINDERS ENGINE TABLE
export const reminders = pgTable("reminders", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: varchar("title", { length: 150 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // "Insurance", "Fitness", "Permit", "Road Tax", "PUC", "Service", "Tyres", "Battery", "License", "Salary"
  plateNumber: varchar("plate_number", { length: 20 }),
  driverId: varchar("driver_id", { length: 50 }),
  frequency: varchar("frequency", { length: 50 }).notNull(), // "Daily", "Weekly", "Monthly", "Quarterly", "Half Yearly", "Yearly", "Every X Days", "Every X Months", "Every X Years", "Every X Kilometers"
  frequencyValue: integer("frequency_value"),
  nextDueDate: date("next_due_date"),
  nextDueOdometer: integer("next_due_odometer"),
  lastTriggeredDate: date("last_triggered_date"),
  lastTriggeredOdometer: integer("last_triggered_odometer"),
  status: varchar("status", { length: 20 }).notNull().default("Active"), // "Active", "Snoozed", "Completed", "Dismissed"
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// 11. DRIVER ATTENDANCE TABLE
export const driverAttendance = pgTable("driver_attendance", {
  id: varchar("id", { length: 50 }).primaryKey(),
  driverId: varchar("driver_id", { length: 50 }).notNull(),
  date: date("date").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'Present' | 'Leave' | 'Absent'
  startDuty: varchar("start_duty", { length: 10 }), // e.g. "08:00"
  endDuty: varchar("end_duty", { length: 10 }) // e.g. "17:00"
});

// 12. DRIVER ADVANCES TABLE
export const driverAdvances = pgTable("driver_advances", {
  id: varchar("id", { length: 50 }).primaryKey(),
  driverId: varchar("driver_id", { length: 50 }).notNull(),
  date: date("date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 20 }).notNull() // 'advance' | 'repayment'
});

// Drizzle Relations
export const driversRelations = relations(drivers, ({ one, many }) => ({
  attendance: many(driverAttendance),
  advances: many(driverAdvances),
  vehicle: one(vehicles, {
    fields: [drivers.assignedVehiclePlate],
    references: [vehicles.plateNumber]
  })
}));

export const driverAttendanceRelations = relations(driverAttendance, ({ one }) => ({
  driver: one(drivers, {
    fields: [driverAttendance.driverId],
    references: [drivers.id]
  })
}));

export const driverAdvancesRelations = relations(driverAdvances, ({ one }) => ({
  driver: one(drivers, {
    fields: [driverAdvances.driverId],
    references: [drivers.id]
  })
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  driver: one(drivers, {
    fields: [vehicles.assignedDriverId],
    references: [drivers.id]
  }),
  documents: many(vehicleDocuments),
  expenses: many(vehicleExpenses),
  serviceHistory: many(serviceHistory),
  tripHistory: many(tripHistory)
}));

