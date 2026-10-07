/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import {
  Save,
  RotateCcw,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Layers,
  AlertCircle,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import "./Admin_Attendance.css";
import {
  getProgramme,
  getBranch,
  getYear,
  getSections,
} from "../../../apis/Common";
import {
  getTLM,
  loadAdminAttendanceLecturers,
  loadAdminAttendancePeriods,
  loadAdminAttendanceStudents,
  saveAdminAttendanceSubjectWise,
  AdminLecturerItem,
  AdminPeriodItem,
  AdminStudentAttendanceRecord,
} from "../../../apis/AttendanceApis";

// Format helper: YYYY-MM-DD -> DD-MM-YYYY
const toApiDate = (dateVal: string): string => {
  if (!dateVal) return "";
  const parts = dateVal.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateVal;
};

// Today's date in YYYY-MM-DD for HTML date inputs
const getTodayInputDate = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Day name extractor
const getDayName = (dateVal: string): string => {
  if (!dateVal) return "Monday";
  const d = new Date(dateVal);
  return isNaN(d.getTime())
    ? "Monday"
    : d.toLocaleDateString("en-US", { weekday: "long" });
};

// Safe extractors for Common dropdown shapes
const extractProgramme = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string") return { code: item, name: item };
  const rawCode = String(
    item.COURSECODE ??
      item.COURSE_CODE ??
      item.CourseCode ??
      item.courseCode ??
      item.PROGRAMMECODE ??
      item.PROGRAMME ??
      item.code ??
      ""
  ).trim();

  const rawName = String(
    item.COURSE ??
      item.COURSENAME ??
      item.CourseName ??
      item.PROGRAMMENAME ??
      item.name ??
      rawCode
  ).trim();

  return { code: rawCode, name: rawName || rawCode };
};

const extractBranch = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string") return { code: item, name: item };
  const rawCode = String(
    item.BRANCHCODE ??
      item.BRANCH_CODE ??
      item.BranchCode ??
      item.branchCode ??
      item.BRANCH ??
      item.code ??
      ""
  ).trim();

  const rawName = String(
    item.BRANCHNAME ??
      item.BRANCH_NAME ??
      item.BranchName ??
      item.branchName ??
      rawCode
  ).trim();

  return { code: rawCode, name: rawName || rawCode };
};

const extractYear = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string" || typeof item === "number") {
    return { code: String(item), name: `Year ${item}` };
  }
  const rawCode = String(
    item.ID ?? item.id ?? item.YEAR ?? item.Year ?? item.code ?? ""
  ).trim();

  const rawData = String(
    item.DATA ?? item.data ?? item.YEARNAME ?? item.YearName ?? item.name ?? rawCode
  ).trim();

  return { code: rawCode, name: rawData ? `${rawCode} (${rawData})` : `Year ${rawCode}` };
};

const extractSection = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item.trim();
  return String(
    item.SECTION ?? item.section ?? item.Section ?? item.SECTIONNAME ?? ""
  ).trim();
};

const AttendanceByAdmin: React.FC = () => {
  // Academic Year obtained from localStorage as standard
  const [academicYear] = useState<string>(() => {
    return (
      localStorage.getItem("academicYear") ||
      localStorage.getItem("academic_year") ||
      "2026-2027"
    );
  });

  // Filter criteria states
  const [date, setDate] = useState<string>(getTodayInputDate());
  const [shift, setShift] = useState<string>("1");
  const [semester, setSemester] = useState<string>("");
  const [isPractical, setIsPractical] = useState<boolean>(false);
  const [srNo, setSrNo] = useState<string>("");
  const [erNo, setErNo] = useState<string>("");

  // Dropdown list states
  const [programmesList, setProgrammesList] = useState<{ code: string; name: string }[]>([]);
  const [programme, setProgramme] = useState<string>("");

  const [branchesList, setBranchesList] = useState<{ code: string; name: string }[]>([]);
  const [branch, setBranch] = useState<string>("");

  const [yearsList, setYearsList] = useState<{ code: string; name: string }[]>([]);
  const [sYear, setSYear] = useState<string>("");

  const [sectionsList, setSectionsList] = useState<string[]>([]);
  const [section, setSection] = useState<string>("");

  const [lecturersList, setLecturersList] = useState<AdminLecturerItem[]>([]);
  const [lecturer, setLecturer] = useState<string>("");

  const [periodsList, setPeriodsList] = useState<AdminPeriodItem[]>([]);
  const [period, setPeriod] = useState<string>("");

  const [tlmData, setTlmData] = useState<{ TLM: string }[]>([]);
  const [tlm, setTlm] = useState<string>("");

  // Quick inputs & remarks
  const [absentNumberInput, setAbsentNumberInput] = useState<string>("");
  const [absentNumbersStr, setAbsentNumbersStr] = useState<string>("");
  const [dayTaught, setDayTaught] = useState<string>("");

  // Students roster & search filtering
  const [students, setStudents] = useState<AdminStudentAttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Loading states
  const [loadingProgrammes, setLoadingProgrammes] = useState<boolean>(false);
  const [loadingBranches, setLoadingBranches] = useState<boolean>(false);
  const [loadingYears, setLoadingYears] = useState<boolean>(false);
  const [loadingSections, setLoadingSections] = useState<boolean>(false);
  const [loadingLecturers, setLoadingLecturers] = useState<boolean>(false);
  const [loadingPeriods, setLoadingPeriods] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [savingAttendance, setSavingAttendance] = useState<boolean>(false);

  // 1. Initial Load: Fetch TLM and Programmes for current academicYear
  useEffect(() => {
    const fetchInitialLookups = async () => {
      // Load TLM
      try {
        const tlmRes = await getTLM(academicYear);
        if (tlmRes?.data && Array.isArray(tlmRes.data)) {
          setTlmData(tlmRes.data);
        }
      } catch (err) {
        console.error("Error loading TLM data:", err);
      }

      // Load Programmes
      setLoadingProgrammes(true);
      try {
        const res = await getProgramme(academicYear);
        const list = Array.isArray(res) ? res : res?.data || [];
        const formatted = list
          .map(extractProgramme)
          .filter((p: { code: string; name: string }) => Boolean(p.code));
        setProgrammesList(formatted);
      } catch (err) {
        console.error("Error loading programmes:", err);
      } finally {
        setLoadingProgrammes(false);
      }
    };

    fetchInitialLookups();
  }, [academicYear]);

  // 2. Handle Programme selection -> Load Branches & Years
  const handleProgrammeChange = async (selectedProg: string) => {
    setProgramme(selectedProg);

    // Reset downstream selections
    setBranch("");
    setBranchesList([]);
    setSYear("");
    setYearsList([]);
    setSemester("");
    setSection("");
    setSectionsList([]);
    setLecturer("");
    setLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setDayTaught("");
    setAbsentNumbersStr("");
    setSearchQuery("");

    if (!selectedProg) return;

    setLoadingBranches(true);
    setLoadingYears(true);
    try {
      const [branchRes, yearRes] = await Promise.all([
        getBranch(selectedProg, academicYear),
        getYear(selectedProg, academicYear),
      ]);

      const bList = Array.isArray(branchRes) ? branchRes : branchRes?.data || [];
      setBranchesList(
        bList
          .map(extractBranch)
          .filter((b: { code: string; name: string }) => Boolean(b.code))
      );

      const yList = Array.isArray(yearRes) ? yearRes : yearRes?.data || [];
      setYearsList(
        yList
          .map(extractYear)
          .filter((y: { code: string; name: string }) => Boolean(y.code))
      );
    } catch (err) {
      console.error("Error loading branches and years:", err);
      toast.error("Failed to load branches and years for selected programme.");
    } finally {
      setLoadingBranches(false);
      setLoadingYears(false);
    }
  };

  // Helper to fetch sections when Programme, Branch, and Year are ready
  const fetchSectionsList = async (prog: string, br: string, yr: string) => {
    if (!prog || !br || !yr) {
      setSectionsList([]);
      setSection("");
      return;
    }
    setLoadingSections(true);
    try {
      const res = await getSections(prog, br, yr, academicYear);
      const list = Array.isArray(res) ? res : res?.data || [];
      const formatted = list.map(extractSection).filter(Boolean);
      setSectionsList(formatted);
    } catch (err) {
      console.error("Error loading sections:", err);
      toast.error("Failed to load sections.");
    } finally {
      setLoadingSections(false);
    }
  };

  // 3. Handle Branch selection
  const handleBranchChange = (selectedBranch: string) => {
    setBranch(selectedBranch);
    setSection("");
    setSectionsList([]);
    setLecturer("");
    setLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setDayTaught("");
    setAbsentNumbersStr("");
    setSearchQuery("");

    if (programme && selectedBranch && sYear) {
      fetchSectionsList(programme, selectedBranch, sYear);
    }
  };

  // 4. Handle Year selection
  const handleYearChange = (selectedYear: string) => {
    setSYear(selectedYear);
    setSection("");
    setSectionsList([]);
    setLecturer("");
    setLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setDayTaught("");
    setAbsentNumbersStr("");
    setSearchQuery("");

    if (programme && branch && selectedYear) {
      fetchSectionsList(programme, branch, selectedYear);
    }
  };

  // Helper to load lecturers when all prerequisites are selected
  const fetchLecturersList = async (
    prog: string,
    br: string,
    yr: string,
    sem: string,
    sec: string,
    dt: string,
    sh: string
  ) => {
    if (!prog || !br || !yr || !sem || !sec || !dt) {
      setLecturersList([]);
      setLecturer("");
      return;
    }

    setLoadingLecturers(true);
    try {
      const payload = {
        acdYr: academicYear,
        lecturer: "",
        programme: prog,
        branch: br,
        sYear: yr,
        semester: sem,
        section: sec,
        date: toApiDate(dt),
        subType: "",
        shift: sh,
      };
      const res = await loadAdminAttendanceLecturers(payload);
      const data = res?.data || [];
      setLecturersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading lecturers:", err);
      toast.error("Failed to load faculty for the selected section.");
    } finally {
      setLoadingLecturers(false);
    }
  };

  // 5. Handle Semester change
  const handleSemesterChange = (selectedSem: string) => {
    setSemester(selectedSem);
    setLecturer("");
    setLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setDayTaught("");
    setAbsentNumbersStr("");
    setSearchQuery("");

    if (programme && branch && sYear && selectedSem && section) {
      fetchLecturersList(programme, branch, sYear, selectedSem, section, date, shift);
    }
  };

  // 6. Handle Section change -> Load Lecturers
  const handleSectionChange = (selectedSec: string) => {
    setSection(selectedSec);
    setLecturer("");
    setLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setDayTaught("");
    setAbsentNumbersStr("");
    setSearchQuery("");

    if (programme && branch && sYear && semester && selectedSec) {
      fetchLecturersList(programme, branch, sYear, semester, selectedSec, date, shift);
    }
  };

  // 7. Handle Date & Shift changes
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setLecturer("");
    setLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setSearchQuery("");

    if (programme && branch && sYear && semester && section && newDate) {
      fetchLecturersList(programme, branch, sYear, semester, section, newDate, shift);
    }
  };

  const handleShiftChange = (newShift: string) => {
    setShift(newShift);
    setLecturer("");
    setLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setSearchQuery("");

    if (programme && branch && sYear && semester && section && date) {
      fetchLecturersList(programme, branch, sYear, semester, section, date, newShift);
    }
  };

  // 8. Handle Lecturer selection -> Load Periods
  const handleLecturerChange = async (selectedLec: string) => {
    setLecturer(selectedLec);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setDayTaught("");
    setAbsentNumbersStr("");
    setSearchQuery("");

    if (!selectedLec || !programme || !branch || !sYear || !semester || !section || !date) {
      return;
    }

    setLoadingPeriods(true);
    try {
      const payload = {
        acdYr: academicYear,
        lecturer: selectedLec,
        shift,
        programme,
        branch,
        sYear,
        semester,
        section,
        date: toApiDate(date),
      };
      const res = await loadAdminAttendancePeriods(payload);
      const data = res?.data || [];
      setPeriodsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading periods:", err);
      toast.error("Failed to load periods for selected faculty.");
    } finally {
      setLoadingPeriods(false);
    }
  };

  // 9. Load Students Roster
  const fetchStudentsRoster = async (selectedPeriod: string) => {
    if (!lecturer || !selectedPeriod || !programme || !branch || !sYear || !semester || !section) {
      return;
    }

    setLoadingStudents(true);
    try {
      const payload = {
        lecturer,
        period: selectedPeriod,
        date: toApiDate(date),
        academicYear,
        programme,
        branch,
        sYear,
        semester,
        section,
        isPractical,
        srNo: isPractical ? srNo : "",
        erNo: isPractical ? erNo : "",
      };

      const res = await loadAdminAttendanceStudents(payload);
      const studentRecords: AdminStudentAttendanceRecord[] = res?.data || [];

      if (!Array.isArray(studentRecords) || studentRecords.length === 0) {
        setStudents([]);
        toast.info("No students found for this period.");
        return;
      }

      const normalized = studentRecords.map((st, idx) => ({
        ...st,
        SNO: st.SNO ?? idx + 1,
        ATT: (st.ATT || "").toUpperCase() === "A" ? "A" : "P",
        REMARKS: st.REMARKS || "",
      }));

      setStudents(normalized);
      setSearchQuery("");

      // Pre-fill Taught Chapter if saved earlier
      const existingTaught = studentRecords.find((s) => s.DAYTAUGHT)?.DAYTAUGHT;
      if (existingTaught) {
        setDayTaught(existingTaught);
      }

      toast.success(`Loaded ${normalized.length} students successfully.`);
    } catch (err) {
      console.error("Error loading students:", err);
      toast.error("Failed to load student attendance roster.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // 10. Handle Period selection -> Load Students
  const handlePeriodChange = (selectedPeriod: string) => {
    setPeriod(selectedPeriod);
    setStudents([]);
    setDayTaught("");
    setAbsentNumbersStr("");
    setSearchQuery("");

    if (selectedPeriod) {
      fetchStudentsRoster(selectedPeriod);
    }
  };

  // Synchronize absent numbers string with current attendance
  useEffect(() => {
    const absents = students
      .filter((st) => (st.ATT || "").toUpperCase() === "A")
      .map((st) => {
        const roll = (st.ROLLNO || "").trim();
        return roll || st.REGISTRATIONNO || String(st.SNO);
      });
    setAbsentNumbersStr(absents.join(", "));
  }, [students]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => (s.ATT || "").toUpperCase() === "P").length;
    const absent = students.filter((s) => (s.ATT || "").toUpperCase() === "A").length;
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
    return { total, present, absent, pct };
  }, [students]);

  const isAllPresent = students.length > 0 && stats.absent === 0;
  const isSomePresent = stats.present > 0 && stats.present < stats.total;

  // Filtered students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter((st) => {
      const sNo = String(st.SNO || "").toLowerCase();
      const roll = (st.ROLLNO || "").toLowerCase();
      const reg = (st.REGISTRATIONNO || "").toLowerCase();
      const name = (st.SNAME || "").toLowerCase();
      const remarks = (st.REMARKS || "").toLowerCase();
      return (
        sNo.includes(q) ||
        roll.includes(q) ||
        reg.includes(q) ||
        name.includes(q) ||
        remarks.includes(q)
      );
    });
  }, [students, searchQuery]);

  // Active Subject details
  const activeSubjectInfo = useMemo(() => {
    if (students.length === 0) return null;
    const first = students[0];
    return {
      subCode: first.SUB_CODE || "",
      subjectName: first.SUBJECTNAME || "Subject",
      programmeName: first.PROGRAMME || programme,
      branchName: first.BRANCH || branch,
      year: first.SYEAR || sYear,
      semester: first.SSEMESTER || semester,
      section: first.SECTION || section,
    };
  }, [students, programme, branch, sYear, semester, section]);

  // Toggle individual student attendance by identifier
  const handleToggleStudentAttendance = (studentIdentifier: string | number) => {
    setStudents((prev) =>
      prev.map((st) => {
        const match =
          (st.REGISTRATIONNO && st.REGISTRATIONNO === studentIdentifier) ||
          st.SNO === studentIdentifier;
        if (match) {
          const current = (st.ATT || "").toUpperCase() === "A" ? "A" : "P";
          return {
            ...st,
            ATT: current === "P" ? "A" : "P",
          };
        }
        return st;
      })
    );
  };

  // Remarks change by identifier
  const handleRemarksChange = (studentIdentifier: string | number, val: string) => {
    setStudents((prev) =>
      prev.map((st) => {
        const match =
          (st.REGISTRATIONNO && st.REGISTRATIONNO === studentIdentifier) ||
          st.SNO === studentIdentifier;
        if (match) {
          return { ...st, REMARKS: val };
        }
        return st;
      })
    );
  };

  // Toggle all students Present / Absent
  const handleToggleAll = (markPresent: boolean) => {
    const targetStatus = markPresent ? "P" : "A";
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        ATT: targetStatus,
      }))
    );
    toast.info(`Marked all students as ${markPresent ? "Present" : "Absent"}`);
  };

  // Quick toggle by Serial No. or Roll No.
  const handleQuickAbsentToggle = () => {
    const query = absentNumberInput.trim().toLowerCase();
    if (!query) return;

    const matchedStudent = students.find((st) => {
      const sNo = String(st.SNO || "").trim().toLowerCase();
      const rollNo = (st.ROLLNO || "").trim().toLowerCase();
      const regNo = (st.REGISTRATIONNO || "").trim().toLowerCase();
      return sNo === query || rollNo === query || regNo === query;
    });

    if (matchedStudent) {
      const identifier = matchedStudent.REGISTRATIONNO || (matchedStudent.SNO ?? "");
      handleToggleStudentAttendance(identifier);
      const studentName = matchedStudent.SNAME || query;
      const nextStatus =
        (matchedStudent.ATT || "").toUpperCase() === "A" ? "Present" : "Absent";
      toast.info(`Marked ${studentName} as ${nextStatus}`);
    } else {
      toast.warning(`No student found matching: "${absentNumberInput}"`);
    }

    setAbsentNumberInput("");
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      toast.error("Please select all fields and load students before saving.");
      return;
    }

    if (!lecturer || !period) {
      toast.error("Faculty and Period are required to save attendance.");
      return;
    }

    setSavingAttendance(true);
    try {
      const firstRoll = students[0]?.ROLLNO?.trim() || students[0]?.SNO?.toString() || "1";
      const lastRoll =
        students[students.length - 1]?.ROLLNO?.trim() ||
        students[students.length - 1]?.SNO?.toString() ||
        String(students.length);

      const periodSingle = period.includes(",") ? period.split(",")[0].trim() : period;
      const periodRange = period.includes(",") ? period : `${period},${period}`;
      const subjectCode = students[0]?.SUB_CODE || "";

      const studentItems = students.map((st, idx) => ({
        sNo: idx,
        regNo: st.REGISTRATIONNO || null,
        status: (st.ATT || "").toUpperCase() === "A" ? "A" : "P",
        remarks: st.REMARKS || "",
      }));

      const payload = {
        lecturer,
        semester,
        programme,
        branch,
        sYear,
        section,
        period: periodSingle,
        subjects: subjectCode,
        academicYear,
        day: getDayName(date),
        date: toApiDate(date),
        srNo: firstRoll,
        erNo: lastRoll,
        dayTaught: dayTaught.trim() || "Regular Session",
        attStat: "Y",
        query: "",
        periodRange,
        tlm: tlm || "PPT",
        students: studentItems,
      };

      const res = await saveAdminAttendanceSubjectWise(payload);
      if (res?.success) {
        toast.success(res.message || "Attendance saved successfully!");
      } else {
        toast.warning(res?.message || "Attendance saved with warnings.");
      }
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to save attendance.");
    } finally {
      setSavingAttendance(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    setDate(getTodayInputDate());
    setShift("1");
    setProgramme("");
    setBranch("");
    setBranchesList([]);
    setSYear("");
    setYearsList([]);
    setSemester("");
    setSection("");
    setSectionsList([]);
    setLecturer("");
    setLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setTlm("");
    setIsPractical(false);
    setSrNo("");
    setErNo("");
    setAbsentNumberInput("");
    setAbsentNumbersStr("");
    setDayTaught("");
    setStudents([]);
    setSearchQuery("");
    toast.info("Form filters cleared.");
  };

  return (
    <div className="dbs-batches-container">
      {/* Header matching Batches form */}
      <div className="dbs-batches-header">
        <div className="dbs-batches-title-group">
          <div className="dbs-batches-icon-wrapper">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2>Attendance By Admin</h2>
            <p>Mark &amp; Manage Subject-wise Student Attendance</p>
          </div>
        </div>

        <div className="dbs-batches-badges">
          <span className="dbs-batches-ay-badge">
            Academic Year: <strong>{academicYear}</strong>
          </span>
          {students.length > 0 && (
            <span className="dbs-batches-count-badge">
              <Users size={14} />
              Total Students: <strong>{stats.total}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Attendance Criteria Card */}
      <div className="dbs-batches-card">
        <div className="dbs-batches-card-header">
          <h3>
            <Layers size={18} />
            Session &amp; Attendance Details
          </h3>
          <div className="dbs-att-note-pill">
            <AlertCircle size={14} />
            <span>Red row indicates Absent</span>
          </div>
        </div>

        <div className="dbs-timetable-grid">
          {/* 1. Date & Shift */}
          <div className="dbs-input-box dbs-double-select">
            <label>Date &amp; Shift</label>
            <div>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              <select
                value={shift}
                onChange={(e) => handleShiftChange(e.target.value)}
              >
                <option value="1">Shift 1</option>
                <option value="2">Shift 2</option>
              </select>
            </div>
          </div>

          {/* 2. Programme */}
          <div className="dbs-input-box">
            <label>
              Programme
              {loadingProgrammes && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              value={programme}
              onChange={(e) => handleProgrammeChange(e.target.value)}
              disabled={loadingProgrammes}
            >
              <option value="">Select Programme</option>
              {programmesList.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Branch */}
          <div className="dbs-input-box">
            <label>
              Branch
              {loadingBranches && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              value={branch}
              onChange={(e) => handleBranchChange(e.target.value)}
              disabled={loadingBranches || !programme}
            >
              <option value="">Select Branch</option>
              {branchesList.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Year & Semester (Double Select) */}
          <div className="dbs-input-box dbs-double-select">
            <label>
              Year &amp; Semester
              {loadingYears && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <div>
              <select
                value={sYear}
                onChange={(e) => handleYearChange(e.target.value)}
                disabled={loadingYears || !programme}
              >
                <option value="">Select Year</option>
                {yearsList.map((y) => (
                  <option key={y.code} value={y.code}>
                    {y.name}
                  </option>
                ))}
              </select>

              <select
                value={semester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                disabled={!sYear}
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>

          {/* 5. Section */}
          <div className="dbs-input-box">
            <label>
              Section
              {loadingSections && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              value={section}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={loadingSections || !sYear || !branch}
            >
              <option value="">Select Section</option>
              {sectionsList.map((sec, idx) => (
                <option key={idx} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Lecturer */}
          <div className="dbs-input-box">
            <label>
              Lecturer
              {loadingLecturers && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              value={lecturer}
              onChange={(e) => handleLecturerChange(e.target.value)}
              disabled={loadingLecturers || lecturersList.length === 0}
            >
              <option value="">Select Lecturer</option>
              {lecturersList.map((lec, idx) => (
                <option key={idx} value={lec.LECTURER}>
                  {lec.FNAME}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Period(s) */}
          <div className="dbs-input-box">
            <label>
              Period(s)
              {loadingPeriods && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              disabled={loadingPeriods || periodsList.length === 0}
            >
              <option value="">Select Period</option>
              {periodsList.map((p, idx) => (
                <option key={idx} value={p.FRM_TO_PERIODS}>
                  Period {p.FRM_TO_PERIODS} {p.SUBJECTNAME ? `- ${p.SUBJECTNAME}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* 8. Teaching Method */}
          <div className="dbs-input-box">
            <label>Teaching Method (TLM)</label>
            <select
              value={tlm}
              onChange={(e) => setTlm(e.target.value)}
            >
              <option value="">Select Learning Method</option>
              {tlmData.map((data, index) => (
                <option key={index} value={data.TLM}>
                  {data.TLM}
                </option>
              ))}
            </select>
          </div>

          {/* 9. Quick Mark Absent */}
          <div className="dbs-input-box">
            <label>
              Quick Toggle Absent
              <span className="dbs-sub-label">Enter Serial or Roll No</span>
            </label>
            <div className="dbs-quick-absent-group">
              <input
                type="text"
                placeholder="e.g. 5 or Roll No..."
                value={absentNumberInput}
                onChange={(e) => setAbsentNumberInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleQuickAbsentToggle();
                  }
                }}
              />
              <button
                type="button"
                className="dbs-quick-absent-btn"
                onClick={handleQuickAbsentToggle}
                disabled={!absentNumberInput.trim() || students.length === 0}
              >
                Toggle
              </button>
            </div>
          </div>

          {/* 10. Practical Session */}
          <div className="dbs-input-box">
            <label>Session Type</label>
            <label className="dbs-custom-checkbox-wrapper" htmlFor="practicalCheck">
              <input
                type="checkbox"
                id="practicalCheck"
                checked={isPractical}
                onChange={(e) => setIsPractical(e.target.checked)}
              />
              <span>Is Practical Session</span>
            </label>
          </div>

          {/* Practical Roll Range (Conditional) */}
          {isPractical && (
            <div className="dbs-input-box dbs-double-select dbs-full-width">
              <label>Practical Roll Range (Start - End)</label>
              <div>
                <input
                  type="text"
                  placeholder="First RegdNo (srNo)"
                  value={srNo}
                  onChange={(e) => setSrNo(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Last RegdNo (erNo)"
                  value={erNo}
                  onChange={(e) => setErNo(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* 11. Absent Number(s) */}
          <div className="dbs-input-box dbs-full-width">
            <label>
              Absent Number(s)
              <span className="dbs-sub-label">Auto-generated from marked absentees</span>
            </label>
            <textarea
              rows={2}
              placeholder="No students marked absent yet."
              value={absentNumbersStr}
              readOnly
              className="dbs-readonly-textarea"
            />
          </div>

          {/* 12. Taught Chapter */}
          <div className="dbs-input-box dbs-full-width">
            <label>Taught Chapter / Topics Covered</label>
            <textarea
              rows={2}
              placeholder="Enter chapter or lecture topics covered today..."
              value={dayTaught}
              onChange={(e) => setDayTaught(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="dbs-form-actions-row">
          <button
            type="button"
            className="dbs-form-save-btn"
            onClick={handleSaveAttendance}
            disabled={savingAttendance || students.length === 0}
          >
            {savingAttendance ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {savingAttendance ? "Saving Attendance..." : "Save Attendance"}
          </button>

          <button
            type="button"
            className="dbs-form-cancel-btn"
            onClick={handleReset}
            disabled={savingAttendance}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Subject & Session Banner */}
      {activeSubjectInfo && (
        <div className="dbs-subject-banner">
          <div className="dbs-subject-banner-title">
            <BookOpen size={18} />
            <span>
              {activeSubjectInfo.subCode ? `[${activeSubjectInfo.subCode}] ` : ""}
              {activeSubjectInfo.subjectName}
            </span>
          </div>
          <div className="dbs-subject-meta">
            <span>
              Date: <strong>{toApiDate(date)}</strong>
            </span>
            <span>
              Day: <strong>{getDayName(date)}</strong>
            </span>
            <span>
              Period: <strong>{period}</strong>
            </span>
            <span>
              Section: <strong>{section}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Attendance Stats Cards */}
      {students.length > 0 && (
        <div className="dbs-stat-summary-row">
          <div className="dbs-stat-pill">
            <div className="dbs-stat-pill-header">
              <span className="dbs-stat-pill-label">Total Students</span>
              <Users size={16} className="text-slate-500" />
            </div>
            <span className="dbs-stat-pill-value">{stats.total}</span>
          </div>

          <div className="dbs-stat-pill present">
            <div className="dbs-stat-pill-header">
              <span className="dbs-stat-pill-label">Present</span>
              <CheckCircle2 size={16} className="dbs-stat-icon" />
            </div>
            <span className="dbs-stat-pill-value">{stats.present}</span>
          </div>

          <div className="dbs-stat-pill absent">
            <div className="dbs-stat-pill-header">
              <span className="dbs-stat-pill-label">Absent</span>
              <XCircle size={16} className="dbs-stat-icon" />
            </div>
            <span className="dbs-stat-pill-value">{stats.absent}</span>
          </div>

          <div className="dbs-stat-pill pct">
            <div className="dbs-stat-pill-header">
              <span className="dbs-stat-pill-label">Attendance Rate</span>
              <span className="dbs-stat-pill-badge">{stats.pct}%</span>
            </div>
            <span className="dbs-stat-pill-value">{stats.pct}%</span>
          </div>
        </div>
      )}

      {/* Student Attendance Roster Card */}
      <div className="dbs-students-card">
        <div className="dbs-students-toolbar">
          <div className="dbs-students-toolbar-title">
            <h3>
              <Users size={18} />
              Student Attendance Roster
            </h3>
            {students.length > 0 && (
              <span className="dbs-batches-ay-badge">
                Present: <strong>{stats.present}</strong> / {stats.total}
              </span>
            )}
          </div>

          {students.length > 0 && (
            <div className="dbs-students-toolbar-actions">
              <div className="dbs-quick-mark-btns">
                <button
                  type="button"
                  className="dbs-mark-all-btn present"
                  onClick={() => handleToggleAll(true)}
                  title="Mark all students Present"
                >
                  <CheckCircle2 size={14} />
                  Mark All Present
                </button>
                <button
                  type="button"
                  className="dbs-mark-all-btn absent"
                  onClick={() => handleToggleAll(false)}
                  title="Mark all students Absent"
                >
                  <XCircle size={14} />
                  Mark All Absent
                </button>
              </div>

              <div className="dbs-students-search-wrapper">
                <Search size={16} className="dbs-students-search-icon" />
                <input
                  type="text"
                  placeholder="Search by roll, reg no, or name..."
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
          {loadingStudents ? (
            <div className="dbs-table-empty">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <p>Loading student attendance roster...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <table className="dbs-attendance-table">
              <thead>
                <tr>
                  <th style={{ width: "70px" }} className="dbs-text-center">
                    S.No
                  </th>
                  <th style={{ width: "110px" }}>Roll No</th>
                  <th style={{ width: "170px" }}>Register No</th>
                  <th>Student Name</th>
                  <th style={{ width: "130px" }} className="dbs-text-center">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <input
                        type="checkbox"
                        className="dbs-att-checkbox"
                        checked={isAllPresent}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomePresent;
                        }}
                        onChange={(e) => handleToggleAll(e.target.checked)}
                        title="Toggle all Present / Absent"
                      />
                      <span>Status</span>
                    </div>
                  </th>
                  <th style={{ width: "230px" }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st, index) => {
                  const isAbsent = (st.ATT || "").toUpperCase() === "A";
                  const roll = (st.ROLLNO || "").trim() || String(st.SNO ?? index + 1);
                  const identifier = st.REGISTRATIONNO || st.SNO || index;

                  return (
                    <tr
                      key={identifier}
                      className={isAbsent ? "dbs-student-absent" : ""}
                    >
                      <td className="dbs-text-center font-semibold">
                        {st.SNO ?? index + 1}
                      </td>
                      <td>
                        <strong>{roll}</strong>
                      </td>
                      <td>
                        <span className="dbs-regno-badge">
                          {st.REGISTRATIONNO || "-"}
                        </span>
                      </td>
                      <td>
                        <strong>{st.SNAME || "-"}</strong>
                      </td>
                      <td className="dbs-text-center">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="checkbox"
                            className="dbs-att-checkbox"
                            checked={!isAbsent}
                            onChange={() => handleToggleStudentAttendance(identifier)}
                            title={isAbsent ? "Click to mark Present" : "Click to mark Absent"}
                          />
                          <span
                            className={`dbs-status-badge ${
                              isAbsent ? "absent" : "present"
                            }`}
                          >
                            {isAbsent ? "A" : "P"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="dbs-att-remarks-input"
                          placeholder="Optional remark..."
                          value={st.REMARKS || ""}
                          onChange={(e) => handleRemarksChange(identifier, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="dbs-table-empty">
              <AlertCircle size={32} />
              <p>
                {students.length > 0 && searchQuery
                  ? "No students match your search criteria."
                  : "Select all session details (Date, Shift, Programme, Branch, Year, Section, Lecturer, and Period) above to view and mark attendance."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceByAdmin;
