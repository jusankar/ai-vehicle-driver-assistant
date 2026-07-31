import { db } from "./index.ts";
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
} from "./schema.ts";
import { eq, sql } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Seed Initial Data
export async function seedDatabase() {
  try {
    console.log("Checking if database seeding is required...");
    
    // 1. Check if vehicles table is empty
    const vehicleCountResult = await db.select({ count: sql`count(*)` }).from(vehicles);
    const hasVehicles = Number(vehicleCountResult[0]?.count || 0) > 0;

    if (!hasVehicles) {
      console.log("Seeding drivers...");
      // Seed Drivers
      await db.insert(drivers).values([
        {
          id: "drv_1",
          name: "Rajesh Kumar",
          phone: "+91 98765 43210",
          licenseNumber: "DL-6820202991",
          licenseExpiry: "2029-10-15",
          assignedVehiclePlate: "TN68AB1234",
          joiningDate: "2026-03-15",
          salaryType: "Monthly",
          salaryRate: "18000.00",
          advance: "1500.00",
          dutyStatus: "OnDuty",
          attendanceStatus: "Present"
        },
        {
          id: "drv_2",
          name: "Amit Singh",
          phone: "+91 87654 32109",
          licenseNumber: "DL-1220220399",
          licenseExpiry: "2031-04-20",
          assignedVehiclePlate: "TN68CD5678",
          joiningDate: "2025-08-10",
          salaryType: "Monthly",
          salaryRate: "20000.00",
          advance: "0.00",
          dutyStatus: "OffDuty",
          attendanceStatus: "Present"
        },
        {
          id: "drv_3",
          name: "Gurnam Singh",
          phone: "+91 76543 21098",
          licenseNumber: "DL-PB02219011",
          licenseExpiry: "2028-11-12",
          assignedVehiclePlate: "KA01EF9012",
          joiningDate: "2024-11-01",
          salaryType: "Daily",
          salaryRate: "700.00",
          advance: "3000.00",
          dutyStatus: "OnDuty",
          attendanceStatus: "Present"
        },
        {
          id: "drv_4",
          name: "Senthil Kumar",
          phone: "+91 99445 12345",
          licenseNumber: "DL-TN6820210001",
          licenseExpiry: "2030-05-18",
          assignedVehiclePlate: "MH12GH3456",
          joiningDate: "2026-05-20",
          salaryType: "PerTrip",
          salaryRate: "1500.00",
          advance: "0.00",
          dutyStatus: "OffDuty",
          attendanceStatus: "Absent"
        }
      ]);

      console.log("Seeding driver attendance and advances...");
      await db.insert(driverAttendance).values([
        { id: "att_1", driverId: "drv_1", date: "2026-07-15", status: "Present", startDuty: "08:00", endDuty: "18:00" },
        { id: "att_2", driverId: "drv_1", date: "2026-07-16", status: "Present", startDuty: "08:15", endDuty: "17:45" },
        { id: "att_3", driverId: "drv_1", date: "2026-07-17", status: "Present", startDuty: "08:00", endDuty: "17:00" },
        { id: "att_4", driverId: "drv_2", date: "2026-07-17", status: "Present", startDuty: "08:30", endDuty: "18:30" },
        { id: "att_5", driverId: "drv_3", date: "2026-07-17", status: "Present", startDuty: "07:30", endDuty: "19:00" },
        { id: "att_6", driverId: "drv_4", date: "2026-07-17", status: "Absent" }
      ]);

      await db.insert(driverAdvances).values([
        { id: "adv_1", driverId: "drv_1", date: "2026-07-10", amount: "2000.00", description: "Highway food and truck servicing pocket money", type: "advance" },
        { id: "adv_2", driverId: "drv_1", date: "2026-07-15", amount: "500.00", description: "Repayment to office", type: "repayment" },
        { id: "adv_3", driverId: "drv_3", date: "2026-07-05", amount: "3000.00", description: "Personal emergency cash advance", type: "advance" }
      ]);

      console.log("Seeding vehicles...");
      // Seed Vehicles
      await db.insert(vehicles).values([
        {
          plateNumber: "TN68AB1234",
          name: "Chettinad Express",
          model: "Ashok Leyland 1615 (16T Truck)",
          manufacturer: "Ashok Leyland",
          purchaseDate: "2024-03-15",
          engineNumber: "AL-ENG-84523",
          chassisNumber: "AL-CHS-99231",
          insuranceNo: "INS-9923188",
          insuranceExpiry: "2026-08-15",
          insuranceProvider: "Royal Sundaram Insurance",
          insuranceAmount: "32000.00",
          fitnessNo: "FIT-332912",
          fitnessExpiry: "2027-01-10",
          permitNo: "PER-TN68-11",
          permitExpiry: "2028-04-12",
          permitType: "National Permit",
          roadTaxReceiptNo: "TAX-22119",
          roadTaxExpiry: "2026-12-20",
          roadTaxAmount: "18000.00",
          pucNo: "PUC-99238",
          pucExpiry: "2026-09-30",
          fastagId: "FT-TN68AB1234",
          fastagBalance: "4500.00",
          currentOdometer: 145200,
          status: "Active",
          assignedDriverId: "drv_1"
        },
        {
          plateNumber: "TN68CD5678",
          name: "Ganga Carrier",
          model: "BharatBenz 2823R (10-Wheeler)",
          manufacturer: "BharatBenz",
          purchaseDate: "2023-11-20",
          engineNumber: "BB-ENG-44512",
          chassisNumber: "BB-CHS-11209",
          insuranceNo: "INS-1120955",
          insuranceExpiry: "2026-07-25",
          insuranceProvider: "ICICI Lombard",
          insuranceAmount: "48000.00",
          fitnessNo: "FIT-847291",
          fitnessExpiry: "2026-12-05",
          permitNo: "PER-TN68-33",
          permitExpiry: "2027-11-15",
          permitType: "National Permit",
          roadTaxReceiptNo: "TAX-88410",
          roadTaxExpiry: "2026-10-30",
          roadTaxAmount: "24000.00",
          pucNo: "PUC-44512",
          pucExpiry: "2026-08-20",
          fastagId: "FT-TN68CD5678",
          fastagBalance: "1200.00",
          currentOdometer: 84500,
          status: "Maintenance",
          assignedDriverId: "drv_2"
        },
        {
          plateNumber: "KA01EF9012",
          name: "Karnataka Cargo King",
          model: "Tata Prima 5530.S (Trailer)",
          manufacturer: "Tata Motors",
          purchaseDate: "2024-05-12",
          engineNumber: "TATA-ENG-77341",
          chassisNumber: "TATA-CHS-88124",
          insuranceNo: "INS-8812400",
          insuranceExpiry: "2026-11-30",
          insuranceProvider: "HDFC ERGO",
          insuranceAmount: "55000.00",
          fitnessNo: "FIT-901292",
          fitnessExpiry: "2027-03-22",
          permitNo: "PER-KA01-99",
          permitExpiry: "2028-09-18",
          permitType: "National Permit",
          roadTaxReceiptNo: "TAX-33921",
          roadTaxExpiry: "2027-02-15",
          roadTaxAmount: "28000.00",
          pucNo: "PUC-77341",
          pucExpiry: "2026-11-10",
          fastagId: "FT-KA01EF9012",
          fastagBalance: "6400.00",
          currentOdometer: 198000,
          status: "Active",
          assignedDriverId: "drv_3"
        },
        {
          plateNumber: "MH12GH3456",
          name: "Deccan Queen",
          model: "Mahindra Blazo X 35 (Tipper)",
          manufacturer: "Mahindra",
          purchaseDate: "2025-01-10",
          engineNumber: "MHD-ENG-11002",
          chassisNumber: "MHD-CHS-55410",
          insuranceNo: "INS-5541099",
          insuranceExpiry: "2026-06-12",
          insuranceProvider: "National Insurance",
          insuranceAmount: "29000.00",
          fitnessNo: "FIT-554101",
          fitnessExpiry: "2026-09-18",
          permitNo: "PER-MH12-55",
          permitExpiry: "2027-01-15",
          permitType: "State Permit",
          roadTaxReceiptNo: "TAX-11022",
          roadTaxExpiry: "2026-08-10",
          roadTaxAmount: "14000.00",
          pucNo: "PUC-11002",
          pucExpiry: "2026-07-20",
          fastagId: "FT-MH12GH3456",
          fastagBalance: "350.00",
          currentOdometer: 52000,
          status: "Inactive",
          assignedDriverId: "drv_4"
        }
      ]);

      console.log("Seeding documents, expenses, trips, service history, and fuel logs...");

      // Seed Vehicle Expenses
      await db.insert(vehicleExpenses).values([
        { id: "ex_v1_1", plateNumber: "TN68AB1234", date: "2026-07-02", category: "Fuel", amount: "16200.00", description: "Filled 180 Liters of Diesel at IOCL", receiptName: "fuel_bill_3821.jpg" },
        { id: "ex_v1_2", plateNumber: "TN68AB1234", date: "2026-07-03", category: "Repairs", amount: "4500.00", description: "Tyre puncture repair & alignment", receiptName: "tyre_repair_9921.jpg" },
        { id: "ex_v1_3", plateNumber: "TN68AB1234", date: "2026-07-14", category: "Fuel", amount: "14400.00", description: "Filled 160 Liters of Diesel at HPCL", receiptName: "fuel_bill_3910.jpg" },
        { id: "ex_v2_1", plateNumber: "TN68CD5678", date: "2026-06-25", category: "Fuel", amount: "18000.00", description: "Filled 200 Liters of Diesel at BPCL", receiptName: "fuel_bill_1120.jpg" },
        { id: "ex_v2_2", plateNumber: "TN68CD5678", date: "2026-07-07", category: "Repairs", amount: "12000.00", description: "Engine oil change & oil filter replace", receiptName: "service_invoice_22.jpg" },
        { id: "ex_3", plateNumber: "KA01EF9012", date: "2026-07-11", category: "Tolls", amount: "2800.00", description: "NHAI Toll plaza transit recharge" },
        { id: "ex_4", plateNumber: "MH12GH3456", date: "2026-07-15", category: "Repairs", amount: "6500.00", description: "Front brake pads replacement" }
      ]);

      // Seed Fuel Logs
      await db.insert(fuelLogs).values([
        { id: "fl_1", plateNumber: "TN68AB1234", date: "2026-07-02", liters: "180.00", amount: "16200.00", driverName: "Rajesh Kumar" },
        { id: "fl_2", plateNumber: "TN68AB1234", date: "2026-07-14", liters: "160.00", amount: "14400.00", driverName: "Rajesh Kumar" },
        { id: "fl_3", plateNumber: "TN68CD5678", date: "2026-06-25", liters: "200.00", amount: "18000.00", driverName: "Amit Singh" }
      ]);

      // Seed Service History
      await db.insert(serviceHistory).values([
        { id: "srv_v1_1", plateNumber: "TN68AB1234", date: "2026-05-10", type: "General Maintenance", provider: "Bosch Service Center", cost: "14500.00", odometer: 138000, details: "Engine oil replacement, oil filter, air filter cleaning, brake padding tune up" },
        { id: "srv_v2_1", plateNumber: "TN68CD5678", date: "2026-07-07", type: "Lubrication Service", provider: "BharatBenz Authorized Workshop", cost: "12000.00", odometer: 84300, details: "Engine oil change & oil filter replace" }
      ]);

      // Seed Trip History
      await db.insert(tripHistory).values([
        { id: "tr_v1_1", plateNumber: "TN68AB1234", date: "2026-07-12", fromLocation: "Trichy", toLocation: "Chennai", distanceKm: "330.00", fuelUsedLiters: "110.00", driverName: "Rajesh Kumar" },
        { id: "tr_v2_1", plateNumber: "TN68CD5678", date: "2026-06-28", fromLocation: "Chennai", toLocation: "Madurai", distanceKm: "460.00", fuelUsedLiters: "155.00", driverName: "Amit Singh" }
      ]);

      // Seed Notifications
      await db.insert(notifications).values([
        { id: "nt_1", title: "Insurance Expired", message: "Vehicle MH12GH3456 insurance expired on June 12, 2026. Please renew immediately.", date: "2026-07-17", type: "alert", read: false },
        { id: "nt_2", title: "Insurance Expiring Soon", message: "Vehicle TN68CD5678 insurance expires on July 25, 2026. Please renew.", date: "2026-07-17", type: "warning", read: false },
        { id: "nt_3", title: "Fitness Certificate Due", message: "Vehicle MH12GH3456 fitness certificate is due for renewal on September 18, 2026.", date: "2026-07-15", type: "info", read: false }
      ]);

      // Seed Reminders
      console.log("Seeding default reminders...");
      await db.insert(reminders).values([
        {
          id: "rem_1",
          title: "TN68AB1234 - Annual Insurance Renewal",
          category: "Insurance",
          plateNumber: "TN68AB1234",
          frequency: "Yearly",
          nextDueDate: "2026-08-15",
          notes: "Renew via Royal Sundaram Insurance. Expected cost: Rs 32,000",
          status: "Active"
        },
        {
          id: "rem_2",
          title: "TN68CD5678 - Fitness Certificate Renewal",
          category: "Fitness",
          plateNumber: "TN68CD5678",
          frequency: "Yearly",
          nextDueDate: "2026-12-05",
          notes: "Physical vehicle fitness inspection required at RTO",
          status: "Active"
        },
        {
          id: "rem_3",
          title: "TN68CD5678 - Pollution (PUC) check",
          category: "PUC",
          plateNumber: "TN68CD5678",
          frequency: "Every X Months",
          frequencyValue: 6,
          nextDueDate: "2026-08-20",
          notes: "Mandatory emission test at certified bunk",
          status: "Active"
        },
        {
          id: "rem_4",
          title: "TN68AB1234 - Odometer Lubrication Service",
          category: "Service",
          plateNumber: "TN68AB1234",
          frequency: "Every X Kilometers",
          frequencyValue: 10000,
          nextDueOdometer: 150000, // current is 145200
          notes: "Engine oil, filters, and grease service",
          status: "Active"
        },
        {
          id: "rem_5",
          title: "Driver Rajesh Kumar - Monthly Salary Payment",
          category: "Salary",
          driverId: "drv_1",
          frequency: "Monthly",
          nextDueDate: "2026-08-01",
          notes: "Basic salary payment: Rs 18,000",
          status: "Active"
        },
        {
          id: "rem_6",
          title: "Driver Rajesh Kumar - License Expiry",
          category: "License",
          driverId: "drv_1",
          frequency: "Every X Years",
          frequencyValue: 5,
          nextDueDate: "2029-10-15",
          notes: "Commercial license renewal",
          status: "Active"
        },
        {
          id: "rem_7",
          title: "MH12GH3456 - Tyres Rotation",
          category: "Tyres",
          plateNumber: "MH12GH3456",
          frequency: "Every X Kilometers",
          frequencyValue: 20000,
          nextDueOdometer: 72000, // current is 52000
          notes: "Rotate front and rear tyres to ensure even tread wear",
          status: "Active"
        }
      ]);

      console.log("Relational tables successfully seeded!");
    } else {
      console.log("Relational tables already seeded.");
    }

    // Ensure reminders are seeded even if vehicles exist (as reminders table is new)
    const reminderCountResult = await db.select({ count: sql`count(*)` }).from(reminders);
    const hasReminders = Number(reminderCountResult[0]?.count || 0) > 0;
    if (!hasReminders) {
      console.log("Seeding reminders separately as they are missing...");
      await db.insert(reminders).values([
        {
          id: "rem_1",
          title: "TN68AB1234 - Annual Insurance Renewal",
          category: "Insurance",
          plateNumber: "TN68AB1234",
          frequency: "Yearly",
          nextDueDate: "2026-08-15",
          notes: "Renew via Royal Sundaram Insurance. Expected cost: Rs 32,000",
          status: "Active"
        },
        {
          id: "rem_2",
          title: "TN68CD5678 - Fitness Certificate Renewal",
          category: "Fitness",
          plateNumber: "TN68CD5678",
          frequency: "Yearly",
          nextDueDate: "2026-12-05",
          notes: "Physical vehicle fitness inspection required at RTO",
          status: "Active"
        },
        {
          id: "rem_3",
          title: "TN68CD5678 - Pollution (PUC) check",
          category: "PUC",
          plateNumber: "TN68CD5678",
          frequency: "Every X Months",
          frequencyValue: 6,
          nextDueDate: "2026-08-20",
          notes: "Mandatory emission test at certified bunk",
          status: "Active"
        },
        {
          id: "rem_4",
          title: "TN68AB1234 - Odometer Lubrication Service",
          category: "Service",
          plateNumber: "TN68AB1234",
          frequency: "Every X Kilometers",
          frequencyValue: 10000,
          nextDueOdometer: 150000,
          notes: "Engine oil, filters, and grease service",
          status: "Active"
        },
        {
          id: "rem_5",
          title: "Driver Rajesh Kumar - Monthly Salary Payment",
          category: "Salary",
          driverId: "drv_1",
          frequency: "Monthly",
          nextDueDate: "2026-08-01",
          notes: "Basic salary payment: Rs 18,000",
          status: "Active"
        },
        {
          id: "rem_6",
          title: "Driver Rajesh Kumar - License Expiry",
          category: "License",
          driverId: "drv_1",
          frequency: "Every X Years",
          frequencyValue: 5,
          nextDueDate: "2029-10-15",
          notes: "Commercial license renewal",
          status: "Active"
        },
        {
          id: "rem_7",
          title: "MH12GH3456 - Tyres Rotation",
          category: "Tyres",
          plateNumber: "MH12GH3456",
          frequency: "Every X Kilometers",
          frequencyValue: 20000,
          nextDueOdometer: 72000,
          notes: "Rotate front and rear tyres to ensure even tread wear",
          status: "Active"
        }
      ]);
      console.log("Reminders seeded successfully!");
    }

    // 2. Seed Knowledge Base Embeddings for RAG
    const kbCountResult = await db.select({ count: sql`count(*)` }).from(kbEmbeddings);
    const hasKb = Number(kbCountResult[0]?.count || 0) > 0;

    if (!hasKb) {
      console.log("Seeding Knowledge Base with pgvector embeddings...");
      
      const kbChunks = [
        {
          text: "When should engine oil be changed? Engine oil should be changed every 10,000 to 15,000 kilometers, or every 6 months, whichever comes first. For heavy commercial vehicles like Ashok Leyland trucks, BharatBenz trucks, and Tata motors trailers, periodic engine oil replacement is critical to maintain fuel economy and prevent engine wear.",
          category: "maintenance"
        },
        {
          text: "How much money spent on tyres? In July 2026, ₹4,500 was spent on tyre puncture repairs and wheel alignment for vehicle TN68AB1234. Tyres are a major expense item; you should inspect alignment and pressure weekly to maximize tyre life.",
          category: "expenses"
        },
        {
          text: "General tyre replacement guidelines: Heavy-duty commercial truck tyres should be replaced or retreaded every 80,000 to 100,000 kilometers depending on payload and terrain. Premium radial tyres cost around ₹25,000 to ₹35,000 each.",
          category: "maintenance"
        },
        {
          text: "When should air and fuel filters be replaced? Air filters should be cleaned every 5,000 km and replaced every 20,000 km. Fuel filters should be replaced every 20,000 km or during major periodic lubrication services.",
          category: "maintenance"
        },
        {
          text: "What are the local fitness certificate (FC) regulations? Commercial vehicles in India must undergo physical inspection for Fitness Certificate (FC) renewal every year for vehicles older than 8 years, and once in two years for newer vehicles.",
          category: "compliance"
        },
        {
          text: "How much diesel was filled in July 2026? A total of 340 Liters of diesel was filled in July 2026 across the fleet, costing ₹30,600. Specifically, TN68AB1234 filled 180 Liters (₹16,200) on July 2, and 160 Liters (₹14,400) on July 14.",
          category: "fuel"
        }
      ];

      for (const chunk of kbChunks) {
        try {
          console.log(`Generating embedding for RAG chunk: "${chunk.text.substring(0, 40)}..."`);
          const embedRes = await ai.models.embedContent({
            model: "gemini-embedding-2-preview",
            contents: chunk.text
          });

          const embeddingVector = embedRes.embeddings?.[0]?.values;
          if (embeddingVector && embeddingVector.length === 768) {
            await db.insert(kbEmbeddings).values({
              text: chunk.text,
              category: chunk.category,
              embedding: embeddingVector
            });
          } else {
            console.warn("Invalid embedding output size or content: ", embeddingVector?.length);
          }
        } catch (err) {
          console.error("Failed to generate/insert embedding for chunk:", chunk.text, err);
        }
      }
      console.log("Knowledge Base vector embeddings seeded successfully!");
    } else {
      console.log("Knowledge Base embeddings already seeded.");
    }

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
