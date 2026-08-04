export type Language = 'en';

export const translations = {
  en: {
    // Header & Nav
    appName: "AI Fleet & Driver Assistant",
    language: "Language",
    english: "English",
    home: "Home",
    assistant: "Ask AI",
    fleet: "Fleet",
    drivers: "Drivers",
    vault: "Document Vault",
    reminders: "Reminders",
    reports: "Reports",
    settings: "Settings",
    
    // Configuration & Settings
    instanceConfig: "Instance & AI Configuration",
    instanceConfigSub: "Configure your Client Instance ID and multi-provider AI engine (Gemini, OpenAI, Claude, or Custom Endpoint).",
    clientIdLabel: "Client Instance ID",
    clientIdHelp: "Data is securely saved and isolated under this Instance ID.",
    aiProviderLabel: "AI Provider",
    apiKeyLabel: "API Key",
    apiKeyPlaceholder: "Paste your API key here (or leave blank for server default)",
    modelNameLabel: "Model Name",
    baseUrlLabel: "Base URL (Optional)",
    baseUrlPlaceholder: "e.g., https://api.openai.com/v1 or custom proxy",
    testConnection: "Test AI Connection",
    testing: "Testing...",
    saveConfig: "Save Configuration",
    configSavedSuccess: "Configuration saved successfully!",
    connectionSuccess: "AI Connection Successful!",
    connectionFailed: "AI Connection Failed: ",
    dataPersistenceNote: "Mobile App Offline Persistence: Enabled. All changes are stored locally on your device under this Instance ID.",
    resetInstanceData: "Reset Instance Local Data",
    resetDataWarning: "Are you sure you want to reset local data for this Instance ID?",

    // Home Banner & Stats
    fleetHealthy: "Your Fleet Status",
    fleetAttentionNeeded: "Fleet Attention Needed",
    dieselFilled: "Diesel Filled",
    fuelCost: "Fuel Cost",
    repairsTolls: "Repairs & Tolls",
    activeVehicles: "Active Vehicles",
    activeDrivers: "Active Drivers",
    pendingReminders: "Pending Reminders",
    julyTotal: "Total Cost",
    loggedItems: "Logged Items",
    
    // Quick Actions
    quickActions: "Quick Actions",
    askAi: "Ask AI",
    addVehicle: "Add Vehicle",
    addDriver: "Add Driver",
    uploadDoc: "Upload Document",
    viewReports: "View Reports",
    configureAi: "Configure AI & Instance",
    
    // Fleet / Vehicles
    vehicleManagement: "Vehicle Management",
    searchVehicles: "Search vehicles by plate or model...",
    registerNewVehicle: "Register New Vehicle",
    plateNumber: "Plate Number",
    model: "Model",
    assignedDriver: "Assigned Driver",
    status: "Status",
    odometer: "Odometer",
    insuranceExpiry: "Insurance Expiry",
    fitnessExpiry: "Fitness Expiry",
    actions: "Actions",
    viewDetails: "View Details",
    active: "Active",
    maintenance: "Maintenance",
    inactive: "Inactive",
    
    // Drivers
    driverManagement: "Driver Management",
    searchDrivers: "Search drivers by name or phone...",
    registerNewDriver: "Register New Driver",
    phone: "Phone",
    licenseNumber: "License Number",
    joiningDate: "Joining Date",
    attendance: "Attendance",
    salary: "Salary",
    advanceHistory: "Advance History",
    markAttendance: "Mark Attendance",
    present: "Present",
    absent: "Absent",
    leave: "Leave",
    giveAdvance: "Give Advance",
    
    // Vault
    documentVault: "Cloud Document Vault",
    uploadDocument: "Upload Document / Invoice",
    allDocuments: "All Documents",
    insurancePdfs: "Insurance PDFs",
    fuelBills: "Fuel Bills",
    serviceBills: "Service Bills",
    
    // Reminders
    reminderSchedule: "Automated Renewal & Expense Schedule",
    addNewReminder: "Add New Reminder",
    title: "Title",
    category: "Category",
    dueDate: "Due Date",
    frequency: "Frequency",
    
    // Reports
    reportsAnalytics: "Fleet Performance & Cost Analytics",
    totalFuelExpense: "Total Fuel Expense",
    totalMaintenanceExpense: "Total Maintenance",
    costPerKm: "Cost / km",
    
    // Assistant Chat
    typeMessage: "Ask anything in natural language about your fleet...",
    send: "Send",
    clearChat: "Clear Chat",
    aiConnecting: "Connecting to AI...",
    aiError: "Error connecting to AI.",

    // Common
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    delete: "Delete",
    edit: "Edit",
    submit: "Submit",
    loading: "Loading...",
  }
};


