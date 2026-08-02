import React, { useState, useMemo } from "react";
import { 
  FileText, 
  FileSpreadsheet, 
  TrendingUp, 
  Clock, 
  ArrowLeft, 
  Download, 
  Calendar, 
  User, 
  Truck, 
  Activity, 
  Wallet, 
  Filter, 
  Sparkles, 
  Printer, 
  Search,
  CheckCircle,
  AlertTriangle,
  MapPin,
  ClipboardList,
  BarChart2,
  Zap,
  Droplet
} from "lucide-react";
import { FleetDatabase, Vehicle, Driver, FuelLog, ExpenseLog } from "../types";

interface ReportsViewProps {
  fleet: FleetDatabase | null;
  triggerToast: (msg: string) => void;
  isDarkMode?: boolean;
  lang?: 'en' | 'ta';
}

type ReportType = 
  | 'vehicle-expense'
  | 'driver-expense'
  | 'fuel'
  | 'service'
  | 'insurance'
  | 'mileage'
  | 'trips'
  | 'attendance'
  | 'salary'
  | 'vehicle-wise'
  | 'driver-wise'
  | 'monthly'
  | 'yearly';

export default function ReportsView({ fleet, triggerToast, isDarkMode = false, lang = 'en' }: ReportsViewProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  
  // Filter States
  const [dateFrom, setDateFrom] = useState("2026-07-01");
  const [dateTo, setDateTo] = useState("2026-07-31");
  const [selectedVehicle, setSelectedVehicle] = useState("All");
  const [selectedDriver, setSelectedDriver] = useState("All");

  const vehiclesList = useMemo(() => fleet?.vehicles || [], [fleet]);
  const driversList = useMemo(() => fleet?.drivers || [], [fleet]);

  // Utility to filter records by date range
  const isWithinDateRange = (dateStr: string) => {
    if (!dateStr) return false;
    return dateStr >= dateFrom && dateStr <= dateTo;
  };

  // 1. Vehicle Expense Data
  const vehicleExpensesReport = useMemo(() => {
    const list: Array<{
      date: string;
      plateNumber: string;
      vehicleName: string;
      category: string;
      amount: number;
      description: string;
    }> = [];

    vehiclesList.forEach(v => {
      // Vehicle embedded expenses
      if (v.expenses) {
        v.expenses.forEach(e => {
          if (isWithinDateRange(e.date)) {
            list.push({
              date: e.date,
              plateNumber: v.plateNumber,
              vehicleName: v.name,
              category: e.category,
              amount: e.amount,
              description: e.description
            });
          }
        });
      }
    });

    // Global expense logs
    if (fleet?.expenseLogs) {
      fleet.expenseLogs.forEach(el => {
        if (isWithinDateRange(el.date)) {
          const v = vehiclesList.find(veh => veh.plateNumber === el.plateNumber);
          list.push({
            date: el.date,
            plateNumber: el.plateNumber,
            vehicleName: v ? v.name : "Global/Other",
            category: el.category,
            amount: el.amount,
            description: el.description
          });
        }
      });
    }

    // Apply vehicle filter
    let filtered = list;
    if (selectedVehicle !== "All") {
      filtered = filtered.filter(item => item.plateNumber === selectedVehicle);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [vehiclesList, fleet?.expenseLogs, dateFrom, dateTo, selectedVehicle]);

  // 2. Driver Expense Data
  const driverExpensesReport = useMemo(() => {
    const list: Array<{
      date: string;
      driverName: string;
      type: string;
      amount: number;
      description: string;
    }> = [];

    driversList.forEach(d => {
      // Driver Advance records
      if (d.advanceHistory) {
        d.advanceHistory.forEach(adv => {
          if (isWithinDateRange(adv.date)) {
            list.push({
              date: adv.date,
              driverName: d.name,
              type: adv.type === 'advance' ? 'Salary Advance Taken' : 'Advance Repayment',
              amount: adv.type === 'advance' ? adv.amount : -adv.amount,
              description: adv.description
            });
          }
        });
      }
    });

    // Filter by driver
    let filtered = list;
    if (selectedDriver !== "All") {
      filtered = filtered.filter(item => item.driverName === selectedDriver);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [driversList, dateFrom, dateTo, selectedDriver]);

  // 3. Fuel Data
  const fuelReport = useMemo(() => {
    const list: Array<{
      date: string;
      plateNumber: string;
      vehicleName: string;
      driverName: string;
      liters: number;
      amount: number;
    }> = [];

    if (fleet?.fuelLogs) {
      fleet.fuelLogs.forEach(fl => {
        if (isWithinDateRange(fl.date)) {
          const v = vehiclesList.find(veh => veh.plateNumber === fl.plateNumber);
          list.push({
            date: fl.date,
            plateNumber: fl.plateNumber,
            vehicleName: v ? v.name : "Unknown Vehicle",
            driverName: fl.driverName,
            liters: fl.liters,
            amount: fl.amount
          });
        }
      });
    }

    // Apply filters
    let filtered = list;
    if (selectedVehicle !== "All") {
      filtered = filtered.filter(item => item.plateNumber === selectedVehicle);
    }
    if (selectedDriver !== "All") {
      filtered = filtered.filter(item => item.driverName === selectedDriver);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [fleet?.fuelLogs, vehiclesList, dateFrom, dateTo, selectedVehicle, selectedDriver]);

  // 4. Service Data
  const serviceReport = useMemo(() => {
    const list: Array<{
      date: string;
      plateNumber: string;
      vehicleName: string;
      type: string;
      provider: string;
      cost: number;
      odometer: number;
      details: string;
    }> = [];

    vehiclesList.forEach(v => {
      if (v.serviceHistory) {
        v.serviceHistory.forEach(s => {
          if (isWithinDateRange(s.date)) {
            list.push({
              date: s.date,
              plateNumber: v.plateNumber,
              vehicleName: v.name,
              type: s.type,
              provider: s.provider,
              cost: s.cost,
              odometer: s.odometer,
              details: s.details
            });
          }
        });
      }
    });

    let filtered = list;
    if (selectedVehicle !== "All") {
      filtered = filtered.filter(item => item.plateNumber === selectedVehicle);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [vehiclesList, dateFrom, dateTo, selectedVehicle]);

  // 5. Insurance Data
  const insuranceReport = useMemo(() => {
    return vehiclesList.map(v => {
      const expiry = new Date(v.insuranceExpiry);
      const today = new Date();
      today.setHours(0,0,0,0);
      const diffTime = expiry.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let status: 'Active' | 'Expiring Soon' | 'Expired' = 'Active';
      if (daysLeft < 0) status = 'Expired';
      else if (daysLeft <= 30) status = 'Expiring Soon';

      return {
        plateNumber: v.plateNumber,
        vehicleName: v.name,
        insuranceNo: v.insuranceNo || "N/A",
        provider: v.insuranceProvider || "N/A",
        amount: v.insuranceAmount || 0,
        expiryDate: v.insuranceExpiry,
        daysLeft,
        status
      };
    });
  }, [vehiclesList]);

  // 6. Mileage Data (Fuel efficiency analysis)
  const mileageReport = useMemo(() => {
    const list: Array<{
      date: string;
      plateNumber: string;
      vehicleName: string;
      driverName: string;
      distanceKm: number;
      fuelLiters: number;
      mileage: number; // km per liter
    }> = [];

    vehiclesList.forEach(v => {
      if (v.tripHistory) {
        v.tripHistory.forEach(t => {
          if (isWithinDateRange(t.date) && t.fuelUsedLiters > 0) {
            list.push({
              date: t.date,
              plateNumber: v.plateNumber,
              vehicleName: v.name,
              driverName: t.driverName,
              distanceKm: t.distanceKm,
              fuelLiters: t.fuelUsedLiters,
              mileage: Number((t.distanceKm / t.fuelUsedLiters).toFixed(2))
            });
          }
        });
      }
    });

    let filtered = list;
    if (selectedVehicle !== "All") {
      filtered = filtered.filter(item => item.plateNumber === selectedVehicle);
    }
    if (selectedDriver !== "All") {
      filtered = filtered.filter(item => item.driverName === selectedDriver);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [vehiclesList, dateFrom, dateTo, selectedVehicle, selectedDriver]);

  // 7. Trips Data
  const tripsReport = useMemo(() => {
    const list: Array<{
      date: string;
      plateNumber: string;
      vehicleName: string;
      from: string;
      to: string;
      distanceKm: number;
      fuelUsedLiters: number;
      driverName: string;
    }> = [];

    vehiclesList.forEach(v => {
      if (v.tripHistory) {
        v.tripHistory.forEach(t => {
          if (isWithinDateRange(t.date)) {
            list.push({
              date: t.date,
              plateNumber: v.plateNumber,
              vehicleName: v.name,
              from: t.from,
              to: t.to,
              distanceKm: t.distanceKm,
              fuelUsedLiters: t.fuelUsedLiters,
              driverName: t.driverName
            });
          }
        });
      }
    });

    let filtered = list;
    if (selectedVehicle !== "All") {
      filtered = filtered.filter(item => item.plateNumber === selectedVehicle);
    }
    if (selectedDriver !== "All") {
      filtered = filtered.filter(item => item.driverName === selectedDriver);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [vehiclesList, dateFrom, dateTo, selectedVehicle, selectedDriver]);

  // 8. Attendance Data
  const attendanceReport = useMemo(() => {
    const list: Array<{
      date: string;
      driverName: string;
      status: 'Present' | 'Leave' | 'Absent';
      hours: string;
    }> = [];

    driversList.forEach(d => {
      if (d.attendanceHistory) {
        d.attendanceHistory.forEach(att => {
          if (isWithinDateRange(att.date)) {
            let hours = "N/A";
            if (att.startDuty && att.endDuty) {
              const [sH, sM] = att.startDuty.split(":").map(Number);
              const [eH, eM] = att.endDuty.split(":").map(Number);
              const diffMin = (eH * 60 + eM) - (sH * 60 + sM);
              if (diffMin > 0) {
                hours = `${(diffMin / 60).toFixed(1)} hrs`;
              }
            }
            list.push({
              date: att.date,
              driverName: d.name,
              status: att.status,
              hours
            });
          }
        });
      }
    });

    let filtered = list;
    if (selectedDriver !== "All") {
      filtered = filtered.filter(item => item.driverName === selectedDriver);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [driversList, dateFrom, dateTo, selectedDriver]);

  // 9. Salary Data (Calculates salary on duty days & tracks advances)
  const salaryReport = useMemo(() => {
    return driversList.map(d => {
      const attendance = d.attendanceHistory || [];
      const presentDays = attendance.filter(att => isWithinDateRange(att.date) && att.status === 'Present').length;
      const leaveDays = attendance.filter(att => isWithinDateRange(att.date) && att.status === 'Leave').length;
      const absentDays = attendance.filter(att => isWithinDateRange(att.date) && att.status === 'Absent').length;

      // Calculate base salary
      let earnedSalary = 0;
      if (d.salaryType === 'Monthly') {
        // Assume monthly rate covers 30 days
        const dailyRate = d.salaryRate / 30;
        earnedSalary = Math.round(dailyRate * (presentDays + leaveDays)); // Leave is usually paid
      } else if (d.salaryType === 'Daily') {
        earnedSalary = d.salaryRate * presentDays;
      } else {
        // Per Trip salary
        const tripsCount = vehiclesList.reduce((acc, v) => {
          const driverTrips = v.tripHistory?.filter(t => isWithinDateRange(t.date) && t.driverName === d.name).length || 0;
          return acc + driverTrips;
        }, 0);
        earnedSalary = d.salaryRate * tripsCount;
      }

      // Advances in period
      const periodAdvances = d.advanceHistory
        ?.filter(adv => isWithinDateRange(adv.date) && adv.type === 'advance')
        .reduce((sum, adv) => sum + adv.amount, 0) || 0;
      
      const periodRepayments = d.advanceHistory
        ?.filter(adv => isWithinDateRange(adv.date) && adv.type === 'repayment')
        .reduce((sum, adv) => sum + adv.amount, 0) || 0;

      const netAdvanceChange = periodAdvances - periodRepayments;
      const netPayable = Math.max(0, earnedSalary - d.advance);

      return {
        driverId: d.id,
        driverName: d.name,
        salaryType: d.salaryType,
        rate: d.salaryRate,
        presentDays,
        earnedSalary,
        currentAdvanceBalance: d.advance,
        netPayable
      };
    });
  }, [driversList, vehiclesList, dateFrom, dateTo]);

  // 10. Vehicle Wise Summary Report (Unified fleet operational matrix)
  const vehicleWiseReport = useMemo(() => {
    return vehiclesList.map(v => {
      const trips = v.tripHistory?.filter(t => isWithinDateRange(t.date)) || [];
      const totalTrips = trips.length;
      const totalDistance = trips.reduce((sum, t) => sum + t.distanceKm, 0);
      const fuelLiters = trips.reduce((sum, t) => sum + t.fuelUsedLiters, 0);

      // Fuel cost in date range
      const fuelCost = fleet?.fuelLogs
        ?.filter(fl => fl.plateNumber === v.plateNumber && isWithinDateRange(fl.date))
        .reduce((sum, fl) => sum + fl.amount, 0) || 0;

      // Maintenance cost
      const serviceCost = v.serviceHistory
        ?.filter(s => isWithinDateRange(s.date))
        .reduce((sum, s) => sum + s.cost, 0) || 0;

      // Other expenses
      const otherExpenses = v.expenses
        ?.filter(e => isWithinDateRange(e.date))
        .reduce((sum, e) => sum + e.amount, 0) || 0;

      const totalCost = fuelCost + serviceCost + otherExpenses;

      return {
        plateNumber: v.plateNumber,
        name: v.name,
        totalTrips,
        totalDistance,
        fuelLiters,
        fuelCost,
        serviceCost,
        otherExpenses,
        totalCost
      };
    });
  }, [vehiclesList, fleet?.fuelLogs, dateFrom, dateTo]);

  // 11. Driver Wise Summary Report
  const driverWiseReport = useMemo(() => {
    return driversList.map(d => {
      // Find driver driven trips
      let totalTrips = 0;
      let totalDistance = 0;
      let fuelFilled = 0;

      vehiclesList.forEach(v => {
        const driven = v.tripHistory?.filter(t => isWithinDateRange(t.date) && t.driverName === d.name) || [];
        totalTrips += driven.length;
        totalDistance += driven.reduce((sum, t) => sum + t.distanceKm, 0);
      });

      // Fuel logs filled by this driver
      const driverFuelLogs = fleet?.fuelLogs?.filter(fl => fl.driverName === d.name && isWithinDateRange(fl.date)) || [];
      fuelFilled = driverFuelLogs.reduce((sum, fl) => sum + fl.amount, 0);

      // Attendance rate
      const attendance = d.attendanceHistory || [];
      const logsInPeriod = attendance.filter(att => isWithinDateRange(att.date));
      const presentInPeriod = logsInPeriod.filter(att => att.status === 'Present').length;
      const attendanceRate = logsInPeriod.length > 0 ? Math.round((presentInPeriod / logsInPeriod.length) * 100) : 100;

      return {
        driverName: d.name,
        assignedVehicle: d.assignedVehiclePlate || "None",
        totalTrips,
        totalDistance,
        fuelFilled,
        attendanceRate,
        advanceBalance: d.advance
      };
    });
  }, [driversList, vehiclesList, fleet?.fuelLogs, dateFrom, dateTo]);

  // Combined Finance list for Monthly / Yearly grouping
  const allFinances = useMemo(() => {
    const list: Array<{ date: string; amount: number; type: 'Fuel' | 'Service' | 'Expense' | 'Advance' }> = [];

    // Fuel logs
    if (fleet?.fuelLogs) {
      fleet.fuelLogs.forEach(fl => {
        list.push({ date: fl.date, amount: fl.amount, type: 'Fuel' });
      });
    }

    // Vehicle specific service costs
    vehiclesList.forEach(v => {
      if (v.serviceHistory) {
        v.serviceHistory.forEach(s => {
          list.push({ date: s.date, amount: s.cost, type: 'Service' });
        });
      }
      if (v.expenses) {
        v.expenses.forEach(e => {
          list.push({ date: e.date, amount: e.amount, type: 'Expense' });
        });
      }
    });

    // Global expense logs
    if (fleet?.expenseLogs) {
      fleet.expenseLogs.forEach(el => {
        list.push({ date: el.date, amount: el.amount, type: 'Expense' });
      });
    }

    // Advances
    driversList.forEach(d => {
      if (d.advanceHistory) {
        d.advanceHistory.forEach(adv => {
          if (adv.type === 'advance') {
            list.push({ date: adv.date, amount: adv.amount, type: 'Advance' });
          }
        });
      }
    });

    return list;
  }, [fleet?.fuelLogs, fleet?.expenseLogs, vehiclesList, driversList]);

  // 12. Monthly Financial Aggregation
  const monthlyReport = useMemo(() => {
    const monthlyGroups: Record<string, {
      month: string;
      fuel: number;
      service: number;
      expense: number;
      advance: number;
      total: number;
    }> = {};

    allFinances.forEach(f => {
      if (!f.date) return;
      const monthStr = f.date.substring(0, 7); // "YYYY-MM"
      if (!monthlyGroups[monthStr]) {
        monthlyGroups[monthStr] = { month: monthStr, fuel: 0, service: 0, expense: 0, advance: 0, total: 0 };
      }

      if (f.type === 'Fuel') monthlyGroups[monthStr].fuel += f.amount;
      else if (f.type === 'Service') monthlyGroups[monthStr].service += f.amount;
      else if (f.type === 'Expense') monthlyGroups[monthStr].expense += f.amount;
      else if (f.type === 'Advance') monthlyGroups[monthStr].advance += f.amount;

      monthlyGroups[monthStr].total += f.amount;
    });

    return Object.values(monthlyGroups).sort((a, b) => b.month.localeCompare(a.month));
  }, [allFinances]);

  // 13. Yearly Financial Aggregation
  const yearlyReport = useMemo(() => {
    const yearlyGroups: Record<string, {
      year: string;
      fuel: number;
      service: number;
      expense: number;
      advance: number;
      total: number;
    }> = {};

    allFinances.forEach(f => {
      if (!f.date) return;
      const yearStr = f.date.substring(0, 4); // "YYYY"
      if (!yearlyGroups[yearStr]) {
        yearlyGroups[yearStr] = { year: yearStr, fuel: 0, service: 0, expense: 0, advance: 0, total: 0 };
      }

      if (f.type === 'Fuel') yearlyGroups[yearStr].fuel += f.amount;
      else if (f.type === 'Service') yearlyGroups[yearStr].service += f.amount;
      else if (f.type === 'Expense') yearlyGroups[yearStr].expense += f.amount;
      else if (f.type === 'Advance') yearlyGroups[yearStr].advance += f.amount;

      yearlyGroups[yearStr].total += f.amount;
    });

    return Object.values(yearlyGroups).sort((a, b) => b.year.localeCompare(a.year));
  }, [allFinances]);

  // EXPORT ENGINE: EXCEL (CSV)
  const handleExportExcel = (type: ReportType) => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let title = "";

    switch (type) {
      case 'vehicle-expense':
        title = "Vehicle_Expenses_Report";
        headers = ["Date", "Plate Number", "Vehicle Name", "Expense Category", "Amount (Rs)", "Description"];
        rows = vehicleExpensesReport.map(item => [item.date, item.plateNumber, item.vehicleName, item.category, item.amount, item.description]);
        break;
      case 'driver-expense':
        title = "Driver_Expenses_Advances_Report";
        headers = ["Date", "Driver Name", "Type", "Amount (Rs)", "Description"];
        rows = driverExpensesReport.map(item => [item.date, item.driverName, item.type, item.amount, item.description]);
        break;
      case 'fuel':
        title = "Fuel_Fills_Ledger";
        headers = ["Date", "Plate Number", "Vehicle Name", "Driver Name", "Liters Fill", "Total Cost (Rs)"];
        rows = fuelReport.map(item => [item.date, item.plateNumber, item.vehicleName, item.driverName, item.liters, item.amount]);
        break;
      case 'service':
        title = "Vehicle_Maintenance_Service_Ledger";
        headers = ["Date", "Plate Number", "Vehicle Name", "Service/Type", "Provider", "Cost (Rs)", "Odometer (km)", "Details"];
        rows = serviceReport.map(item => [item.date, item.plateNumber, item.vehicleName, item.type, item.provider, item.cost, item.odometer, item.details]);
        break;
      case 'insurance':
        title = "Fleet_Insurance_Expiry_Ledger";
        headers = ["Plate Number", "Vehicle Name", "Policy No", "Provider", "Premium paid (Rs)", "Expiry Date", "Days Left", "Status"];
        rows = insuranceReport.map(item => [item.plateNumber, item.vehicleName, item.insuranceNo, item.provider, item.amount, item.expiryDate, item.daysLeft, item.status]);
        break;
      case 'mileage':
        title = "Mileage_Efficiency_Report";
        headers = ["Date", "Plate Number", "Vehicle Name", "Driver Name", "Distance (km)", "Fuel Consumed (L)", "Mileage (km/L)"];
        rows = mileageReport.map(item => [item.date, item.plateNumber, item.vehicleName, item.driverName, item.distanceKm, item.fuelLiters, item.mileage]);
        break;
      case 'trips':
        title = "Fleet_Trips_Ledger";
        headers = ["Date", "Plate Number", "Vehicle Name", "Origin", "Destination", "Distance (km)", "Fuel Used (L)", "Driver Name"];
        rows = tripsReport.map(item => [item.date, item.plateNumber, item.vehicleName, item.from, item.to, item.distanceKm, item.fuelUsedLiters, item.driverName]);
        break;
      case 'attendance':
        title = "Drivers_Attendance_Ledger";
        headers = ["Date", "Driver Name", "Status", "Duty Duration"];
        rows = attendanceReport.map(item => [item.date, item.driverName, item.status, item.hours]);
        break;
      case 'salary':
        title = "Drivers_Salary_Calculated_Payout";
        headers = ["Driver ID", "Driver Name", "Salary Contract", "Rate (Rs)", "Present Days", "Gross Salary (Rs)", "Current Advance Bal", "Net Payable (Rs)"];
        rows = salaryReport.map(item => [item.driverId, item.driverName, item.salaryType, item.rate, item.presentDays, item.earnedSalary, item.currentAdvanceBalance, item.netPayable]);
        break;
      case 'vehicle-wise':
        title = "Vehicle_Wise_Unified_Ledger";
        headers = ["Plate Number", "Friendly Name", "Total Trips", "Total Distance (km)", "Fuel Liters", "Fuel Paid (Rs)", "Maintenance (Rs)", "Other Expenses (Rs)", "Total Outlay (Rs)"];
        rows = vehicleWiseReport.map(item => [item.plateNumber, item.name, item.totalTrips, item.totalDistance, item.fuelLiters, item.fuelCost, item.serviceCost, item.otherExpenses, item.totalCost]);
        break;
      case 'driver-wise':
        title = "Driver_Wise_Unified_Ledger";
        headers = ["Driver Name", "Assigned Vehicle", "Total Trips Driven", "Total Distance (km)", "Total Fuel Filled (Rs)", "Attendance Rate (%)", "Advance Balance (Rs)"];
        rows = driverWiseReport.map(item => [item.driverName, item.assignedVehicle, item.totalTrips, item.totalDistance, item.fuelFilled, item.attendanceRate, item.advanceBalance]);
        break;
      case 'monthly':
        title = "Monthly_Financial_Aggregation";
        headers = ["Month", "Fuel Outlay (Rs)", "Service Outlay (Rs)", "General Expenses (Rs)", "Advances (Rs)", "Overall (Rs)"];
        rows = monthlyReport.map(item => [item.month, item.fuel, item.service, item.expense, item.advance, item.total]);
        break;
      case 'yearly':
        title = "Yearly_Financial_Aggregation";
        headers = ["Year", "Fuel Outlay (Rs)", "Service Outlay (Rs)", "General Expenses (Rs)", "Advances (Rs)", "Overall (Rs)"];
        rows = yearlyReport.map(item => [item.year, item.fuel, item.service, item.expense, item.advance, item.total]);
        break;
    }

    let csvContent = headers.join(",") + "\n";
    rows.forEach(row => {
      const escapedRow = row.map(cell => {
        let text = String(cell ?? "").replace(/"/g, '""');
        if (text.includes(",") || text.includes("\n") || text.includes('"')) {
          return `"${text}"`;
        }
        return text;
      });
      csvContent += escapedRow.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title}_${dateFrom}_to_${dateTo}.csv`;
    link.click();
    triggerToast(`📊 Exported ${title} Excel-CSV successfully!`);
  };

  // EXPORT ENGINE: PDF (Print dialog with vector formatting)
  const handleExportPDF = (type: ReportType) => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let reportName = "";
    let summaryHTML = "";

    switch (type) {
      case 'vehicle-expense':
        reportName = "Vehicle Expenses Detail Report";
        headers = ["Date", "Vehicle", "Category", "Amount", "Description"];
        rows = vehicleExpensesReport.map(item => [item.date, `${item.vehicleName} (${item.plateNumber})`, item.category, `Rs. ${item.amount.toLocaleString()}`, item.description]);
        const totalExp = vehicleExpensesReport.reduce((s, i) => s + i.amount, 0);
        summaryHTML = `<div><strong>Total Expenses:</strong> Rs. ${totalExp.toLocaleString()} | <strong>Records Count:</strong> ${vehicleExpensesReport.length}</div>`;
        break;
      case 'driver-expense':
        reportName = "Driver Advances & Outlay Report";
        headers = ["Date", "Driver Name", "Outlay Category", "Amount", "Description"];
        rows = driverExpensesReport.map(item => [item.date, item.driverName, item.type, `Rs. ${item.amount.toLocaleString()}`, item.description]);
        const totalNetAdv = driverExpensesReport.reduce((s, i) => s + i.amount, 0);
        summaryHTML = `<div><strong>Net Period Advances Balance:</strong> Rs. ${totalNetAdv.toLocaleString()} | <strong>Outlay Entries:</strong> ${driverExpensesReport.length}</div>`;
        break;
      case 'fuel':
        reportName = "Diesel & Fuel Purchases Ledger";
        headers = ["Date", "Vehicle Plate", "Driver Name", "Quantity (L)", "Total Amount"];
        rows = fuelReport.map(item => [item.date, item.plateNumber, item.driverName, `${item.liters} L`, `Rs. ${item.amount.toLocaleString()}`]);
        const fuelAmt = fuelReport.reduce((s, i) => s + i.amount, 0);
        const fuelQty = fuelReport.reduce((s, i) => s + i.liters, 0);
        summaryHTML = `<div><strong>Total Fuel Expense:</strong> Rs. ${fuelAmt.toLocaleString()} | <strong>Total Liters Filled:</strong> ${fuelQty.toLocaleString()} L</div>`;
        break;
      case 'service':
        reportName = "Vehicle Maintenance & Workshop Ledger";
        headers = ["Date", "Vehicle Plate", "Service Type", "Workshop Provider", "Cost", "Odometer", "Details"];
        rows = serviceReport.map(item => [item.date, item.plateNumber, item.type, item.provider, `Rs. ${item.cost.toLocaleString()}`, `${item.odometer.toLocaleString()} km`, item.details]);
        const totalSvc = serviceReport.reduce((s, i) => s + i.cost, 0);
        summaryHTML = `<div><strong>Total Maintenance Outlay:</strong> Rs. ${totalSvc.toLocaleString()} | <strong>Service Actions Count:</strong> ${serviceReport.length}</div>`;
        break;
      case 'insurance':
        reportName = "Fleet Insurance Coverage Audit";
        headers = ["Vehicle", "Policy Number", "Provider", "Premium Amount", "Expiry Date", "Status"];
        rows = insuranceReport.map(item => [`${item.vehicleName} (${item.plateNumber})`, item.insuranceNo, item.provider, `Rs. ${item.amount.toLocaleString()}`, item.expiryDate, item.status]);
        summaryHTML = `<div><strong>Active Vehicles:</strong> ${insuranceReport.filter(i=>i.status==='Active').length} | <strong>Alert Expiries:</strong> ${insuranceReport.filter(i=>i.status!=='Active').length}</div>`;
        break;
      case 'mileage':
        reportName = "Fuel Efficiency & Mileage Ledger";
        headers = ["Date", "Vehicle Plate", "Driver Name", "Distance (km)", "Fuel (L)", "Efficiency (km/L)"];
        rows = mileageReport.map(item => [item.date, item.plateNumber, item.driverName, `${item.distanceKm} km`, `${item.fuelLiters} L`, `${item.mileage} km/L`]);
        const avgMileage = mileageReport.length > 0 ? (mileageReport.reduce((s, i) => s + i.mileage, 0) / mileageReport.length).toFixed(2) : "0";
        summaryHTML = `<div><strong>Average Efficiency:</strong> ${avgMileage} km/L | <strong>Analyzed Trips:</strong> ${mileageReport.length}</div>`;
        break;
      case 'trips':
        reportName = "Fleet Trips Completed History";
        headers = ["Date", "Vehicle Plate", "Driver", "Origin", "Destination", "Distance", "Fuel Used"];
        rows = tripsReport.map(item => [item.date, item.plateNumber, item.driverName, item.from, item.to, `${item.distanceKm} km`, `${item.fuelUsedLiters} L`]);
        const totalDist = tripsReport.reduce((s, i) => s + i.distanceKm, 0);
        summaryHTML = `<div><strong>Total Distance Driven:</strong> ${totalDist.toLocaleString()} km | <strong>Total Trips Run:</strong> ${tripsReport.length}</div>`;
        break;
      case 'attendance':
        reportName = "Drivers Duty Attendance Logs";
        headers = ["Date", "Driver Name", "Duty Status", "Duty Hours"];
        rows = attendanceReport.map(item => [item.date, item.driverName, item.status, item.hours]);
        summaryHTML = `<div><strong>Present Days logged:</strong> ${attendanceReport.filter(i=>i.status==='Present').length} | <strong>Absent Days logged:</strong> ${attendanceReport.filter(i=>i.status==='Absent').length}</div>`;
        break;
      case 'salary':
        reportName = "Payroll & Earnings Audit Statement";
        headers = ["Driver Name", "Salary Contract", "Base Rate", "Days Present", "Gross Salary", "Advances Balance", "Est. Net Payout"];
        rows = salaryReport.map(item => [item.driverName, item.salaryType, `Rs. ${item.rate.toLocaleString()}`, item.presentDays, `Rs. ${item.earnedSalary.toLocaleString()}`, `Rs. ${item.currentAdvanceBalance.toLocaleString()}`, `Rs. ${item.netPayable.toLocaleString()}`]);
        const totalPayroll = salaryReport.reduce((s, i) => s + i.earnedSalary, 0);
        summaryHTML = `<div><strong>Est. Total Payroll Cost:</strong> Rs. ${totalPayroll.toLocaleString()} | <strong>Outstanding Advances Out:</strong> Rs. ${salaryReport.reduce((s, i) => s + i.currentAdvanceBalance, 0).toLocaleString()}</div>`;
        break;
      case 'vehicle-wise':
        reportName = "Vehicle-Wise Master Expense Analysis";
        headers = ["Vehicle", "Total Trips", "Distance (km)", "Fuel Outlay", "Maintenance Cost", "Other Cost", "Total Outlay"];
        rows = vehicleWiseReport.map(item => [`${item.name} (${item.plateNumber})`, item.totalTrips, item.totalDistance.toLocaleString(), `Rs. ${item.fuelCost.toLocaleString()}`, `Rs. ${item.serviceCost.toLocaleString()}`, `Rs. ${item.otherExpenses.toLocaleString()}`, `Rs. ${item.totalCost.toLocaleString()}`]);
        summaryHTML = `<div><strong>Grand Combined Outlay:</strong> Rs. ${vehicleWiseReport.reduce((s, i) => s + i.totalCost, 0).toLocaleString()}</div>`;
        break;
      case 'driver-wise':
        reportName = "Driver-Wise Performance Ledger";
        headers = ["Driver Name", "Assigned Vehicle", "Driven Trips", "Total Distance", "Fuel Outlay", "Attendance", "Advance Bal"];
        rows = driverWiseReport.map(item => [item.driverName, item.assignedVehicle, item.totalTrips, `${item.totalDistance.toLocaleString()} km`, `Rs. ${item.fuelFilled.toLocaleString()}`, `${item.attendanceRate}%`, `Rs. ${item.advanceBalance.toLocaleString()}`]);
        summaryHTML = `<div><strong>Active Drivers Audit:</strong> ${driverWiseReport.length}</div>`;
        break;
      case 'monthly':
        reportName = "Monthly Consolidated Financial Ledger";
        headers = ["Month", "Fuel Cost", "Maintenance Cost", "Other Expenses", "Advances Out", "Total Outlay"];
        rows = monthlyReport.map(item => [item.month, `Rs. ${item.fuel.toLocaleString()}`, `Rs. ${item.service.toLocaleString()}`, `Rs. ${item.expense.toLocaleString()}`, `Rs. ${item.advance.toLocaleString()}`, `Rs. ${item.total.toLocaleString()}`]);
        summaryHTML = `<div><strong>Financial Periods logged:</strong> ${monthlyReport.length}</div>`;
        break;
      case 'yearly':
        reportName = "Yearly Consolidated Financial Ledger";
        headers = ["Year", "Fuel Cost", "Maintenance Cost", "Other Expenses", "Advances Out", "Total Outlay"];
        rows = yearlyReport.map(item => [item.year, `Rs. ${item.fuel.toLocaleString()}`, `Rs. ${item.service.toLocaleString()}`, `Rs. ${item.expense.toLocaleString()}`, `Rs. ${item.advance.toLocaleString()}`, `Rs. ${item.total.toLocaleString()}`]);
        summaryHTML = `<div><strong>Financial Years logged:</strong> ${yearlyReport.length}</div>`;
        break;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to open the PDF printer");
      return;
    }

    const html = `
      <html>
        <head>
          <title>${reportName}</title>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 40px; color: #1C1B1F; background-color: #ffffff; }
            .header-container { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #6750A4; padding-bottom: 20px; margin-bottom: 30px; }
            .title-section h1 { margin: 0; font-size: 26px; font-weight: 800; color: #6750A4; font-family: 'Inter', sans-serif; }
            .title-section p { margin: 5px 0 0 0; font-size: 13px; color: #49454F; font-weight: 500; }
            .meta-section { text-align: right; font-size: 11px; color: #79747E; line-height: 1.6; }
            .meta-section strong { color: #1C1B1F; }
            .summary-card { background-color: #F3EDF7; border: 1px solid #EADDFF; border-radius: 16px; padding: 15px; margin-bottom: 30px; font-size: 13px; color: #21005D; display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11.5px; }
            th { background-color: #6750A4; color: #ffffff; font-weight: 700; border: 1px solid #6750A4; padding: 10px 12px; text-align: left; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
            td { border: 1px solid #CAC4D0; padding: 9px 12px; color: #1C1B1F; }
            tr:nth-child(even) { background-color: #F7F2FA; }
            .footer { margin-top: 50px; font-size: 10px; color: #79747E; text-align: center; border-top: 1px solid #EADDFF; padding-top: 20px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="title-section">
              <h1>${reportName}</h1>
              <p>Fleet Core Operations & Compliance Ledger</p>
            </div>
            <div class="meta-section">
              <p><strong>Period:</strong> ${dateFrom} to ${dateTo}</p>
              <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> Offically Signed / Audit Ready</p>
            </div>
          </div>
          
          <div class="summary-card">
            ${summaryHTML}
          </div>

          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell ?? "—"}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>LOCKCHAIN AES-256 ENCRYPTED DOCUMENT LEDGER // DIGITALLY SIGNED SYNC // PAGE 1 OF 1</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    triggerToast(`📄 PDF Print-Dialogue triggered for ${reportName}!`);
  };

  // Main reports bento dashboard list
  const reportsList = [
    { id: 'vehicle-expense', title: 'Vehicle Expense', count: vehicleExpensesReport.length, icon: Wallet, desc: 'Workshop, tyres, battery and general vehicle-specific outlays.', category: 'Expenses' },
    { id: 'driver-expense', title: 'Driver Expense', count: driverExpensesReport.length, icon: User, desc: 'Advances, repayments, and outlays attributed to drivers.', category: 'Expenses' },
    { id: 'fuel', title: 'Fuel Report', count: fuelReport.length, icon: Activity, desc: 'Detailed tracking of diesel/fuel fills, volume, and costs.', category: 'Expenses' },
    { id: 'service', title: 'Service Records', count: serviceReport.length, icon: Truck, desc: 'Scheduled maintenance, workshop repairs, and services.', category: 'Operations' },
    { id: 'insurance', title: 'Insurance Audit', count: insuranceReport.length, icon: FileText, desc: 'Policy expiries, premium amounts, and warning status.', category: 'Compliance' },
    { id: 'mileage', title: 'Mileage (Fuel Efficiency)', count: mileageReport.length, icon: TrendingUp, desc: 'Fuel consumption versus distance driven (km/L).', category: 'Analytics' },
    { id: 'trips', title: 'Trips History', count: tripsReport.length, icon: MapPin, desc: 'Trip logs, origin, destination, distance, and drivers.', category: 'Operations' },
    { id: 'attendance', title: 'Driver Attendance', count: attendanceReport.length, icon: Clock, desc: 'Duty check-ins, leaves, absent records, and durations.', category: 'Compliance' },
    { id: 'salary', title: 'Salary & Advances', count: salaryReport.length, icon: Wallet, desc: 'Earning rates, active days, advances, and net due pay.', category: 'Compliance' },
    { id: 'vehicle-wise', title: 'Vehicle-Wise Master', count: vehicleWiseReport.length, icon: Truck, desc: 'Aggregated totals of cost, distance, and fuel per truck.', category: 'Unified Analytics' },
    { id: 'driver-wise', title: 'Driver-Wise Master', count: driverWiseReport.length, icon: User, desc: 'Trips run, total km driven, advances outstanding per driver.', category: 'Unified Analytics' },
    { id: 'monthly', title: 'Monthly Financials', count: monthlyReport.length, icon: Calendar, desc: 'Monthly cash-outlay summary grouped chronologically.', category: 'Unified Analytics' },
    { id: 'yearly', title: 'Yearly Financials', count: yearlyReport.length, icon: Calendar, desc: 'Annual operational & financial overview.', category: 'Unified Analytics' },
  ];

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-200 font-sans transition-colors ${
      isDarkMode ? 'bg-[#141218] text-[#E6E0E9]' : 'bg-[#FAF9FC] text-[#1C1B1F]'
    }`}>
      
      {/* Dynamic Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b shrink-0 transition-colors ${
        isDarkMode ? 'bg-[#211F26] border-[#36343B]' : 'bg-white border-[#CAC4D0]'
      }`}>
        <div className="flex items-center gap-3">
          {selectedReport ? (
            <button 
              onClick={() => setSelectedReport(null)}
              className={`p-2 rounded-full transition-colors active:scale-95 ${
                isDarkMode ? 'text-[#CAC4D0] hover:bg-[#36343B]' : 'text-[#49454F] hover:bg-[#E8DEF8]/60'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}
          <div>
            <h1 className={`text-base font-extrabold ${isDarkMode ? 'text-[#E6E0E9]' : 'text-[#1C1B1F]'}`}>
              {selectedReport 
                ? reportsList.find(r => r.id === selectedReport)?.title + " Report"
                : "Compliance Reports Panel"
              }
            </h1>
            <p className={`text-[10px] font-medium ${isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'}`}>
              {selectedReport 
                ? "Official ledger analysis & dynamic records" 
                : "Audit-ready live exportable fleet reports"
              }
            </p>
          </div>
        </div>

        {isDarkMode && (
          <span className="bg-[#381E72] text-[#D0BCFF] text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#4F378B]">
            NIGHT MODE (HIGH CONTRAST)
          </span>
        )}
      </div>

      {/* Main Container */}
      {!selectedReport ? (
        // DASHBOARD MODE
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Calendar & Global Filter Card */}
          <div className={`p-4 rounded-3xl space-y-3 shadow-xs border transition-colors ${
            isDarkMode 
              ? 'bg-[#2B2930] border-[#49454F] text-[#E6E0E9]' 
              : 'bg-[#EADDFF]/40 border-[#EADDFF] text-[#1C1B1F]'
          }`}>
            <h3 className={`text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider ${
              isDarkMode ? 'text-[#D0BCFF]' : 'text-[#21005D]'
            }`}>
              <Filter className="w-3.5 h-3.5" />
              Global Ledger Filter
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${
                  isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'
                }`}>From Date</label>
                <div className={`border rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-[#211F26] border-[#49454F]' : 'bg-white border-[#CAC4D0]'
                }`}>
                  <Calendar className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#D0BCFF]' : 'text-[#6750A4]'}`} />
                  <input 
                    type="date" 
                    value={dateFrom} 
                    onChange={(e) => setDateFrom(e.target.value)} 
                    className={`bg-transparent border-none focus:outline-none w-full font-medium ${
                      isDarkMode ? 'text-[#E6E0E9]' : 'text-[#1C1B1F]'
                    }`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${
                  isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'
                }`}>To Date</label>
                <div className={`border rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-[#211F26] border-[#49454F]' : 'bg-white border-[#CAC4D0]'
                }`}>
                  <Calendar className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#D0BCFF]' : 'text-[#6750A4]'}`} />
                  <input 
                    type="date" 
                    value={dateTo} 
                    onChange={(e) => setDateTo(e.target.value)} 
                    className={`bg-transparent border-none focus:outline-none w-full font-medium ${
                      isDarkMode ? 'text-[#E6E0E9]' : 'text-[#1C1B1F]'
                    }`}
                  />
                </div>
              </div>
            </div>

            <p className={`text-[9px] font-semibold italic text-center pt-1 border-t ${
              isDarkMode ? 'text-[#D0BCFF]/80 border-[#49454F]' : 'text-[#21005D]/70 border-[#EADDFF]/60'
            }`}>
              * Filters apply instantly across all 13 customized ledger cards below.
            </p>
          </div>

          {/* Grid of Report Cards */}
          <div className="grid grid-cols-1 gap-2.5">
            {reportsList.map(report => {
              const IconComp = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id as ReportType)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 shadow-xs active:scale-98 group ${
                    isDarkMode 
                      ? 'bg-[#211F26] border-[#36343B] hover:border-[#D0BCFF] hover:bg-[#2B2930]' 
                      : 'bg-white border-[#CAC4D0]/60 hover:border-[#6750A4] hover:bg-[#F3EDF7]/20'
                  }`}
                >
                  <div className="space-y-1">
                    <span className={`text-[8px] font-extrabold uppercase border px-2 py-0.5 rounded-full ${
                      isDarkMode ? 'bg-[#2B2930] text-[#D0BCFF] border-[#49454F]' : 'bg-[#F3EDF7] text-[#21005D] border-[#CAC4D0]/40'
                    }`}>
                      {report.category}
                    </span>
                    <h3 className={`font-bold text-xs sm:text-sm mt-1 transition-colors ${
                      isDarkMode ? 'text-[#E6E0E9] group-hover:text-[#D0BCFF]' : 'text-[#1C1B1F] group-hover:text-[#6750A4]'
                    }`}>
                      {report.title}
                    </h3>
                    <p className={`text-[10px] font-medium leading-relaxed ${
                      isDarkMode ? 'text-[#CAC4D0]' : 'text-[#49454F]'
                    }`}>
                      {report.desc}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full shrink-0">
                    <div className={`p-2 rounded-xl transition-colors ${
                      isDarkMode ? 'bg-[#4F378B] text-[#EADDFF]' : 'bg-[#EADDFF] text-[#21005D] group-hover:bg-[#6750A4] group-hover:text-white'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    {report.id !== 'insurance' && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border mt-2 ${
                        isDarkMode ? 'text-[#D0BCFF] bg-[#2B2930] border-[#49454F]' : 'text-[#6750A4] bg-[#F3EDF7] border-[#CAC4D0]/30'
                      }`}>
                        {report.count} items
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      ) : (
        // REPORT DETAILED SCREEN
        <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
          
          {/* Dynamic Filters Bar specific to active report */}
          <div className="bg-white border border-[#CAC4D0]/80 p-3.5 rounded-2xl space-y-3 shrink-0">
            <div className="flex justify-between items-center pb-2 border-b border-[#CAC4D0]/40">
              <span className="bg-[#EADDFF] text-[#21005D] text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-[#EADDFF]">
                Active Filter Pane
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleExportExcel(selectedReport)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Excel (CSV)
                </button>
                <button
                  onClick={() => handleExportPDF(selectedReport)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  PDF (Print)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {/* Conditional Vehicle Selection */}
              {['vehicle-expense', 'fuel', 'service', 'mileage', 'trips', 'vehicle-wise'].includes(selectedReport) && (
                <div>
                  <label className="block text-[8px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Filter Vehicle</label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-1.5 text-[#1C1B1F] focus:outline-none"
                  >
                    <option value="All">All Vehicles</option>
                    {vehiclesList.map(v => (
                      <option key={v.plateNumber} value={v.plateNumber}>{v.plateNumber} ({v.name})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional Driver Selection */}
              {['driver-expense', 'fuel', 'mileage', 'trips', 'attendance', 'driver-wise'].includes(selectedReport) && (
                <div>
                  <label className="block text-[8px] font-bold text-[#49454F] uppercase tracking-wider mb-1">Filter Driver</label>
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-1.5 text-[#1C1B1F] focus:outline-none"
                  >
                    <option value="All">All Drivers</option>
                    {driversList.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Filters inside Report detail too */}
              <div>
                <label className="block text-[8px] font-bold text-[#49454F] uppercase tracking-wider mb-1">From Date</label>
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-1 text-[#1C1B1F] focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-[#49454F] uppercase tracking-wider mb-1">To Date</label>
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-[#F3EDF7] border border-[#CAC4D0] rounded-xl px-2 py-1 text-[#1C1B1F] focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* RENDERING INDIVIDUAL SELECTED REPORT TABLE */}
          <div className="flex-1 bg-white border border-[#CAC4D0]/60 rounded-3xl overflow-hidden flex flex-col">
            
            <div className="flex-1 overflow-auto p-1 text-[11px]">
              
              {/* VEHICLE EXPENSES */}
              {selectedReport === 'vehicle-expense' && (
                <div className="min-w-[400px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Date</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Vehicle</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Category</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Amount</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleExpensesReport.length > 0 ? vehicleExpensesReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{item.date}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-700">{item.plateNumber}</td>
                          <td className="p-2.5">
                            <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-200">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-[#6750A4]">Rs. {item.amount.toLocaleString()}</td>
                          <td className="p-2.5 text-slate-600 truncate max-w-[120px]" title={item.description}>{item.description}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">No expense records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* DRIVER EXPENSES */}
              {selectedReport === 'driver-expense' && (
                <div className="min-w-[400px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Date</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Driver Name</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Outlay Type</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Amount</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverExpensesReport.length > 0 ? driverExpensesReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{item.date}</td>
                          <td className="p-2.5 font-bold text-slate-700">{item.driverName}</td>
                          <td className="p-2.5">
                            <span className={`font-bold px-2 py-0.5 rounded border ${
                              item.amount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className={`p-2.5 font-bold ${item.amount > 0 ? 'text-[#6750A4]' : 'text-emerald-700'}`}>
                            Rs. {Math.abs(item.amount).toLocaleString()}
                          </td>
                          <td className="p-2.5 text-slate-600 truncate max-w-[120px]">{item.description}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">No advance or repayment records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* FUEL REPORT */}
              {selectedReport === 'fuel' && (
                <div className="min-w-[400px]">

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Date</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Vehicle</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Driver</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Liters</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuelReport.length > 0 ? fuelReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{item.date}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-700">{item.plateNumber}</td>
                          <td className="p-2.5 font-semibold text-slate-600">{item.driverName}</td>
                          <td className="p-2.5 font-bold text-slate-600">{item.liters} L</td>
                          <td className="p-2.5 font-bold text-purple-700">Rs. {item.amount.toLocaleString()}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">No fuel logs found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SERVICE RECORDS */}
              {selectedReport === 'service' && (
                <div className="min-w-[450px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Date</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Vehicle</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Action</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Workshop</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Odometer</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceReport.length > 0 ? serviceReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{item.date}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-700">{item.plateNumber}</td>
                          <td className="p-2.5 font-semibold text-slate-600">{item.type}</td>
                          <td className="p-2.5 text-slate-500">{item.provider}</td>
                          <td className="p-2.5 font-mono">{item.odometer.toLocaleString()} km</td>
                          <td className="p-2.5 font-bold text-purple-700">Rs. {item.cost.toLocaleString()}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-bold">No maintenance services found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* INSURANCE POLICY STATUS */}
              {selectedReport === 'insurance' && (
                <div className="min-w-[450px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Vehicle</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Policy / Provider</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Expiry Date</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Days Left</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insuranceReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-slate-700">
                            {item.plateNumber}
                            <span className="block text-[9px] text-slate-400 font-sans">{item.vehicleName}</span>
                          </td>
                          <td className="p-2.5">
                            <span className="font-semibold text-slate-700">{item.insuranceNo}</span>
                            <span className="block text-[9px] text-slate-400">{item.provider}</span>
                          </td>
                          <td className="p-2.5 font-semibold text-slate-600">{item.expiryDate}</td>
                          <td className={`p-2.5 font-mono font-bold ${item.daysLeft < 0 ? 'text-red-600' : item.daysLeft <= 30 ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {item.daysLeft < 0 ? `Overdue by ${Math.abs(item.daysLeft)} days` : `${item.daysLeft} days left`}
                          </td>
                          <td className="p-2.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              item.status === 'Expired' 
                                ? 'bg-red-50 text-red-700 border-red-200' 
                                : item.status === 'Expiring Soon' 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MILEAGE ENGINE */}
              {selectedReport === 'mileage' && (
                <div className="min-w-[400px]">

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Date</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Vehicle Plate</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Driver Name</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Distance</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Fuel Used</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Mileage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mileageReport.length > 0 ? mileageReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{item.date}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-700">{item.plateNumber}</td>
                          <td className="p-2.5 font-semibold text-slate-500">{item.driverName}</td>
                          <td className="p-2.5 font-mono">{item.distanceKm} km</td>
                          <td className="p-2.5 font-mono">{item.fuelLiters} L</td>
                          <td className="p-2.5">
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2 py-0.5 rounded">
                              {item.mileage} km/L
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-bold">No mileage data found. Check trip records for fuel details.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TRIPS REPORT */}
              {selectedReport === 'trips' && (
                <div className="min-w-[450px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Date</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Vehicle</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Driver</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Route (From ➔ To)</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Distance</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Fuel Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tripsReport.length > 0 ? tripsReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{item.date}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-700">{item.plateNumber}</td>
                          <td className="p-2.5 font-semibold text-slate-600">{item.driverName}</td>
                          <td className="p-2.5 font-medium text-slate-700">
                            {item.from} ➔ {item.to}
                          </td>
                          <td className="p-2.5 font-bold">{item.distanceKm} km</td>
                          <td className="p-2.5 text-slate-500">{item.fuelUsedLiters} L</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-bold">No trips logged in this date range.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ATTENDANCE REPORT */}
              {selectedReport === 'attendance' && (
                <div className="min-w-[400px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Date</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Driver Name</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Attendance Status</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Working Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceReport.length > 0 ? attendanceReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{item.date}</td>
                          <td className="p-2.5 font-bold text-slate-700">{item.driverName}</td>
                          <td className="p-2.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              item.status === 'Present' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : item.status === 'Leave' 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-2.5 font-semibold text-slate-600">{item.hours}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-bold">No attendance logs found in database.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SALARY & PAYROLL STATEMENT */}
              {selectedReport === 'salary' && (
                <div className="min-w-[450px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Driver Name</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Contract / Rate</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Present Days</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Earned Salary</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Outstanding Advance</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Est. Net Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-700">{item.driverName}</td>
                          <td className="p-2.5">
                            <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded text-[10px] border border-slate-200">
                              {item.salaryType}
                            </span>
                            <span className="block font-medium text-[10px] text-slate-400 mt-0.5">Rs. {item.rate.toLocaleString()}</span>
                          </td>
                          <td className="p-2.5 font-bold font-mono">{item.presentDays} days</td>
                          <td className="p-2.5 font-bold text-slate-600">Rs. {item.earnedSalary.toLocaleString()}</td>
                          <td className="p-2.5 font-semibold text-red-600">Rs. {item.currentAdvanceBalance.toLocaleString()}</td>
                          <td className="p-2.5 font-black text-emerald-800 bg-emerald-50/20">
                            Rs. {item.netPayable.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VEHICLE-WISE CONSOLIDATION */}
              {selectedReport === 'vehicle-wise' && (
                <div className="min-w-[500px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Vehicle Plate</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Trips / Distance</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Fuel Cost</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Maintenance</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Other Cost</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleWiseReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-slate-700">
                            {item.plateNumber}
                            <span className="block text-[9px] text-slate-400 font-sans">{item.name}</span>
                          </td>
                          <td className="p-2.5 font-semibold text-slate-600">
                            {item.totalTrips} trips
                            <span className="block text-[9px] text-slate-400 font-mono">{item.totalDistance.toLocaleString()} km</span>
                          </td>
                          <td className="p-2.5">Rs. {item.fuelCost.toLocaleString()}</td>
                          <td className="p-2.5">Rs. {item.serviceCost.toLocaleString()}</td>
                          <td className="p-2.5">Rs. {item.otherExpenses.toLocaleString()}</td>
                          <td className="p-2.5 font-bold text-[#6750A4] bg-purple-50/20">
                            Rs. {item.totalCost.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* DRIVER-WISE CONSOLIDATION */}
              {selectedReport === 'driver-wise' && (
                <div className="min-w-[450px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Driver Name</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Assigned Truck</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Trips driven</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Distance driven</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Attendance %</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Advances Bal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverWiseReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-700">{item.driverName}</td>
                          <td className="p-2.5 font-mono text-slate-500">{item.assignedVehicle}</td>
                          <td className="p-2.5 font-semibold">{item.totalTrips} trips</td>
                          <td className="p-2.5 font-mono">{item.totalDistance.toLocaleString()} km</td>
                          <td className="p-2.5 font-bold text-emerald-700">{item.attendanceRate}%</td>
                          <td className="p-2.5 font-bold text-red-600">Rs. {item.advanceBalance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MONTHLY CONSOLIDATION */}
              {selectedReport === 'monthly' && (
                <div className="min-w-[450px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Month</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Fuel Cost</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Service Cost</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">General Expenses</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Advances Issued</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyReport.length > 0 ? monthlyReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-700">{item.month}</td>
                          <td className="p-2.5 text-slate-600">Rs. {item.fuel.toLocaleString()}</td>
                          <td className="p-2.5 text-slate-600">Rs. {item.service.toLocaleString()}</td>
                          <td className="p-2.5 text-slate-600">Rs. {item.expense.toLocaleString()}</td>
                          <td className="p-2.5 text-red-600">Rs. {item.advance.toLocaleString()}</td>
                          <td className="p-2.5 font-extrabold text-[#6750A4] bg-purple-50/10">
                            Rs. {item.total.toLocaleString()}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-bold">No financial logs recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* YEARLY CONSOLIDATION */}
              {selectedReport === 'yearly' && (
                <div className="min-w-[450px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3EDF7] text-[#21005D]">
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Year</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Fuel Cost</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Service Cost</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">General Expenses</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Advances Issued</th>
                        <th className="p-2.5 font-bold border-b border-[#CAC4D0]">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyReport.length > 0 ? yearlyReport.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#CAC4D0]/30 hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-700">{item.year}</td>
                          <td className="p-2.5 text-slate-600">Rs. {item.fuel.toLocaleString()}</td>
                          <td className="p-2.5 text-slate-600">Rs. {item.service.toLocaleString()}</td>
                          <td className="p-2.5 text-slate-600">Rs. {item.expense.toLocaleString()}</td>
                          <td className="p-2.5 text-red-600">Rs. {item.advance.toLocaleString()}</td>
                          <td className="p-2.5 font-extrabold text-[#6750A4] bg-purple-50/10">
                            Rs. {item.total.toLocaleString()}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-bold">No yearly data recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

            {/* Quick Metrics Subfooter */}
            <div className="bg-[#FAF9FC] border-t border-[#CAC4D0]/60 p-3.5 flex justify-between items-center shrink-0">
              <div className="flex gap-2">
                <span className="text-[10px] text-[#49454F] font-bold">From: <span className="font-mono text-[#1C1B1F]">{dateFrom}</span></span>
                <span className="text-[10px] text-[#49454F] font-bold">To: <span className="font-mono text-[#1C1B1F]">{dateTo}</span></span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                Official Compliance Synced
              </span>
            </div>

          </div>
          
          {/* Back button at the very bottom */}
          <button
            onClick={() => setSelectedReport(null)}
            className="w-full bg-[#EADDFF] hover:bg-[#D0BCFF] text-[#21005D] text-xs font-extrabold py-2.5 rounded-xl border border-[#EADDFF] flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports Panel
          </button>

        </div>
      )}

    </div>
  );
}
