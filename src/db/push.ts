import { createPool } from "./index.ts";
import { seedDatabase } from "./seed.ts";
import * as dotenv from "dotenv";

dotenv.config();

async function initDatabase() {
  const pool = createPool();
  console.log("Connecting to PostgreSQL to sync schema and tables...");

  try {
    const client = await pool.connect();
    console.log("Successfully connected to PostgreSQL!");

    // Try creating vector extension if pgvector is available
    try {
      await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
      console.log("pgvector extension enabled or confirmed.");
    } catch (e: any) {
      console.warn("Notice: pgvector extension not installed in Postgres, using TEXT fallback for embeddings column.");
    }

    console.log("Creating database tables if they do not exist...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "drivers" (
        "id" VARCHAR(50) PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "phone" VARCHAR(30) NOT NULL,
        "license_number" VARCHAR(50) NOT NULL UNIQUE,
        "license_expiry" DATE NOT NULL,
        "assigned_vehicle_plate" VARCHAR(20),
        "joining_date" DATE NOT NULL DEFAULT '2026-03-15',
        "salary_type" VARCHAR(30) NOT NULL DEFAULT 'Monthly',
        "salary_rate" NUMERIC(12, 2) NOT NULL DEFAULT 18000.00,
        "advance" NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        "duty_status" VARCHAR(30) NOT NULL DEFAULT 'OffDuty',
        "attendance_status" VARCHAR(30) NOT NULL DEFAULT 'None'
      );

      CREATE TABLE IF NOT EXISTS "vehicles" (
        "plate_number" VARCHAR(20) PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "model" VARCHAR(100) NOT NULL,
        "manufacturer" VARCHAR(100) NOT NULL,
        "purchase_date" DATE NOT NULL,
        "engine_number" VARCHAR(50) NOT NULL UNIQUE,
        "chassis_number" VARCHAR(50) NOT NULL UNIQUE,
        "insurance_no" VARCHAR(50),
        "insurance_expiry" DATE NOT NULL,
        "insurance_provider" VARCHAR(100),
        "insurance_amount" NUMERIC(12, 2),
        "fitness_no" VARCHAR(50),
        "fitness_expiry" DATE NOT NULL,
        "permit_no" VARCHAR(50),
        "permit_expiry" DATE,
        "permit_type" VARCHAR(50),
        "road_tax_receipt_no" VARCHAR(50),
        "road_tax_expiry" DATE,
        "road_tax_amount" NUMERIC(12, 2),
        "puc_no" VARCHAR(50),
        "puc_expiry" DATE,
        "fastag_id" VARCHAR(50),
        "fastag_balance" NUMERIC(12, 2) DEFAULT 0.00,
        "current_odometer" INTEGER NOT NULL DEFAULT 0,
        "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
        "assigned_driver_id" VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS "vehicle_documents" (
        "id" VARCHAR(50) PRIMARY KEY,
        "plate_number" VARCHAR(20) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "type" VARCHAR(30) NOT NULL,
        "uploaded_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "url" TEXT
      );

      CREATE TABLE IF NOT EXISTS "vehicle_expenses" (
        "id" VARCHAR(50) PRIMARY KEY,
        "plate_number" VARCHAR(20) NOT NULL,
        "date" DATE NOT NULL,
        "category" VARCHAR(30) NOT NULL,
        "amount" NUMERIC(12, 2) NOT NULL,
        "description" TEXT NOT NULL,
        "receipt_name" VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS "service_history" (
        "id" VARCHAR(50) PRIMARY KEY,
        "plate_number" VARCHAR(20) NOT NULL,
        "date" DATE NOT NULL,
        "type" VARCHAR(100) NOT NULL,
        "provider" VARCHAR(150) NOT NULL,
        "cost" NUMERIC(12, 2) NOT NULL,
        "odometer" INTEGER NOT NULL,
        "details" TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "trip_history" (
        "id" VARCHAR(50) PRIMARY KEY,
        "plate_number" VARCHAR(20) NOT NULL,
        "date" DATE NOT NULL,
        "from_location" VARCHAR(100) NOT NULL,
        "to_location" VARCHAR(100) NOT NULL,
        "distance_km" NUMERIC(8, 2) NOT NULL,
        "fuel_used_liters" NUMERIC(8, 2) NOT NULL,
        "driver_name" VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "fuel_logs" (
        "id" VARCHAR(50) PRIMARY KEY,
        "plate_number" VARCHAR(20) NOT NULL,
        "date" DATE NOT NULL,
        "liters" NUMERIC(8, 2) NOT NULL,
        "amount" NUMERIC(12, 2) NOT NULL,
        "driver_name" VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" VARCHAR(50) PRIMARY KEY,
        "title" VARCHAR(150) NOT NULL,
        "message" TEXT NOT NULL,
        "date" DATE NOT NULL,
        "type" VARCHAR(20) NOT NULL DEFAULT 'info',
        "read" BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS "reminders" (
        "id" VARCHAR(50) PRIMARY KEY,
        "title" VARCHAR(150) NOT NULL,
        "category" VARCHAR(50) NOT NULL,
        "plate_number" VARCHAR(20),
        "driver_id" VARCHAR(50),
        "frequency" VARCHAR(50) NOT NULL,
        "frequency_value" INTEGER,
        "next_due_date" DATE,
        "next_due_odometer" INTEGER,
        "last_triggered_date" DATE,
        "last_triggered_odometer" INTEGER,
        "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
        "notes" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "driver_attendance" (
        "id" VARCHAR(50) PRIMARY KEY,
        "driver_id" VARCHAR(50) NOT NULL,
        "date" DATE NOT NULL,
        "status" VARCHAR(20) NOT NULL,
        "start_duty" VARCHAR(10),
        "end_duty" VARCHAR(10)
      );

      CREATE TABLE IF NOT EXISTS "driver_advances" (
        "id" VARCHAR(50) PRIMARY KEY,
        "driver_id" VARCHAR(50) NOT NULL,
        "date" DATE NOT NULL,
        "amount" NUMERIC(12, 2) NOT NULL,
        "description" TEXT NOT NULL,
        "type" VARCHAR(20) NOT NULL
      );
    `);

    // Create kb_embeddings table carefully checking vector extension support
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS "kb_embeddings" (
          "id" SERIAL PRIMARY KEY,
          "text" TEXT NOT NULL,
          "category" VARCHAR(50) NOT NULL DEFAULT 'general',
          "embedding" vector(768) NOT NULL
        );
      `);
    } catch (vectorErr) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS "kb_embeddings" (
          "id" SERIAL PRIMARY KEY,
          "text" TEXT NOT NULL,
          "category" VARCHAR(50) NOT NULL DEFAULT 'general',
          "embedding" TEXT NOT NULL
        );
      `);
    }

    client.release();
    console.log("✓ All 12 tables created successfully in PostgreSQL!");

    console.log("Seeding initial data...");
    await seedDatabase();
    console.log("✓ Database setup and seeding completed successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("Database table creation error:", error?.message || error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
