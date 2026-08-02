export type Language = 'en' | 'ta';

export const translations = {
  en: {
    // Header & Nav
    appName: "AI Fleet & Driver Assistant",
    language: "Language",
    english: "English",
    tamil: "தமிழ்",
    home: "Home",
    assistant: "AI Assistant",
    fleet: "Fleet",
    drivers: "Drivers",
    vault: "Document Vault",
    reminders: "Reminders",
    reports: "Reports",
    
    // Home Banner & Stats
    fleetHealthy: "Your Fleet Status",
    fleetAttentionNeeded: "Fleet Attention Needed",
    dieselFilled: "Diesel Filled",
    fuelCost: "Fuel Cost",
    repairsTolls: "Repairs & Tolls",
    activeVehicles: "Active Vehicles",
    activeDrivers: "Active Drivers",
    pendingReminders: "Pending Reminders",
    julyTotal: "July Total",
    loggedItems: "Logged Items",
    
    // Quick Actions
    quickActions: "Quick Actions",
    askAi: "Ask AI Assistant",
    addVehicle: "Add Vehicle",
    addDriver: "Add Driver",
    uploadDoc: "Upload Document",
    viewReports: "View Reports",
    
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
    
    // Common
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    delete: "Delete",
    edit: "Edit",
    submit: "Submit",
    loading: "Loading...",
  },
  ta: {
    // Header & Nav
    appName: "AI வாகனம் & ஓட்டுநர் உதவி",
    language: "மொழி",
    english: "English",
    tamil: "தமிழ்",
    home: "முகப்பு",
    assistant: "AI உதவியாளர்",
    fleet: "வாகனங்கள்",
    drivers: "ஓட்டுநர்கள்",
    vault: "ஆவணப் பெட்டகம்",
    reminders: "நினைவூட்டல்கள்",
    reports: "அறிக்கைகள்",
    
    // Home Banner & Stats
    fleetHealthy: "உங்கள் வாகனப் படை நிலை",
    fleetAttentionNeeded: "வாகன கவனக் குறிப்பு",
    dieselFilled: "டீசல் நிரப்பப்பட்டது",
    fuelCost: "எரிபொருள் செலவு",
    repairsTolls: "பராமரிப்பு & டோல் செலவு",
    activeVehicles: "செயலில் உள்ள வாகனங்கள்",
    activeDrivers: "செயலில் உள்ள ஓட்டுநர்கள்",
    pendingReminders: "நிலுவையில் உள்ள நினைவூட்டல்கள்",
    julyTotal: "ஜூலை மொத்தம்",
    loggedItems: "பதிவு செய்யப்பட்டவை",
    
    // Quick Actions
    quickActions: "விரைவுச் செயல்கள்",
    askAi: "AI உதவியாளரிடம் கேட்க",
    addVehicle: "வாகனம் சேர்க்க",
    addDriver: "ஓட்டுநர் சேர்க்க",
    uploadDoc: "ஆவணம் பதிவேற்ற",
    viewReports: "அறிக்கைகளைப் பார்க்க",
    
    // Fleet / Vehicles
    vehicleManagement: "வாகன மேலாண்மை",
    searchVehicles: "எண் அல்லது மாடலைத் தேடுக...",
    registerNewVehicle: "புதிய வாகனம் பதிவு செய்",
    plateNumber: "வாகன எண்",
    model: "மாடல்",
    assignedDriver: "ஒதுக்கப்பட்ட ஓட்டுநர்",
    status: "நிலை",
    odometer: "ஓடோமீட்டர்",
    insuranceExpiry: "இன்சூரன்ஸ் முடிவு",
    fitnessExpiry: "எஃப்.சி (FC) முடிவு",
    actions: "செயல்கள்",
    viewDetails: "விவரங்களைப் பார்க்க",
    active: "செயலில்",
    maintenance: "பராமரிப்பில்",
    inactive: "செயலிழந்து",
    
    // Drivers
    driverManagement: "ஓட்டுநர் மேலாண்மை",
    searchDrivers: "பெயர் அல்லது போன் எண்ணைத் தேடுக...",
    registerNewDriver: "புதிய ஓட்டுநர் பதிவு செய்",
    phone: "தொலைபேசி",
    licenseNumber: "லைசென்ஸ் எண்",
    joiningDate: "சேர்ந்த தேதி",
    attendance: "வருகைப் பதிவு",
    salary: "சம்பளம்",
    advanceHistory: "முன்பணம் வரலாறு",
    markAttendance: "வருகை பதிவு செய்",
    present: "வந்துள்ளார்",
    absent: "வரவில்லை",
    leave: "விடுப்பு",
    giveAdvance: "முன்பணம் வழங்கு",
    
    // Vault
    documentVault: "மேகக்கணி ஆவணப் பெட்டகம்",
    uploadDocument: "ஆவணம் / பில் பதிவேற்ற",
    allDocuments: "அனைத்து ஆவணங்கள்",
    insurancePdfs: "இன்சூரன்ஸ் ஆவணங்கள்",
    fuelBills: "டீசல் பில்கள்",
    serviceBills: "சர்வீஸ் பில்கள்",
    
    // Reminders
    reminderSchedule: "புதுப்பித்தல் & செலவு நினைவூட்டல்",
    addNewReminder: "புதிய நினைவூட்டல் சேர்க்க",
    title: "தலைப்பு",
    category: "வகை",
    dueDate: "கடைசி தேதி",
    frequency: "அதிர்வெண்",
    
    // Reports
    reportsAnalytics: "வாகன திறன் & செலவு பகுப்பாய்வு",
    totalFuelExpense: "மொத்த டீசல் செலவு",
    totalMaintenanceExpense: "மொத்த பராமரிப்பு",
    costPerKm: "கிமீ செலவு",
    
    // Common
    save: "சேமி",
    cancel: "ரத்து செய்",
    close: "மூடு",
    delete: "நீக்கு",
    edit: "திருத்து",
    submit: "சமர்ப்பி",
    loading: "ஏற்றுகிறது...",
  }
};
