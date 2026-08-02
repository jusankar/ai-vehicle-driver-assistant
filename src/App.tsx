import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Upload, 
  Bell, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  LogOut, 
  RefreshCw, 
  Folder, 
  FileCode, 
  Copy, 
  Check, 
  FileText, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  User, 
  Truck, 
  FileSpreadsheet, 
  HelpCircle,
  X,
  Volume2,
  Trash2,
  Plus,
  Search,
  Calendar,
  Wallet,
  Activity,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  CloudUpload,
  HardDriveDownload,
  Database
} from "lucide-react";
import { FleetDatabase, ChatMessage, Vehicle, Driver, FuelLog, ExpenseLog, NotificationItem } from "./types";
import { flutterProjectFiles, FlutterFile } from "./flutterCode";
import ReportsView from "./components/ReportsView";
import { 
  uploadCloudDocument, 
  submitExpenseLog, 
  confirmDocumentData, 
  autoSyncPendingQueue, 
  setSimulatedOfflineMode, 
  getIsOffline 
} from "./services/apiService";
import { 
  getPendingItems, 
  clearPendingQueue, 
  PendingSyncItem 
} from "./services/offlineSync";

// Browser SpeechRecognition definition
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}
const windowWithSpeech = window as unknown as IWindow;

export default function App() {
  // Mobile Simulator State
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'fleet' | 'drivers' | 'vault' | 'reminders' | 'reports'>('home');
  const [fleet, setFleet] = useState<FleetDatabase | null>(null);

  // Material 3 Theme Toggle State (Light Day / High-Contrast Dark Night Mode for Fleet Management)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("fleet_theme") === "dark";
  });

  // Service Worker Offline Sync & Pending Storage State
  const [isOffline, setIsOfflineState] = useState<boolean>(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingSyncItems, setPendingSyncItems] = useState<PendingSyncItem[]>([]);
  const [isSyncingQueue, setIsSyncingQueue] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [syncProgressMsg, setSyncProgressMsg] = useState<string>("");

  const refreshPendingQueue = async () => {
    try {
      const items = await getPendingItems();
      setPendingSyncItems(items);
    } catch (err) {
      console.error("Failed to load pending sync queue", err);
    }
  };

  const handleToggleSimulatedOffline = (offline: boolean) => {
    setIsSimulatedOffline(offline);
    setSimulatedOfflineMode(offline);
    setIsOfflineState(offline || (typeof navigator !== 'undefined' ? !navigator.onLine : false));
    if (offline) {
      triggerToast("⚡ Offline Simulation Enabled! Document uploads & expense submissions will queue in Service Worker.");
    } else {
      triggerToast("🌐 Online Mode Restored! Triggering automatic Service Worker sync...");
      handleManualSync();
    }
  };

  const handleManualSync = async () => {
    setIsSyncingQueue(true);
    setSyncProgressMsg("Processing cached IndexedDB queue via Service Worker...");
    try {
      const result = await autoSyncPendingQueue((msg) => setSyncProgressMsg(msg));
      if (result.syncedCount > 0) {
        if (result.updatedDatabase) {
          setFleet(result.updatedDatabase);
        } else {
          await fetchFleetDatabase();
        }
        triggerToast(`🎉 Successfully synchronized ${result.syncedCount} queued document uploads and expense log submissions!`);
      } else if (result.failedCount > 0) {
        triggerToast(`⚠️ Sync attempt complete: ${result.failedCount} items waiting for server connection.`);
      } else {
        triggerToast("✅ All offline items are fully synchronized with PostgreSQL server!");
      }
      await refreshPendingQueue();
    } catch (err) {
      console.error("Error during manual sync", err);
      triggerToast("❌ Connection error while synchronizing queue.");
    } finally {
      setIsSyncingQueue(false);
      setSyncProgressMsg("");
    }
  };

  const handleClearQueue = async () => {
    if (!window.confirm("Are you sure you want to clear the pending offline sync queue?")) return;
    await clearPendingQueue();
    await refreshPendingQueue();
    triggerToast("🗑️ Offline sync queue cleared.");
  };

  useEffect(() => {
    refreshPendingQueue();

    const handleOnlineStatus = async () => {
      const offlineNow = getIsOffline();
      setIsOfflineState(offlineNow);
      if (!offlineNow) {
        triggerToast("🌐 Connection restored! Auto-synchronizing Service Worker queue...");
        setIsSyncingQueue(true);
        const result = await autoSyncPendingQueue();
        if (result.syncedCount > 0) {
          if (result.updatedDatabase) {
            setFleet(result.updatedDatabase);
          } else {
            fetchFleetDatabase();
          }
          triggerToast(`🚀 Auto-synchronized ${result.syncedCount} offline uploads & expenses!`);
        }
        setIsSyncingQueue(false);
        refreshPendingQueue();
      }
    };

    const handleOfflineStatus = () => {
      setIsOfflineState(true);
      triggerToast("⚡ Device is now OFFLINE. Submissions will cache in Service Worker IndexedDB!");
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_ONLINE_SYNC_REQUEST') {
          handleOnlineStatus();
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fleet_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fleet_theme", "light");
    }
  }, [isDarkMode]);

  // Centralized Reminder Engine States
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [searchReminderQuery, setSearchReminderQuery] = useState("");
  const [filterReminderStatus, setFilterReminderStatus] = useState<string>("All");
  const [filterReminderCategory, setFilterReminderCategory] = useState<string>("All");
  const [isRunningScheduler, setIsRunningScheduler] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    title: "",
    category: "Insurance" as 'Insurance' | 'Fitness' | 'Permit' | 'Road Tax' | 'PUC' | 'Service' | 'Tyres' | 'Battery' | 'License' | 'Salary',
    plateNumber: "",
    driverId: "",
    frequency: "Monthly" as 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Yearly' | 'Every X Days' | 'Every X Months' | 'Every X Years' | 'Every X Kilometers',
    frequencyValue: "1",
    nextDueDate: new Date().toISOString().split('T')[0],
    nextDueOdometer: "",
    notes: ""
  });

  // Centralized Cloud Vault States
  const [docUploadType, setDocUploadType] = useState<'Insurance PDF' | 'Fuel Bills' | 'Service Bills' | 'Tyre Bills' | 'Battery Bills' | 'RC' | 'Fitness Certificate' | 'Driving License' | 'Salary Receipt'>('Insurance PDF');
  const [docUploadSource, setDocUploadSource] = useState<'Camera' | 'Gallery' | 'PDF'>('PDF');
  const [docNotes, setDocNotes] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [simulatedCameraStream, setSimulatedCameraStream] = useState(false);
  const [selectedCloudDoc, setSelectedCloudDoc] = useState<any | null>(null);
  
  // Driver Management State
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [showDriverRegisterModal, setShowDriverRegisterModal] = useState(false);
  const [searchDriverQuery, setSearchDriverQuery] = useState("");
  const [driverDetailSubTab, setDriverDetailSubTab] = useState<'attendance' | 'salary' | 'advance' | 'docs'>('attendance');
  const [driverRegisterForm, setDriverRegisterForm] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    licenseExpiry: "2029-12-31",
    assignedVehiclePlate: "",
    joiningDate: new Date().toISOString().split('T')[0],
    salaryType: 'Monthly' as 'Monthly' | 'Daily' | 'PerTrip',
    salaryRate: "18000"
  });

  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({
    amount: "",
    description: "",
    type: 'advance' as 'advance' | 'repayment'
  });

  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    salaryType: 'Monthly' as 'Monthly' | 'Daily' | 'PerTrip',
    salaryRate: ""
  });

  const [showDriverDocModal, setShowDriverDocModal] = useState(false);
  const [driverDocForm, setDriverDocForm] = useState({
    name: "",
    type: 'License' as 'License' | 'Aadhaar' | 'Medical' | 'Other'
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Welcome to your AI Vehicle & Driver Assistant! 🚚\n\nAsk me any question in natural language about your fleet, drivers, diesel fills, or July expenses. \n\n*Try asking: 'How much diesel did I fill this month?' or 'What is the insurance expiry date for TN68CD5678?'*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [recentChats, setRecentChats] = useState<string[]>([
    "July diesel consumption query",
    "Insurance expiration schedule",
    "Driver assigned to TN68AB1234"
  ]);

  // Voice Speech State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Document Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");
  const [parsedDocResult, setParsedDocResult] = useState<any | null>(null);

  // Low confidence document review & verification form
  const [lowConfidenceDoc, setLowConfidenceDoc] = useState<{
    fileName: string;
    extracted: any;
    confidenceScore: number;
  } | null>(null);

  const [verificationForm, setVerificationForm] = useState({
    documentType: "OTHER",
    plateNumber: "TN68AB1234",
    date: "2026-07-17",
    vendor: "",
    amount: 0,
    gst: "",
    invoiceNumber: "",
    fuelQuantity: 0,
    serviceDetails: "",
    insuranceDetails: "",
    expiryDate: "",
    driverName: ""
  });

  // Developer Sidebar State
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(flutterProjectFiles[0]);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isFlutterSidebarOpen, setIsFlutterSidebarOpen] = useState(true);

  // Filter & Search states inside App (Simulator helper)
  const [showNotifications, setShowNotifications] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Vehicle Management State
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchVehicleQuery, setSearchVehicleQuery] = useState("");
  const [detailSubTab, setDetailSubTab] = useState<'docs' | 'expenses' | 'service' | 'trips'>('docs');
  const [registerForm, setRegisterForm] = useState({
    plateNumber: "",
    name: "",
    model: "",
    manufacturer: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    engineNumber: "",
    chassisNumber: "",
    currentOdometer: "15000",
    assignedDriverId: "",
    fastagId: "",
    fastagBalance: "1500",
    insuranceExpiry: "2027-07-17",
    fitnessExpiry: "2028-07-17"
  });

  // Load Initial Database State
  useEffect(() => {
    fetchFleetDatabase();
    initSpeechRecognition();
  }, []);

  const handleRegisterVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...registerForm,
          currentOdometer: Number(registerForm.currentOdometer),
          fastagBalance: Number(registerForm.fastagBalance)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.database);
        setShowRegisterModal(false);
        triggerToast(`🎉 Registered Vehicle ${registerForm.plateNumber.toUpperCase()} successfully!`);
        // Reset form
        setRegisterForm({
          plateNumber: "",
          name: "",
          model: "",
          manufacturer: "",
          purchaseDate: new Date().toISOString().split('T')[0],
          engineNumber: "",
          chassisNumber: "",
          currentOdometer: "15000",
          assignedDriverId: "",
          fastagId: "",
          fastagBalance: "1500",
          insuranceExpiry: "2027-07-17",
          fitnessExpiry: "2028-07-17"
        });
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to register vehicle");
      }
    } catch (err) {
      console.error("Register vehicle error", err);
      alert("Connection error while registering vehicle");
    }
  };

  const fetchFleetDatabase = async () => {
    try {
      const res = await fetch("/api/fleet");
      if (res.ok) {
        const data = await res.json();
        setFleet(data);
      }
    } catch (err) {
      console.error("Failed to fetch fleet database", err);
    }
  };

  const resetDatabase = async () => {
    try {
      const res = await fetch("/api/fleet/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.database);
        triggerToast("Database successfully restored to original seed!");
      }
    } catch (err) {
      console.error("Failed to reset database", err);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reminderForm,
          frequencyValue: reminderForm.frequencyValue ? Number(reminderForm.frequencyValue) : undefined,
          nextDueOdometer: reminderForm.nextDueOdometer ? Number(reminderForm.nextDueOdometer) : undefined,
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.currentDatabase);
        setShowReminderModal(false);
        triggerToast(`🎉 Scheduled Reminder "${reminderForm.title}" successfully!`);
        // Reset Form
        setReminderForm({
          title: "",
          category: "Insurance",
          plateNumber: "",
          driverId: "",
          frequency: "Monthly",
          frequencyValue: "1",
          nextDueDate: new Date().toISOString().split('T')[0],
          nextDueOdometer: "",
          notes: ""
        });
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to create reminder");
      }
    } catch (err) {
      console.error("Failed to create reminder", err);
      alert("Connection error while creating reminder");
    }
  };

  const handleUpdateReminderStatus = async (id: string, status: 'Active' | 'Snoozed' | 'Completed' | 'Dismissed') => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.currentDatabase);
        triggerToast(`Reminder status updated to "${status}"`);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Failed to update reminder status", err);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.currentDatabase);
        triggerToast("🗑️ Reminder deleted successfully");
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete reminder");
      }
    } catch (err) {
      console.error("Failed to delete reminder", err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/clear", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.database);
        triggerToast("Notifications cleared!");
      }
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  const handleDismissNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.database);
      }
    } catch (err) {
      console.error("Failed to dismiss notification", err);
    }
  };

  const handleRunScheduler = async () => {
    setIsRunningScheduler(true);
    try {
      const res = await fetch("/api/scheduler/run", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.currentDatabase);
        const { triggeredCount } = data.result;
        if (triggeredCount > 0) {
          triggerToast(`🔔 Scheduler run complete! Triggered ${triggeredCount} reminders!`);
        } else {
          triggerToast("✅ Scheduler run complete! No reminders are currently due.");
        }
      } else {
        triggerToast("❌ Failed to run scheduler evaluation");
      }
    } catch (err) {
      console.error("Failed to run scheduler check", err);
      triggerToast("❌ Connection error during scheduler check");
    } finally {
      setIsRunningScheduler(false);
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...driverRegisterForm,
          salaryRate: Number(driverRegisterForm.salaryRate)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.database);
        setShowDriverRegisterModal(false);
        triggerToast(`🎉 Registered Driver ${driverRegisterForm.name} successfully!`);
        // Reset form
        setDriverRegisterForm({
          name: "",
          phone: "",
          licenseNumber: "",
          licenseExpiry: "2029-12-31",
          assignedVehiclePlate: "",
          joiningDate: new Date().toISOString().split('T')[0],
          salaryType: 'Monthly',
          salaryRate: "18000"
        });
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to register driver");
      }
    } catch (err) {
      console.error("Register driver error", err);
      alert("Connection error while registering driver");
    }
  };

  const handleUpdateAttendance = async (driverId: string, status: 'Present' | 'Leave' | 'Absent') => {
    try {
      const res = await fetch(`/api/drivers/${driverId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_attendance",
          status
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.database);
        triggerToast(`Attendance marked as ${status}`);
      }
    } catch (err) {
      console.error("Attendance update error", err);
    }
  };

  const handleToggleDuty = async (driverId: string, currentDuty: 'OnDuty' | 'OffDuty') => {
    const action = currentDuty === 'OnDuty' ? 'end_duty' : 'start_duty';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    try {
      const res = await fetch(`/api/drivers/${driverId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          time: nowTime
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.database);
        triggerToast(action === 'start_duty' ? "Duty started!" : "Duty ended!");
      }
    } catch (err) {
      console.error("Duty status change error", err);
    }
  };

  const handleUpdateAdvance = async (e: React.FormEvent, driverId: string) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/drivers/${driverId}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(advanceForm.amount),
          description: advanceForm.description,
          type: advanceForm.type
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.database);
        setShowAdvanceModal(false);
        triggerToast(`Successfully processed ${advanceForm.type === 'advance' ? 'advance' : 'repayment'}!`);
        setAdvanceForm({ amount: "", description: "", type: "advance" });
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to process advance");
      }
    } catch (err) {
      console.error("Advance error", err);
    }
  };

  const handleUpdateSalary = async (e: React.FormEvent, driverId: string) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/drivers/${driverId}/salary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salaryType: salaryForm.salaryType,
          salaryRate: Number(salaryForm.salaryRate)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.database);
        setShowSalaryModal(false);
        triggerToast("Salary structure updated successfully!");
        setSalaryForm({ salaryType: "Monthly", salaryRate: "" });
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update salary");
      }
    } catch (err) {
      console.error("Salary update error", err);
    }
  };

  const handleUploadDriverDoc = async (e: React.FormEvent, driverId: string) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/drivers/${driverId}/document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: driverDocForm.name,
          type: driverDocForm.type
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.database);
        setShowDriverDocModal(false);
        triggerToast("Driver document uploaded successfully!");
        setDriverDocForm({ name: "", type: "License" });
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to add document");
      }
    } catch (err) {
      console.error("Document upload error", err);
    }
  };

  const handleCloudDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    setUploadProgressMsg("Initializing Service Worker & checking connectivity status...");
    await new Promise(r => setTimeout(r, 400));
    setUploadProgressMsg("Transmitting payload to Cloud Vault / Service Worker cache...");
    await new Promise(r => setTimeout(r, 500));

    try {
      const cleanType = docUploadType.toLowerCase().replace(/\s+/g, '_');
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const extension = docUploadSource === 'PDF' ? 'pdf' : 'jpg';
      const fileName = `${cleanType}_${randomId}.${extension}`;
      const mockSize = docUploadSource === 'PDF' ? "1.4 MB" : "620 KB";

      const result = await uploadCloudDocument({
        name: fileName,
        documentType: docUploadType,
        source: docUploadSource,
        notes: docNotes,
        fileSize: mockSize,
        fileData: capturedImage || undefined
      }, fleet);

      if (result.updatedDatabase) {
        setFleet(result.updatedDatabase);
      }

      setIsUploading(false);
      setUploadProgressMsg("");
      setDocNotes("");
      setCapturedImage(null);

      if (result.isOfflineQueued) {
        triggerToast(`⚡ Offline Mode: Document "${fileName}" cached in Service Worker queue for auto-sync.`);
      } else {
        triggerToast(`🚀 ${docUploadType} uploaded and stored securely!`);
      }

      await refreshPendingQueue();
    } catch (err) {
      console.error("Cloud doc upload error", err);
      alert("Error processing file upload");
      setIsUploading(false);
    }
  };

  // Web Speech API Initialization
  const initSpeechRecognition = () => {
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN"; // Set to Indian English/Standard English

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setInputText(resultText);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser or environment.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputText("");
      recognitionRef.current.start();
    }
  };

  // Chat message submission
  const handleSendMessage = async (textToSend?: string, wasVoice = false) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Add user message
    const userMsgId = `user_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: wasVoice
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setIsAiThinking(true);

    // Scroll chat window down
    setTimeout(() => {
      const container = document.getElementById("chat-thread-container");
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);

    try {
      if (getIsOffline()) {
        const result = await submitExpenseLog({
          plateNumber: "TN68AB1234",
          amount: 500,
          category: "Others",
          description: query
        }, fleet);

        if (result.updatedDatabase) {
          setFleet(result.updatedDatabase);
        }

        const offlineMsg: ChatMessage = {
          id: `ai_offline_${Date.now()}`,
          sender: "assistant",
          text: `⚡ Device is currently OFFLINE.\n\nYour message/submission ("${query}") has been safely cached in the Service Worker queue! It will automatically synchronize with the database server once connectivity is restored.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, offlineMsg]);
        await refreshPendingQueue();
        return;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Remove structural [DATABASE_ACTION] tags from displayed AI text
        const displayReply = data.reply.replace(/\[DATABASE_ACTION_START\]([\s\S]*?)\[DATABASE_ACTION_END\]/, "").trim();

        const assistantMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: "assistant",
          text: displayReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMsg]);
        
        // If server side database was updated, synchronize
        if (data.updatedDbState && data.currentDatabase) {
          setFleet(data.currentDatabase);
          triggerToast("✨ AI auto-applied database changes to Fleet State!");
        }
      } else {
        throw new Error("Failed to get response");
      }
    } catch (err) {
      // Offline fallback
      const result = await submitExpenseLog({
        plateNumber: "TN68AB1234",
        amount: 500,
        category: "Others",
        description: query
      }, fleet);

      if (result.updatedDatabase) {
        setFleet(result.updatedDatabase);
      }

      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "assistant",
        text: "⚡ Network connection unavailable. Request cached in Service Worker queue for auto-sync on reconnect.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      await refreshPendingQueue();
    } finally {
      setIsAiThinking(false);
      setTimeout(() => {
        const container = document.getElementById("chat-thread-container");
        if (container) container.scrollTop = container.scrollHeight;
      }, 50);
    }
  };

  // Handle Document Invoice / Receipt File Uploads
  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgressMsg("Uploading file to assistant secure sandbox...");

    try {
      // Step 1: Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(",")[1];
        setUploadProgressMsg("Gemini is reading document & extracting ledger variables...");

        // Step 2: Post to parse API
        const response = await fetch("/api/upload-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Data: base64String,
            mimeType: file.type || "image/jpeg",
            fileName: file.name
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.confidenceLow) {
            setLowConfidenceDoc({
              fileName: file.name,
              extracted: resData.data,
              confidenceScore: resData.confidenceScore
            });
            setVerificationForm({
              documentType: resData.data.documentType || "OTHER",
              plateNumber: resData.data.plateNumber || "TN68AB1234",
              date: resData.data.date || "2026-07-17",
              vendor: resData.data.vendor || "",
              amount: resData.data.amount || 0,
              gst: resData.data.gst || "",
              invoiceNumber: resData.data.invoiceNumber || "",
              fuelQuantity: resData.data.fuelQuantity || 0,
              serviceDetails: resData.data.serviceDetails || "",
              insuranceDetails: resData.data.insuranceDetails || "",
              expiryDate: resData.data.expiryDate || "",
              driverName: resData.data.driverName || ""
            });
            triggerToast("⚠️ AI confidence is low. Please review and confirm extracted values.");
          } else {
            setParsedDocResult({
              fileName: file.name,
              extracted: resData.data,
              message: resData.message
            });
            setFleet(resData.currentDatabase);
            triggerToast("📂 Document successfully scanned and auto-saved!");
          }
        } else {
          alert("Error parsing document. Please ensure it's a valid clear receipt file.");
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      setIsUploading(false);
      alert("Failed uploading receipt.");
    }
  };

  // Submit confirmed document data from verification form
  const handleConfirmDocument = async () => {
    if (!lowConfidenceDoc) return;
    setIsUploading(true);
    setUploadProgressMsg("Saving verified document records via Service Worker database layer...");

    try {
      const result = await confirmDocumentData({
        fileName: lowConfidenceDoc.fileName,
        data: verificationForm
      }, fleet);

      if (result.updatedDatabase) {
        setFleet(result.updatedDatabase);
      }

      setLowConfidenceDoc(null);

      if (result.isOfflineQueued) {
        triggerToast(`⚡ ${result.message}`);
      } else {
        triggerToast("✅ Document successfully verified and saved to fleet log!");
      }

      await refreshPendingQueue();
    } catch (err) {
      console.error(err);
      alert("Error connection with server.");
    } finally {
      setIsUploading(false);
    }
  };

  // Copy Clipboard Helper for Developer Exporter
  const copyToClipboard = (file: FlutterFile) => {
    navigator.clipboard.writeText(file.content);
    setCopiedFile(file.path);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  // Compute stats on fly for frontend display
  const getJulyFuelStats = () => {
    if (!fleet) return { liters: 0, cost: 0 };
    const logs = fleet.fuelLogs.filter(f => f.date.startsWith("2026-07"));
    const liters = logs.reduce((sum, item) => sum + item.liters, 0);
    const cost = logs.reduce((sum, item) => sum + item.amount, 0);
    return { liters, cost };
  };

  const getJulyExpenseTotal = () => {
    if (!fleet) return 0;
    return fleet.expenseLogs
      .filter(e => e.date.startsWith("2026-07"))
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const activeDriverCount = () => {
    if (!fleet) return 0;
    return fleet.drivers.filter(d => d.assignedVehiclePlate !== "").length;
  };

  const getDaysRemaining = (expiryDateStr: string | undefined) => {
    if (!expiryDateStr) return null;
    const diff = new Date(expiryDateStr).getTime() - new Date("2026-07-17").getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const stats = getJulyFuelStats();
  const JulyExpenses = getJulyExpenseTotal();

  return (
    <div className={`min-h-screen font-sans flex flex-col md:flex-row overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0F0D13] text-[#E6E0E9] dark' : 'bg-[#F7F2FA] text-[#1C1B1F]'
    }`}>
      
      {/* LEFT PANEL: Interactive Material 3 Android Simulator */}
      <div className={`flex-1 p-4 md:p-6 lg:p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r overflow-y-auto transition-colors ${
        isDarkMode ? 'bg-[#141218] border-[#36343B]' : 'bg-[#F7F2FA] border-[#CAC4D0]'
      }`}>
        <div className="w-full max-w-lg">
          
          {/* Header branding */}
          <div className="text-center mb-3">
            <h1 className={`text-2xl font-bold tracking-tight flex items-center justify-center gap-2 ${
              isDarkMode ? 'text-[#E6E0E9]' : 'text-[#1C1B1F]'
            }`}>
              <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-[#D0BCFF]' : 'text-[#6750A4]'}`} />
              AI Vehicle & Driver Assistant
            </h1>
            <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'}`}>
              Live Interactive Prototype (Material 3 Mobile Shell)
            </p>

            {/* Material 3 Segmented Theme Selector */}
            <div className="mt-2.5 flex items-center justify-center">
              <div className={`inline-flex items-center p-1 rounded-2xl border transition-all shadow-xs ${
                isDarkMode 
                  ? 'bg-[#2B2930] border-[#49454F] text-[#E6E0E9]' 
                  : 'bg-[#E7E0EC] border-[#CAC4D0] text-[#1C1B1F]'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsDarkMode(false);
                    triggerToast("☀️ Standard Day Mode activated (Material 3 Light)");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    !isDarkMode
                      ? 'bg-[#6750A4] text-white shadow-sm scale-102'
                      : isDarkMode ? 'text-[#CAC4D0] hover:text-white' : 'text-[#49454F] hover:text-[#1C1B1F]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Day Theme</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDarkMode(true);
                    triggerToast("🌙 Night-Time Fleet Mode activated (Material 3 High-Contrast Dark)");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isDarkMode
                      ? 'bg-[#D0BCFF] text-[#381E72] shadow-sm scale-102 font-extrabold'
                      : 'text-[#49454F] hover:text-[#1C1B1F]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Night Mode (High Contrast)</span>
                </button>
              </div>
            </div>
          </div>

          {/* THE PHYSICAL PHONE CONTAINER */}
          <div className={`relative mx-auto bg-[#1C1B1F] rounded-[3rem] p-4 shadow-2xl border-4 w-full max-w-sm aspect-[9/19] flex flex-col overflow-hidden ring-12 transition-all ${
            isDarkMode ? 'border-[#49454F] ring-[#4F378B]' : 'border-[#79747E] ring-[#EADDFF]'
          }`}>
            
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1C1B1F] rounded-b-xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#49454F]"></div>
              <div className="w-12 h-1 bg-[#49454F] rounded-full"></div>
            </div>

            {/* Simulated Android Status Bar */}
            <div className={`flex justify-between px-6 pt-2 pb-3 text-[11px] font-medium select-none z-40 transition-colors ${
              isDarkMode ? 'bg-[#211F26] text-[#CAC4D0]' : 'bg-[#F3EDF7] text-[#49454F]'
            }`}>
              <span className={`font-semibold ${isDarkMode ? 'text-[#E6E0E9]' : 'text-[#1C1B1F]'}`}>07:13 AM</span>
              <div className="flex items-center gap-1.5">
                {isDarkMode && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#381E72] text-[#D0BCFF] font-bold text-[8px] border border-[#4F378B]">
                    NIGHT
                  </span>
                )}
                <span className={`px-1 py-0.5 rounded font-mono text-[9px] border ${
                  isDarkMode 
                    ? 'bg-[#2B2930] text-[#D0BCFF] border-[#49454F]' 
                    : 'bg-[#EADDFF] text-[#21005D] border-[#CAC4D0]'
                }`}>2026-07-17</span>
                <span className={`w-2.5 h-2.5 rounded-sm inline-block ${isDarkMode ? 'bg-[#D0BCFF]' : 'bg-[#6750A4]'}`}></span>
                <span>5G</span>
                <span>94%</span>
              </div>
            </div>

            {/* SCREEN VIEWPORT */}
            <div className={`flex-1 rounded-[2rem] flex flex-col relative overflow-hidden transition-colors ${
              isDarkMode ? 'bg-[#141218] text-[#E6E0E9]' : 'bg-[#F7F2FA] text-[#1C1B1F]'
            }`}>
              
              {/* Material 3 App Header */}
              <div className={`px-4 py-3 border-b flex items-center justify-between shadow-xs transition-colors ${
                isDarkMode ? 'bg-[#211F26] border-[#36343B]' : 'bg-[#F3EDF7] border-[#CAC4D0]'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow ${
                    isDarkMode ? 'bg-[#D0BCFF] text-[#381E72]' : 'bg-[#6750A4]'
                  }`}>
                    AI
                  </div>
                  <div>
                    <h2 className={`text-sm font-semibold tracking-wide leading-tight ${
                      isDarkMode ? 'text-[#E6E0E9]' : 'text-[#1C1B1F]'
                    }`}>AI Assistant</h2>
                    <span className={`text-[10px] flex items-center gap-1 font-medium ${
                      isDarkMode ? 'text-emerald-400' : 'text-[#0A301A]'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {isDarkMode ? 'Night Fleet Mode' : 'Core Engine Online'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Service Worker Offline Sync Queue Button */}
                  <button
                    type="button"
                    onClick={() => setShowSyncModal(true)}
                    title="Service Worker Offline Sync Queue"
                    className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all border ${
                      pendingSyncItems.length > 0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : isOffline
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : isDarkMode
                        ? 'bg-[#2B2930] text-[#D0BCFF] border-[#49454F] hover:bg-[#36343B]'
                        : 'bg-[#EADDFF] text-[#21005D] border-[#CAC4D0] hover:bg-[#E8DEF8]'
                    }`}
                  >
                    {isOffline ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3 text-emerald-500" />}
                    <span>{pendingSyncItems.length > 0 ? `${pendingSyncItems.length} Sync` : 'SW Sync'}</span>
                  </button>

                  {/* Theme Mode Button in App Bar */}
                  <button 
                    type="button"
                    onClick={() => {
                      const nextMode = !isDarkMode;
                      setIsDarkMode(nextMode);
                      triggerToast(nextMode ? "🌙 High-Contrast Night Mode activated!" : "☀️ Standard Day Mode activated!");
                    }}
                    title={isDarkMode ? "Switch to Day Mode" : "Switch to Night Mode (High Contrast)"}
                    className={`p-1.5 rounded-full transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-[#36343B] text-amber-300' 
                        : 'hover:bg-[#E8DEF8] text-[#49454F]'
                    }`}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#6750A4]" />}
                  </button>

                  {/* Notification Bell */}
                  <button 
                    onClick={() => setShowNotifications(prev => !prev)}
                    className={`p-1.5 rounded-full relative transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-[#36343B] text-[#CAC4D0]' 
                        : 'hover:bg-[#E8DEF8] text-[#49454F]'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    {fleet && fleet.notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-[#B3261E] rounded-full"></span>
                    )}
                  </button>

                  {/* Reset Seed Button */}
                  <button 
                    onClick={resetDatabase}
                    title="Reset Fleet Database"
                    className={`p-1.5 rounded-full transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-[#36343B] text-[#CAC4D0]' 
                        : 'hover:bg-[#E8DEF8] text-[#49454F]'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Service Worker Offline Status Banner */}
              {(isOffline || pendingSyncItems.length > 0) && (
                <div className={`px-3 py-1.5 text-[11px] flex items-center justify-between font-medium border-b shadow-2xs transition-colors ${
                  isOffline 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                    : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                }`}>
                  <div className="flex items-center gap-1.5">
                    {isOffline ? (
                      <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                    ) : (
                      <HardDriveDownload className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                    <span className="truncate">
                      {isOffline ? `Offline Mode (${pendingSyncItems.length} queued)` : `${pendingSyncItems.length} cached item(s) pending sync`}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowSyncModal(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ml-1 shadow-2xs"
                  >
                    View Queue
                  </button>
                </div>
              )}

              {/* Notification Drawer (Overlay modal inside Phone) */}
              {showNotifications && (
                <div className="absolute inset-x-0 top-[53px] bg-[#F3EDF7]/95 backdrop-blur-md border-b border-[#CAC4D0] p-4 z-40 shadow-xl max-h-72 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#CAC4D0]/60">
                    <span className="text-xs font-bold text-[#49454F] tracking-wider">SYSTEM NOTIFICATIONS</span>
                    <div className="flex items-center gap-2">
                      {fleet && fleet.notifications.length > 0 && (
                        <button 
                          onClick={handleClearNotifications}
                          className="text-[10px] font-semibold text-[#6750A4] hover:underline"
                        >
                          Clear All
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)} className="text-[#49454F] hover:text-[#1C1B1F] p-0.5">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {fleet && fleet.notifications.length > 0 ? (
                    <div className="space-y-2">
                      {fleet.notifications.map((notif) => (
                        <div key={notif.id} className="bg-[#F7F2FA] p-2.5 rounded-lg border border-[#CAC4D0] flex items-start justify-between gap-2 shadow-2xs">
                          <div className="flex items-start gap-2">
                            <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${notif.type === 'alert' || notif.type === 'warning' ? 'text-[#B3261E]' : 'text-[#6750A4]'}`} />
                            <div>
                              <p className="text-xs font-semibold text-[#1C1B1F] leading-tight">{notif.title}</p>
                              <p className="text-[11px] text-[#49454F] mt-0.5 leading-snug">{notif.message}</p>
                              <span className="text-[9px] text-[#79747E] font-mono mt-1 block">{notif.date}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDismissNotification(notif.id)}
                            className="text-[#79747E] hover:text-[#1C1B1F] p-0.5 shrink-0"
                            title="Dismiss notification"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#79747E] text-xs text-center py-4">No recent notifications.</p>
                  )}
                </div>
              )}

              {/* ACTIVE TAB CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
                
                {/* TOAST NOTIFICATION */}
                {successToast && (
                  <div className="bg-[#C2EFD4] border border-[#0A301A]/20 text-[#0A301A] p-2.5 rounded-xl text-xs flex items-start gap-2 shadow-md animate-fade-in z-30">
                    <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <p className="font-medium">{successToast}</p>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {/* TAB 1: HOME PANEL */}
                  {activeTab === 'home' && (
                    <motion.div
                      key="home"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="space-y-4 flex-1"
                    >
                      
                      {/* Welcome Hero Grid Banner */}
                      <div className="bg-gradient-to-br from-[#EADDFF] to-[#D8C9EF] p-4 rounded-2xl border border-[#CAC4D0] shadow-sm">
                        <div className="flex items-center gap-1.5 text-[#21005D] text-[10px] font-bold uppercase tracking-wider mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#6750A4]" />
                          AI-Powered Mobile Fleet
                        </div>
                        <h3 className="text-lg font-bold text-[#21005D] leading-tight">Your fleet is running healthy</h3>
                        <p className="text-[#49454F] text-xs mt-1.5 leading-snug">
                          All 4 heavy trucks online. 1 schedule alarm logged. Ask the assistant to view or make changes.
                        </p>
                      </div>

                      {/* July Fleet Stats Bento Grid */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#49454F]">July Statistics</h4>
                          <span className="text-[9px] text-[#79747E] font-mono">July 1 - July 17</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-[#F3EDF7] p-3 rounded-xl border border-[#CAC4D0]">
                            <span className="text-[10px] text-[#49454F] block font-medium">Diesel Filled</span>
                            <span className="text-sm font-bold text-[#1C1B1F] block mt-1">{stats.liters} Liters</span>
                            <span className="text-[9px] text-[#79747E] font-mono block mt-0.5">July Cumulative</span>
                          </div>

                          <div className="bg-[#F3EDF7] p-3 rounded-xl border border-[#CAC4D0]">
                            <span className="text-[10px] text-[#49454F] block font-medium">Fuel Cost</span>
                            <span className="text-sm font-bold text-[#1B5E20] block mt-1">Rs. {stats.cost.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-[#79747E] block mt-0.5">Avg Rs. 90/Liter</span>
                          </div>

                          <div className="bg-[#F3EDF7] p-3 rounded-xl border border-[#CAC4D0]">
                            <span className="text-[10px] text-[#49454F] block font-medium">Other Expenses</span>
                            <span className="text-sm font-bold text-[#0D47A1] block mt-1">Rs. {JulyExpenses.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-[#79747E] block mt-0.5">Repairs & Tolls</span>
                          </div>

                          <div className="bg-[#F3EDF7] p-3 rounded-xl border border-[#CAC4D0]">
                            <span className="text-[10px] text-[#49454F] block font-medium">Drivers Assigned</span>
                            <span className="text-sm font-bold text-[#6750A4] block mt-1">{activeDriverCount()} / 4 Active</span>
                            <span className="text-[9px] text-[#79747E] block mt-0.5">100% capacity</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Mobile Quick Actions */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#49454F]">Quick Operations</h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {/* File Upload Trigger */}
                          <label className="flex flex-col items-center justify-center bg-[#EADDFF] hover:bg-[#D8C9EF] border border-[#CAC4D0] p-3.5 rounded-xl cursor-pointer text-center group transition-all duration-200">
                            <Upload className="w-5 h-5 text-[#6750A4] mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold text-[#21005D]">Upload Receipt</span>
                            <span className="text-[9px] text-[#49454F] mt-0.5">Parse bill automatically</span>
                            <input 
                              type="file" 
                              accept="image/*,application/pdf" 
                              onChange={handleDocumentUpload} 
                              className="hidden" 
                            />
                          </label>

                          {/* Voice Input Trigger */}
                          <button 
                            onClick={() => {
                              setActiveTab('chat');
                              setTimeout(() => {
                                toggleListening();
                              }, 300);
                            }}
                            className="flex flex-col items-center justify-center bg-[#E8DEF8] hover:bg-[#D8C9EF] border border-[#CAC4D0] p-3.5 rounded-xl text-center group transition-all duration-200"
                          >
                            <Mic className="w-5 h-5 text-[#6750A4] mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold text-[#1D192B]">Voice Assistant</span>
                            <span className="text-[9px] text-[#49454F] mt-0.5">Hands-free speech</span>
                          </button>

                          {/* Reports Trigger */}
                          <button 
                            onClick={() => setActiveTab('reports')}
                            className="col-span-2 flex items-center justify-start gap-3 bg-[#F3EDF7] hover:bg-[#EADDFF]/40 border border-[#CAC4D0] p-3 rounded-xl transition-all duration-200 group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-[#6750A4]/10 flex items-center justify-center text-[#6750A4] group-hover:scale-105 transition-transform">
                              <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-[#1C1B1F] block">Generate Operational Reports</span>
                              <span className="text-[9px] text-[#49454F] block mt-0.5">13 compliant ledgers with PDF/Excel exports</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#49454F] ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>

                      {/* Recent Chats / Conversations */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#49454F]">Recent Chats</h4>
                          <button onClick={() => setActiveTab('chat')} className="text-[#6750A4] hover:text-[#21005D] text-xs font-medium">Open Thread</button>
                        </div>

                        <div className="space-y-1.5">
                          {recentChats.map((chat, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => {
                                setActiveTab('chat');
                                handleSendMessage(chat);
                              }}
                              className="bg-[#F3EDF7] hover:bg-[#E8DEF8] p-2.5 rounded-xl border border-[#CAC4D0] flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <MessageSquare className="w-4 h-4 text-[#49454F] shrink-0" />
                                <span className="text-xs text-[#1C1B1F] truncate">{chat}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#79747E] shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* TAB 2: ACTIVE CHAT PANEL (The ChatGPT Experience) */}
                  {activeTab === 'chat' && (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex flex-col h-full flex-1 min-h-[380px] bg-[#F7F2FA]"
                    >
                    
                    {/* Chat History Thread */}
                    <div 
                      id="chat-thread-container"
                      className="flex-1 overflow-y-auto space-y-3 pr-1 scroll-smooth"
                    >
                      {messages.map((m) => (
                        <div 
                          key={m.id} 
                          className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`p-3 rounded-2xl max-w-[85%] text-xs shadow-sm leading-relaxed ${
                            m.sender === 'user' 
                              ? 'bg-[#F3EDF7] border border-[#CAC4D0] text-[#1C1B1F] rounded-br-none' 
                              : 'bg-[#E8DEF8] text-[#1D192B] rounded-bl-none'
                          }`}>
                            <div className="whitespace-pre-line">{m.text}</div>
                            
                            <div className={`text-[9px] mt-1.5 flex items-center gap-1 opacity-70 ${
                              m.sender === 'user' ? 'text-[#49454F] justify-end' : 'text-[#49454F]'
                            }`}>
                              {m.isVoice && <Volume2 className="w-3 h-3 text-[#6750A4]" />}
                              <span>{m.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Thinking loader */}
                      {isAiThinking && (
                        <div className="flex items-center gap-2 p-2 bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl max-w-[140px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6750A4] animate-bounce"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6750A4] animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6750A4] animate-bounce [animation-delay:0.4s]"></span>
                          <span className="text-[10px] text-[#49454F] font-medium">AI is thinking</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Suggestions scroll */}
                    <div className="flex gap-1.5 py-2 overflow-x-auto select-none shrink-0 no-scrollbar">
                      <button 
                        onClick={() => handleSendMessage("How much diesel did I fill this month?")}
                        className="bg-[#F3EDF7] hover:bg-[#E8DEF8] border border-[#CAC4D0] px-2.5 py-1.5 rounded-full text-[10px] text-[#49454F] hover:text-[#1C1B1F] whitespace-nowrap transition-colors shrink-0"
                      >
                        "diesel filled this month"
                      </button>
                      <button 
                        onClick={() => handleSendMessage("Show vehicle expenses for July")}
                        className="bg-[#F3EDF7] hover:bg-[#E8DEF8] border border-[#CAC4D0] px-2.5 py-1.5 rounded-full text-[10px] text-[#49454F] hover:text-[#1C1B1F] whitespace-nowrap transition-colors shrink-0"
                      >
                        "July expenses breakdown"
                      </button>
                      <button 
                        onClick={() => handleSendMessage("What is the insurance expiry date for TN68AB1234?")}
                        className="bg-[#F3EDF7] hover:bg-[#E8DEF8] border border-[#CAC4D0] px-2.5 py-1.5 rounded-full text-[10px] text-[#49454F] hover:text-[#1C1B1F] whitespace-nowrap transition-colors shrink-0"
                      >
                        "TN68AB1234 insurance"
                      </button>
                      <button 
                        onClick={() => handleSendMessage("Who is driving vehicle TN68AB1234?")}
                        className="bg-[#F3EDF7] hover:bg-[#E8DEF8] border border-[#CAC4D0] px-2.5 py-1.5 rounded-full text-[10px] text-[#49454F] hover:text-[#1C1B1F] whitespace-nowrap transition-colors shrink-0"
                      >
                        "Who is driving TN68AB1234?"
                      </button>
                    </div>

                    {/* Chat Input Dock */}
                    <div className="border-t border-[#CAC4D0] pt-2.5 bg-[#F7F2FA] flex gap-2 items-center shrink-0">
                      
                      {/* Voice Microphone Indicator / Pulse Wave */}
                      {isListening ? (
                        <div className="flex-1 bg-[#F9DEDC] rounded-full py-2 px-4 border border-[#B3261E]/30 flex items-center justify-between">
                          <span className="text-xs text-[#410E0B] font-semibold flex items-center gap-1.5 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-[#B3261E] animate-ping"></span>
                            Listening... Speak now
                          </span>
                          <button 
                            onClick={toggleListening}
                            className="p-1 rounded-full bg-[#B3261E] hover:bg-[#8C1D18] text-white transition-colors"
                          >
                            <MicOff className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 bg-white rounded-full border border-[#79747E] flex items-center px-3.5 gap-2 relative focus-within:ring-2 focus-within:ring-[#6750A4] transition-all">
                          
                          {/* File Attachment Shortcut */}
                          <label className="cursor-pointer text-[#49454F] hover:text-[#1C1B1F] p-1 rounded-full hover:bg-[#E8DEF8] transition-all shrink-0">
                            <Upload className="w-4 h-4" />
                            <input 
                              type="file" 
                              accept="image/*,application/pdf" 
                              onChange={handleDocumentUpload} 
                              className="hidden" 
                            />
                          </label>

                          <input 
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            placeholder="Ask assistant or type query..."
                            className="flex-1 bg-transparent border-none outline-none py-2 text-xs text-[#1C1B1F] placeholder-[#49454F] font-sans"
                          />
                          
                          {/* Voice mic button */}
                          <button 
                            onClick={toggleListening}
                            className="p-1 rounded-full text-[#49454F] hover:text-[#6750A4] hover:bg-[#E8DEF8] transition-all shrink-0"
                            title="Voice input"
                          >
                            <Mic className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Submit Arrow button */}
                      {!isListening && (
                        <button 
                          onClick={() => handleSendMessage()}
                          disabled={!inputText.trim()}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shadow transition-all shrink-0 ${
                            inputText.trim() 
                              ? 'bg-[#6750A4] hover:bg-[#523E87] text-white' 
                              : 'bg-[#F3EDF7] border border-[#CAC4D0] text-[#79747E] cursor-not-allowed'
                          }`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    </motion.div>
                  )}

                  {/* TAB 3: VEHICLE MANAGEMENT & DETAILED PROFILE LEDGERS */}
                  {activeTab === 'fleet' && (
                    <motion.div
                      key="fleet"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="space-y-4 flex-1"
                    >
                    
                    {selectedVehiclePlate ? (
                      /* --- 1. DETAILED VEHICLE PROFILE VIEW --- */
                      (() => {
                        const v = fleet?.vehicles.find(veh => veh.plateNumber === selectedVehiclePlate);
                        if (!v) {
                          return (
                            <div className="text-center p-6 bg-[#F3EDF7] rounded-2xl border border-[#CAC4D0]">
                              <p className="text-sm font-semibold text-[#1C1B1F]">Vehicle not found.</p>
                              <button 
                                onClick={() => setSelectedVehiclePlate(null)}
                                className="mt-3 bg-[#6750A4] text-white text-xs px-4 py-2 rounded-xl"
                              >
                                Go Back
                              </button>
                            </div>
                          );
                        }

                        const driver = fleet?.drivers.find(d => d.id === v.assignedDriverId);
                        
                        // Expiry dates status checker helper
                        const renderExpiryBadge = (label: string, dateStr: string | undefined, certNo?: string) => {
                          const daysLeft = getDaysRemaining(dateStr);
                          let statusColor = "bg-[#C2EFD4] text-[#0A301A] border-[#0A301A]/10";
                          let text = "Valid";
                          
                          if (daysLeft === null) {
                            return (
                              <div className="bg-[#F3EDF7] p-2.5 rounded-xl border border-[#CAC4D0] flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-semibold text-[#1C1B1F] block">{label}</span>
                                  <span className="text-[10px] text-[#79747E]">No certificate loaded</span>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8DEF8] text-[#49454F] font-bold">Unverified</span>
                              </div>
                            );
                          } else if (daysLeft < 0) {
                            statusColor = "bg-[#F8D7DA] text-[#721C24] border-[#721C24]/10";
                            text = `Expired (${Math.abs(daysLeft)}d ago)`;
                          } else if (daysLeft <= 30) {
                            statusColor = "bg-[#FFF3CD] text-[#856404] border-[#856404]/10";
                            text = `Expires in ${daysLeft}d`;
                          } else {
                            text = `Valid (${daysLeft}d left)`;
                          }

                          return (
                            <div className="bg-white p-2.5 rounded-xl border border-[#CAC4D0] flex justify-between items-start text-xs shadow-sm">
                              <div className="min-w-0 pr-2">
                                <span className="font-bold text-[#1C1B1F] block">{label}</span>
                                <span className="text-[10px] text-[#49454F] font-mono block mt-0.5 truncate">{certNo || "No Cert #"}</span>
                                <span className="text-[9px] text-[#79747E] font-mono">{dateStr}</span>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${statusColor}`}>
                                {text}
                              </span>
                            </div>
                          );
                        };

                        return (
                          <div className="space-y-4 animate-fade-in text-xs">
                            
                            {/* Profile Header Block */}
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => setSelectedVehiclePlate(null)}
                                className="p-1.5 bg-white border border-[#CAC4D0] rounded-full text-[#49454F] hover:text-[#1C1B1F] shadow-sm transition-all shrink-0"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold font-mono bg-white px-2.5 py-0.5 rounded-lg border-2 border-[#1C1B1F] text-[#1C1B1F] tracking-wide inline-block shadow-sm">
                                    {v.plateNumber}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                    v.status === 'Active' ? 'bg-[#C2EFD4] text-[#0A301A]' :
                                    v.status === 'Maintenance' ? 'bg-[#FFF3CD] text-[#856404]' : 'bg-[#EADDFF] text-[#21005D]'
                                  }`}>
                                    {v.status}
                                  </span>
                                </div>
                                <h3 className="text-xs font-semibold text-[#49454F] mt-1 truncate">{v.name}</h3>
                              </div>
                            </div>

                            {/* Specifications Grid */}
                            <div className="bg-[#F3EDF7] p-3 rounded-2xl border border-[#CAC4D0] space-y-2">
                              <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider block">Vehicle Specifications</span>
                              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#49454F]">
                                <div className="bg-white p-2 rounded-xl border border-[#CAC4D0]/50">
                                  <span className="text-[9px] text-[#79747E] block">Make & Model</span>
                                  <span className="font-semibold text-[#1C1B1F] mt-0.5 block">{v.model}</span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-[#CAC4D0]/50">
                                  <span className="text-[9px] text-[#79747E] block">Manufacturer</span>
                                  <span className="font-semibold text-[#1C1B1F] mt-0.5 block">{v.manufacturer}</span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-[#CAC4D0]/50">
                                  <span className="text-[9px] text-[#79747E] block">Odometer</span>
                                  <span className="font-semibold text-[#1C1B1F] font-mono mt-0.5 block">{v.currentOdometer.toLocaleString('en-IN')} km</span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-[#CAC4D0]/50">
                                  <span className="text-[9px] text-[#79747E] block">FASTag Balance</span>
                                  <span className="font-bold text-[#1B5E20] font-mono mt-0.5 block">Rs. {(v.fastagBalance || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="col-span-2 bg-white p-2 rounded-xl border border-[#CAC4D0]/50 grid grid-cols-2 gap-2 text-[10px]">
                                  <div>
                                    <span className="text-[9px] text-[#79747E] block">Engine Number</span>
                                    <span className="font-mono text-[#1C1B1F] font-semibold truncate block mt-0.5">{v.engineNumber}</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-[#79747E] block">Chassis Number</span>
                                    <span className="font-mono text-[#1C1B1F] font-semibold truncate block mt-0.5">{v.chassisNumber}</span>
                                  </div>
                                </div>
                                <div className="col-span-2 bg-white p-2 rounded-xl border border-[#CAC4D0]/50 flex justify-between items-center text-[10px]">
                                  <div>
                                    <span className="text-[9px] text-[#79747E] block">Assigned Driver</span>
                                    <span className="font-semibold text-[#1C1B1F] block mt-0.5">{driver?.name || "Unassigned"}</span>
                                  </div>
                                  {driver && (
                                    <span className="text-[#6750A4] font-semibold font-mono">{driver.phone}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Active Document Expiry Trackers */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider block">Required Documents & Expiries</span>
                              <div className="space-y-1.5">
                                {renderExpiryBadge("Insurance Coverage", v.insuranceExpiry, v.insuranceNo)}
                                {renderExpiryBadge("Fitness Certification", v.fitnessExpiry, v.fitnessNo)}
                                {renderExpiryBadge("State / National Permit", v.permitExpiry, v.permitNo)}
                                {renderExpiryBadge("Commercial Road Tax", v.roadTaxExpiry, v.roadTaxReceiptNo)}
                                {renderExpiryBadge("Pollution Certificate (PUC)", v.pucExpiry, v.pucNo)}
                              </div>
                            </div>

                            {/* Embedded Document Uploader specifically for this vehicle */}
                            <div className="bg-[#EADDFF]/40 border border-[#CAC4D0] p-3 rounded-2xl flex items-center justify-between gap-3">
                              <div>
                                <span className="font-bold text-[#21005D] block">Fast Document Scan</span>
                                <span className="text-[10px] text-[#49454F] block mt-0.5">Upload any permit, tax bill, or fuel invoice to parse & log instantly.</span>
                              </div>
                              <label className="flex items-center justify-center bg-[#6750A4] hover:bg-[#523E87] px-3 py-2 rounded-xl cursor-pointer text-center text-white shadow transition-colors font-semibold gap-1 text-[11px] shrink-0">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Scan File</span>
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf" 
                                  onChange={handleDocumentUpload} 
                                  className="hidden" 
                                />
                              </label>
                            </div>

                            {/* Nested History Sub-tabs */}
                            <div className="space-y-2">
                              <div className="flex border-b border-[#CAC4D0] text-[11px]">
                                {(['docs', 'expenses', 'service', 'trips'] as const).map((tab) => (
                                  <button
                                    key={tab}
                                    onClick={() => setDetailSubTab(tab)}
                                    className={`flex-1 py-1.5 text-center font-bold capitalize transition-all border-b-2 -mb-px ${
                                      detailSubTab === tab 
                                        ? 'text-[#6750A4] border-[#6750A4]' 
                                        : 'text-[#49454F] border-transparent hover:text-[#1C1B1F]'
                                    }`}
                                  >
                                    {tab === 'docs' ? 'Vault' : tab}
                                  </button>
                                ))}
                              </div>

                              <div className="bg-white p-2.5 rounded-2xl border border-[#CAC4D0] min-h-[140px] max-h-60 overflow-y-auto space-y-1.5 shadow-inner">
                                {detailSubTab === 'docs' && (
                                  v.documents.length > 0 ? (
                                    <div className="space-y-1.5">
                                      {v.documents.map((doc) => (
                                        <div key={doc.id} className="p-2 bg-[#F3EDF7] rounded-xl border border-[#CAC4D0]/40 flex items-center justify-between text-[11px]">
                                          <div className="min-w-0 pr-2">
                                            <span className="font-semibold text-[#1C1B1F] truncate block">{doc.name}</span>
                                            <span className="text-[9px] text-[#79747E] font-mono block mt-0.5">Category: {doc.type}</span>
                                          </div>
                                          <span className="text-[9px] text-[#49454F] font-mono shrink-0">{doc.uploadedAt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[#79747E] text-xs text-center py-8">No document uploads in vault yet.</p>
                                  )
                                )}

                                {detailSubTab === 'expenses' && (
                                  v.expenses.length > 0 ? (
                                    <div className="space-y-1.5">
                                      <div className="text-[10px] text-[#1B5E20] font-bold px-1 flex justify-between">
                                        <span>Total Vehicle Expenditures:</span>
                                        <span>Rs. {v.expenses.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</span>
                                      </div>
                                      {v.expenses.map((exp) => (
                                        <div key={exp.id} className="p-2 bg-[#F3EDF7] rounded-xl border border-[#CAC4D0]/40 flex justify-between items-start text-[11px]">
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="font-bold text-[#1C1B1F]">{exp.category}</span>
                                              <span className="text-[9px] text-[#79747E] font-mono">{exp.date}</span>
                                            </div>
                                            <p className="text-[#49454F] text-[10px] mt-0.5 leading-snug">{exp.description}</p>
                                          </div>
                                          <span className="font-bold text-[#B3261E] font-mono shrink-0">Rs. {exp.amount.toLocaleString('en-IN')}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[#79747E] text-xs text-center py-8">No expenses logged for this truck.</p>
                                  )
                                )}

                                {detailSubTab === 'service' && (
                                  v.serviceHistory && v.serviceHistory.length > 0 ? (
                                    <div className="space-y-2">
                                      {v.serviceHistory.map((sh) => (
                                        <div key={sh.id} className="p-2.5 bg-[#F3EDF7] rounded-xl border border-[#CAC4D0]/40 text-[11px] space-y-1">
                                          <div className="flex justify-between font-bold text-[#1C1B1F]">
                                            <span>{sh.type}</span>
                                            <span className="text-[#1B5E20] font-mono">Rs. {sh.cost.toLocaleString('en-IN')}</span>
                                          </div>
                                          <div className="text-[10px] text-[#49454F] flex justify-between">
                                            <span>At: {sh.provider}</span>
                                            <span className="font-mono">{sh.odometer.toLocaleString('en-IN')} km</span>
                                          </div>
                                          <p className="text-[10px] bg-white/70 p-1 rounded border border-[#CAC4D0]/20 text-[#49454F] leading-snug">{sh.details}</p>
                                          <span className="text-[9px] text-[#79747E] font-mono block text-right">{sh.date}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[#79747E] text-xs text-center py-8">No service history scanned.</p>
                                  )
                                )}

                                {detailSubTab === 'trips' && (
                                  v.tripHistory && v.tripHistory.length > 0 ? (
                                    <div className="space-y-2">
                                      {v.tripHistory.map((tr) => (
                                        <div key={tr.id} className="p-2.5 bg-[#F3EDF7] rounded-xl border border-[#CAC4D0]/40 text-[11px] space-y-1">
                                          <div className="flex justify-between font-bold text-[#1C1B1F]">
                                            <span className="flex items-center gap-1">{tr.from} → {tr.to}</span>
                                            <span className="font-mono">{tr.distanceKm} km</span>
                                          </div>
                                          <div className="text-[10px] text-[#49454F] flex justify-between">
                                            <span>Driver: {tr.driverName}</span>
                                            <span>Fuel: {tr.fuelUsedLiters}L used</span>
                                          </div>
                                          <span className="text-[9px] text-[#79747E] font-mono block text-right">{tr.date}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[#79747E] text-xs text-center py-8">No trip logs scanned for this truck.</p>
                                  )
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })()
                    ) : (
                      /* --- 2. VEHICLE LIST VIEW --- */
                      <div className="space-y-4 animate-fade-in text-xs">
                        
                        {/* List Actions Search Bar */}
                        <div className="flex gap-2">
                          <div className="flex-1 bg-white border border-[#CAC4D0] rounded-xl flex items-center px-2.5 gap-2 shadow-sm focus-within:ring-2 focus-within:ring-[#6750A4] transition-all">
                            <Search className="w-4 h-4 text-[#49454F]" />
                            <input 
                              type="text"
                              value={searchVehicleQuery}
                              onChange={(e) => setSearchVehicleQuery(e.target.value)}
                              placeholder="Search vehicle number or name..."
                              className="flex-1 bg-transparent py-2 border-none outline-none text-xs text-[#1C1B1F] placeholder-[#49454F] font-sans"
                            />
                          </div>
                          
                          <button 
                            onClick={() => setShowRegisterModal(true)}
                            className="bg-[#6750A4] hover:bg-[#523E87] text-white p-2.5 rounded-xl shadow-sm hover:shadow transition-all shrink-0 flex items-center gap-1"
                            title="Register Vehicle"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-[11px] font-bold pr-1">Register</span>
                          </button>
                        </div>

                        {/* List of registered vehicles */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            Registered Fleet ({fleet?.vehicles.length || 0})
                          </span>
                          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
                            {(fleet?.vehicles || [])
                              .filter(v => 
                                v.plateNumber.toLowerCase().includes(searchVehicleQuery.toLowerCase()) || 
                                v.name.toLowerCase().includes(searchVehicleQuery.toLowerCase()) ||
                                v.model.toLowerCase().includes(searchVehicleQuery.toLowerCase())
                              )
                              .map((v) => {
                                const drv = fleet?.drivers.find(d => d.id === v.assignedDriverId);
                                
                                // Calculate alert counts
                                let warns = 0;
                                const insDays = getDaysRemaining(v.insuranceExpiry);
                                const fitDays = getDaysRemaining(v.fitnessExpiry);
                                if (insDays !== null && insDays <= 30) warns++;
                                if (fitDays !== null && fitDays <= 30) warns++;

                                return (
                                  <div 
                                    key={v.plateNumber} 
                                    onClick={() => setSelectedVehiclePlate(v.plateNumber)}
                                    className="bg-white hover:bg-[#EADDFF]/20 p-3 rounded-2xl border border-[#CAC4D0] cursor-pointer shadow-sm hover:shadow transition-all group duration-200"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="font-bold text-[#1C1B1F] font-mono bg-[#F3EDF7] px-2.5 py-0.5 rounded-lg border border-[#CAC4D0] text-[11px] tracking-wide shadow-xs">
                                          {v.plateNumber}
                                        </span>
                                        <span className="text-[11px] font-bold text-[#1C1B1F] block mt-1.5 group-hover:text-[#6750A4] transition-colors">
                                          {v.name}
                                        </span>
                                      </div>
                                      <div className="flex flex-col items-end gap-1.5">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          v.status === 'Active' ? 'bg-[#C2EFD4] text-[#0A301A]' :
                                          v.status === 'Maintenance' ? 'bg-[#FFF3CD] text-[#856404]' : 'bg-[#EADDFF] text-[#21005D]'
                                        }`}>
                                          {v.status}
                                        </span>
                                        {warns > 0 && (
                                          <span className="text-[9px] bg-[#F8D7DA] text-[#721C24] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                                            <AlertCircle className="w-2.5 h-2.5" />
                                            {warns} alert{warns > 1 ? 's' : ''}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="mt-2.5 pt-2 border-t border-[#CAC4D0]/50 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-[#49454F]">
                                      <div className="truncate">Model: <span className="text-[#1C1B1F] font-semibold">{v.model}</span></div>
                                      <div>Odometer: <span className="text-[#1C1B1F] font-mono font-semibold">{v.currentOdometer.toLocaleString('en-IN')} km</span></div>
                                      <div className="truncate">Driver: <span className="text-[#1C1B1F] font-semibold">{drv?.name || "Unassigned"}</span></div>
                                      <div>FASTag: <span className="text-[#1B5E20] font-bold">Rs. {v.fastagBalance || 0}</span></div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Traditional Ledger links toggle */}
                        <div className="pt-3 border-t border-[#CAC4D0] flex justify-between items-center text-[10px]">
                          <span className="text-[#79747E] font-medium">Reset mock database anytime:</span>
                          <button 
                            onClick={resetDatabase}
                            className="text-[#6750A4] hover:text-[#21005D] flex items-center gap-1 font-bold underline"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Reset Database
                          </button>
                        </div>

                      </div>
                    )}

                    {/* --- 3. MANUAL VEHICLE REGISTRATION FORM OVERLAY MODAL --- */}
                    {showRegisterModal && (
                      <div className="fixed inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
                        <form 
                          onSubmit={handleRegisterVehicle}
                          className="bg-white p-5 rounded-3xl border border-[#CAC4D0] max-w-sm w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-[#CAC4D0] pb-2">
                            <h3 className="text-sm font-bold text-[#1C1B1F] flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-[#6750A4]" />
                              Register Vehicle
                            </h3>
                            <button 
                              type="button"
                              onClick={() => setShowRegisterModal(false)}
                              className="text-[#49454F] hover:text-[#1C1B1F] p-1 rounded hover:bg-[#E8DEF8]"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Vehicle Plate Number *</label>
                              <input 
                                type="text"
                                required
                                value={registerForm.plateNumber}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, plateNumber: e.target.value }))}
                                placeholder="e.g. TN68XY9999"
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Vehicle Friendly Name *</label>
                              <input 
                                type="text"
                                required
                                value={registerForm.name}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Cauvery Cargo Express"
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Model *</label>
                                <input 
                                  type="text"
                                  required
                                  value={registerForm.model}
                                  onChange={(e) => setRegisterForm(prev => ({ ...prev, model: e.target.value }))}
                                  placeholder="e.g. Tata Signa 4825"
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Manufacturer *</label>
                                <input 
                                  type="text"
                                  required
                                  value={registerForm.manufacturer}
                                  onChange={(e) => setRegisterForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                                  placeholder="e.g. Tata Motors"
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Engine Number</label>
                                <input 
                                  type="text"
                                  value={registerForm.engineNumber}
                                  onChange={(e) => setRegisterForm(prev => ({ ...prev, engineNumber: e.target.value }))}
                                  placeholder="AL-ENG-741"
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Chassis Number</label>
                                <input 
                                  type="text"
                                  value={registerForm.chassisNumber}
                                  onChange={(e) => setRegisterForm(prev => ({ ...prev, chassisNumber: e.target.value }))}
                                  placeholder="AL-CHS-992"
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Odometer (km)</label>
                                <input 
                                  type="number"
                                  value={registerForm.currentOdometer}
                                  onChange={(e) => setRegisterForm(prev => ({ ...prev, currentOdometer: e.target.value }))}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">FASTag Wallet ID</label>
                                <input 
                                  type="text"
                                  value={registerForm.fastagId}
                                  onChange={(e) => setRegisterForm(prev => ({ ...prev, fastagId: e.target.value }))}
                                  placeholder="FT-TN68XY9999"
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">FASTag Bal (Rs.)</label>
                                <input 
                                  type="number"
                                  value={registerForm.fastagBalance}
                                  onChange={(e) => setRegisterForm(prev => ({ ...prev, fastagBalance: e.target.value }))}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Assigned Driver</label>
                                <select
                                  value={registerForm.assignedDriverId}
                                  onChange={(e) => setRegisterForm(prev => ({ ...prev, assignedDriverId: e.target.value }))}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                >
                                  <option value="">Unassigned</option>
                                  {fleet?.drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t border-[#CAC4D0]/50 pt-2">
                              <div>
                                <label className="block text-[9px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Insurance Expiry</label>
                                <input 
                                  type="date"
                                  value={registerForm.insuranceExpiry}
                                  onChange={(e) => setRegisterForm(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-1.5 text-[10px] focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Fitness Expiry</label>
                                <input 
                                  type="date"
                                  value={registerForm.fitnessExpiry}
                                  onChange={(e) => setRegisterForm(prev => ({ ...prev, fitnessExpiry: e.target.value }))}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-1.5 text-[10px] focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#CAC4D0] flex justify-end gap-2">
                            <button 
                              type="button"
                              onClick={() => setShowRegisterModal(false)}
                              className="border border-[#CAC4D0] hover:bg-[#F3EDF7] text-[#49454F] font-bold px-4 py-2 rounded-xl transition-all"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="bg-[#6750A4] hover:bg-[#523E87] text-white font-bold px-5 py-2 rounded-xl shadow transition-all"
                            >
                              Register
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    </motion.div>
                  )}

                  {/* TAB 4: DRIVER MANAGEMENT PANEL */}
                  {activeTab === 'drivers' && (
                    <motion.div
                      key="drivers"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="space-y-4 flex-1"
                    >
                    {selectedDriverId ? (
                      /* --- 1. DETAILED DRIVER PROFILE VIEW --- */
                      (() => {
                        const d = fleet?.drivers.find(drv => drv.id === selectedDriverId);
                        if (!d) {
                          return (
                            <div className="text-center p-6 bg-[#F3EDF7] rounded-2xl border border-[#CAC4D0]">
                              <p className="text-sm font-semibold text-[#1C1B1F]">Driver not found.</p>
                              <button 
                                onClick={() => setSelectedDriverId(null)}
                                className="mt-3 bg-[#6750A4] text-white text-xs px-4 py-2 rounded-xl"
                              >
                                Go Back
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4 animate-fade-in text-xs">
                            {/* Profile Header Block */}
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => setSelectedDriverId(null)}
                                className="p-1.5 bg-white border border-[#CAC4D0] rounded-full text-[#49454F] hover:text-[#1C1B1F] shadow-sm transition-all shrink-0"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <div className="flex-1 min-w-0">
                                <h2 className="text-sm font-bold text-[#1C1B1F] truncate">{d.name}</h2>
                                <p className="text-[10px] text-[#79747E]">Joined on {d.joiningDate}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                d.dutyStatus === 'OnDuty' ? 'bg-[#C2EFD4] text-[#0A301A]' : 'bg-[#EADDFF] text-[#21005D]'
                              }`}>
                                {d.dutyStatus === 'OnDuty' ? 'On Duty' : 'Off Duty'}
                              </span>
                            </div>

                            {/* Duty Status Action Controls */}
                            <div className="bg-white p-3.5 rounded-2xl border border-[#CAC4D0] space-y-3 shadow-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider block">Real-time Duty Controls</span>
                                <span className="text-[10px] text-[#79747E] font-medium">Status: <strong>{d.dutyStatus}</strong></span>
                              </div>
                              <div className="flex gap-2.5">
                                <button
                                  onClick={() => handleToggleDuty(d.id, d.dutyStatus)}
                                  className={`flex-1 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                                    d.dutyStatus === 'OnDuty'
                                      ? 'bg-[#B3261E] hover:bg-[#8C1D18] text-white'
                                      : 'bg-[#1B5E20] hover:bg-[#0E3A14] text-white'
                                  }`}
                                >
                                  <Activity className="w-4 h-4" />
                                  <span>{d.dutyStatus === 'OnDuty' ? 'End Duty' : 'Start Duty'}</span>
                                </button>
                              </div>
                            </div>

                            {/* Attendance Marking Controls */}
                            <div className="bg-white p-3.5 rounded-2xl border border-[#CAC4D0] space-y-3 shadow-xs">
                              <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider block">Today's Attendance Status</span>
                              <div className="grid grid-cols-3 gap-2">
                                {(['Present', 'Leave', 'Absent'] as const).map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleUpdateAttendance(d.id, status)}
                                    className={`py-2 rounded-xl font-bold transition-all border text-center ${
                                      d.attendanceStatus === status
                                        ? status === 'Present' ? 'bg-[#C2EFD4] text-[#0A301A] border-[#0A301A]/30' :
                                          status === 'Leave' ? 'bg-[#FFF3CD] text-[#856404] border-[#856404]/30' :
                                          'bg-[#F8D7DA] text-[#721C24] border-[#721C24]/30'
                                        : 'bg-[#F3EDF7] hover:bg-[#EADDFF]/50 text-[#49454F] border-[#CAC4D0]'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Specifications Grid */}
                            <div className="bg-[#F3EDF7] p-3 rounded-2xl border border-[#CAC4D0] space-y-2">
                              <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider block">Driver Details</span>
                              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#49454F]">
                                <div className="bg-white p-2 rounded-xl border border-[#CAC4D0]/50">
                                  <span className="text-[9px] text-[#79747E] block">Mobile Number</span>
                                  <span className="font-semibold text-[#1C1B1F] mt-0.5 block font-mono">{d.phone}</span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-[#CAC4D0]/50">
                                  <span className="text-[9px] text-[#79747E] block">Assigned Vehicle</span>
                                  <span className="font-bold text-[#6750A4] mt-0.5 block font-mono">
                                    {d.assignedVehiclePlate || "Unassigned"}
                                  </span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-[#CAC4D0]/50">
                                  <span className="text-[9px] text-[#79747E] block">Driving License</span>
                                  <span className="font-semibold text-[#1C1B1F] font-mono mt-0.5 block truncate">{d.licenseNumber}</span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-[#CAC4D0]/50">
                                  <span className="text-[9px] text-[#79747E] block">License Expiry</span>
                                  <span className={`font-semibold mt-0.5 block font-mono ${
                                    getDaysRemaining(d.licenseExpiry) !== null && (getDaysRemaining(d.licenseExpiry) || 0) <= 30
                                      ? 'text-[#B3261E] font-bold'
                                      : 'text-[#1C1B1F]'
                                  }`}>
                                    {d.licenseExpiry}
                                  </span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-[#CAC4D0]/50 flex justify-between items-center col-span-2">
                                  <div>
                                    <span className="text-[9px] text-[#79747E] block">Salary Model</span>
                                    <span className="font-semibold text-[#1C1B1F] mt-0.5 block">
                                      {d.salaryType === 'Monthly' ? 'Monthly Fixed Salary' :
                                       d.salaryType === 'Daily' ? 'Daily Wage Salary' : 'Per Trip Base Salary'}
                                    </span>
                                  </div>
                                  <span className="text-xs font-bold text-[#6750A4] font-mono">
                                    Rs. {d.salaryRate.toLocaleString('en-IN')}/{d.salaryType === 'Monthly' ? 'mo' : d.salaryType === 'Daily' ? 'day' : 'trip'}
                                  </span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-[#CAC4D0]/50 flex justify-between items-center col-span-2">
                                  <div>
                                    <span className="text-[9px] text-[#79747E] block">Outstanding Cash Advance</span>
                                    <span className="font-semibold text-[#1C1B1F] mt-0.5 block">
                                      Balance Due
                                    </span>
                                  </div>
                                  <span className={`text-sm font-bold font-mono ${d.advance > 0 ? 'text-[#B3261E]' : 'text-[#1B5E20]'}`}>
                                    Rs. {d.advance.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Sub Tabs Inside Driver Details */}
                            <div className="space-y-2">
                              <div className="flex border-b border-[#CAC4D0] text-[11px]">
                                {(['attendance', 'salary', 'advance', 'docs'] as const).map((tab) => (
                                  <button
                                    key={tab}
                                    onClick={() => setDriverDetailSubTab(tab)}
                                    className={`flex-1 py-1.5 text-center font-bold capitalize transition-all border-b-2 -mb-px ${
                                      driverDetailSubTab === tab 
                                        ? 'text-[#6750A4] border-[#6750A4]' 
                                        : 'text-[#49454F] border-transparent hover:text-[#1C1B1F]'
                                    }`}
                                  >
                                    {tab === 'docs' ? 'Vault' : tab}
                                  </button>
                                ))}
                              </div>

                              <div className="bg-white p-2.5 rounded-2xl border border-[#CAC4D0] min-h-[140px] max-h-60 overflow-y-auto space-y-1.5 shadow-inner">
                                {driverDetailSubTab === 'attendance' && (
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold text-[#6750A4] px-1 border-b pb-1">
                                      <span>Attendance Logs</span>
                                      <span>Total Days: {d.attendanceHistory.length}</span>
                                    </div>
                                    {d.attendanceHistory && d.attendanceHistory.length > 0 ? (
                                      <div className="space-y-1">
                                        {d.attendanceHistory.slice().reverse().map((att, i) => (
                                          <div key={i} className="p-2 bg-[#F3EDF7] rounded-xl border border-[#CAC4D0]/40 flex justify-between items-center text-[11px]">
                                            <div>
                                              <span className="font-bold text-[#1C1B1F] font-mono">{att.date}</span>
                                              {att.startDuty && (
                                                <span className="text-[10px] text-[#49454F] block mt-0.5">
                                                  Duty Hours: {att.startDuty} to {att.endDuty || "Active"}
                                                </span>
                                              )}
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                              att.status === 'Present' ? 'bg-[#C2EFD4] text-[#0A301A]' :
                                              att.status === 'Leave' ? 'bg-[#FFF3CD] text-[#856404]' : 'bg-[#F8D7DA] text-[#721C24]'
                                            }`}>
                                              {att.status}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[#79747E] text-xs text-center py-8">No attendance records logged yet.</p>
                                    )}
                                  </div>
                                )}

                                {driverDetailSubTab === 'salary' && (
                                  <div className="space-y-2.5">
                                    <div className="flex justify-between items-center border-b pb-1">
                                      <span className="font-bold text-[#6750A4] text-[10px] uppercase">Wage & Salary Structure</span>
                                      <button
                                        onClick={() => {
                                          setSalaryForm({ salaryType: d.salaryType, salaryRate: String(d.salaryRate) });
                                          setShowSalaryModal(true);
                                        }}
                                        className="text-[#6750A4] hover:text-[#21005D] text-[10px] font-bold flex items-center gap-0.5"
                                      >
                                        Edit Wage
                                      </button>
                                    </div>
                                    <div className="p-2.5 bg-[#F3EDF7] rounded-xl border border-[#CAC4D0]/40 text-[11px] space-y-1.5">
                                      <div className="flex justify-between">
                                        <span className="text-[#49454F]">Payment Model:</span>
                                        <span className="font-bold text-[#1C1B1F]">
                                          {d.salaryType === 'Monthly' ? 'Monthly Fixed Salary' :
                                           d.salaryType === 'Daily' ? 'Daily Wage Salary' : 'Per Trip Base Wage'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-[#49454F]">Billing Rate:</span>
                                        <span className="font-bold text-[#1C1B1F] font-mono">Rs. {d.salaryRate.toLocaleString('en-IN')}</span>
                                      </div>
                                      <div className="flex justify-between border-t pt-1.5 border-[#CAC4D0]/40 text-[10px] text-[#79747E]">
                                        <span>Current Calculation:</span>
                                        <span>Auto-tallied on payout periods</span>
                                      </div>
                                    </div>
                                    <p className="text-[10px] text-[#49454F] italic leading-normal">
                                      * Adjust the pay structural standard anytime using the "Edit Wage" configuration above. All trip/day logs reference current billing rates.
                                    </p>
                                  </div>
                                )}

                                {driverDetailSubTab === 'advance' && (
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center border-b pb-1">
                                      <span className="font-bold text-[#6750A4] text-[10px] uppercase">Advances & Repayments</span>
                                      <button
                                        onClick={() => {
                                          setAdvanceForm({ amount: "", description: "", type: "advance" });
                                          setShowAdvanceModal(true);
                                        }}
                                        className="text-[#6750A4] hover:text-[#21005D] text-[10px] font-bold flex items-center gap-0.5"
                                      >
                                        Record Advance
                                      </button>
                                    </div>

                                    {d.advanceHistory && d.advanceHistory.length > 0 ? (
                                      <div className="space-y-1.5">
                                        {d.advanceHistory.map((adv) => (
                                          <div key={adv.id} className="p-2 bg-[#F3EDF7] rounded-xl border border-[#CAC4D0]/40 flex justify-between items-start text-[11px]">
                                            <div>
                                              <div className="flex items-center gap-1.5">
                                                <span className={`text-[9px] font-bold px-1 py-0.25 rounded ${
                                                  adv.type === 'advance' ? 'bg-[#F8D7DA] text-[#721C24]' : 'bg-[#C2EFD4] text-[#0A301A]'
                                                }`}>
                                                  {adv.type === 'advance' ? 'Advance' : 'Repay'}
                                                </span>
                                                <span className="text-[9px] text-[#79747E] font-mono">{adv.date}</span>
                                              </div>
                                              <p className="text-[#49454F] text-[10px] mt-0.5 leading-normal">{adv.description}</p>
                                            </div>
                                            <span className={`font-bold font-mono text-[11px] ${
                                              adv.type === 'advance' ? 'text-[#B3261E]' : 'text-[#1B5E20]'
                                            }`}>
                                              {adv.type === 'advance' ? '+' : '-'} Rs. {adv.amount.toLocaleString('en-IN')}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[#79747E] text-xs text-center py-8">No advance transactions registered.</p>
                                    )}
                                  </div>
                                )}

                                {driverDetailSubTab === 'docs' && (
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center border-b pb-1">
                                      <span className="font-bold text-[#6750A4] text-[10px] uppercase">Driver Vault Vault</span>
                                      <button
                                        onClick={() => {
                                          setDriverDocForm({ name: "", type: "License" });
                                          setShowDriverDocModal(true);
                                        }}
                                        className="text-[#6750A4] hover:text-[#21005D] text-[10px] font-bold flex items-center gap-0.5"
                                      >
                                        Add Document
                                      </button>
                                    </div>
                                    {d.documents && d.documents.length > 0 ? (
                                      <div className="space-y-1">
                                        {d.documents.map((doc) => (
                                          <div key={doc.id} className="p-2 bg-[#F3EDF7] rounded-xl border border-[#CAC4D0]/40 flex items-center justify-between text-[11px]">
                                            <div>
                                              <span className="font-semibold text-[#1C1B1F]">{doc.name}</span>
                                              <span className="text-[9px] text-[#79747E] font-mono block mt-0.5">Category: {doc.type}</span>
                                            </div>
                                            <span className="text-[9px] text-[#49454F] font-mono">{doc.uploadedAt}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[#79747E] text-xs text-center py-8">No driver documents uploaded yet.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      /* --- 2. DRIVERS LIST DIRECTORY VIEW --- */
                      <div className="space-y-4 animate-fade-in text-xs">
                        {/* List Actions Search Bar */}
                        <div className="flex gap-2">
                          <div className="flex-1 bg-white border border-[#CAC4D0] rounded-xl flex items-center px-2.5 gap-2 shadow-sm focus-within:ring-2 focus-within:ring-[#6750A4] transition-all">
                            <Search className="w-4 h-4 text-[#49454F]" />
                            <input 
                              type="text"
                              value={searchDriverQuery}
                              onChange={(e) => setSearchDriverQuery(e.target.value)}
                              placeholder="Search driver name or license..."
                              className="flex-1 bg-transparent py-2 border-none outline-none text-xs text-[#1C1B1F] placeholder-[#49454F] font-sans"
                            />
                          </div>
                          
                          <button 
                            onClick={() => setShowDriverRegisterModal(true)}
                            className="bg-[#6750A4] hover:bg-[#523E87] text-white p-2.5 rounded-xl shadow-sm hover:shadow transition-all shrink-0 flex items-center gap-1"
                            title="Register Driver"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-[11px] font-bold pr-1">Add</span>
                          </button>
                        </div>

                        {/* List of registered drivers */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            Active Driver Registry ({fleet?.drivers.length || 0})
                          </span>
                          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
                            {(fleet?.drivers || [])
                              .filter(d => 
                                d.name.toLowerCase().includes(searchDriverQuery.toLowerCase()) || 
                                d.phone.toLowerCase().includes(searchDriverQuery.toLowerCase()) ||
                                d.licenseNumber.toLowerCase().includes(searchDriverQuery.toLowerCase())
                              )
                              .map((d) => {
                                const initials = d.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                
                                return (
                                  <div 
                                    key={d.id} 
                                    onClick={() => setSelectedDriverId(d.id)}
                                    className="bg-white hover:bg-[#EADDFF]/20 p-3 rounded-2xl border border-[#CAC4D0] cursor-pointer shadow-sm hover:shadow transition-all group duration-200"
                                  >
                                    <div className="flex gap-3 items-center">
                                      {/* Initials Avatar */}
                                      <div className="w-9 h-9 rounded-full bg-[#EADDFF] border border-[#CAC4D0] flex items-center justify-center font-bold text-[#21005D] text-xs font-mono">
                                        {initials}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-[#1C1B1F] group-hover:text-[#6750A4] transition-colors truncate">
                                            {d.name}
                                          </span>
                                          <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded-full ${
                                            d.dutyStatus === 'OnDuty' ? 'bg-[#C2EFD4] text-[#0A301A]' : 'bg-[#EADDFF] text-[#21005D]'
                                          }`}>
                                            {d.dutyStatus}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1 text-[10px] text-[#49454F]">
                                          <span>Ph: <strong className="font-mono">{d.phone}</strong></span>
                                          {d.assignedVehiclePlate && (
                                            <span className="font-mono bg-[#F3EDF7] border border-[#CAC4D0]/60 px-1 py-0.25 rounded text-[9px]">
                                              Truck: {d.assignedVehiclePlate}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-2.5 pt-2 border-t border-[#CAC4D0]/50 grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-[#79747E]">
                                      <div>License Exp: <span className="text-[#1C1B1F] font-semibold font-mono">{d.licenseExpiry}</span></div>
                                      <div>Joined: <span className="text-[#1C1B1F] font-mono">{d.joiningDate}</span></div>
                                      <div>Salary model: <span className="text-[#1C1B1F] font-semibold">{d.salaryType} (Rs. {d.salaryRate})</span></div>
                                      <div>Advances Due: <span className={`font-semibold font-mono ${d.advance > 0 ? 'text-[#B3261E]' : 'text-[#1B5E20]'}`}>Rs. {d.advance}</span></div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Reset mock database link */}
                        <div className="pt-3 border-t border-[#CAC4D0] flex justify-between items-center text-[10px]">
                          <span className="text-[#79747E]">Reset mock database state:</span>
                          <button 
                            onClick={resetDatabase}
                            className="text-[#6750A4] hover:text-[#21005D] flex items-center gap-1 font-bold underline"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Reset Database
                          </button>
                        </div>
                      </div>
                    )}

                    {/* --- 3. MANUAL DRIVER REGISTRATION FORM MODAL OVERLAY --- */}
                    {showDriverRegisterModal && (
                      <div className="fixed inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
                        <form 
                          onSubmit={handleRegisterDriver}
                          className="bg-white p-5 rounded-3xl border border-[#CAC4D0] max-w-sm w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-[#CAC4D0] pb-2">
                            <h3 className="text-sm font-bold text-[#1C1B1F] flex items-center gap-1.5">
                              <User className="w-4 h-4 text-[#6750A4]" />
                              Register New Driver
                            </h3>
                            <button 
                              type="button"
                              onClick={() => setShowDriverRegisterModal(false)}
                              className="text-[#49454F] hover:text-[#1C1B1F] p-1 rounded hover:bg-[#E8DEF8]"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Driver Name *</label>
                              <input 
                                type="text"
                                required
                                value={driverRegisterForm.name}
                                onChange={(e) => setDriverRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Shanmugam Pillai"
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Mobile Number *</label>
                              <input 
                                type="text"
                                required
                                value={driverRegisterForm.phone}
                                onChange={(e) => setDriverRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="e.g. +91 94432 12345"
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Driving License *</label>
                                <input 
                                  type="text"
                                  required
                                  value={driverRegisterForm.licenseNumber}
                                  onChange={(e) => setDriverRegisterForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                                  placeholder="e.g. DL-TN6820240011"
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">License Expiry *</label>
                                <input 
                                  type="date"
                                  required
                                  value={driverRegisterForm.licenseExpiry}
                                  onChange={(e) => setDriverRegisterForm(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-1.5 text-[10px] focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Joining Date</label>
                                <input 
                                  type="date"
                                  value={driverRegisterForm.joiningDate}
                                  onChange={(e) => setDriverRegisterForm(prev => ({ ...prev, joiningDate: e.target.value }))}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-1.5 text-[10px] focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Assign Truck</label>
                                <select
                                  value={driverRegisterForm.assignedVehiclePlate}
                                  onChange={(e) => setDriverRegisterForm(prev => ({ ...prev, assignedVehiclePlate: e.target.value }))}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none"
                                >
                                  <option value="">None / Unassigned</option>
                                  {fleet?.vehicles.map(v => (
                                    <option key={v.plateNumber} value={v.plateNumber}>{v.plateNumber} - {v.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#CAC4D0]/50">
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Salary Model</label>
                                <select
                                  value={driverRegisterForm.salaryType}
                                  onChange={(e) => setDriverRegisterForm(prev => ({ ...prev, salaryType: e.target.value as any }))}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none"
                                >
                                  <option value="Monthly">Monthly Fixed</option>
                                  <option value="Daily">Daily Wage</option>
                                  <option value="PerTrip">Per Trip Base</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Wage Rate (Rs.)</label>
                                <input 
                                  type="number"
                                  required
                                  value={driverRegisterForm.salaryRate}
                                  onChange={(e) => setDriverRegisterForm(prev => ({ ...prev, salaryRate: e.target.value }))}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#CAC4D0] flex justify-end gap-2">
                            <button 
                              type="button"
                              onClick={() => setShowDriverRegisterModal(false)}
                              className="border border-[#CAC4D0] hover:bg-[#F3EDF7] text-[#49454F] font-bold px-4 py-2 rounded-xl transition-all"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="bg-[#6750A4] hover:bg-[#523E87] text-white font-bold px-5 py-2 rounded-xl shadow transition-all"
                            >
                              Register
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* --- 4. MANAGE ADVANCE TRANSACTION MODAL OVERLAY --- */}
                    {showAdvanceModal && selectedDriverId && (
                      <div className="fixed inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
                        <form 
                          onSubmit={(e) => handleUpdateAdvance(e, selectedDriverId)}
                          className="bg-white p-5 rounded-3xl border border-[#CAC4D0] max-w-sm w-full shadow-2xl space-y-4 text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-[#CAC4D0] pb-2">
                            <h3 className="text-sm font-bold text-[#1C1B1F] flex items-center gap-1.5">
                              <Wallet className="w-4 h-4 text-[#6750A4]" />
                              Record Cash Advance
                            </h3>
                            <button 
                              type="button"
                              onClick={() => setShowAdvanceModal(false)}
                              className="text-[#49454F] hover:text-[#1C1B1F] p-1 rounded hover:bg-[#E8DEF8]"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Transaction Type</label>
                              <select
                                value={advanceForm.type}
                                onChange={(e) => setAdvanceForm(prev => ({ ...prev, type: e.target.value as any }))}
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none"
                              >
                                <option value="advance">Advance Payment (Outflow)</option>
                                <option value="repayment">Repayment/Recovery (Inflow)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Amount (Rs.) *</label>
                              <input 
                                type="number"
                                required
                                min="1"
                                value={advanceForm.amount}
                                onChange={(e) => setAdvanceForm(prev => ({ ...prev, amount: e.target.value }))}
                                placeholder="e.g. 2000"
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Description / Notes</label>
                              <input 
                                type="text"
                                value={advanceForm.description}
                                onChange={(e) => setAdvanceForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="e.g. festival emergency fund, trip expense"
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#CAC4D0] flex justify-end gap-2">
                            <button 
                              type="button"
                              onClick={() => setShowAdvanceModal(false)}
                              className="border border-[#CAC4D0] hover:bg-[#F3EDF7] text-[#49454F] font-bold px-4 py-2 rounded-xl transition-all"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="bg-[#6750A4] hover:bg-[#523E87] text-white font-bold px-5 py-2 rounded-xl shadow"
                            >
                              Save Transaction
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* --- 5. EDIT SALARY MODAL OVERLAY --- */}
                    {showSalaryModal && selectedDriverId && (
                      <div className="fixed inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
                        <form 
                          onSubmit={(e) => handleUpdateSalary(e, selectedDriverId)}
                          className="bg-white p-5 rounded-3xl border border-[#CAC4D0] max-w-sm w-full shadow-2xl space-y-4 text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-[#CAC4D0] pb-2">
                            <h3 className="text-sm font-bold text-[#1C1B1F] flex items-center gap-1.5">
                              <Wallet className="w-4 h-4 text-[#6750A4]" />
                              Configure Wage / Salary
                            </h3>
                            <button 
                              type="button"
                              onClick={() => setShowSalaryModal(false)}
                              className="text-[#49454F] hover:text-[#1C1B1F] p-1 rounded hover:bg-[#E8DEF8]"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Wage Payment Model</label>
                              <select
                                value={salaryForm.salaryType}
                                onChange={(e) => setSalaryForm(prev => ({ ...prev, salaryType: e.target.value as any }))}
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none"
                              >
                                <option value="Monthly">Monthly Fixed</option>
                                <option value="Daily">Daily Wage</option>
                                <option value="PerTrip">Per Trip Base</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Billing Rate (Rs.) *</label>
                              <input 
                                type="number"
                                required
                                min="0"
                                value={salaryForm.salaryRate}
                                onChange={(e) => setSalaryForm(prev => ({ ...prev, salaryRate: e.target.value }))}
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#CAC4D0] flex justify-end gap-2">
                            <button 
                              type="button"
                              onClick={() => setShowSalaryModal(false)}
                              className="border border-[#CAC4D0] hover:bg-[#F3EDF7] text-[#49454F] font-bold px-4 py-2 rounded-xl transition-all"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="bg-[#6750A4] hover:bg-[#523E87] text-white font-bold px-5 py-2 rounded-xl shadow"
                            >
                              Update Wage
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* --- 6. ADD DRIVER DOCUMENT MODAL OVERLAY --- */}
                    {showDriverDocModal && selectedDriverId && (
                      <div className="fixed inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
                        <form 
                          onSubmit={(e) => handleUploadDriverDoc(e, selectedDriverId)}
                          className="bg-white p-5 rounded-3xl border border-[#CAC4D0] max-w-sm w-full shadow-2xl space-y-4 text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-[#CAC4D0] pb-2">
                            <h3 className="text-sm font-bold text-[#1C1B1F] flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-[#6750A4]" />
                              Add Vault Document
                            </h3>
                            <button 
                              type="button"
                              onClick={() => setShowDriverDocModal(false)}
                              className="text-[#49454F] hover:text-[#1C1B1F] p-1 rounded hover:bg-[#E8DEF8]"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Document Name *</label>
                              <input 
                                type="text"
                                required
                                value={driverDocForm.name}
                                onChange={(e) => setDriverDocForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. health_clearance_medical.pdf"
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Document Category</label>
                              <select
                                value={driverDocForm.type}
                                onChange={(e) => setDriverDocForm(prev => ({ ...prev, type: e.target.value as any }))}
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none"
                              >
                                <option value="License">Driving License Scan</option>
                                <option value="Aadhaar">Aadhaar Card Scan</option>
                                <option value="Medical">Medical Fitness Certificate</option>
                                <option value="Other">Other Certificate/Document</option>
                              </select>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#CAC4D0] flex justify-end gap-2">
                            <button 
                              type="button"
                              onClick={() => setShowDriverDocModal(false)}
                              className="border border-[#CAC4D0] hover:bg-[#F3EDF7] text-[#49454F] font-bold px-4 py-2 rounded-xl transition-all"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="bg-[#6750A4] hover:bg-[#523E87] text-white font-bold px-5 py-2 rounded-xl shadow"
                            >
                              Upload File
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    </motion.div>
                  )}

                  {/* TAB 5: CENTRALIZED CLOUD VAULT (DOCUMENT UPLOAD MODULE) */}
                  {activeTab === 'vault' && (
                    <motion.div
                      key="vault"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex-1 space-y-4"
                    >
                    {/* Header Banner */}
                    <div className="bg-[#EADDFF] p-4 rounded-3xl border border-[#CAC4D0] relative overflow-hidden shadow-sm">
                      <div className="relative z-10">
                        <h2 className="text-base font-bold text-[#21005D] flex items-center gap-1.5">
                          <Folder className="w-5 h-5 text-[#6750A4]" />
                          Central Cloud Storage
                        </h2>
                        <p className="text-[#49454F] text-[11px] font-medium mt-1 leading-normal">
                          Securely manage and upload compliant logs, bills, and certifications to centralized cloud storage.
                        </p>
                      </div>
                      <div className="absolute -right-3 -bottom-3 text-[#6750A4]/10 select-none">
                        <Folder className="w-24 h-24 stroke-[1.5]" />
                      </div>
                    </div>

                    {/* Central Document Upload Form */}
                    <div className="bg-white p-4 rounded-3xl border border-[#CAC4D0] shadow-xs space-y-4 text-xs animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-[#CAC4D0]/50 pb-2.5">
                        <h3 className="font-bold text-[#1C1B1F] flex items-center gap-2">
                          <Upload className="w-4 h-4 text-[#6750A4]" />
                          Upload New Document
                        </h3>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          AES-256 Cloud Encrypted
                        </span>
                      </div>

                      <form onSubmit={handleCloudDocUpload} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Document Type Dropdown */}
                          <div>
                            <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Document Category *</label>
                            <select
                              value={docUploadType}
                              onChange={(e) => setDocUploadType(e.target.value as any)}
                              className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4] font-medium"
                            >
                              <option value="Insurance PDF">Insurance PDF</option>
                              <option value="Fuel Bills">Fuel Bills</option>
                              <option value="Service Bills">Service Bills</option>
                              <option value="Tyre Bills">Tyre Bills</option>
                              <option value="Battery Bills">Battery Bills</option>
                              <option value="RC">RC (Registration Certificate)</option>
                              <option value="Fitness Certificate">Fitness Certificate</option>
                              <option value="Driving License">Driving License</option>
                              <option value="Salary Receipt">Salary Receipt</option>
                            </select>
                          </div>

                          {/* Source Selection (Camera / Gallery / PDF) */}
                          <div>
                            <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Upload Method *</label>
                            <select
                              value={docUploadSource}
                              onChange={(e) => {
                                setDocUploadSource(e.target.value as any);
                                setCapturedImage(null);
                                setSimulatedCameraStream(false);
                              }}
                              className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4] font-medium"
                            >
                              <option value="PDF">PDF Document File</option>
                              <option value="Camera">Camera Capture</option>
                              <option value="Gallery">Photo Gallery</option>
                            </select>
                          </div>
                        </div>

                        {/* Interactive Method Context Area */}
                        <div className="border border-[#CAC4D0] rounded-2xl bg-[#F7F2FA] p-3.5 flex flex-col items-center justify-center min-h-[140px] text-center relative overflow-hidden">
                          {docUploadSource === 'PDF' && (
                            <div className="space-y-2.5 w-full">
                              <FileText className="w-10 h-10 text-[#6750A4] mx-auto opacity-75" />
                              <div>
                                <p className="font-bold text-[#1C1B1F]">Drag & Drop your compliant PDF file</p>
                                <p className="text-[10px] text-[#49454F] mt-0.5">Accepts audit-ready digital PDF format up to 10MB</p>
                              </div>
                              <label className="inline-block bg-[#E8DEF8] hover:bg-[#EADDFF] text-[#21005D] text-[11px] font-bold px-3.5 py-2 rounded-xl border border-[#CAC4D0] cursor-pointer transition-all">
                                Select PDF File
                                <input 
                                  type="file" 
                                  accept=".pdf" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      triggerToast(`Selected file: ${file.name}`);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          )}

                          {docUploadSource === 'Gallery' && (
                            <div className="space-y-2.5 w-full">
                              <Sparkles className="w-10 h-10 text-pink-600 mx-auto opacity-75 animate-pulse" />
                              <div>
                                <p className="font-bold text-[#1C1B1F]">Choose photo from local gallery</p>
                                <p className="text-[10px] text-[#49454F] mt-0.5">Select scanned PNG or JPEG receipts</p>
                              </div>
                              <label className="inline-block bg-[#E8DEF8] hover:bg-[#EADDFF] text-[#21005D] text-[11px] font-bold px-3.5 py-2 rounded-xl border border-[#CAC4D0] cursor-pointer transition-all">
                                Browse Gallery
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setCapturedImage(reader.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                      triggerToast("Loaded image from gallery!");
                                    }
                                  }}
                                />
                              </label>
                              {capturedImage && (
                                <div className="mt-3 relative w-full max-w-[120px] mx-auto border border-[#CAC4D0] rounded-xl overflow-hidden aspect-video bg-black shadow-xs">
                                  <img src={capturedImage} alt="Gallery Preview" className="w-full h-full object-cover" />
                                  <button 
                                    type="button" 
                                    onClick={() => setCapturedImage(null)} 
                                    className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {docUploadSource === 'Camera' && (
                            <div className="space-y-2.5 w-full">
                              {!simulatedCameraStream && !capturedImage ? (
                                <>
                                  <Smartphone className="w-10 h-10 text-[#6750A4] mx-auto opacity-75" />
                                  <div>
                                    <p className="font-bold text-[#1C1B1F]">Camera Capture Simulator</p>
                                    <p className="text-[10px] text-[#49454F] mt-0.5">Simulate taking a snapshot using device camera</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSimulatedCameraStream(true);
                                      triggerToast("Simulated camera view active");
                                    }}
                                    className="bg-[#6750A4] hover:bg-[#523E87] text-white text-[11px] font-bold px-3.5 py-2 rounded-xl border border-[#CAC4D0] transition-all"
                                  >
                                    Initialize Camera
                                  </button>
                                </>
                              ) : simulatedCameraStream ? (
                                <div className="w-full max-w-[260px] mx-auto space-y-2">
                                  <div className="relative border border-[#CAC4D0] rounded-2xl overflow-hidden aspect-video bg-black flex flex-col items-center justify-center">
                                    {/* Animated scan indicator */}
                                    <div className="absolute inset-x-0 h-0.5 bg-cyan-400 animate-[bounce_2s_infinite]"></div>
                                    <span className="text-[10px] text-cyan-400 font-mono absolute top-2 left-2 animate-pulse">📷 LIVE CAM SIMULATOR</span>
                                    <span className="text-[10px] text-white font-mono opacity-50 px-4 text-center">Place receipt/document centered in front of lens</span>
                                  </div>
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSimulatedCameraStream(false);
                                        setCapturedImage(null);
                                      }}
                                      className="bg-white hover:bg-red-50 border border-[#CAC4D0] text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Set a dummy image content
                                        setCapturedImage("https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&q=85");
                                        setSimulatedCameraStream(false);
                                        triggerToast("Snapshot captured!");
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1"
                                    >
                                      Take Snapshot
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="relative w-full max-w-[220px] mx-auto border border-[#CAC4D0] rounded-2xl overflow-hidden aspect-video bg-black shadow-md">
                                    <img src={capturedImage!} alt="Snapshot Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <span className="absolute top-2 left-2 bg-emerald-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">Captured Snapshot</span>
                                    <button 
                                      type="button" 
                                      onClick={() => setCapturedImage(null)} 
                                      className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-emerald-700 font-bold">Image ready for AES-256 block-chunk cloud storage.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Notes Input */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Add Cloud Indexing Tag / Notes</label>
                          <input 
                            type="text"
                            value={docNotes}
                            onChange={(e) => setDocNotes(e.target.value)}
                            placeholder="e.g. July Diesel receipt, TN68AB1234, Rs. 14,400"
                            className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={docUploadSource !== 'PDF' && !capturedImage}
                          className={`w-full bg-[#6750A4] text-white hover:bg-[#523E87] py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-all ${
                            (docUploadSource !== 'PDF' && !capturedImage) ? 'opacity-50 cursor-not-allowed bg-[#E8DEF8] text-[#79747E]' : ''
                          }`}
                        >
                          <Upload className="w-4 h-4" />
                          Commit and Upload to Cloud Storage
                        </button>
                      </form>
                    </div>

                    {/* Central Document Upload History List */}
                    <div className="bg-white p-4 rounded-3xl border border-[#CAC4D0] shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between border-b border-[#CAC4D0]/50 pb-2">
                        <h3 className="font-bold text-[#1C1B1F] flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#6750A4]" />
                          Cloud Storage Ledger ({fleet?.uploadedDocuments?.length || 0})
                        </h3>
                        <span className="text-[10px] text-[#49454F] font-medium">Auto-Syncing</span>
                      </div>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {fleet?.uploadedDocuments && fleet.uploadedDocuments.length > 0 ? (
                          fleet.uploadedDocuments.map((doc) => (
                            <div 
                              key={doc.id}
                              onClick={() => setSelectedCloudDoc(doc)}
                              className="p-3 bg-[#F7F2FA] rounded-2xl border border-[#CAC4D0]/40 flex items-center justify-between hover:bg-[#EADDFF]/20 cursor-pointer transition-all duration-150 group"
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="p-2 rounded-xl bg-white border border-[#CAC4D0] text-[#6750A4] group-hover:text-purple-600 transition-colors shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 font-sans">
                                  <p className="font-bold text-[#1C1B1F] truncate text-xs">{doc.name}</p>
                                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                    <span className="text-[9px] bg-[#EADDFF] text-[#21005D] font-bold px-1.5 py-0.5 rounded">
                                      {doc.documentType}
                                    </span>
                                    <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                                      {doc.source}
                                    </span>
                                    <span className="text-[9px] text-[#49454F] font-mono font-medium">
                                      {doc.fileSize}
                                    </span>
                                  </div>
                                  {doc.notes && (
                                    <p className="text-[10px] text-[#49454F] italic truncate mt-1">“{doc.notes}”</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <span className="text-[9px] text-[#79747E] font-mono hidden sm:inline">{doc.uploadedAt}</span>
                                <div className="bg-white border border-[#CAC4D0] rounded-lg p-1.5 text-[#6750A4] hover:bg-[#EADDFF]/40">
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-[#79747E] bg-[#F7F2FA] rounded-2xl border border-dashed border-[#CAC4D0]">
                            <Folder className="w-8 h-8 mx-auto mb-1.5 opacity-55" />
                            <p className="font-bold text-[11px]">No cloud storage logs found</p>
                            <p className="text-[10px] opacity-75 mt-0.5">Commit document forms above to upload your first compliant file.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cloud Document Details Modal overlay */}
                    {selectedCloudDoc && (
                      <div className="fixed inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
                        <div className="bg-white p-5 rounded-3xl border border-[#CAC4D0] max-w-sm w-full shadow-2xl space-y-4 text-xs">
                          <div className="flex items-center justify-between border-b border-[#CAC4D0]/50 pb-2">
                            <h3 className="font-bold text-[#1C1B1F] flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              Cloud Compliance Verified
                            </h3>
                            <button 
                              onClick={() => setSelectedCloudDoc(null)}
                              className="text-[#49454F] p-1 rounded hover:bg-[#E8DEF8]"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3.5">
                            {selectedCloudDoc.fileData ? (
                              <div className="border border-[#CAC4D0] rounded-xl overflow-hidden aspect-video bg-black">
                                <img src={selectedCloudDoc.fileData} alt="Cloud Document" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="bg-[#F7F2FA] p-3.5 rounded-xl border border-[#CAC4D0] text-center space-y-1">
                                <FileText className="w-8 h-8 text-indigo-600 mx-auto" />
                                <p className="font-bold text-[#1C1B1F] font-mono text-[11px] truncate">{selectedCloudDoc.name}</p>
                                <p className="text-[9px] text-[#79747E] font-medium uppercase font-mono">Format: Audit PDF File</p>
                              </div>
                            )}

                            <div className="space-y-2">
                              <div className="flex justify-between border-b border-[#CAC4D0]/30 pb-1.5">
                                <span className="text-[#49454F]">Storage Location:</span>
                                <span className="text-[#6750A4] font-semibold font-mono text-[10px] break-all max-w-[200px] text-right">
                                  {selectedCloudDoc.storageUrl}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-[#CAC4D0]/30 pb-1.5">
                                <span className="text-[#49454F]">Document Type:</span>
                                <span className="text-[#1C1B1F] font-bold uppercase">{selectedCloudDoc.documentType}</span>
                              </div>
                              <div className="flex justify-between border-b border-[#CAC4D0]/30 pb-1.5">
                                <span className="text-[#49454F]">Upload Source:</span>
                                <span className="text-[#1C1B1F] font-semibold uppercase">{selectedCloudDoc.source}</span>
                              </div>
                              <div className="flex justify-between border-b border-[#CAC4D0]/30 pb-1.5">
                                <span className="text-[#49454F]">Size in Cloud:</span>
                                <span className="text-[#1C1B1F] font-mono font-semibold">{selectedCloudDoc.fileSize}</span>
                              </div>
                              <div className="flex justify-between border-b border-[#CAC4D0]/30 pb-1.5">
                                <span className="text-[#49454F]">Encryption:</span>
                                <span className="text-emerald-700 font-bold">AES-256 GCM Block</span>
                              </div>
                              <div className="flex justify-between border-b border-[#CAC4D0]/30 pb-1.5">
                                <span className="text-[#49454F]">Time Synced:</span>
                                <span className="text-[#1C1B1F] font-mono">{selectedCloudDoc.uploadedAt}</span>
                              </div>
                              {selectedCloudDoc.notes && (
                                <div className="space-y-1">
                                  <span className="text-[#49454F] block">Compliant indexing tags/notes:</span>
                                  <p className="bg-[#F3EDF7] p-2.5 rounded-xl border border-[#CAC4D0] leading-relaxed text-[#1C1B1F]">
                                    {selectedCloudDoc.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#CAC4D0] flex justify-end gap-2">
                            <button
                              onClick={() => {
                                window.open(selectedCloudDoc.storageUrl, "_blank");
                                triggerToast("Opening simulated secure storage URI in new tab...");
                              }}
                              className="bg-white hover:bg-slate-50 text-[#6750A4] border border-[#CAC4D0] text-[10px] font-bold px-3 py-1.5 rounded-lg"
                            >
                              Verify Cloud URL
                            </button>
                            <button 
                              onClick={() => setSelectedCloudDoc(null)}
                              className="bg-[#6750A4] hover:bg-[#523E87] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    </motion.div>
                  )}

                  {/* TAB 6: REMINDERS */}
                  {activeTab === 'reminders' && (
                    <motion.div
                      key="reminders"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="space-y-4 font-sans flex-1"
                    >
                    {/* Header card with summary */}
                    <div className="bg-gradient-to-br from-[#6750A4] to-[#4F378B] text-white p-4 rounded-3xl shadow-md space-y-3 relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                        <Clock className="w-32 h-32" />
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="bg-white/20 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
                            Live Reminders Core
                          </span>
                          <h2 className="text-xl font-extrabold tracking-tight mt-1 font-sans">Schedules & Reminders</h2>
                          <p className="text-[10px] text-purple-100 mt-0.5">Automated date & odometer threshold tracking</p>
                        </div>
                        <button
                          onClick={handleRunScheduler}
                          disabled={isRunningScheduler}
                          className="bg-[#EADDFF] hover:bg-[#D0BCFF] text-[#21005D] text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all shrink-0 active:scale-95 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRunningScheduler ? 'animate-spin' : ''}`} />
                          {isRunningScheduler ? 'Running...' : 'Run Scheduler'}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
                        <div className="bg-white/10 p-1.5 rounded-xl">
                          <p className="text-[9px] text-purple-200 uppercase font-bold tracking-wide">Active</p>
                          <p className="text-base font-black">{fleet?.reminders?.filter(r => r.status === 'Active').length || 0}</p>
                        </div>
                        <div className="bg-white/10 p-1.5 rounded-xl">
                          <p className="text-[9px] text-purple-200 uppercase font-bold tracking-wide">Snoozed</p>
                          <p className="text-base font-black">{fleet?.reminders?.filter(r => r.status === 'Snoozed').length || 0}</p>
                        </div>
                        <div className="bg-white/10 p-1.5 rounded-xl">
                          <p className="text-[9px] text-purple-200 uppercase font-bold tracking-wide">Other</p>
                          <p className="text-base font-black">{fleet?.reminders?.filter(r => ['Completed', 'Dismissed'].includes(r.status)).length || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Toolbar and Search */}
                    <div className="bg-white p-3.5 rounded-3xl border border-[#CAC4D0] shadow-xs space-y-3">
                      <div className="flex gap-2">
                        <div className="bg-[#F3EDF7] rounded-xl px-3 py-1.5 flex items-center gap-2 flex-1 min-w-0 border border-[#CAC4D0]/60">
                          <Search className="w-4 h-4 text-[#49454F]" />
                          <input
                            type="text"
                            placeholder="Search reminders..."
                            value={searchReminderQuery}
                            onChange={(e) => setSearchReminderQuery(e.target.value)}
                            className="bg-transparent border-none text-xs text-[#1C1B1F] focus:outline-none w-full"
                          />
                        </div>
                        <button
                          onClick={() => setShowReminderModal(true)}
                          className="bg-[#6750A4] hover:bg-[#523E87] text-white p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                          title="Create Reminder"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <div className="flex-1 min-w-[100px]">
                          <label className="block text-[8px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Filter Category</label>
                          <select
                            value={filterReminderCategory}
                            onChange={(e) => setFilterReminderCategory(e.target.value)}
                            className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-lg px-2 py-1 text-[11px] text-[#1C1B1F] focus:outline-none"
                          >
                            <option value="All">All Categories</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Fitness">Fitness</option>
                            <option value="Permit">Permit</option>
                            <option value="Road Tax">Road Tax</option>
                            <option value="PUC">PUC</option>
                            <option value="Service">Service</option>
                            <option value="Tyres">Tyres</option>
                            <option value="Battery">Battery</option>
                            <option value="License">License</option>
                            <option value="Salary">Salary</option>
                          </select>
                        </div>
                        <div className="flex-1 min-w-[100px]">
                          <label className="block text-[8px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Filter Status</label>
                          <select
                            value={filterReminderStatus}
                            onChange={(e) => setFilterReminderStatus(e.target.value)}
                            className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-lg px-2 py-1 text-[11px] text-[#1C1B1F] focus:outline-none"
                          >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active Only</option>
                            <option value="Snoozed">Snoozed Only</option>
                            <option value="Completed">Completed Only</option>
                            <option value="Dismissed">Dismissed Only</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Reminders List */}
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {fleet?.reminders && fleet.reminders.length > 0 ? (() => {
                        const filtered = fleet.reminders.filter(r => {
                          const matchesSearch = r.title.toLowerCase().includes(searchReminderQuery.toLowerCase()) ||
                            (r.notes && r.notes.toLowerCase().includes(searchReminderQuery.toLowerCase())) ||
                            (r.plateNumber && r.plateNumber.toLowerCase().includes(searchReminderQuery.toLowerCase()));
                          const matchesCategory = filterReminderCategory === "All" || r.category === filterReminderCategory;
                          const matchesStatus = filterReminderStatus === "All" || r.status === filterReminderStatus;
                          return matchesSearch && matchesCategory && matchesStatus;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-8 text-[#79747E] bg-white rounded-3xl border border-[#CAC4D0]/60 p-4">
                              <HelpCircle className="w-8 h-8 mx-auto mb-1.5 opacity-40 text-[#6750A4]" />
                              <p className="font-bold text-[11px]">No matching reminders found</p>
                              <p className="text-[9px] opacity-75 mt-0.5">Try adjusting your filters or search query.</p>
                            </div>
                          );
                        }

                        return filtered.map(r => {
                          // Category configuration
                          const categoryStyles: Record<string, { bg: string; text: string; border: string }> = {
                            Insurance: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
                            Fitness: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                            Permit: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
                            'Road Tax': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
                            PUC: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
                            Service: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
                            Tyres: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
                            Battery: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
                            License: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                            Salary: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
                          };

                          const style = categoryStyles[r.category] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };

                          // Calculate due helper text
                          let dueMessage = "";
                          let isUrgent = false;

                          if (r.frequency === "Every X Kilometers") {
                            if (r.nextDueOdometer) {
                              const vehicle = fleet.vehicles.find(v => v.plateNumber === r.plateNumber);
                              const currentOdo = vehicle ? vehicle.currentOdometer : 0;
                              const diff = r.nextDueOdometer - currentOdo;
                              if (diff <= 0) {
                                dueMessage = `DUE NOW! (Odometer: ${currentOdo} km / Limit: ${r.nextDueOdometer} km)`;
                                isUrgent = true;
                              } else {
                                dueMessage = `Due in ${diff.toLocaleString()} km (at ${r.nextDueOdometer.toLocaleString()} km)`;
                              }
                            }
                          } else {
                            if (r.nextDueDate) {
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              const due = new Date(r.nextDueDate);
                              due.setHours(0,0,0,0);
                              const diffTime = due.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              
                              if (diffDays < 0) {
                                dueMessage = `OVERDUE by ${Math.abs(diffDays)} days (Due: ${r.nextDueDate})`;
                                isUrgent = true;
                              } else if (diffDays === 0) {
                                dueMessage = `DUE TODAY! (Date: ${r.nextDueDate})`;
                                isUrgent = true;
                              } else {
                                dueMessage = `Due in ${diffDays} days (Date: ${r.nextDueDate})`;
                              }
                            }
                          }

                          return (
                            <div
                              key={r.id}
                              className={`bg-white p-3.5 rounded-3xl border transition-all relative overflow-hidden ${
                                isUrgent && r.status === 'Active'
                                  ? 'border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)] bg-red-50/10'
                                  : 'border-[#CAC4D0]/50 hover:bg-slate-50/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="space-y-1.5 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}>
                                      {r.category}
                                    </span>
                                    <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                                      {r.frequency}
                                    </span>
                                    {r.status === 'Snoozed' && (
                                      <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5 animate-pulse">
                                        <Clock className="w-2.5 h-2.5" /> Snoozed
                                      </span>
                                    )}
                                    {r.status === 'Completed' && (
                                      <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                        Completed
                                      </span>
                                    )}
                                    {r.status === 'Dismissed' && (
                                      <span className="text-[9px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                                        Dismissed
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="font-bold text-xs sm:text-sm text-[#1C1B1F] leading-snug">{r.title}</h4>
                                  
                                  {/* Next due badge */}
                                  <p className={`text-[10px] font-bold flex items-center gap-1 ${isUrgent && r.status === 'Active' ? 'text-red-600' : 'text-slate-600'}`}>
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    {dueMessage}
                                  </p>

                                  {/* Associated Vehicle or Driver */}
                                  {(r.plateNumber || r.driverId) && (
                                    <div className="flex gap-1.5 flex-wrap text-[9px] text-[#49454F] font-semibold">
                                      {r.plateNumber && (
                                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                                          🚗 {r.plateNumber}
                                        </span>
                                      )}
                                      {r.driverId && (
                                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                          👤 Driver: {fleet?.drivers?.find(d => d.id === r.driverId)?.name || r.driverId}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {r.notes && (
                                    <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed font-sans mt-1">
                                      “{r.notes}”
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleDeleteReminder(r.id)}
                                  className="text-[#79747E] hover:text-red-600 p-1 rounded-lg hover:bg-red-50 shrink-0 transition-all self-start"
                                  title="Delete Reminder"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Footer status buttons */}
                              {r.status === 'Active' && (
                                <div className="mt-3 pt-2 border-t border-[#CAC4D0]/40 flex gap-1.5 justify-end">
                                  <button
                                    onClick={() => handleUpdateReminderStatus(r.id, 'Snoozed')}
                                    className="bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all"
                                  >
                                    Snooze
                                  </button>
                                  <button
                                    onClick={() => handleUpdateReminderStatus(r.id, 'Dismissed')}
                                    className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all"
                                  >
                                    Dismiss
                                  </button>
                                  <button
                                    onClick={() => handleUpdateReminderStatus(r.id, 'Completed')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-xs transition-all active:scale-95"
                                  >
                                    <Check className="w-3 h-3" />
                                    Mark Completed
                                  </button>
                                </div>
                              )}

                              {r.status !== 'Active' && (
                                <div className="mt-3 pt-2 border-t border-[#CAC4D0]/40 flex gap-1.5 justify-end">
                                  <button
                                    onClick={() => handleUpdateReminderStatus(r.id, 'Active')}
                                    className="bg-[#6750A4] hover:bg-[#523E87] text-white text-[10px] font-bold px-3 py-1 rounded-xl transition-all"
                                  >
                                    Reactivate Schedule
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })() : (
                        <div className="text-center py-8 text-[#79747E] bg-white rounded-3xl border border-dashed border-[#CAC4D0] p-4">
                          <Clock className="w-8 h-8 mx-auto mb-1.5 opacity-55 text-[#6750A4]" />
                          <p className="font-bold text-[11px]">No reminders scheduled</p>
                          <p className="text-[10px] opacity-75 mt-0.5">Click the plus icon above to schedule your first reminder.</p>
                        </div>
                      )}
                    </div>

                    {/* Create Reminder Modal */}
                    {showReminderModal && (
                      <div className="fixed inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
                        <div className="bg-white p-5 rounded-3xl border border-[#CAC4D0] max-w-sm w-full shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between border-b border-[#CAC4D0]/50 pb-2">
                            <h3 className="font-bold text-sm text-[#1C1B1F] flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-[#6750A4]" />
                              Schedule Fleet Reminder
                            </h3>
                            <button
                              onClick={() => setShowReminderModal(false)}
                              className="text-[#49454F] p-1 rounded hover:bg-[#E8DEF8]"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <form onSubmit={handleCreateReminder} className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Reminder Title *</label>
                              <input
                                type="text"
                                required
                                value={reminderForm.title}
                                onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                                placeholder="e.g. Annual PUC renewal check"
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Category *</label>
                                <select
                                  value={reminderForm.category}
                                  onChange={(e: any) => setReminderForm({ ...reminderForm, category: e.target.value })}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                >
                                  <option value="Insurance">Insurance</option>
                                  <option value="Fitness">Fitness</option>
                                  <option value="Permit">Permit</option>
                                  <option value="Road Tax">Road Tax</option>
                                  <option value="PUC">PUC</option>
                                  <option value="Service">Service</option>
                                  <option value="Tyres">Tyres</option>
                                  <option value="Battery">Battery</option>
                                  <option value="License">License</option>
                                  <option value="Salary">Salary</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Frequency *</label>
                                <select
                                  value={reminderForm.frequency}
                                  onChange={(e: any) => setReminderForm({ ...reminderForm, frequency: e.target.value })}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                >
                                  <option value="Daily">Daily</option>
                                  <option value="Weekly">Weekly</option>
                                  <option value="Monthly">Monthly</option>
                                  <option value="Quarterly">Quarterly</option>
                                  <option value="Half Yearly">Half Yearly</option>
                                  <option value="Yearly">Yearly</option>
                                  <option value="Every X Days">Every X Days</option>
                                  <option value="Every X Months">Every X Months</option>
                                  <option value="Every X Years">Every X Years</option>
                                  <option value="Every X Kilometers">Every X Kilometers</option>
                                </select>
                              </div>
                            </div>

                            {reminderForm.frequency.startsWith("Every X") && (
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">
                                  {reminderForm.frequency === "Every X Kilometers" ? "Kilometers Value (X) *" : "Time Duration (X) *"}
                                </label>
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  value={reminderForm.frequencyValue}
                                  onChange={(e) => setReminderForm({ ...reminderForm, frequencyValue: e.target.value })}
                                  placeholder={reminderForm.frequency === "Every X Kilometers" ? "e.g. 10000" : "e.g. 3"}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Plate Number</label>
                                <select
                                  value={reminderForm.plateNumber}
                                  onChange={(e) => setReminderForm({ ...reminderForm, plateNumber: e.target.value })}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                >
                                  <option value="">None (Global)</option>
                                  {fleet?.vehicles.map(v => (
                                    <option key={v.plateNumber} value={v.plateNumber}>{v.plateNumber}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Driver</label>
                                <select
                                  value={reminderForm.driverId}
                                  onChange={(e) => setReminderForm({ ...reminderForm, driverId: e.target.value })}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                >
                                  <option value="">None (Global)</option>
                                  {fleet?.drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {reminderForm.frequency !== "Every X Kilometers" ? (
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Next Due Date *</label>
                                <input
                                  type="date"
                                  required
                                  value={reminderForm.nextDueDate}
                                  onChange={(e) => setReminderForm({ ...reminderForm, nextDueDate: e.target.value })}
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Next Due Odometer (km) *</label>
                                <input
                                  type="number"
                                  required
                                  min="0"
                                  value={reminderForm.nextDueOdometer}
                                  onChange={(e) => setReminderForm({ ...reminderForm, nextDueOdometer: e.target.value })}
                                  placeholder="e.g. 155000"
                                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-[10px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Description / Notes</label>
                              <textarea
                                value={reminderForm.notes}
                                onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })}
                                placeholder="Additional details or instructions..."
                                rows={2}
                                className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-1.5 focus:ring-[#6750A4]"
                              />
                            </div>

                            <div className="pt-2 border-t border-[#CAC4D0] flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setShowReminderModal(false)}
                                className="bg-white hover:bg-slate-50 text-[#6750A4] border border-[#CAC4D0] text-[10px] font-bold px-3 py-2 rounded-xl transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="bg-[#6750A4] hover:bg-[#523E87] text-white text-[10px] font-bold px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95"
                              >
                                Schedule
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                    </motion.div>
                  )}

                  {/* TAB 7: REPORTS */}
                  {activeTab === 'reports' && fleet && (
                    <motion.div
                      key="reports"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex-1"
                    >
                      <ReportsView fleet={fleet} triggerToast={triggerToast} isDarkMode={isDarkMode} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Android Navigation Bar (Material 3 style with Framer Motion) */}
              <div className={`border-t px-1 py-2 flex justify-around items-center select-none shrink-0 z-30 transition-colors ${
                isDarkMode ? 'bg-[#211F26] border-[#36343B]' : 'bg-[#F3EDF7] border-[#CAC4D0]'
              }`}>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="flex flex-col items-center gap-1 text-[8.5px] font-semibold flex-1"
                >
                  <div className="relative px-2.5 py-1 rounded-full transition-colors flex items-center justify-center">
                    {activeTab === 'home' && (
                      <motion.div
                        layoutId="activeTabPill"
                        className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-[#4F378B]' : 'bg-[#EADDFF]'}`}
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Smartphone className={`w-3.5 h-3.5 relative z-10 ${
                      activeTab === 'home' 
                        ? isDarkMode ? 'text-[#EADDFF]' : 'text-[#21005D]' 
                        : isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'
                    }`} />
                  </div>
                  <span className={activeTab === 'home' ? isDarkMode ? 'font-bold text-[#E6E0E9]' : 'font-bold text-[#1C1B1F]' : isDarkMode ? 'text-[#CAC4D0]' : ''}>Home</span>
                </button>

                <button 
                  onClick={() => setActiveTab('chat')}
                  className="flex flex-col items-center gap-1 text-[8.5px] font-semibold flex-1"
                >
                  <div className="relative px-2.5 py-1 rounded-full transition-colors flex items-center justify-center">
                    {activeTab === 'chat' && (
                      <motion.div
                        layoutId="activeTabPill"
                        className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-[#4F378B]' : 'bg-[#EADDFF]'}`}
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <MessageSquare className={`w-3.5 h-3.5 relative z-10 ${
                      activeTab === 'chat' 
                        ? isDarkMode ? 'text-[#EADDFF]' : 'text-[#21005D]' 
                        : isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'
                    }`} />
                  </div>
                  <span className={activeTab === 'chat' ? isDarkMode ? 'font-bold text-[#E6E0E9]' : 'font-bold text-[#1C1B1F]' : isDarkMode ? 'text-[#CAC4D0]' : ''}>Ask AI</span>
                </button>

                <button 
                  onClick={() => setActiveTab('fleet')}
                  className="flex flex-col items-center gap-1 text-[8.5px] font-semibold flex-1"
                >
                  <div className="relative px-2.5 py-1 rounded-full transition-colors flex items-center justify-center">
                    {activeTab === 'fleet' && (
                      <motion.div
                        layoutId="activeTabPill"
                        className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-[#4F378B]' : 'bg-[#EADDFF]'}`}
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Truck className={`w-3.5 h-3.5 relative z-10 ${
                      activeTab === 'fleet' 
                        ? isDarkMode ? 'text-[#EADDFF]' : 'text-[#21005D]' 
                        : isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'
                    }`} />
                  </div>
                  <span className={activeTab === 'fleet' ? isDarkMode ? 'font-bold text-[#E6E0E9]' : 'font-bold text-[#1C1B1F]' : isDarkMode ? 'text-[#CAC4D0]' : ''}>Fleet</span>
                </button>

                <button 
                  onClick={() => setActiveTab('drivers')}
                  className="flex flex-col items-center gap-1 text-[8.5px] font-semibold flex-1"
                >
                  <div className="relative px-2.5 py-1 rounded-full transition-colors flex items-center justify-center">
                    {activeTab === 'drivers' && (
                      <motion.div
                        layoutId="activeTabPill"
                        className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-[#4F378B]' : 'bg-[#EADDFF]'}`}
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <User className={`w-3.5 h-3.5 relative z-10 ${
                      activeTab === 'drivers' 
                        ? isDarkMode ? 'text-[#EADDFF]' : 'text-[#21005D]' 
                        : isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'
                    }`} />
                  </div>
                  <span className={activeTab === 'drivers' ? isDarkMode ? 'font-bold text-[#E6E0E9]' : 'font-bold text-[#1C1B1F]' : isDarkMode ? 'text-[#CAC4D0]' : ''}>Drivers</span>
                </button>

                <button 
                  onClick={() => setActiveTab('reminders')}
                  className="flex flex-col items-center gap-1 text-[8.5px] font-semibold flex-1"
                >
                  <div className="relative px-2.5 py-1 rounded-full transition-colors flex items-center justify-center">
                    {activeTab === 'reminders' && (
                      <motion.div
                        layoutId="activeTabPill"
                        className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-[#4F378B]' : 'bg-[#EADDFF]'}`}
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Clock className={`w-3.5 h-3.5 relative z-10 ${
                      activeTab === 'reminders' 
                        ? isDarkMode ? 'text-[#EADDFF]' : 'text-[#21005D]' 
                        : isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'
                    }`} />
                  </div>
                  <span className={activeTab === 'reminders' ? isDarkMode ? 'font-bold text-[#E6E0E9]' : 'font-bold text-[#1C1B1F]' : isDarkMode ? 'text-[#CAC4D0]' : ''}>Reminders</span>
                </button>

                <button 
                  onClick={() => setActiveTab('vault')}
                  className="flex flex-col items-center gap-1 text-[8.5px] font-semibold flex-1"
                >
                  <div className="relative px-2.5 py-1 rounded-full transition-colors flex items-center justify-center">
                    {activeTab === 'vault' && (
                      <motion.div
                        layoutId="activeTabPill"
                        className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-[#4F378B]' : 'bg-[#EADDFF]'}`}
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Folder className={`w-3.5 h-3.5 relative z-10 ${
                      activeTab === 'vault' 
                        ? isDarkMode ? 'text-[#EADDFF]' : 'text-[#21005D]' 
                        : isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'
                    }`} />
                  </div>
                  <span className={activeTab === 'vault' ? isDarkMode ? 'font-bold text-[#E6E0E9]' : 'font-bold text-[#1C1B1F]' : isDarkMode ? 'text-[#CAC4D0]' : ''}>Vault</span>
                </button>

                <button 
                  onClick={() => setActiveTab('reports')}
                  className="flex flex-col items-center gap-1 text-[8.5px] font-semibold flex-1"
                >
                  <div className="relative px-2.5 py-1 rounded-full transition-colors flex items-center justify-center">
                    {activeTab === 'reports' && (
                      <motion.div
                        layoutId="activeTabPill"
                        className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-[#4F378B]' : 'bg-[#EADDFF]'}`}
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <FileSpreadsheet className={`w-3.5 h-3.5 relative z-10 ${
                      activeTab === 'reports' 
                        ? isDarkMode ? 'text-[#EADDFF]' : 'text-[#21005D]' 
                        : isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'
                    }`} />
                  </div>
                  <span className={activeTab === 'reports' ? isDarkMode ? 'font-bold text-[#E6E0E9]' : 'font-bold text-[#1C1B1F]' : isDarkMode ? 'text-[#CAC4D0]' : ''}>Reports</span>
                </button>
              </div>

            </div>

            {/* Simulated Android Navigation pill bar */}
            <div className={`w-full flex justify-center py-2 select-none z-40 transition-colors ${
              isDarkMode ? 'bg-[#211F26]' : 'bg-[#F3EDF7]'
            }`}>
              <div className="w-24 h-1 bg-[#79747E] rounded-full"></div>
            </div>

          </div>

        </div>
      </div>

      {/* RIGHT PANEL: Flutter Production Code Explorer & Exporter */}
      <div className={`p-4 md:p-6 lg:p-8 flex flex-col transition-all duration-300 ${
        isDarkMode ? 'bg-[#1D1B20] border-[#36343B] text-[#E6E0E9]' : 'bg-[#F3EDF7] border-[#CAC4D0] text-[#1C1B1F]'
      } ${
        isFlutterSidebarOpen ? 'w-full md:w-[45%] lg:w-[42%]' : 'w-full md:w-16'
      } overflow-y-auto shrink-0 border-t md:border-t-0 md:border-l border-[#CAC4D0]`}>
        
        {isFlutterSidebarOpen ? (
          <div className="flex-1 flex flex-col h-full min-w-0">
            
            {/* Header / Collapse control */}
            <div className="flex items-center justify-between border-b border-[#CAC4D0] pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#EADDFF] text-[#21005D] border border-[#CAC4D0]">
                  <FileCode className="w-5 h-5 text-[#6750A4]" />
                </div>
                <div>
                  <h2 className="text-md font-bold text-[#1C1B1F] flex items-center gap-1.5 leading-tight">
                    Flutter MVVM Exporter
                  </h2>
                  <p className="text-[#49454F] text-xs mt-0.5 font-medium">Production-ready Android code</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFlutterSidebarOpen(false)}
                className="p-1.5 rounded hover:bg-[#E8DEF8] text-[#49454F] hover:text-[#1C1B1F] transition-colors hidden md:block"
                title="Collapse Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Description */}
            <p className="text-[#49454F] text-xs leading-relaxed mb-4">
              This panel generates the <strong>complete ready-to-use Flutter MVVM structure</strong> supporting speech inputs, file receipt parsing, and beautiful Material 3 cards. Drag/drop, copy individual files, or compile.
            </p>

            {/* Code Exporter layout */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#1C1B1F] rounded-xl border border-[#CAC4D0] overflow-hidden">
              
              {/* Flutter Files Navigation */}
              <div className="bg-[#F3EDF7] px-3 py-2 border-b border-[#CAC4D0] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                {flutterProjectFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      selectedFile.path === file.path
                        ? 'bg-white text-[#6750A4] border border-[#CAC4D0] shadow-sm'
                        : 'text-[#49454F] hover:text-[#1C1B1F] hover:bg-[#E8DEF8]/50'
                    }`}
                  >
                    {file.path.endsWith('.yaml') ? (
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-[#6750A4]" />
                    )}
                    {file.path.split('/').pop()}
                  </button>
                ))}
              </div>

              {/* Code Viewer Panel Header */}
              <div className="px-4 py-2 bg-[#F7F2FA] border-b border-[#CAC4D0] flex justify-between items-center text-xs text-[#49454F] font-mono shrink-0">
                <span className="truncate">📁 {selectedFile.path}</span>
                <button
                  onClick={() => copyToClipboard(selectedFile)}
                  className="bg-white hover:bg-[#E8DEF8] text-[#49454F] px-2.5 py-1.5 rounded border border-[#CAC4D0] flex items-center gap-1 transition-all"
                >
                  {copiedFile === selectedFile.path ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Box Area */}
              <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed bg-[#1C1B1F] select-text">
                <pre className="whitespace-pre">
                  <code>{selectedFile.content}</code>
                </pre>
              </div>

            </div>

            {/* Quick Flutter setup guide */}
            <div className="mt-4 bg-[#EADDFF] p-3 rounded-xl border border-[#CAC4D0] shrink-0 text-xs text-[#21005D]">
              <span className="font-bold text-[#21005D] block mb-1">🚀 How to Run this Flutter App:</span>
              <ol className="list-decimal pl-4 space-y-1 text-[#49454F]">
                <li>Create a clean Flutter app: <code className="bg-white px-1 rounded text-[#6750A4] font-mono">flutter create ai_assistant</code></li>
                <li>Add the dependencies from <code className="bg-white px-1 rounded text-[#6750A4] font-mono">pubspec.yaml</code> and run <code className="bg-white px-1 rounded text-[#6750A4] font-mono">flutter pub get</code>.</li>
                <li>Copy the lib folder files matching the architecture above.</li>
                <li>Insert your Gemini API key in <code className="bg-white px-1 rounded text-[#6750A4] font-mono">lib/main.dart</code> and launch!</li>
              </ol>
            </div>

          </div>
        ) : (
          /* Collapsed sidebar mode */
          <div className="flex flex-col items-center gap-4 py-4 shrink-0 h-full justify-between">
            <button 
              onClick={() => setIsFlutterSidebarOpen(true)}
              className="p-2 rounded-xl bg-white text-[#6750A4] border border-[#CAC4D0] hover:bg-[#E8DEF8] transition-all shadow-sm"
              title="Expand Flutter Code"
            >
              <FileCode className="w-5 h-5" />
            </button>
            <div className="text-[10px] text-[#49454F] font-mono font-bold tracking-widest uppercase vertical-text origin-center select-none">
              Flutter Code Exporter
            </div>
          </div>
        )}

      </div>

      {/* DOCUMENT LOADING & SCANNING OVERLAY MODAL */}
      {isUploading && (
        <div className="fixed inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
          <div className="bg-white p-6 rounded-3xl border border-[#CAC4D0] text-center max-w-sm w-full shadow-2xl space-y-4">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-[#EADDFF] border-t-[#6750A4] animate-spin"></span>
              <Upload className="w-6 h-6 text-[#6750A4] animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1C1B1F]">Scanning Document</h3>
              <p className="text-[#49454F] text-sm mt-1.5 font-medium">{uploadProgressMsg}</p>
            </div>
            <div className="w-full bg-[#F3EDF7] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#6750A4] h-full w-2/3 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* EXTRACTED DOCUMENT REPORT MODAL */}
      {parsedDocResult && (
        <div className="fixed inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
          <div className="bg-white p-6 rounded-3xl border border-[#CAC4D0] text-left max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#CAC4D0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#6750A4]" />
                <h3 className="text-base font-bold text-[#1C1B1F]">AI Document Scan Completed</h3>
              </div>
              <button 
                onClick={() => setParsedDocResult(null)}
                className="text-[#49454F] hover:text-[#1C1B1F] p-1 rounded hover:bg-[#E8DEF8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#CAC4D0]/40 pb-2">
                <span className="text-[#49454F]">File Analyzed:</span>
                <span className="text-[#1C1B1F] font-mono font-semibold">{parsedDocResult.fileName}</span>
              </div>
              <div className="flex justify-between border-b border-[#CAC4D0]/40 pb-2">
                <span className="text-[#49454F]">Extracted Document Category:</span>
                <span className="px-2 py-0.5 rounded bg-[#EADDFF] text-[#21005D] font-bold uppercase">{parsedDocResult.extracted.documentType}</span>
              </div>
              <div className="flex justify-between border-b border-[#CAC4D0]/40 pb-2">
                <span className="text-[#49454F]">Extracted Vehicle:</span>
                <span className="text-[#1C1B1F] font-mono bg-[#F3EDF7] px-2 py-0.5 rounded border border-[#CAC4D0]">{parsedDocResult.extracted.plateNumber}</span>
              </div>
              <div className="flex justify-between border-b border-[#CAC4D0]/40 pb-2">
                <span className="text-[#49454F]">Extracted Amount:</span>
                <span className="text-[#1B5E20] font-bold font-mono">Rs. {Number(parsedDocResult.extracted.amount).toLocaleString('en-IN')}</span>
              </div>
              {parsedDocResult.extracted.liters && (
                <div className="flex justify-between border-b border-[#CAC4D0]/40 pb-2">
                  <span className="text-[#49454F]">Extracted Fuel Liters:</span>
                  <span className="text-[#1C1B1F] font-semibold font-mono">{parsedDocResult.extracted.liters} Liters</span>
                </div>
              )}
              <div className="flex justify-between border-b border-[#CAC4D0]/40 pb-2">
                <span className="text-[#49454F]">Date:</span>
                <span className="text-[#1C1B1F] font-mono">{parsedDocResult.extracted.date}</span>
              </div>
              <div className="flex justify-between border-b border-[#CAC4D0]/40 pb-2">
                <span className="text-[#49454F]">Provider:</span>
                <span className="text-[#1C1B1F] font-semibold">{parsedDocResult.extracted.provider || "Unknown"}</span>
              </div>
              <div>
                <span className="text-[#49454F] block mb-1">Details:</span>
                <p className="bg-[#F3EDF7] p-2 rounded text-[#1C1B1F] border border-[#CAC4D0] leading-normal">{parsedDocResult.message}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#CAC4D0] flex justify-end">
              <button 
                onClick={() => setParsedDocResult(null)}
                className="bg-[#6750A4] hover:bg-[#523E87] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* LOW CONFIDENCE REVIEW & VERIFICATION MODAL */}
      {lowConfidenceDoc && (
        <div className="fixed inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
          <div className="bg-white p-6 rounded-3xl border border-[#CAC4D0] text-left max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#CAC4D0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1B1F]">Verify Extracted Information</h3>
                  <p className="text-[10px] text-amber-600 font-semibold">AI Extraction Confidence Low ({Math.round(lowConfidenceDoc.confidenceScore * 100)}%)</p>
                </div>
              </div>
              <button 
                onClick={() => setLowConfidenceDoc(null)}
                className="text-[#49454F] hover:text-[#1C1B1F] p-1 rounded hover:bg-[#E8DEF8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#49454F] leading-normal bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
              We detected a scan of <strong className="text-amber-800">{lowConfidenceDoc.fileName}</strong>, but some details might be unclear or require human verification. Please inspect and correct the fields below before finalizing.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[#49454F] font-bold mb-1">Document Category</label>
                <select
                  value={verificationForm.documentType}
                  onChange={(e) => setVerificationForm(p => ({ ...p, documentType: e.target.value }))}
                  className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                >
                  <option value="FUEL">Fuel Bills</option>
                  <option value="SERVICE">Service Bills</option>
                  <option value="TYRE">Tyre Bills</option>
                  <option value="BATTERY">Battery Bills</option>
                  <option value="INSURANCE">Insurance PDF</option>
                  <option value="RC">RC (Registration Certificate)</option>
                  <option value="FITNESS">Fitness Certificate</option>
                  <option value="LICENSE">Driving License</option>
                  <option value="SALARY">Salary Receipt</option>
                  <option value="OTHER">Other / Miscellaneous</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[#49454F] font-bold mb-1">Vehicle Plate No.</label>
                <select
                  value={verificationForm.plateNumber}
                  onChange={(e) => setVerificationForm(p => ({ ...p, plateNumber: e.target.value }))}
                  className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                >
                  {fleet.vehicles.map(v => (
                    <option key={v.plateNumber} value={v.plateNumber}>{v.plateNumber} ({v.name})</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[#49454F] font-bold mb-1">Transaction/Issue Date</label>
                <input
                  type="date"
                  value={verificationForm.date}
                  onChange={(e) => setVerificationForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[#49454F] font-bold mb-1">Expiry Date (if applicable)</label>
                <input
                  type="date"
                  value={verificationForm.expiryDate}
                  onChange={(e) => setVerificationForm(p => ({ ...p, expiryDate: e.target.value }))}
                  className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[#49454F] font-bold mb-1">Vendor / Provider</label>
                <input
                  type="text"
                  placeholder="e.g. Bharat Petroleum"
                  value={verificationForm.vendor}
                  onChange={(e) => setVerificationForm(p => ({ ...p, vendor: e.target.value }))}
                  className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[#49454F] font-bold mb-1">Total Amount (Rs.)</label>
                <input
                  type="number"
                  value={verificationForm.amount}
                  onChange={(e) => setVerificationForm(p => ({ ...p, amount: Number(e.target.value) }))}
                  className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[#49454F] font-bold mb-1">GST / Tax Info</label>
                <input
                  type="text"
                  placeholder="e.g. 33AAAAA1111A1Z1"
                  value={verificationForm.gst}
                  onChange={(e) => setVerificationForm(p => ({ ...p, gst: e.target.value }))}
                  className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[#49454F] font-bold mb-1">Invoice / Receipt No.</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-99"
                  value={verificationForm.invoiceNumber}
                  onChange={(e) => setVerificationForm(p => ({ ...p, invoiceNumber: e.target.value }))}
                  className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[#49454F] font-bold mb-1">Driver Name (if listed)</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={verificationForm.driverName}
                  onChange={(e) => setVerificationForm(p => ({ ...p, driverName: e.target.value }))}
                  className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                />
              </div>

              {verificationForm.documentType === "FUEL" && (
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[#49454F] font-bold mb-1">Fuel Quantity (Liters)</label>
                  <input
                    type="number"
                    value={verificationForm.fuelQuantity}
                    onChange={(e) => setVerificationForm(p => ({ ...p, fuelQuantity: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                  />
                </div>
              )}

              {["SERVICE", "TYRE", "BATTERY", "RC"].includes(verificationForm.documentType) && (
                <div className="col-span-2">
                  <label className="block text-[#49454F] font-bold mb-1">Service & Repair Details</label>
                  <textarea
                    rows={2}
                    placeholder="Describe maintenance or service done..."
                    value={verificationForm.serviceDetails}
                    onChange={(e) => setVerificationForm(p => ({ ...p, serviceDetails: e.target.value }))}
                    className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                  />
                </div>
              )}

              {verificationForm.documentType === "INSURANCE" && (
                <div className="col-span-2">
                  <label className="block text-[#49454F] font-bold mb-1">Insurance Coverage Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Third Party Coverage with Nil Depreciation"
                    value={verificationForm.insuranceDetails}
                    onChange={(e) => setVerificationForm(p => ({ ...p, insuranceDetails: e.target.value }))}
                    className="w-full bg-white border border-[#CAC4D0] rounded-lg p-2 text-[#1C1B1F] focus:ring-1 focus:ring-[#6750A4]"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#CAC4D0] flex justify-end gap-2">
              <button 
                onClick={() => setLowConfidenceDoc(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 text-[#49454F] transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDocument}
                className="bg-[#6750A4] hover:bg-[#523E87] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Confirm & Save to Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE WORKER OFFLINE SYNC QUEUE MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
          <div className={`p-6 rounded-3xl border text-left max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-colors ${
            isDarkMode 
              ? 'bg-[#211F26] border-[#49454F] text-[#E6E0E9]' 
              : 'bg-white border-[#CAC4D0] text-[#1C1B1F]'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-[#CAC4D0]/30">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold ${
                  isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Service Worker Offline Sync Queue</h3>
                  <p className={`text-[11px] font-medium ${isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'}`}>
                    IndexedDB Persistent Storage & Auto-Sync Engine
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSyncModal(false)}
                className={`p-1.5 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-[#36343B] text-[#E6E0E9]' : 'hover:bg-[#E8DEF8] text-[#1C1B1F]'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Offline Simulator Controls */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${
              isDarkMode ? 'bg-[#2B2930] border-[#49454F]' : 'bg-[#F3EDF7] border-[#CAC4D0]'
            }`}>
              <div className="flex items-center gap-2">
                {isOffline ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
                <div>
                  <div className="text-xs font-bold">
                    Network Status: {isOffline ? "⚡ OFFLINE" : "🌐 ONLINE"}
                  </div>
                  <div className="text-[10px] opacity-70">
                    {isSimulatedOffline ? "Simulated Offline Mode Enabled" : "Connected to Backend API"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleSimulatedOffline(!isSimulatedOffline)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isSimulatedOffline 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {isSimulatedOffline ? "Restore Online" : "Simulate Offline"}
              </button>
            </div>

            {/* Sync Progress Indicator */}
            {isSyncingQueue && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-xs flex items-center gap-2 text-indigo-400 font-medium animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>{syncProgressMsg || "Synchronizing with PostgreSQL database..."}</span>
              </div>
            )}

            {/* Pending List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold px-1">
                <span>Cached Pending Submissions ({pendingSyncItems.length})</span>
                {pendingSyncItems.length > 0 && (
                  <button 
                    onClick={handleClearQueue}
                    className="text-red-400 hover:text-red-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Queue
                  </button>
                )}
              </div>

              {pendingSyncItems.length === 0 ? (
                <div className={`p-6 text-center rounded-2xl border border-dashed text-xs ${
                  isDarkMode ? 'border-[#49454F] text-[#CAC4D0]' : 'border-[#CAC4D0] text-[#49454F]'
                }`}>
                  <Check className="w-8 h-8 mx-auto mb-1.5 text-emerald-500" />
                  <p className="font-bold text-sm">All Items Synchronized</p>
                  <p className="text-[11px] mt-0.5">Document uploads and expense log submissions will automatically queue here when mobile device is offline.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {pendingSyncItems.map(item => (
                    <div 
                      key={item.id}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-colors ${
                        isDarkMode ? 'bg-[#2B2930] border-[#49454F]' : 'bg-[#F7F2FA] border-[#CAC4D0]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          item.type === 'DOCUMENT_UPLOAD' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {item.type === 'DOCUMENT_UPLOAD' ? <CloudUpload className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs leading-tight">{item.title}</div>
                          <div className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5 font-mono">
                            <Clock className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleTimeString()} · {item.type}
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Queued
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#CAC4D0]/30 flex items-center justify-end gap-2">
              <button 
                onClick={() => setShowSyncModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isDarkMode ? 'hover:bg-[#36343B] text-[#CAC4D0]' : 'hover:bg-[#E8DEF8] text-[#49454F]'
                }`}
              >
                Close
              </button>
              
              <button 
                disabled={isSyncingQueue || pendingSyncItems.length === 0}
                onClick={handleManualSync}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-all ${
                  isSyncingQueue || pendingSyncItems.length === 0
                    ? 'bg-gray-500 opacity-50 cursor-not-allowed'
                    : isDarkMode ? 'bg-[#D0BCFF] text-[#381E72] hover:bg-[#E8DEF8]' : 'bg-[#6750A4] hover:bg-[#523E87]'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingQueue ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
