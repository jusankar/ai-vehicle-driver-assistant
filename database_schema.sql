-- Relational Database Schema for AI Vehicle & Driver Assistant
-- Designed for PostgreSQL / Google Cloud SQL with Foreign Key integrity

-- 1. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS drivers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    assigned_vehicle_plate VARCHAR(20)
);

-- 2. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    plate_number VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    purchase_date DATE NOT NULL,
    engine_number VARCHAR(50) UNIQUE NOT NULL,
    chassis_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Expiry Dates & Certificate Numbers
    insurance_no VARCHAR(50),
    insurance_expiry DATE NOT NULL,
    insurance_provider VARCHAR(100),
    insurance_amount NUMERIC(12, 2),
    
    fitness_no VARCHAR(50),
    fitness_expiry DATE NOT NULL,
    
    permit_no VARCHAR(50),
    permit_expiry DATE,
    permit_type VARCHAR(50), -- 'National', 'State', etc.
    
    road_tax_receipt_no VARCHAR(50),
    road_tax_expiry DATE,
    road_tax_amount NUMERIC(12, 2),
    
    puc_no VARCHAR(50),
    puc_expiry DATE,
    
    fastag_id VARCHAR(50),
    fastag_balance NUMERIC(12, 2) DEFAULT 0.00,
    
    current_odometer INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Maintenance', 'Inactive')),
    assigned_driver_id VARCHAR(50) REFERENCES drivers(id) ON DELETE SET NULL
);

-- Complete circular foreign key from drivers back to vehicles table
ALTER TABLE drivers 
ADD CONSTRAINT fk_assigned_vehicle 
FOREIGN KEY (assigned_vehicle_plate) REFERENCES vehicles(plate_number) ON DELETE SET NULL;

-- 3. VEHICLE DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS vehicle_documents (
    id VARCHAR(50) PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL REFERENCES vehicles(plate_number) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('Insurance', 'Fitness', 'Permit', 'Road Tax', 'PUC', 'Fuel', 'Service', 'Trip', 'FASTag', 'Other')),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    url TEXT
);

-- 4. VEHICLE EXPENSES TABLE
CREATE TABLE IF NOT EXISTS vehicle_expenses (
    id VARCHAR(50) PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL REFERENCES vehicles(plate_number) ON DELETE CASCADE,
    date DATE NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('Fuel', 'Maintenance', 'Repairs', 'Tolls', 'Taxes', 'Permit', 'Insurance', 'Fines', 'Other')),
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    receipt_name VARCHAR(255)
);

-- 5. SERVICE HISTORY TABLE
CREATE TABLE IF NOT EXISTS service_history (
    id VARCHAR(50) PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL REFERENCES vehicles(plate_number) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g. 'Periodic Maintenance', 'Engine Repair'
    provider VARCHAR(150) NOT NULL,
    cost NUMERIC(12, 2) NOT NULL,
    odometer INT NOT NULL,
    details TEXT NOT NULL
);

-- 6. TRIP HISTORY TABLE
CREATE TABLE IF NOT EXISTS trip_history (
    id VARCHAR(50) PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL REFERENCES vehicles(plate_number) ON DELETE CASCADE,
    date DATE NOT NULL,
    from_location VARCHAR(100) NOT NULL,
    to_location VARCHAR(100) NOT NULL,
    distance_km NUMERIC(8, 2) NOT NULL,
    fuel_used_liters NUMERIC(8, 2) NOT NULL,
    driver_name VARCHAR(100) NOT NULL
);

-- 7. GLOBAL FUEL LOGS (For Quick Aggregate Reports)
CREATE TABLE IF NOT EXISTS fuel_logs (
    id VARCHAR(50) PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL REFERENCES vehicles(plate_number) ON DELETE CASCADE,
    date DATE NOT NULL,
    liters NUMERIC(8, 2) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    driver_name VARCHAR(100) NOT NULL
);

-- 8. SYSTEM ALERTS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'alert')),
    read BOOLEAN NOT NULL DEFAULT FALSE
);

-- CREATE INDEXES FOR CRITICAL FLOATING METRICS & LOOKUPS
CREATE INDEX idx_vehicle_expenses_plate ON vehicle_expenses(plate_number);
CREATE INDEX idx_service_history_plate ON service_history(plate_number);
CREATE INDEX idx_trip_history_plate ON trip_history(plate_number);
CREATE INDEX idx_fuel_logs_plate ON fuel_logs(plate_number);
CREATE INDEX idx_vehicle_documents_plate ON vehicle_documents(plate_number);
