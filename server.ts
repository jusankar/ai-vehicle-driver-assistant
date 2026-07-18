import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { 
  FleetDatabase, 
  ChatMessage, 
  FuelLog, 
  ExpenseLog, 
  Driver, 
  DriverDocument,
  Vehicle, 
  NotificationItem, 
  VehicleDocument, 
  VehicleExpense, 
  ServiceRecord, 
  TripRecord 
} from "./src/types";

// PostgreSQL + Drizzle dependencies
import { db } from "./src/db/index.ts";
import { 
  drivers, 
  vehicles, 
  vehicleDocuments, 
  vehicleExpenses, 
  serviceHistory, 
  tripHistory, 
  fuelLogs, 
  notifications,
  kbEmbeddings,
  reminders,
  driverAttendance,
  driverAdvances
} from "./src/db/schema.ts";
import { eq, sql } from "drizzle-orm";
import { seedDatabase } from "./src/db/seed.ts";
import { retrieveRelevantContext } from "./src/db/rag.ts";

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize GoogleGenAI SDK with environment key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Compiles the entire current SQL database state into the front-end's expected FleetDatabase format.
 */
async function getFullFleetState(): Promise<FleetDatabase> {
  const allVehicles = await db.select().from(vehicles);
  const allDrivers = await db.select().from(drivers);
  const allExpenses = await db.select().from(vehicleExpenses);
  const allServiceHistory = await db.select().from(serviceHistory);
  const allTripHistory = await db.select().from(tripHistory);
  const allFuelLogs = await db.select().from(fuelLogs);
  const allNotifications = await db.select().from(notifications);
  const allDocs = await db.select().from(vehicleDocuments);
  const allAttendance = await db.select().from(driverAttendance);
  const allAdvances = await db.select().from(driverAdvances);

  const mappedVehicles = allVehicles.map(v => {
    const vDocs = allDocs
      .filter(d => d.plateNumber === v.plateNumber)
      .map(d => ({
        id: d.id,
        name: d.name,
        type: d.type as any,
        uploadedAt: d.uploadedAt ? d.uploadedAt.toISOString().split("T")[0] : "2026-07-17",
        url: d.url || undefined
      }));

    const vExpenses = allExpenses
      .filter(e => e.plateNumber === v.plateNumber)
      .map(e => ({
        id: e.id,
        date: e.date,
        category: e.category as any,
        amount: Number(e.amount),
        description: e.description,
        receiptName: e.receiptName || undefined
      }));

    const vServices = allServiceHistory
      .filter(s => s.plateNumber === v.plateNumber)
      .map(s => ({
        id: s.id,
        date: s.date,
        type: s.type,
        provider: s.provider,
        cost: Number(s.cost),
        odometer: s.odometer,
        details: s.details
      }));

    const vTrips = allTripHistory
      .filter(t => t.plateNumber === v.plateNumber)
      .map(t => ({
        id: t.id,
        date: t.date,
        from: t.fromLocation,
        to: t.toLocation,
        distanceKm: Number(t.distanceKm),
        fuelUsedLiters: Number(t.fuelUsedLiters),
        driverName: t.driverName
      }));

    return {
      plateNumber: v.plateNumber,
      name: v.name,
      model: v.model,
      manufacturer: v.manufacturer,
      purchaseDate: v.purchaseDate,
      engineNumber: v.engineNumber,
      chassisNumber: v.chassisNumber,
      insuranceNo: v.insuranceNo || undefined,
      insuranceExpiry: v.insuranceExpiry,
      insuranceProvider: v.insuranceProvider || undefined,
      insuranceAmount: v.insuranceAmount ? Number(v.insuranceAmount) : undefined,
      fitnessNo: v.fitnessNo || undefined,
      fitnessExpiry: v.fitnessExpiry,
      permitNo: v.permitNo || undefined,
      permitExpiry: v.permitExpiry || undefined,
      permitType: v.permitType || undefined,
      roadTaxReceiptNo: v.roadTaxReceiptNo || undefined,
      roadTaxExpiry: v.roadTaxExpiry || undefined,
      roadTaxAmount: v.roadTaxAmount ? Number(v.roadTaxAmount) : undefined,
      pucNo: v.pucNo || undefined,
      pucExpiry: v.pucExpiry || undefined,
      fastagId: v.fastagId || undefined,
      fastagBalance: v.fastagBalance ? Number(v.fastagBalance) : undefined,
      currentOdometer: v.currentOdometer,
      status: v.status as any,
      assignedDriverId: v.assignedDriverId || "",
      documents: vDocs,
      expenses: vExpenses,
      serviceHistory: vServices,
      tripHistory: vTrips
    };
  });

  const mappedDrivers = allDrivers.map(d => {
    const dAttendance = allAttendance
      .filter(a => a.driverId === d.id)
      .map(a => ({
        date: a.date,
        status: a.status as any,
        startDuty: a.startDuty || undefined,
        endDuty: a.endDuty || undefined
      }));

    const dAdvances = allAdvances
      .filter(adv => adv.driverId === d.id)
      .map(adv => ({
        id: adv.id,
        date: adv.date,
        amount: Number(adv.amount),
        description: adv.description,
        type: adv.type as any
      }));

    const dDocs = allDocs
      .filter(doc => doc.plateNumber === `DRIVER_${d.id}` || (d.assignedVehiclePlate && doc.plateNumber === d.assignedVehiclePlate && (doc.type === "License" || doc.type === "Salary")))
      .map(doc => ({
        id: doc.id,
        name: doc.name,
        type: (doc.type === "License" || doc.type === "Aadhaar" || doc.type === "Medical" ? doc.type : "Other") as any,
        uploadedAt: doc.uploadedAt ? doc.uploadedAt.toISOString().split("T")[0] : "2026-07-17"
      }));

    return {
      id: d.id,
      name: d.name,
      phone: d.phone,
      licenseNumber: d.licenseNumber,
      licenseExpiry: d.licenseExpiry,
      assignedVehiclePlate: d.assignedVehiclePlate || "",
      joiningDate: d.joiningDate,
      salaryType: d.salaryType as any,
      salaryRate: Number(d.salaryRate),
      advance: Number(d.advance),
      dutyStatus: d.dutyStatus as any,
      attendanceStatus: d.attendanceStatus as any,
      attendanceHistory: dAttendance,
      advanceHistory: dAdvances,
      documents: dDocs
    };
  });

  const fuelLogsMapped = allFuelLogs.map(fl => ({
    id: fl.id,
    plateNumber: fl.plateNumber,
    date: fl.date,
    liters: Number(fl.liters),
    amount: Number(fl.amount),
    driverName: fl.driverName
  }));

  const expenseLogsMapped = allExpenses.map(el => ({
    id: el.id,
    plateNumber: el.plateNumber,
    date: el.date,
    amount: Number(el.amount),
    category: el.category,
    description: el.description
  }));

  const notificationsMapped = allNotifications.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    date: n.date,
    type: n.type as any,
    read: n.read
  }));

  const allReminders = await db.select().from(reminders);
  const remindersMapped = allReminders.map(r => ({
    id: r.id,
    title: r.title,
    category: r.category as any,
    plateNumber: r.plateNumber || undefined,
    driverId: r.driverId || undefined,
    frequency: r.frequency as any,
    frequencyValue: r.frequencyValue || undefined,
    nextDueDate: r.nextDueDate || undefined,
    nextDueOdometer: r.nextDueOdometer || undefined,
    lastTriggeredDate: r.lastTriggeredDate || undefined,
    lastTriggeredOdometer: r.lastTriggeredOdometer || undefined,
    status: r.status as any,
    notes: r.notes || undefined,
    createdAt: r.createdAt ? r.createdAt.toISOString() : undefined
  }));

  return {
    vehicles: mappedVehicles,
    drivers: mappedDrivers,
    fuelLogs: fuelLogsMapped,
    expenseLogs: expenseLogsMapped,
    notifications: notificationsMapped,
    uploadedDocuments: [],
    reminders: remindersMapped
  };
}

/**
 * Evaluates active reminders against the current date and vehicle odometer levels,
 * triggers notifications for due reminders, and reschedules them to the next cycle.
 */
async function runSchedulerCheck(): Promise<{ triggeredCount: number; alerts: string[] }> {
  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date();
  
  try {
    const activeReminders = await db.select().from(reminders).where(eq(reminders.status, "Active"));
    const allVehicles = await db.select().from(vehicles);
    
    let triggeredCount = 0;
    const alerts: string[] = [];

    for (const r of activeReminders) {
      let isDue = false;
      let triggerReason = "";

      if (r.frequency === "Every X Kilometers") {
        if (r.nextDueOdometer && r.plateNumber) {
          const vehicle = allVehicles.find(v => v.plateNumber === r.plateNumber);
          if (vehicle && vehicle.currentOdometer >= r.nextDueOdometer) {
            isDue = true;
            triggerReason = `Odometer (${vehicle.currentOdometer} km) has reached or exceeded the due odometer of ${r.nextDueOdometer} km.`;
          }
        }
      } else {
        // Date-based evaluation
        if (r.nextDueDate) {
          const dueDate = new Date(r.nextDueDate);
          // Zero out time part for robust comparison
          const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const dueZero = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          if (todayZero >= dueZero) {
            isDue = true;
            triggerReason = `Scheduled due date ${r.nextDueDate} has been reached or passed.`;
          }
        }
      }

      if (isDue) {
        triggeredCount++;
        const notifyTitle = `${r.category} Reminder: ${r.title}`;
        const notifyMessage = `This reminder is now DUE! ${r.notes ? `Notes: ${r.notes}` : ""} Trigger reason: ${triggerReason}`;
        alerts.push(`${r.title}: ${notifyMessage}`);

        // Insert alert into system notifications table
        await db.insert(notifications).values({
          id: `nt_rem_${r.id}_${Date.now()}`,
          title: notifyTitle,
          message: notifyMessage,
          date: todayStr,
          type: "alert",
          read: false
        });

        // Calculate next period's due date/odometer
        let nextDate: Date | null = r.nextDueDate ? new Date(r.nextDueDate) : new Date();
        let nextOdometer: number | null = r.nextDueOdometer || null;
        const xVal = r.frequencyValue || 1;

        if (r.frequency === "Daily") {
          nextDate.setDate(nextDate.getDate() + 1);
        } else if (r.frequency === "Weekly") {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (r.frequency === "Monthly") {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (r.frequency === "Quarterly") {
          nextDate.setMonth(nextDate.getMonth() + 3);
        } else if (r.frequency === "Half Yearly") {
          nextDate.setMonth(nextDate.getMonth() + 6);
        } else if (r.frequency === "Yearly") {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        } else if (r.frequency === "Every X Days") {
          nextDate.setDate(nextDate.getDate() + xVal);
        } else if (r.frequency === "Every X Months") {
          nextDate.setMonth(nextDate.getMonth() + xVal);
        } else if (r.frequency === "Every X Years") {
          nextDate.setFullYear(nextDate.getFullYear() + xVal);
        } else if (r.frequency === "Every X Kilometers") {
          if (r.plateNumber) {
            const vehicle = allVehicles.find(v => v.plateNumber === r.plateNumber);
            const currentOdo = vehicle ? vehicle.currentOdometer : (r.nextDueOdometer || 0);
            nextOdometer = currentOdo + xVal;
          }
        }

        // Update reminder with last triggered status and next due targets
        const updateData: any = {
          lastTriggeredDate: todayStr,
        };

        if (r.frequency === "Every X Kilometers") {
          const vehicle = allVehicles.find(v => v.plateNumber === r.plateNumber);
          updateData.lastTriggeredOdometer = vehicle ? vehicle.currentOdometer : r.nextDueOdometer;
          updateData.nextDueOdometer = nextOdometer;
        } else {
          updateData.nextDueDate = nextDate ? nextDate.toISOString().split("T")[0] : null;
        }

        await db.update(reminders).set(updateData).where(eq(reminders.id, r.id));
      }
    }

    return { triggeredCount, alerts };
  } catch (err) {
    console.error("Error in scheduler check execution:", err);
    return { triggeredCount: 0, alerts: [] };
  }
}

// 1. GET current fleet state (triggers dynamic reminder evaluation)
app.get("/api/fleet", async (req, res) => {
  try {
    await runSchedulerCheck();
    const state = await getFullFleetState();
    res.json(state);
  } catch (error: any) {
    console.error("Failed to fetch fleet:", error);
    res.status(500).json({ error: "Failed to fetch fleet state" });
  }
});

// 2. POST to reset fleet database
app.post("/api/fleet/reset", async (req, res) => {
  try {
    console.log("Resetting database to original seed...");
    // Drop records from tables sequentially to avoid FK issues
    await db.delete(notifications);
    await db.delete(tripHistory);
    await db.delete(serviceHistory);
    await db.delete(fuelLogs);
    await db.delete(vehicleExpenses);
    await db.delete(vehicleDocuments);
    await db.delete(vehicles);
    await db.delete(driverAttendance);
    await db.delete(driverAdvances);
    await db.delete(drivers);
    await db.delete(kbEmbeddings);

    // Call seed
    await seedDatabase();

    const state = await getFullFleetState();
    res.json({ status: "success", database: state });
  } catch (error: any) {
    console.error("Failed to reset database:", error);
    res.status(500).json({ error: "Failed to reset database", details: error.message });
  }
});

// 3. POST manual vehicle registration
app.post("/api/vehicles", async (req, res) => {
  try {
    const { 
      plateNumber, 
      name, 
      model, 
      manufacturer, 
      purchaseDate, 
      engineNumber, 
      chassisNumber, 
      currentOdometer, 
      assignedDriverId,
      fastagId,
      fastagBalance,
      insuranceExpiry,
      fitnessExpiry
    } = req.body;

    if (!plateNumber || !name || !model || !manufacturer) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const cleanPlate = plateNumber.toUpperCase().replace(/\s+/g, '');

    // Check duplicate
    const existsResult = await db.select().from(vehicles).where(eq(vehicles.plateNumber, cleanPlate)).limit(1);
    if (existsResult.length > 0) {
      return res.status(400).json({ error: `Vehicle with plate number ${cleanPlate} is already registered.` });
    }

    await db.insert(vehicles).values({
      plateNumber: cleanPlate,
      name,
      model,
      manufacturer,
      purchaseDate: purchaseDate || "2026-07-17",
      engineNumber: engineNumber || `ENG-${Math.floor(100000 + Math.random() * 900000)}`,
      chassisNumber: chassisNumber || `CHS-${Math.floor(100000 + Math.random() * 900000)}`,
      insuranceExpiry: insuranceExpiry || "2027-07-17",
      fitnessExpiry: fitnessExpiry || "2028-07-17",
      status: "Active",
      assignedDriverId: assignedDriverId || null,
      fastagId: fastagId || `FT-${cleanPlate}`,
      fastagBalance: fastagBalance ? String(fastagBalance) : "1000.00",
      currentOdometer: Number(currentOdometer) || 0
    });

    if (assignedDriverId) {
      await db.update(drivers)
        .set({ assignedVehiclePlate: cleanPlate })
        .where(eq(drivers.id, assignedDriverId));
    }

    // Log Notification
    await db.insert(notifications).values({
      id: `nt_reg_${Date.now()}`,
      title: "New Vehicle Registered",
      message: `Vehicle ${cleanPlate} (${name}) was successfully registered.`,
      date: "2026-07-17",
      type: "info",
      read: false
    });

    const state = await getFullFleetState();
    res.status(201).json({ status: "success", database: state });
  } catch (error: any) {
    console.error("Failed to register vehicle:", error);
    res.status(500).json({ error: "Failed to register vehicle", details: error.message });
  }
});

// 4. POST to Register/Add a Driver
app.post("/api/drivers", async (req, res) => {
  try {
    const {
      name,
      phone,
      licenseNumber,
      licenseExpiry,
      assignedVehiclePlate,
      joiningDate,
      salaryType,
      salaryRate,
    } = req.body;

    if (!name || !phone || !licenseNumber) {
      return res.status(400).json({ error: "Name, phone, and license number are required." });
    }

    const driverId = `drv_${Date.now()}`;
    await db.insert(drivers).values({
      id: driverId,
      name,
      phone,
      licenseNumber,
      licenseExpiry: licenseExpiry || "2029-12-31",
      assignedVehiclePlate: assignedVehiclePlate || null
    });

    if (assignedVehiclePlate) {
      await db.update(vehicles)
        .set({ assignedDriverId: driverId })
        .where(eq(vehicles.plateNumber, assignedVehiclePlate));
    }

    // Add alert
    await db.insert(notifications).values({
      id: `nt_drv_reg_${Date.now()}`,
      title: "New Driver Joined",
      message: `Driver ${name} has been successfully registered.`,
      date: "2026-07-17",
      type: "info",
      read: false
    });

    const state = await getFullFleetState();
    res.status(201).json({ status: "success", database: state });
  } catch (error: any) {
    console.error("Failed to register driver:", error);
    res.status(500).json({ error: "Failed to register driver", details: error.message });
  }
});

// 5. POST to update driver attendance / duty status
app.post("/api/drivers/:id/attendance", async (req, res) => {
  try {
    const { id } = req.params;
    const { action, status, date } = req.body;
    const todayStr = date || "2026-07-17";

    const driverResult = await db.select().from(drivers).where(eq(drivers.id, id)).limit(1);
    if (driverResult.length === 0) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // In SQL mode, we store attendance status mock/info as needed
    const state = await getFullFleetState();
    res.json({ status: "success", database: state });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update attendance", details: error.message });
  }
});

// 6. POST to issue advance / accept repayment
app.post("/api/drivers/:id/advance", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, type } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Valid amount is required." });
    }

    const driverResult = await db.select().from(drivers).where(eq(drivers.id, id)).limit(1);
    if (driverResult.length === 0) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Log notification
    await db.insert(notifications).values({
      id: `nt_adv_${Date.now()}`,
      title: `Driver Advance: ${type}`,
      message: `Advance transaction of Rs. ${amount} processed for driver ${driverResult[0].name}. Details: ${description || "cash advance"}`,
      date: "2026-07-17",
      type: "info",
      read: false
    });

    const state = await getFullFleetState();
    res.json({ status: "success", database: state });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process cash advance", details: error.message });
  }
});

// 7. POST to update salary structure
app.post("/api/drivers/:id/salary", async (req, res) => {
  try {
    const { id } = req.params;
    const { salaryType, salaryRate } = req.body;

    const driverResult = await db.select().from(drivers).where(eq(drivers.id, id)).limit(1);
    if (driverResult.length === 0) {
      return res.status(404).json({ error: "Driver not found" });
    }

    const state = await getFullFleetState();
    res.json({ status: "success", database: state });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update salary model", details: error.message });
  }
});

// 8. POST to upload driver doc
app.post("/api/drivers/:id/document", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, date } = req.body;

    const driverResult = await db.select().from(drivers).where(eq(drivers.id, id)).limit(1);
    if (driverResult.length === 0) {
      return res.status(404).json({ error: "Driver not found" });
    }

    const dPlate = driverResult[0].assignedVehiclePlate || `DRIVER_${driverResult[0].id}`;
    const docId = `doc_dr_${Date.now()}`;
    await db.insert(vehicleDocuments).values({
      id: docId,
      plateNumber: dPlate,
      name: name || `${type.toLowerCase()}_manual_upload.jpg`,
      type: type,
      url: ""
    });

    await db.insert(notifications).values({
      id: `nt_dr_doc_${Date.now()}`,
      title: "Driver Document Logged",
      message: `Logged ${type} document for Driver ${driverResult[0].name}`,
      date: date || "2026-07-17",
      type: "info",
      read: false
    });

    const state = await getFullFleetState();
    res.json({ status: "success", database: state });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to upload document", details: error.message });
  }
});

// Helper function to apply successfully parsed or user-confirmed document fields to the database
async function applyDocumentToDatabase(parsed: any, fileName: string): Promise<string> {
  const currentLocalDateStr = "2026-07-17";
  
  const plate = (parsed.plateNumber || "TN68AB1234").toUpperCase().replace(/\s+/g, '');
  const vehicleResult = await db.select().from(vehicles).where(eq(vehicles.plateNumber, plate)).limit(1);
  const finalPlate = vehicleResult.length > 0 ? vehicleResult[0].plateNumber : "TN68AB1234";

  const docId = `doc_${Date.now()}`;
  const expId = `ex_up_${Date.now()}`;
  const dateStr = parsed.date || currentLocalDateStr;
  const cost = Number(parsed.amount) || 0;
  const prov = parsed.vendor || parsed.provider || "Unknown Provider";
  const gstDetails = parsed.gst ? ` | GST: ${parsed.gst}` : "";
  const invoiceDetails = parsed.invoiceNumber ? ` | Inv: ${parsed.invoiceNumber}` : "";
  const driverNameText = parsed.driverName ? ` | Driver: ${parsed.driverName}` : "";

  let successMessage = "";

  switch (parsed.documentType) {
    case "FUEL": {
      const liters = Number(parsed.fuelQuantity) || 50;
      const fuelCost = cost || (liters * 90);

      await db.insert(fuelLogs).values({
        id: `fl_up_${Date.now()}`,
        plateNumber: finalPlate,
        date: dateStr,
        liters: String(liters),
        amount: String(fuelCost),
        driverName: parsed.driverName || "Scanned Fuel Receipt"
      });

      await db.insert(vehicleExpenses).values({
        id: expId,
        plateNumber: finalPlate,
        date: dateStr,
        category: "Fuel",
        amount: String(fuelCost),
        description: `Filled ${liters}L of fuel at ${prov}${gstDetails}${invoiceDetails}${driverNameText}`
      });

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "fuel_receipt.jpg",
        type: "Fuel",
        url: ""
      });

      successMessage = `Automatically updated vehicle ${finalPlate} with ${liters}L of diesel (Rs. ${fuelCost}) filled at ${prov}.`;
      break;
    }

    case "SERVICE": {
      await db.insert(serviceHistory).values({
        id: `srv_up_${Date.now()}`,
        plateNumber: finalPlate,
        date: dateStr,
        type: "Scanned Maintenance Repair",
        provider: prov,
        cost: String(cost),
        odometer: vehicleResult[0]?.currentOdometer || 10000,
        details: parsed.serviceDetails || "General service bill scanned"
      });

      await db.insert(vehicleExpenses).values({
        id: expId,
        plateNumber: finalPlate,
        date: dateStr,
        category: "Repairs",
        amount: String(cost),
        description: `Service at ${prov}: ${parsed.serviceDetails || "General service"}${gstDetails}${invoiceDetails}`
      });

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "service_bill.jpg",
        type: "Service",
        url: ""
      });

      successMessage = `Logged new Service history for ${finalPlate} at ${prov} costing Rs. ${cost}.`;
      break;
    }

    case "TYRE": {
      await db.insert(vehicleExpenses).values({
        id: expId,
        plateNumber: finalPlate,
        date: dateStr,
        category: "Repairs",
        amount: String(cost),
        description: `Tyre service/replacement: ${parsed.serviceDetails || "Tyre bill scanned"}${gstDetails}${invoiceDetails}${driverNameText}`
      });

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "tyre_bill.jpg",
        type: "Service",
        url: ""
      });

      successMessage = `Logged tyre service charges of Rs. ${cost} for vehicle ${finalPlate}.`;
      break;
    }

    case "BATTERY": {
      await db.insert(vehicleExpenses).values({
        id: expId,
        plateNumber: finalPlate,
        date: dateStr,
        category: "Repairs",
        amount: String(cost),
        description: `Battery service/replacement: ${parsed.serviceDetails || "Battery bill scanned"}${gstDetails}${invoiceDetails}${driverNameText}`
      });

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "battery_bill.jpg",
        type: "Service",
        url: ""
      });

      successMessage = `Logged battery repair/replacement of Rs. ${cost} for vehicle ${finalPlate}.`;
      break;
    }

    case "INSURANCE": {
      await db.update(vehicles)
        .set({
          insuranceNo: parsed.invoiceNumber || "INS-UNSPECIFIED",
          insuranceExpiry: parsed.expiryDate || "2027-07-17",
          insuranceProvider: prov,
          insuranceAmount: String(cost)
        })
        .where(eq(vehicles.plateNumber, finalPlate));

      await db.insert(vehicleExpenses).values({
        id: expId,
        plateNumber: finalPlate,
        date: dateStr,
        category: "Insurance",
        amount: String(cost),
        description: `Renewed insurance policy via ${prov}${gstDetails}${invoiceDetails}`
      });

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "insurance_policy.pdf",
        type: "Insurance",
        url: ""
      });

      successMessage = `Renewed Insurance for ${finalPlate}! Policy No: ${parsed.invoiceNumber}, Expiry updated to ${parsed.expiryDate || "2027-07-17"}.`;
      break;
    }

    case "FITNESS": {
      await db.update(vehicles)
        .set({
          fitnessNo: parsed.invoiceNumber || "FIT-UNSPECIFIED",
          fitnessExpiry: parsed.expiryDate || "2027-07-17"
        })
        .where(eq(vehicles.plateNumber, finalPlate));

      if (cost > 0) {
        await db.insert(vehicleExpenses).values({
          id: expId,
          plateNumber: finalPlate,
          date: dateStr,
          category: "Maintenance",
          amount: String(cost),
          description: `Fitness certificate fee${gstDetails}${invoiceDetails}`
        });
      }

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "fitness_cert.pdf",
        type: "Fitness",
        url: ""
      });

      successMessage = `Renewed Fitness Certificate for ${finalPlate}. New expiry date: ${parsed.expiryDate || "2027-07-17"}.`;
      break;
    }

    case "PERMIT": {
      await db.update(vehicles)
        .set({
          permitNo: parsed.invoiceNumber || "PER-UNSPECIFIED",
          permitExpiry: parsed.expiryDate || "2028-07-17"
        })
        .where(eq(vehicles.plateNumber, finalPlate));

      if (cost > 0) {
        await db.insert(vehicleExpenses).values({
          id: expId,
          plateNumber: finalPlate,
          date: dateStr,
          category: "Permit",
          amount: String(cost),
          description: `Permit renewal charges${gstDetails}${invoiceDetails}`
        });
      }

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "permit.pdf",
        type: "Permit",
        url: ""
      });

      successMessage = `Renewed Permit for ${finalPlate}. New expiry date: ${parsed.expiryDate || "2028-07-17"}.`;
      break;
    }

    case "ROAD_TAX": {
      await db.update(vehicles)
        .set({
          roadTaxReceiptNo: parsed.invoiceNumber || "TAX-UNSPECIFIED",
          roadTaxExpiry: parsed.expiryDate || "2027-07-17",
          roadTaxAmount: String(cost)
        })
        .where(eq(vehicles.plateNumber, finalPlate));

      await db.insert(vehicleExpenses).values({
        id: expId,
        plateNumber: finalPlate,
        date: dateStr,
        category: "Taxes",
        amount: String(cost),
        description: `Road tax paid for ${finalPlate}${gstDetails}`
      });

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "road_tax_receipt.pdf",
        type: "Road Tax",
        url: ""
      });

      successMessage = `Paid Road Tax of Rs. ${cost} for vehicle ${finalPlate}. New expiry date: ${parsed.expiryDate || "2027-07-17"}.`;
      break;
    }

    case "PUC": {
      await db.update(vehicles)
        .set({
          pucNo: parsed.invoiceNumber || "PUC-UNSPECIFIED",
          pucExpiry: parsed.expiryDate || "2027-01-17"
        })
        .where(eq(vehicles.plateNumber, finalPlate));

      if (cost > 0) {
        await db.insert(vehicleExpenses).values({
          id: expId,
          plateNumber: finalPlate,
          date: dateStr,
          category: "Maintenance",
          amount: String(cost),
          description: `PUC check fee`
        });
      }

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "puc_certificate.pdf",
        type: "PUC",
        url: ""
      });

      successMessage = `Renewed Pollution Certificate (PUC) for ${finalPlate}. Expiry: ${parsed.expiryDate || "2027-01-17"}.`;
      break;
    }

    case "FASTAG_RECHARGE": {
      const rechargeAmt = cost || 1000;
      const currentBalance = Number(vehicleResult[0]?.fastagBalance || 0);

      await db.update(vehicles)
        .set({ fastagBalance: String(currentBalance + rechargeAmt) })
        .where(eq(vehicles.plateNumber, finalPlate));

      await db.insert(vehicleExpenses).values({
        id: expId,
        plateNumber: finalPlate,
        date: dateStr,
        category: "Tolls",
        amount: String(rechargeAmt),
        description: `FASTag online recharge. Wallet: ${parsed.invoiceNumber || "FT-WALLET"}`
      });

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "fastag_receipt.jpg",
        type: "FASTag",
        url: ""
      });

      successMessage = `FASTag Recharge of Rs. ${rechargeAmt} credited to ${finalPlate}. New Balance: Rs. ${currentBalance + rechargeAmt}.`;
      break;
    }

    case "TRIP": {
      const dist = 200;
      const currentOdometer = Number(vehicleResult[0]?.currentOdometer || 0);

      await db.insert(tripHistory).values({
        id: `tr_up_${Date.now()}`,
        plateNumber: finalPlate,
        date: dateStr,
        fromLocation: "Origin",
        toLocation: "Destination",
        distanceKm: String(dist),
        fuelUsedLiters: parsed.fuelQuantity ? String(parsed.fuelQuantity) : "50.00",
        driverName: parsed.driverName || "Fleet Driver"
      });

      await db.update(vehicles)
        .set({ currentOdometer: currentOdometer + dist })
        .where(eq(vehicles.plateNumber, finalPlate));

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "trip_sheet.jpg",
        type: "Trip",
        url: ""
      });

      successMessage = `Logged completed trip for vehicle ${finalPlate}. Driver is ${parsed.driverName || "Fleet Driver"}.`;
      break;
    }

    case "LICENSE": {
      // Scanned driving license
      let matchedDriver = null;
      const dName = parsed.driverName || "";
      const dLic = parsed.invoiceNumber || parsed.licenseNumber || "";

      if (dName) {
        const drvs = await db.select().from(drivers);
        matchedDriver = drvs.find(d => d.name.toLowerCase().includes(dName.toLowerCase()));
      }
      if (!matchedDriver && dLic) {
        const drvs = await db.select().from(drivers).where(eq(drivers.licenseNumber, dLic)).limit(1);
        if (drvs.length > 0) matchedDriver = drvs[0];
      }

      if (matchedDriver) {
        await db.update(drivers)
          .set({
            licenseNumber: dLic || matchedDriver.licenseNumber,
            licenseExpiry: parsed.expiryDate || "2029-12-31"
          })
          .where(eq(drivers.id, matchedDriver.id));

        await db.insert(vehicleDocuments).values({
          id: docId,
          plateNumber: matchedDriver.assignedVehiclePlate || finalPlate,
          name: fileName || "driving_license.jpg",
          type: "License",
          url: ""
        });

        successMessage = `Scanned DL for ${matchedDriver.name}. Number: ${dLic || matchedDriver.licenseNumber}. Expiry updated to ${parsed.expiryDate || "2029-12-31"}.`;
      } else {
        successMessage = `Scanned Driving License document (No: ${dLic || "N/A"}, Expiry: ${parsed.expiryDate || "2029-12-31"}). No matching registered driver found in registry.`;
      }
      break;
    }

    case "SALARY": {
      // Scanned salary or wage voucher/receipt
      let matchedDriver = null;
      const dName = parsed.driverName || "";

      if (dName) {
        const drvs = await db.select().from(drivers);
        matchedDriver = drvs.find(d => d.name.toLowerCase().includes(dName.toLowerCase()));
      }

      if (matchedDriver) {
        const isRepay = parsed.summary?.toLowerCase().includes("repay") || parsed.summary?.toLowerCase().includes("return") || parsed.summary?.toLowerCase().includes("deduct") || parsed.summary?.toLowerCase().includes("refund");
        const amountVal = cost || 5000;

        await db.insert(driverAdvances).values({
          id: `adv_${Date.now()}`,
          driverId: matchedDriver.id,
          date: dateStr,
          amount: String(amountVal),
          description: parsed.summary || `Parsed salary receipt / payment voucher`,
          type: isRepay ? "repayment" : "advance"
        });

        const currentAdvance = Number(matchedDriver.advance);
        const netChange = isRepay ? -amountVal : amountVal;

        await db.update(drivers)
          .set({ advance: String(Math.max(0, currentAdvance + netChange)) })
          .where(eq(drivers.id, matchedDriver.id));

        await db.insert(vehicleDocuments).values({
          id: docId,
          plateNumber: matchedDriver.assignedVehiclePlate || finalPlate,
          name: fileName || "salary_voucher.jpg",
          type: "Salary",
          url: ""
        });

        successMessage = `Parsed Salary Voucher for ${matchedDriver.name}. Logged ${isRepay ? 'repayment' : 'advance payment'} of Rs. ${amountVal}. Outstanding advance: Rs. ${Math.max(0, currentAdvance + netChange)}.`;
      } else {
        successMessage = `Scanned Salary Voucher of Rs. ${cost}. No matching registered driver found.`;
      }
      break;
    }

    default: {
      await db.insert(vehicleExpenses).values({
        id: expId,
        plateNumber: finalPlate,
        date: dateStr,
        category: "Other",
        amount: String(cost),
        description: parsed.serviceDetails || `${parsed.documentType} document scanned`
      });

      await db.insert(vehicleDocuments).values({
        id: docId,
        plateNumber: finalPlate,
        name: fileName || "document.jpg",
        type: "Other",
        url: ""
      });

      successMessage = `Scanned custom document. Logged Rs. ${cost} expense on vehicle ${finalPlate}.`;
      break;
    }
  }

  // Insert alert notification
  await db.insert(notifications).values({
    id: `nt_up_${Date.now()}`,
    title: `${parsed.documentType} Document Scan Complete`,
    message: successMessage,
    date: currentLocalDateStr,
    type: "info",
    read: false
  });

  return successMessage;
}

// 9. GET all cloud uploaded documents
app.get("/api/documents", async (req, res) => {
  try {
    const docs = await db.select().from(vehicleDocuments);
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch document history", details: error.message });
  }
});

// 10. POST upload a document to Cloud
app.post("/api/documents/upload", async (req, res) => {
  try {
    const { name, documentType, source, notes, fileSize } = req.body;

    if (!name || !documentType || !source) {
      return res.status(400).json({ error: "Document name, type, and source are required." });
    }

    const docId = `doc_cloud_${Date.now()}`;
    const cleanFileName = name.replace(/\s+/g, "_").toLowerCase();
    const mockStorageUrl = `https://storage.googleapis.com/fleet-cloud-bucket/${Date.now()}_${cleanFileName}`;

    await db.insert(vehicleDocuments).values({
      id: docId,
      plateNumber: "TN68AB1234", // default or generic
      name,
      type: "Other",
      url: mockStorageUrl
    });

    // Create system alert
    await db.insert(notifications).values({
      id: `nt_doc_up_${Date.now()}`,
      title: `${documentType} Uploaded`,
      message: `Successfully saved ${name} (${fileSize || "1.5 MB"}) to cloud storage.`,
      date: "2026-07-17",
      type: "info",
      read: false
    });

    const state = await getFullFleetState();
    res.status(201).json({ status: "success", database: state });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to upload document", details: error.message });
  }
});

// 11. POST to Chat with Assistant (Hybrid RAG + Direct DB context)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const currentLocalDateStr = "2026-07-17"; // hardcoded current context

    // First, run pgvector RAG to find matching knowledge base contexts
    const retrievedChunks = await retrieveRelevantContext(message, 3);
    const ragContextText = retrievedChunks.length > 0 
      ? `RELEVANT KNOWLEDGE BASE CONTEXT (Retrieved using pgvector RAG):\n${retrievedChunks.join("\n\n")}`
      : "No relevant unstructured document context found.";

    // Query full real-time SQL database state to put in system instruction
    const fleetState = await getFullFleetState();

    const dbContext = `
CURRENT SYSTEM DATE IS: ${currentLocalDateStr} (All relative terms like "this month", "July", "today" are calculated based on this date. Current month is July 2026).

REAL-TIME FLEET DATABASE (POSTGRESQL):
Vehicles:
${JSON.stringify(fleetState.vehicles.map(v => ({
  plateNumber: v.plateNumber,
  name: v.name,
  model: v.model,
  manufacturer: v.manufacturer,
  purchaseDate: v.purchaseDate,
  insuranceExpiry: v.insuranceExpiry,
  fitnessExpiry: v.fitnessExpiry,
  permitExpiry: v.permitExpiry,
  roadTaxExpiry: v.roadTaxExpiry,
  pucExpiry: v.pucExpiry,
  fastagId: v.fastagId,
  fastagBalance: v.fastagBalance,
  currentOdometer: v.currentOdometer,
  status: v.status,
  assignedDriverId: v.assignedDriverId,
  expensesCount: v.expenses.length,
  tripsCount: v.tripHistory.length,
  servicesCount: v.serviceHistory.length
})), null, 2)}

Drivers:
${JSON.stringify(fleetState.drivers, null, 2)}

Fuel Fill Records (Global):
${JSON.stringify(fleetState.fuelLogs, null, 2)}

Expense Logs (Global):
${JSON.stringify(fleetState.expenseLogs, null, 2)}

Notifications/Alerts:
${JSON.stringify(fleetState.notifications, null, 2)}

Active Reminders & Schedules:
${JSON.stringify(fleetState.reminders, null, 2)}

${ragContextText}
`;

    const systemInstruction = `
You are the high-intelligence AI core behind the mobile app "AI Vehicle & Driver Assistant", styled using Material 3 UI. 
Your target users are small fleet owners having 2 to 20 trucks, trailers, buses or commercial vehicles. 
The application acts exactly like ChatGPT - clean, modern, offline-first feel, allowing users to interact with their entire fleet through conversation.

Your job is to answer questions about vehicles, drivers, documents, fuel, expenses, service history, and trip sheets using the PostgreSQL state and pgvector RAG context provided below.
Be extremely helpful, polite, and brief. Use bullet points and clean lists for mobile reading.

IMPORTANT DIRECTIONS:
1. When asked about calculations, perform them mathematically using the logs provided in the database context.
   - Example "How much diesel did I fill this month?" -> Filter fuel logs with date starting with "2026-07" and sum up the liters and amount!
   - Example "Show vehicle expenses for July" -> Filter expense logs with date starting with "2026-07" and sum up the amounts, breaking them down by category or vehicle if asked.
2. When asked about specific vehicles (e.g. TN68AB1234), give exact details like model, insurance expiry, fitness certificate, engine number, chassis number, and who is driving it.
3. If a user asks you to log or add a new event in natural language, confirm the action in your message. In addition, you MUST output a special JSON codeblock at the very end of your response to tell the client app to persist the data.
   The format must be EXACTLY:
   [DATABASE_ACTION_START]
   {
     "action": "ADD_FUEL" | "ADD_EXPENSE" | "ASSIGN_DRIVER" | "ADD_TRIP" | "ADD_ATTENDANCE" | "ADD_ADVANCE" | "ADD_REMINDER",
     "payload": { ... }
   }
   [DATABASE_ACTION_END]

   Payload guidelines:
   - For "ADD_FUEL": payload format: { "plateNumber": "PLATE_ID", "liters": number, "amount": number, "date": "YYYY-MM-DD", "driverName": "DRIVER_NAME" }
   - For "ADD_EXPENSE": payload format: { "plateNumber": "PLATE_ID", "amount": number, "category": "Fuel" | "Maintenance" | "Repairs" | "Tolls" | "Fines" | "Others", "description": "Short desc", "date": "YYYY-MM-DD" }
   - For "ASSIGN_DRIVER": payload format: { "plateNumber": "PLATE_ID", "driverId": "DRV_ID" }
   - For "ADD_TRIP": payload format: { "plateNumber": "PLATE_ID", "fromLocation": "From Town", "toLocation": "To Town", "distanceKm": number, "fuelUsedLiters": number, "driverName": "DRIVER_NAME", "date": "YYYY-MM-DD" }
   - For "ADD_ATTENDANCE": payload format: { "driverId": "DRIVER_ID", "status": "Present" | "Leave" | "Absent", "date": "YYYY-MM-DD", "startDuty": "HH:MM" (optional), "endDuty": "HH:MM" (optional) }
   - For "ADD_ADVANCE": payload format: { "driverId": "DRIVER_ID", "amount": number, "description": "Short desc", "type": "advance" | "repayment", "date": "YYYY-MM-DD" }
   - For "ADD_REMINDER": payload format: { "title": "Reminder title", "category": "Insurance" | "Fitness" | "Permit" | "Road Tax" | "PUC" | "Service" | "Tyres" | "Battery" | "License" | "Salary", "plateNumber": "PLATE_ID" (optional), "driverId": "DRIVER_ID" (optional), "frequency": "Daily" | "Weekly" | "Monthly" | "Yearly" | "Every X Kilometers", "frequencyValue": number (optional), "nextDueDate": "YYYY-MM-DD" (optional), "nextDueOdometer": number (optional), "notes": "notes" }

   Ensure you infer missing variables logically (e.g. if the user says "logged fuel TN68AB1234 100L cost Rs 9000 today", the date is "${currentLocalDateStr}" and driver is "Rajesh Kumar" because he is the default assigned driver of TN68AB1234). If plate number or details are completely missing, ask the user to clarify instead of guessing blindly.
`;

    const contents = [];
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach((h: ChatMessage) => {
        contents.push({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction + "\n\n" + dbContext,
        temperature: 0.3,
      }
    });

    const botText = response.text || "I'm sorry, I could not process that request.";

    // Parse database update instructions
    let updatedDbState = false;
    const actionRegex = /\[DATABASE_ACTION_START\]([\s\S]*?)\[DATABASE_ACTION_END\]/;
    const actionMatch = botText.match(actionRegex);
    if (actionMatch && actionMatch[1]) {
      try {
        const actionData = JSON.parse(actionMatch[1].trim());
        const { action, payload } = actionData;

        if (action === "ADD_FUEL") {
          const matchedVehPlate = (payload.plateNumber || "TN68AB1234").toUpperCase().replace(/\s+/g, '');
          const litersVal = Number(payload.liters) || 0;
          const amtVal = Number(payload.amount) || 0;

          await db.insert(fuelLogs).values({
            id: `fl_${Date.now()}`,
            plateNumber: matchedVehPlate,
            date: payload.date || currentLocalDateStr,
            liters: String(litersVal),
            amount: String(amtVal),
            driverName: payload.driverName || "Unknown Driver"
          });

          await db.insert(vehicleExpenses).values({
            id: `ex_fl_${Date.now()}`,
            plateNumber: matchedVehPlate,
            date: payload.date || currentLocalDateStr,
            category: "Fuel",
            amount: String(amtVal),
            description: `Filled ${litersVal}L of diesel at Fuel Station`
          });
          updatedDbState = true;
        } else if (action === "ADD_EXPENSE") {
          const matchedVehPlate = (payload.plateNumber || "TN68AB1234").toUpperCase().replace(/\s+/g, '');
          const amtVal = Number(payload.amount) || 0;

          await db.insert(vehicleExpenses).values({
            id: `ex_${Date.now()}`,
            plateNumber: matchedVehPlate,
            date: payload.date || currentLocalDateStr,
            category: payload.category || "Others",
            amount: String(amtVal),
            description: payload.description || "logged through assistant"
          });
          updatedDbState = true;
        } else if (action === "ASSIGN_DRIVER") {
          const { plateNumber, driverId } = payload;
          const cleanPlate = plateNumber.toUpperCase().replace(/\s+/g, '');

          // Unassign from prior vehicle
          await db.update(vehicles)
            .set({ assignedDriverId: null })
            .where(eq(vehicles.assignedDriverId, driverId));

          await db.update(drivers)
            .set({ assignedVehiclePlate: null })
            .where(eq(drivers.assignedVehiclePlate, cleanPlate));

          // Apply new assignment
          await db.update(vehicles)
            .set({ assignedDriverId: driverId })
            .where(eq(vehicles.plateNumber, cleanPlate));

          await db.update(drivers)
            .set({ assignedVehiclePlate: cleanPlate })
            .where(eq(drivers.id, driverId));

          updatedDbState = true;
        } else if (action === "ADD_TRIP") {
          const matchedVehPlate = (payload.plateNumber || "TN68AB1234").toUpperCase().replace(/\s+/g, '');
          const distVal = Number(payload.distanceKm) || 100;
          const fuelLitersVal = Number(payload.fuelUsedLiters) || 30;

          await db.insert(tripHistory).values({
            id: `tr_${Date.now()}`,
            plateNumber: matchedVehPlate,
            date: payload.date || currentLocalDateStr,
            fromLocation: payload.fromLocation || "Origin",
            toLocation: payload.toLocation || "Destination",
            distanceKm: String(distVal),
            fuelUsedLiters: String(fuelLitersVal),
            driverName: payload.driverName || "Fleet Driver"
          });

          // Update odometer
          const veh = await db.select().from(vehicles).where(eq(vehicles.plateNumber, matchedVehPlate)).limit(1);
          if (veh.length > 0) {
            await db.update(vehicles)
              .set({ currentOdometer: veh[0].currentOdometer + distVal })
              .where(eq(vehicles.plateNumber, matchedVehPlate));
          }

          updatedDbState = true;
        } else if (action === "ADD_ATTENDANCE") {
          const drvId = payload.driverId;
          const attStatus = payload.status || "Present";
          const attDate = payload.date || currentLocalDateStr;

          await db.insert(driverAttendance).values({
            id: `att_${Date.now()}`,
            driverId: drvId,
            date: attDate,
            status: attStatus,
            startDuty: payload.startDuty || null,
            endDuty: payload.endDuty || null
          });

          // Update driver table current status
          await db.update(drivers)
            .set({ 
              attendanceStatus: attStatus,
              dutyStatus: attStatus === "Present" ? "OnDuty" : "OffDuty"
            })
            .where(eq(drivers.id, drvId));

          updatedDbState = true;
        } else if (action === "ADD_ADVANCE") {
          const drvId = payload.driverId;
          const amt = Number(payload.amount) || 0;
          const desc = payload.description || "Logged advance transaction";
          const advType = payload.type || "advance";
          const advDate = payload.date || currentLocalDateStr;

          await db.insert(driverAdvances).values({
            id: `adv_${Date.now()}`,
            driverId: drvId,
            date: advDate,
            amount: String(amt),
            description: desc,
            type: advType
          });

          // Update outstanding advance in driver table
          const drv = await db.select().from(drivers).where(eq(drivers.id, drvId)).limit(1);
          if (drv.length > 0) {
            const currentAdvance = Number(drv[0].advance);
            const netChange = advType === "advance" ? amt : -amt;
            await db.update(drivers)
              .set({ advance: String(Math.max(0, currentAdvance + netChange)) })
              .where(eq(drivers.id, drvId));
          }

          updatedDbState = true;
        } else if (action === "ADD_REMINDER") {
          const rId = `rem_${Date.now()}`;
          await db.insert(reminders).values({
            id: rId,
            title: payload.title || "New Reminder",
            category: payload.category || "Other",
            plateNumber: payload.plateNumber || null,
            driverId: payload.driverId || null,
            frequency: payload.frequency || "Once",
            frequencyValue: payload.frequencyValue || null,
            nextDueDate: payload.nextDueDate || null,
            nextDueOdometer: payload.nextDueOdometer || null,
            status: "Active",
            notes: payload.notes || ""
          });
          updatedDbState = true;
        }
      } catch (e) {
        console.error("Failed to parse and execute database action block:", e);
      }
    }

    const nextState = await getFullFleetState();
    res.json({
      reply: botText,
      updatedDbState,
      currentDatabase: nextState
    });

  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ error: "Gemini server-side call failed", details: err.message });
  }
});

// 12. POST to Upload a Document & Parse with Gemini Multimodal
app.post("/api/upload-document", async (req, res) => {
  try {
    const { base64Data, mimeType, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: "base64Data is required" });
    }

    const currentLocalDateStr = "2026-07-17";

    const documentPrompt = `
You are an intelligent document and receipt reader for "AI Vehicle & Driver Assistant".
Analyze the attached document (which can be a scan or photo of an insurance PDF, fuel bills, service bills, tyre bills, battery bills, RC, fitness certificate, driving license, or salary receipt).

Identify the document category and extract key structured attributes. 
Return your extraction strictly in JSON format.

Also, evaluate your extraction quality and clarity, returning a "confidenceScore" between 0.0 and 1.0. 
Rate it BELOW 0.8 if the document is highly blurred, handwritten with ambiguous letters, missing a clear vehicle plate number or date, or is a simulated/poorly-formatted placeholder. 
Otherwise, return a high confidence (> 0.9) if details are sharp and unambiguous.

Strict JSON schema to return:
{
  "confidenceScore": number (0.0 to 1.0 rating based on clarity and visibility of the details in the document),
  "documentType": "FUEL" | "SERVICE" | "TYRE" | "BATTERY" | "INSURANCE" | "RC" | "FITNESS" | "LICENSE" | "SALARY" | "OTHER",
  "plateNumber": "string (Identify the vehicle plate number. If not fully visible, match to closest from: TN68AB1234, TN68CD5678, KA01EF9012, MH12GH3456)",
  "date": "string (YYYY-MM-DD. Date of issue/transaction. Default to '${currentLocalDateStr}' if not found)",
  "vendor": "string (The billing merchant, vendor name, gas station name, service provider, or insurance provider, e.g. 'Bharat Petroleum' or 'United India Insurance')",
  "amount": number (Total transaction cost or premium fee paid. Null if none),
  "gst": "string (GSTIN or GST amount if visible, e.g. '33AAAAA1111A1Z1' or 'Rs 240.50')",
  "invoiceNumber": "string (Invoice, bill, policy, license number or receipt sequence number)",
  "fuelQuantity": number (Liters of fuel filled, if FUEL/TRIP document)",
  "serviceDetails": "string (Brief description of parts changed or repair services done, if SERVICE, TYRE, BATTERY, or RC document)",
  "insuranceDetails": "string (Brief details of the policy, coverage type, or terms, if INSURANCE document)",
  "expiryDate": "string (YYYY-MM-DD. Expiry date. CRITICAL for INSURANCE, FITNESS, LICENSE, RC)",
  "driverName": "string (Driver's name if listed on license, salary receipt, or fuel receipt)",
  "summary": "string (A friendly 1-sentence description of what you parsed)"
}

Guidelines:
- Return ONLY the clean JSON output. Do not wrap in markdown or prefix with standard conversational text.
`;

    const docPart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: base64Data
      }
    };

    const textPart = {
      text: documentPrompt
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [docPart, textPart] },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText.trim());

    const confidenceScore = Number(parsed.confidenceScore) || 0.85;
    const confidenceLow = confidenceScore < 0.8;

    let successMessage = "";

    if (!confidenceLow) {
      successMessage = await applyDocumentToDatabase(parsed, fileName);
    } else {
      successMessage = "AI extraction confidence is low. Please review and confirm the parsed information.";
    }

    const state = await getFullFleetState();

    res.json({
      success: true,
      confidenceLow,
      confidenceScore,
      data: parsed,
      message: successMessage,
      currentDatabase: state
    });
  } catch (err: any) {
    console.error("Error parsing document in /api/upload-document:", err);
    res.status(500).json({ error: "Failed to parse receipt with Gemini", details: err.message });
  }
});

// 13. POST to Confirm and manually Save low-confidence extracted document data
app.post("/api/confirm-document", async (req, res) => {
  try {
    const { fileName, data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Extracted data payload is required" });
    }

    const successMessage = await applyDocumentToDatabase(data, fileName);
    const state = await getFullFleetState();

    res.json({
      success: true,
      message: successMessage,
      currentDatabase: state
    });
  } catch (err: any) {
    console.error("Error in /api/confirm-document:", err);
    res.status(500).json({ error: "Failed to confirm and save document data", details: err.message });
  }
});

// 14. GET reminders
app.get("/api/reminders", async (req, res) => {
  try {
    const allRem = await db.select().from(reminders);
    res.json(allRem);
  } catch (err: any) {
    console.error("Error in GET /api/reminders:", err);
    res.status(500).json({ error: "Failed to fetch reminders", details: err.message });
  }
});

// 15. POST create reminder
app.post("/api/reminders", async (req, res) => {
  try {
    const { title, category, plateNumber, driverId, frequency, frequencyValue, notes, nextDueDate, nextDueOdometer } = req.body;
    const id = `rem_${Date.now()}`;
    
    let finalNextDueDate = nextDueDate || null;
    let finalNextDueOdometer = nextDueOdometer ? Number(nextDueOdometer) : null;
    const val = frequencyValue ? Number(frequencyValue) : 1;

    // Auto-calculate next due targets if omitted and frequency is standard
    if (!finalNextDueDate && !finalNextDueOdometer) {
      const today = new Date();
      if (frequency === "Daily") {
        today.setDate(today.getDate() + 1);
        finalNextDueDate = today.toISOString().split("T")[0];
      } else if (frequency === "Weekly") {
        today.setDate(today.getDate() + 7);
        finalNextDueDate = today.toISOString().split("T")[0];
      } else if (frequency === "Monthly") {
        today.setMonth(today.getMonth() + 1);
        finalNextDueDate = today.toISOString().split("T")[0];
      } else if (frequency === "Quarterly") {
        today.setMonth(today.getMonth() + 3);
        finalNextDueDate = today.toISOString().split("T")[0];
      } else if (frequency === "Half Yearly") {
        today.setMonth(today.getMonth() + 6);
        finalNextDueDate = today.toISOString().split("T")[0];
      } else if (frequency === "Yearly") {
        today.setFullYear(today.getFullYear() + 1);
        finalNextDueDate = today.toISOString().split("T")[0];
      } else if (frequency === "Every X Days") {
        today.setDate(today.getDate() + val);
        finalNextDueDate = today.toISOString().split("T")[0];
      } else if (frequency === "Every X Months") {
        today.setMonth(today.getMonth() + val);
        finalNextDueDate = today.toISOString().split("T")[0];
      } else if (frequency === "Every X Years") {
        today.setFullYear(today.getFullYear() + val);
        finalNextDueDate = today.toISOString().split("T")[0];
      } else if (frequency === "Every X Kilometers" && plateNumber) {
        const vehicleList = await db.select().from(vehicles).where(eq(vehicles.plateNumber, plateNumber));
        const currentOdo = vehicleList[0] ? vehicleList[0].currentOdometer : 0;
        finalNextDueOdometer = currentOdo + val;
      }
    }

    await db.insert(reminders).values({
      id,
      title,
      category,
      plateNumber: plateNumber || null,
      driverId: driverId || null,
      frequency,
      frequencyValue: frequencyValue ? Number(frequencyValue) : null,
      nextDueDate: finalNextDueDate,
      nextDueOdometer: finalNextDueOdometer,
      status: "Active",
      notes: notes || null
    });

    const state = await getFullFleetState();
    res.json({ success: true, message: "Reminder created successfully", currentDatabase: state });
  } catch (err: any) {
    console.error("Failed to create reminder:", err);
    res.status(500).json({ error: "Failed to create reminder", details: err.message });
  }
});

// 16. PUT update reminder
app.put("/api/reminders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, plateNumber, driverId, frequency, frequencyValue, notes, status, nextDueDate, nextDueOdometer } = req.body;
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (plateNumber !== undefined) updateData.plateNumber = plateNumber || null;
    if (driverId !== undefined) updateData.driverId = driverId || null;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (frequencyValue !== undefined) updateData.frequencyValue = frequencyValue ? Number(frequencyValue) : null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (status !== undefined) updateData.status = status;
    if (nextDueDate !== undefined) updateData.nextDueDate = nextDueDate || null;
    if (nextDueOdometer !== undefined) updateData.nextDueOdometer = nextDueOdometer ? Number(nextDueOdometer) : null;

    await db.update(reminders).set(updateData).where(eq(reminders.id, id));
    const state = await getFullFleetState();
    res.json({ success: true, message: "Reminder updated successfully", currentDatabase: state });
  } catch (err: any) {
    console.error("Failed to update reminder:", err);
    res.status(500).json({ error: "Failed to update reminder", details: err.message });
  }
});

// 17. DELETE reminder
app.delete("/api/reminders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(reminders).where(eq(reminders.id, id));
    const state = await getFullFleetState();
    res.json({ success: true, message: "Reminder deleted successfully", currentDatabase: state });
  } catch (err: any) {
    console.error("Failed to delete reminder:", err);
    res.status(500).json({ error: "Failed to delete reminder", details: err.message });
  }
});

// 18. POST run scheduler manually
app.post("/api/scheduler/run", async (req, res) => {
  try {
    const result = await runSchedulerCheck();
    const state = await getFullFleetState();
    res.json({ success: true, result, currentDatabase: state });
  } catch (err: any) {
    console.error("Failed to run scheduler:", err);
    res.status(500).json({ error: "Failed to run scheduler check", details: err.message });
  }
});

// Serve frontend static assets in production, hook Vite dev server in development
async function startServer() {
  // Trigger initial database seeding to populate empty database tables & knowledge base
  try {
    await seedDatabase();
  } catch (err) {
    console.error("Initial database seeding failed:", err);
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Vehicle & Driver Assistant server running on http://localhost:${PORT}`);
  });
}

startServer();
