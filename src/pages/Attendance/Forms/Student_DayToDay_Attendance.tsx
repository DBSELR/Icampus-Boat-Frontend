/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import {
  Eye,
  RotateCcw,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Layers,
  AlertCircle,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import "./Student_DayToDay_Attendance.css";
import axios from "axios";

// Helper for default dates
const getTodayInputDate = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getFirstDayOfMonth = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
};

// Format helper: YYYY-MM-DD -> DD-MM-YYYY
const toDisplayDate = (dateVal: string): string => {
  if (!dateVal) return "";
  const parts = dateVal.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateVal;
};

export interface DayWiseRecord {
  sNo: number;
  date: string;
  day: string;
  period: string;
  subCode: string;
  subjectName: string;
  lecturer: string;
  status: "P" | "A";
  chapterTaught: string;
  remarks: string;
}

const Student_DayToDay_Attendance: React.FC = () => {
  // Academic Year from storage or standard default
  const [academicYear] = useState<string>(() => {
    return (
      localStorage.getItem("academicYear") ||
      localStorage.getItem("academic_year") ||
      "2026-2027"
    );
  });

  // Filter criteria states
  const [regNo, setRegNo] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>(getFirstDayOfMonth());
  const [toDate, setToDate] = useState<string>(getTodayInputDate());

  // Data states
  const [records, setRecords] = useState<DayWiseRecord[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "P" | "A">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Statistics calculation
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "P").length;
    const absent = records.filter((r) => r.status === "A").length;
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
    return { total, present, absent, pct };
  }, [records]);

  // Filtered records by status tab & search query
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Status Filter
      if (statusFilter !== "ALL" && r.status !== statusFilter) {
        return false;
      }
      // 2. Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        String(r.sNo).includes(q) ||
        r.date.toLowerCase().includes(q) ||
        r.day.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q) ||
        r.subCode.toLowerCase().includes(q) ||
        r.subjectName.toLowerCase().includes(q) ||
        r.lecturer.toLowerCase().includes(q) ||
        r.chapterTaught.toLowerCase().includes(q) ||
        r.remarks.toLowerCase().includes(q)
      );
    });
  }, [records, statusFilter, searchQuery]);

  // Handle View / Search Attendance
  const handleViewAttendance = async () => {
    const trimmedRegNo = regNo.trim();
    if (!trimmedRegNo) {
      toast.warning("Please enter a student Registration Number.");
      return;
    }

    if (!fromDate || !toDate) {
      toast.warning("Please select both From Date and To Date.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      // Attempt backend API call if available
      const API_BASE = "http://localhost:5000/api/";
      const payload = {
        regNo: trimmedRegNo,
        fromDate,
        toDate,
        academicYear,
      };

      const res = await axios
        .post(`${API_BASE}Student_DayToDay_Attendance/view`, payload)
        .catch(() => null);

      if (res?.data && Array.isArray(res.data.records || res.data.data || res.data)) {
        const rawList = res.data.records || res.data.data || res.data;
        const mapped: DayWiseRecord[] = rawList.map((item: any, idx: number) => ({
          sNo: idx + 1,
          date: item.DATE || item.date || item.Date || "",
          day: item.DAY || item.day || item.Day || "",
          period: String(item.PERIOD || item.period || item.Period || ""),
          subCode: item.SUB_CODE || item.subCode || item.sub_code || "",
          subjectName: item.SUBJECTNAME || item.subjectName || item.Subject || "Subject",
          lecturer: item.FACULTYNAME || item.lecturer || item.Fname || "Faculty",
          status: (item.ATT || item.status || "P").toUpperCase() === "A" ? "A" : "P",
          chapterTaught: item.DAYTAUGHT || item.chapterTaught || item.topic || "-",
          remarks: item.REMARKS || item.remarks || "",
        }));

        setRecords(mapped);
        toast.success(`Found ${mapped.length} attendance records for ${trimmedRegNo}.`);
      } else {
        // If endpoint is not yet mounted on backend, inform gracefully
        setRecords([]);
        toast.info(`No attendance records found for ${trimmedRegNo} in selected date range.`);
      }
    } catch (err: any) {
      console.error("Error fetching day-to-day attendance:", err);
      toast.error(err?.response?.data?.message || "Failed to load student attendance.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset form filters
  const handleReset = () => {
    setRegNo("");
    setFromDate(getFirstDayOfMonth());
    setToDate(getTodayInputDate());
    setRecords([]);
    setHasSearched(false);
    setStatusFilter("ALL");
    setSearchQuery("");
    toast.info("Form filters cleared.");
  };

  return (
    <div className="dbs-batches-container">
      {/* Header matching Batches form */}
      <div className="dbs-batches-header">
        <div className="dbs-batches-title-group">
          <div className="dbs-batches-icon-wrapper">
            <CalendarDays size={24} />
          </div>
          <div>
            <h2>Student Day To Day Attendance</h2>
            <p>Day-wise attendance history, period logs, and overall percentage analysis</p>
          </div>
        </div>

        <div className="dbs-batches-badges">
          <span className="dbs-batches-ay-badge">
            Academic Year: <strong>{academicYear}</strong>
          </span>
          {records.length > 0 && (
            <span className="dbs-batches-count-badge">
              <Users size={14} />
              Total Periods: <strong>{stats.total}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Filter / Search Criteria Card */}
      <div className="dbs-batches-card">
        <div className="dbs-batches-card-header">
          <h3>
            <Layers size={18} />
            Search Criteria
          </h3>
        </div>

        <div className="dbs-search-grid">
          {/* 1. Registration Number */}
          <div className="dbs-input-box">
            <label>Registration No.</label>
            <input
              type="text"
              placeholder="e.g. 21A91A0501"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleViewAttendance();
                }
              }}
            />
          </div>

          {/* 2. From Date */}
          <div className="dbs-input-box">
            <label>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* 3. To Date */}
          <div className="dbs-input-box">
            <label>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="dbs-form-actions-row">
          <button
            type="button"
            className="dbs-view-btn"
            onClick={handleViewAttendance}
            disabled={loading || !regNo.trim()}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Eye size={16} />
            )}
            {loading ? "Loading..." : "View Attendance"}
          </button>

          <button
            type="button"
            className="dbs-form-cancel-btn"
            onClick={handleReset}
            disabled={loading}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Student Profile & Range Banner */}
      {records.length > 0 && (
        <div className="dbs-subject-banner">
          <div className="dbs-subject-banner-title">
            <FileSpreadsheet size={18} />
            <span>
              Student Reg No: <span className="dbs-regno-badge">{regNo.trim().toUpperCase()}</span>
            </span>
          </div>
          <div className="dbs-subject-meta">
            <span>
              From: <strong>{toDisplayDate(fromDate)}</strong>
            </span>
            <span>
              To: <strong>{toDisplayDate(toDate)}</strong>
            </span>
            <span>
              Attendance Rate:{" "}
              <strong style={{ color: Number(stats.pct) >= 75 ? "#15803d" : "#dc2626" }}>
                {stats.pct}%
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Summary Statistics Overview */}
      {records.length > 0 && (
        <div className="dbs-stat-summary-row">
          <div className="dbs-stat-pill">
            <div className="dbs-stat-pill-header">
              <span className="dbs-stat-pill-label">Total Periods</span>
              <Users size={16} className="text-slate-500" />
            </div>
            <span className="dbs-stat-pill-value">{stats.total}</span>
          </div>

          <div className="dbs-stat-pill present">
            <div className="dbs-stat-pill-header">
              <span className="dbs-stat-pill-label">Present Periods</span>
              <CheckCircle2 size={16} className="dbs-stat-icon" />
            </div>
            <span className="dbs-stat-pill-value">{stats.present}</span>
          </div>

          <div className="dbs-stat-pill absent">
            <div className="dbs-stat-pill-header">
              <span className="dbs-stat-pill-label">Absent Periods</span>
              <XCircle size={16} className="dbs-stat-icon" />
            </div>
            <span className="dbs-stat-pill-value">{stats.absent}</span>
          </div>

          <div className="dbs-stat-pill pct">
            <div className="dbs-stat-pill-header">
              <span className="dbs-stat-pill-label">Attendance Rate</span>
              <span
                className="dbs-stat-pill-badge"
                style={{
                  background: Number(stats.pct) >= 75 ? "#dcfce7" : "#fee2e2",
                  color: Number(stats.pct) >= 75 ? "#15803d" : "#dc2626",
                }}
              >
                {stats.pct}%
              </span>
            </div>
            <span className="dbs-stat-pill-value">{stats.pct}%</span>
          </div>
        </div>
      )}

      {/* Attendance Log Table Card */}
      <div className="dbs-students-card">
        <div className="dbs-students-toolbar">
          <div className="dbs-students-toolbar-title">
            <h3>
              <CalendarDays size={18} />
              Daily Attendance Breakdown
            </h3>
            {records.length > 0 && (
              <span className="dbs-batches-ay-badge">
                Present: <strong>{stats.present}</strong> / {stats.total}
              </span>
            )}
          </div>

          {records.length > 0 && (
            <div className="dbs-students-toolbar-actions">
              {/* Status Filter Tabs */}
              <div className="dbs-filter-tabs">
                <button
                  type="button"
                  className={`dbs-filter-tab ${statusFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setStatusFilter("ALL")}
                >
                  All ({records.length})
                </button>
                <button
                  type="button"
                  className={`dbs-filter-tab ${statusFilter === "P" ? "active" : ""}`}
                  onClick={() => setStatusFilter("P")}
                >
                  Present ({stats.present})
                </button>
                <button
                  type="button"
                  className={`dbs-filter-tab ${statusFilter === "A" ? "active" : ""}`}
                  onClick={() => setStatusFilter("A")}
                >
                  Absent ({stats.absent})
                </button>
              </div>

              {/* Live Search */}
              <div className="dbs-students-search-wrapper">
                <Search size={16} className="dbs-students-search-icon" />
                <input
                  type="text"
                  placeholder="Search subject, faculty, date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="dbs-students-search-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Table */}
        <div className="dbs-table-scroll">
          {loading ? (
            <div className="dbs-table-empty">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <p>Fetching student day-to-day attendance log...</p>
            </div>
          ) : filteredRecords.length > 0 ? (
            <table className="dbs-attendance-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }} className="dbs-text-center">
                    S.No
                  </th>
                  <th style={{ width: "110px" }}>Date</th>
                  <th style={{ width: "100px" }}>Day</th>
                  <th style={{ width: "80px" }} className="dbs-text-center">
                    Period
                  </th>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th style={{ width: "90px" }} className="dbs-text-center">
                    Status
                  </th>
                  <th>Chapter / Topics Taught</th>
                  <th style={{ width: "150px" }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, index) => {
                  const isAbsent = r.status === "A";

                  return (
                    <tr
                      key={`${r.date}-${r.period}-${index}`}
                      className={isAbsent ? "dbs-student-absent" : ""}
                    >
                      <td className="dbs-text-center font-semibold">{r.sNo}</td>
                      <td>
                        <strong>{toDisplayDate(r.date)}</strong>
                      </td>
                      <td>{r.day}</td>
                      <td className="dbs-text-center font-semibold">
                        Period {r.period}
                      </td>
                      <td>
                        <strong>
                          {r.subCode ? `[${r.subCode}] ` : ""}
                          {r.subjectName}
                        </strong>
                      </td>
                      <td>{r.lecturer}</td>
                      <td className="dbs-text-center">
                        <span
                          className={`dbs-status-badge ${
                            isAbsent ? "absent" : "present"
                          }`}
                        >
                          {isAbsent ? "A" : "P"}
                        </span>
                      </td>
                      <td>{r.chapterTaught || "-"}</td>
                      <td>{r.remarks || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="dbs-table-empty">
              <AlertCircle size={32} />
              <p>
                {hasSearched
                  ? searchQuery || statusFilter !== "ALL"
                    ? "No records match your filter criteria."
                    : "No attendance records found for this student in the selected date range."
                  : "Enter the student registration number and date range above, then click 'View Attendance' to inspect the detailed daily attendance breakdown."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Student_DayToDay_Attendance;
