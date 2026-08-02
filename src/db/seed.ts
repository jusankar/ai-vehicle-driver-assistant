import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

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
  apiKey: process.env.GEMINI_API_KEY || "DUMMY_KEY",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Seed Initial Data - No dummy seed data per user request
export async function seedDatabase() {
  try {
    console.log("Database initialized in clean mode. Ready for new data feed.");
  } catch (error: any) {
    console.error("Database seed check failed:", error?.message || error);
  }
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase().then(() => {
    console.log("Seeding process completed.");
    process.exit(0);
  }).catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });
}
