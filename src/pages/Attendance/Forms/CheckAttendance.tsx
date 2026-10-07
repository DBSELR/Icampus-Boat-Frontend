import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  RotateCcw,
  Search,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  Sparkles,
  BookOpen,
  Eye,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProgramme,
  getBranch,
  getYear,
  getSections,
} from "../../../apis/Common";
import {
  loadCheckAttendancePeriods,
  loadCheckAttendanceStudents,
  getTimeTableLecturers,
  PeriodItem,
  StudentAttendanceItem,
} from "../../../apis/AttendanceApis";
import "./CheckAttendance.css";

const toApiDate = (dateVal: string): string => {
  if (!dateVal) return "";
  const parts = dateVal.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD -> DD-MM-YYYY
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateVal;
  }
  return dateVal;
};

const DEFAULT_PROGRAMMES = [
  { code: "01", name: "B.Tech" },
  { code: "02", name: "M.Tech" },
  { code: "03", name: "MBA" },
  { code: "04", name: "MCA" },
];

const DEFAULT_BRANCHES = [
  { code: "05", name: "Computer Science & Engineering" },
  { code: "04", name: "Electronics & Communication" },
  { code: "02", name: "Electrical & Electronics" },
  { code: "03", name: "Mechanical Engineering" },
  { code: "01", name: "Civil Engineering" },
  { code: "12", name: "Information Technology" },
];

const DEFAULT_YEARS = [
  { code: "1", name: "1st Year" },
  { code: "2", name: "2nd Year" },
  { code: "3", name: "3rd Year" },
  { code: "4", name: "4th Year" },
];

const DEFAULT_SEMESTERS = [
  { code: "1", name: "Semester 1" },
  { code: "2", name: "Semester 2" },
];

const DEFAULT_SECTIONS = ["A", "B", "C", "D"];

const DEFAULT_LECTURERS = [
  { code: "T848", name: "T848 - Senior Faculty" },
  { code: "T818", name: "T818 - CHAKALI RAJAMALLU" },
  { code: "T817", name: "T817 - JAMPANI VENKATESWARARAO" },
  { code: "T397", name: "T397 - VENKATA LAKSHMI. D" },
  { code: "T686", name: "T686 - LAKSHMI PRASAD. K" },
];

const extractCourse = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string") return { code: item, name: item };
  const rawCode = String(
    item.COURSECODE ??
      item.COURSE_CODE ??
      item.CourseCode ??
      item.courseCode ??
      item.PROGRAMMECODE ??
      item.PROGRAMME ??
      item.Programme ??
      item.programme ??
      item.code ??
      item.id ??
      item.CID ??
      item.COURSE ??
      ""
  ).trim();

  const rawName = String(
    item.COURSE ??
      item.COURSENAME ??
      item.COURSE_NAME ??
      item.CourseName ??
      item.PROGRAMMENAME ??
      item.PROGRAMME_NAME ??
      item.PROGRAMME ??
      item.Programme ??
      item.name ??
      rawCode
  ).trim();

  const code = rawCode === "-" ? "" : rawCode;
  const name = rawName === "-" ? "" : rawName;
  return { code: code || name, name: name || code };
};

const extractBranch = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string") return { code: item, name: item };
  const rawCode = String(
    item.BRANCHCODE ??
      item.BRANCH_CODE ??
      item.BranchCode ??
      item.BRANCH ??
      item.Branch ??
      item.code ??
      item.id ??
      item.BID ??
      ""
  ).trim();

  const rawName = String(
    item.BRANCHNAME ??
      item.BRANCH_NAME ??
      item.BranchName ??
      item.BRANCH ??
      item.Branch ??
      item.name ??
      rawCode
  ).trim();

  const code = rawCode === "-" ? "" : rawCode;
  const name = rawName === "-" ? "" : rawName;
  return { code: code || name, name: name || code };
};

const extractYear = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string" || typeof item === "number") {
    return { code: String(item), name: `Year ${item}` };
  }
  const rawCode = String(
    item.ID ??
      item.id ??
      item.YEAR ??
      item.Year ??
      item.year ??
      item.SYear ??
      item.sYear ??
      item.code ??
      ""
  ).trim();

  const rawData = String(
    item.DATA ??
      item.data ??
      item.YEAR_NAME ??
      item.YEARNAME ??
      item.YearName ??
      item.NAME ??
      item.name ??
      rawCode
  ).trim();

  const code = rawCode === "-" ? "" : rawCode;
  let name = rawData === "-" ? "" : rawData;
  if (name === "1") name = "1st Year";
  else if (name === "2") name = "2nd Year";
  else if (name === "3") name = "3rd Year";
  else if (name === "4") name = "4th Year";
  else if (name && !name.toLowerCase().includes("year")) {
    name = `${name} Year`;
  }

  return { code: code || name, name: name || (code ? `Year ${code}` : "") };
};

const extractSection = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string") {
    return { code: item, name: `Section ${item}` };
  }
  const rawCode = String(
    item.Section ??
      item.SECTION ??
      item.section ??
      item.code ??
      item.id ??
      ""
  ).trim();

  const code = rawCode === "-" ? "" : rawCode;
  return { code, name: code ? `Section ${code}` : "Section" };
};

const extractLecturer = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string" || typeof item === "number") {
    const s = String(item).trim();
    return { code: s, name: s };
  }
  const rawCode = String(
    item.EmpID ??
      item.empId ??
      item.EMPID ??
      item.lecturer ??
      item.Lecturer ??
      item.LECTURER ??
      item.code ??
      item.id ??
      ""
  ).trim();

  const rawName = String(
    item.Fname ??
      item.fname ??
      item.FName1 ??
      item.facultyName ??
      item.FacultyName ??
      item.lecturerName ??
      item.LecturerName ??
      item.name ??
      rawCode
  ).trim();

  const code = rawCode === "-" ? "" : rawCode;
  const name = rawName === "-" ? "" : rawName;
  return { code: code || name, name: name || code };
};

const CheckAttendance: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2026-2027";

  // Form Fields State - initially empty
  const [date, setDate] = useState<string>("");
  const [shift, setShift] = useState<string>("");
  const [programme, setProgramme] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [sYear, setSYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [lecturer, setLecturer] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [isPractical, setIsPractical] = useState<boolean>(false);
  const [srNo, setSrNo] = useState<string>("");
  const [erNo, setErNo] = useState<string>("");

  // Dynamic Options
  const [programmeOptions, setProgrammeOptions] = useState<any[]>([]);
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [yearOptions, setYearOptions] = useState<any[]>([]);
  const [sectionOptions, setSectionOptions] = useState<any[]>([]);
  const [lecturerOptions, setLecturerOptions] = useState<any[]>([]);

  // Results & Loading States - empty initially
  const [loadingPeriods, setLoadingPeriods] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [periodsList, setPeriodsList] = useState<PeriodItem[]>([]);
  const [hasLoadedPeriods, setHasLoadedPeriods] = useState<boolean>(false);

  const [studentsList, setStudentsList] = useState<StudentAttendanceItem[]>([]);
  const [hasLoadedStudents, setHasLoadedStudents] = useState<boolean>(false);

  // Student Filter / Search
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT">("ALL");

  // Load Initial Common Dropdowns
  useEffect(() => {
    const loadCommonData = async () => {
      try {
        const progRes = await getProgramme();
        const list = Array.isArray(progRes)
          ? progRes
          : Array.isArray((progRes as any)?.data)
          ? (progRes as any).data
          : [];
        if (list.length > 0) setProgrammeOptions(list);
        else setProgrammeOptions(DEFAULT_PROGRAMMES);
      } catch (e) {
        console.warn("Could not fetch programmes:", e);
        setProgrammeOptions(DEFAULT_PROGRAMMES);
      }

      try {
        const lectRes = await getTimeTableLecturers({
          programme: "01",
          year: "3",
          semister: "1",
          subcode: "",
        });
        const list = Array.isArray(lectRes)
          ? lectRes
          : Array.isArray((lectRes as any)?.data)
          ? (lectRes as any).data
          : [];
        if (list.length > 0) setLecturerOptions(list);
        else setLecturerOptions(DEFAULT_LECTURERS);
      } catch (e) {
        console.warn("Could not fetch lecturers:", e);
        setLecturerOptions(DEFAULT_LECTURERS);
      }
    };

    loadCommonData();
  }, []);

  // Cascading Branch & Year when Programme changes
  useEffect(() => {
    if (!programme) {
      setBranchOptions([]);
      setYearOptions([]);
      setSectionOptions([]);
      setBranch("");
      setSYear("");
      setSection("");
      return;
    }
    const loadBranchesAndYears = async () => {
      try {
        const [bRes, yRes] = await Promise.all([
          getBranch(programme),
          getYear(programme),
        ]);
        const bList = Array.isArray(bRes)
          ? bRes
          : Array.isArray((bRes as any)?.data)
          ? (bRes as any).data
          : [];
        const yList = Array.isArray(yRes)
          ? yRes
          : Array.isArray((yRes as any)?.data)
          ? (yRes as any).data
          : [];

        if (bList.length > 0) setBranchOptions(bList);
        else setBranchOptions(DEFAULT_BRANCHES);

        if (yList.length > 0) setYearOptions(yList);
        else setYearOptions(DEFAULT_YEARS);
      } catch (e) {
        console.warn("Could not load branch/year cascade:", e);
        setBranchOptions(DEFAULT_BRANCHES);
        setYearOptions(DEFAULT_YEARS);
      }
    };
    loadBranchesAndYears();
  }, [programme]);

  // Cascading Sections when Programme, Branch, and sYear change
  useEffect(() => {
    if (!programme || !branch || !sYear) {
      setSectionOptions([]);
      setSection("");
      return;
    }

    const loadSectionsCascade = async () => {
      try {
        const sRes = await getSections(programme, branch, sYear);
        const sList = Array.isArray(sRes)
          ? sRes
          : Array.isArray((sRes as any)?.data)
          ? (sRes as any).data
          : [];
        if (sList.length > 0) setSectionOptions(sList);
        else setSectionOptions(DEFAULT_SECTIONS);
      } catch (e) {
        console.warn("Could not load sections cascade:", e);
        setSectionOptions(DEFAULT_SECTIONS);
      }
    };
    loadSectionsCascade();
  }, [programme, branch, sYear]);

  // Refresh Lecturers when Programme, sYear or Semester changes
  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const lectRes = await getTimeTableLecturers({
          programme: programme || "01",
          year: sYear || "3",
          semister: semester || "1",
          subcode: "",
        });
        const list = Array.isArray(lectRes)
          ? lectRes
          : Array.isArray((lectRes as any)?.data)
          ? (lectRes as any).data
          : [];
        if (list.length > 0) setLecturerOptions(list);
        else setLecturerOptions(DEFAULT_LECTURERS);
      } catch (e) {
        console.warn("Could not fetch lecturers:", e);
        setLecturerOptions(DEFAULT_LECTURERS);
      }
    };
    fetchLecturers();
  }, [programme, sYear, semester]);

  // 1. API Call: LoadPeriods (/api/CheckAttendance/periods)
  const handleLoadPeriods = async () => {
    const formattedDate = toApiDate(date);
    if (!formattedDate) {
      toast.warning("Please select a date.");
      return;
    }

    setLoadingPeriods(true);
    try {
      const data = await loadCheckAttendancePeriods({
        acdYr: academicYear,
        lecturer: lecturer || "",
        date: formattedDate,
        shift: shift || "1",
        programme: programme || "",
        branch: branch || "",
        semester: semester || "",
        section: section || "",
        sYear: sYear || "",
      });

      if (data && data.length > 0) {
        setPeriodsList(data);
        toast.success(`Loaded ${data.length} period(s) successfully.`);
      } else {
        setPeriodsList([]);
        toast.info("No periods found for the selected criteria.");
      }
      setHasLoadedPeriods(true);
    } catch (error) {
      console.warn("Error loading periods:", error);
      setPeriodsList([]);
      setHasLoadedPeriods(true);
      toast.error("Failed to load periods from server.");
    } finally {
      setLoadingPeriods(false);
    }
  };

  // 2. API Call: Load Grid (/api/CheckAttendance/students)
  const handleLoadStudents = async (selectedPeriodOverride?: string) => {
    const targetPeriod = selectedPeriodOverride || period;
    const formattedDate = toApiDate(date);

    if (!formattedDate) {
      toast.warning("Please select a date.");
      return;
    }

    if (!targetPeriod) {
      toast.warning("Please select a period.");
      return;
    }

    setLoadingStudents(true);
    try {
      const data = await loadCheckAttendanceStudents({
        period: targetPeriod,
        lecturer: lecturer || "",
        date: formattedDate,
        academicYear: academicYear,
        section: section || "",
        branch: branch || "",
        sYear: sYear || "",
        programme: programme || "",
        semester: semester || "",
        isPractical: isPractical,
        srNo: srNo || "",
        erNo: erNo || "",
      });

      if (data && data.length > 0) {
        setStudentsList(data);
        toast.success(`Attendance records loaded for Period ${targetPeriod}.`);
      } else {
        setStudentsList([]);
        toast.info(`No student records found for Period ${targetPeriod}.`);
      }
      setHasLoadedStudents(true);
    } catch (error) {
      console.warn("Error loading students:", error);
      setStudentsList([]);
      setHasLoadedStudents(true);
      toast.error("Failed to load attendance grid from server.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Select Period from Table
  const handleSelectPeriodCard = (pNo: string | number) => {
    const pStr = String(pNo);
    setPeriod(pStr);
    handleLoadStudents(pStr);
  };

  // Handle Reset
  const handleReset = () => {
    setDate("");
    setShift("");
    setProgramme("");
    setBranch("");
    setSYear("");
    setSemester("");
    setSection("");
    setLecturer("");
    setPeriod("");
    setIsPractical(false);
    setSrNo("");
    setErNo("");
    setPeriodsList([]);
    setStudentsList([]);
    setHasLoadedPeriods(false);
    setHasLoadedStudents(false);
    setStudentSearch("");
    setStatusFilter("ALL");
    toast.info("All fields and tables reset.");
  };

  // Helper to determine if a student is absent
  const isStudentAbsent = (s: any): boolean => {
    if (s.isPresent === false || s.IS_PRESENT === false || s.ISPRESENT === false) return true;
    const att = String(
      s.ATT ??
        s.att ??
        s.status ??
        s.STATUS ??
        s.attendanceStatus ??
        s.ATTENDANCE_STATUS ??
        ""
    ).trim().toUpperCase();
    if (att === "A" || att === "ABSENT") return true;
    return false;
  };

  const isStudentPresent = (s: any): boolean => {
    if (s.isPresent === true || s.IS_PRESENT === true || s.ISPRESENT === true) return true;
    const att = String(
      s.ATT ??
        s.att ??
        s.status ??
        s.STATUS ??
        s.attendanceStatus ??
        s.ATTENDANCE_STATUS ??
        ""
    ).trim().toUpperCase();
    if (att === "P" || att === "PRESENT") return true;
    return !isStudentAbsent(s);
  };

  // Filtered Students Calculation
  const filteredStudents = useMemo(() => {
    let list = studentsList;

    if (statusFilter === "PRESENT") {
      list = list.filter((s) => isStudentPresent(s));
    } else if (statusFilter === "ABSENT") {
      list = list.filter((s) => isStudentAbsent(s));
    }

    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      list = list.filter((s) => {
        const reg = String(
          s.REGISTRATIONNO ??
            s.regNo ??
            s.registrationNo ??
            s.ROLLNO ??
            s.rollNo ??
            s.HTNO ??
            s.htno ??
            ""
        ).toLowerCase();
        const name = String(
          s.SNAME ??
            s.sname ??
            s.STUDENTNAME ??
            s.studentName ??
            s.name ??
            ""
        ).toLowerCase();
        const parentMob = String(s.PARENTMBNO ?? "").toLowerCase();
        return reg.includes(q) || name.includes(q) || parentMob.includes(q);
      });
    }

    return list;
  }, [studentsList, statusFilter, studentSearch]);

  // Statistics
  const stats = useMemo(() => {
    const total = studentsList.length;
    const absent = studentsList.filter((s) => isStudentAbsent(s)).length;
    const present = total - absent;
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
    return { total, present, absent, pct };
  }, [studentsList]);

  // Active period object to retrieve current SUBJECTNAME
  const activePeriodObj = useMemo(() => {
    if (!period) return null;
    return (
      periodsList.find((p) => {
        const pNum = String(
          p.period ?? p.periodNo ?? p.PERIOD ?? p.PERIODNO ?? p.FRM_TO_PERIODS
        );
        return pNum === String(period);
      }) || null
    );
  }, [periodsList, period]);

  const activeSubjectName = useMemo(() => {
    // 1. From student records (each student in the response has SUBJECTNAME)
    const fromStudent = studentsList.find((s) => s.SUBJECTNAME || s.subjectName);
    if (fromStudent) {
      const val = fromStudent.SUBJECTNAME || fromStudent.subjectName;
      if (val) return String(val).trim();
    }
    // 2. From active period card
    if (!activePeriodObj) return "";
    return String(
      activePeriodObj.SUBJECTNAME ||
        activePeriodObj.subjectName ||
        activePeriodObj.sUBJECTNAME ||
        activePeriodObj.SUBJECT ||
        activePeriodObj.subject ||
        ""
    ).trim();
  }, [activePeriodObj, studentsList]);

  const activeDayTaught = useMemo(() => {
    const fromStudent = studentsList.find((s) => s.DAYTAUGHT || s.dayTaught);
    return fromStudent ? String(fromStudent.DAYTAUGHT || fromStudent.dayTaught || "").trim() : "";
  }, [studentsList]);

  return (
    <div className="dbs-check-att-container">
      {/* ================= Page Header ================= */}
      <div className="dbs-check-att-header">
        <div className="dbs-check-att-title-group">
          <div className="dbs-check-att-icon-wrapper">
            <CalendarCheck size={24} />
          </div>
          <div>
            <h2>Check Attendance</h2>
            <p>View & verify student attendance records and period logs</p>
          </div>
        </div>

        <div className="dbs-check-att-badges">
          <div className="dbs-check-att-ay-badge">
            Academic Year: <strong>{academicYear}</strong>
          </div>
        </div>
      </div>

      {/* ================= Filter Card ================= */}
      <div className="dbs-check-att-card">
        <div className="dbs-check-att-card-header">
          <h3>
            <BookOpen size={18} />
            <span>Attendance Criteria & Schedule Filters</span>
          </h3>
        </div>

        {/* Note indicating Absent status */}
        <div className="dbs-attendance-note">
          <AlertCircle size={17} />
          <span>NOTE : RED COLOUR INDICATES ABSENT</span>
        </div>

        {/* Grid Controls */}
        <div className="dbs-check-att-grid">
          {/* Date */}
          <div className="dbs-check-input-box">
            <label>Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Shift */}
          <div className="dbs-check-input-box">
            <label>Shift *</label>
            <select value={shift} onChange={(e) => setShift(e.target.value)}>
              <option value="">Select Shift</option>
              <option value="1">Shift-1</option>
              <option value="2">Shift-2</option>
            </select>
          </div>

          {/* Programme */}
          <div className="dbs-check-input-box">
            <label>Programme *</label>
            <select
              value={programme}
              onChange={(e) => {
                setProgramme(e.target.value);
                setBranch("");
                setSYear("");
                setSection("");
              }}
            >
              <option value="">Select Programme</option>
              {(programmeOptions.length > 0 ? programmeOptions : DEFAULT_PROGRAMMES).map((p, idx) => {
                const { code, name } = extractCourse(p);
                if (!code && !name) return null;
                const cleanCode = code === "-" ? "" : code;
                const cleanName = name === "-" ? "" : name;
                const label =
                  cleanCode && cleanName && cleanCode !== cleanName
                    ? `${cleanCode} - ${cleanName}`
                    : cleanName || cleanCode;
                if (!label || label === "-") return null;
                return (
                  <option key={idx} value={cleanCode || cleanName}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Branch */}
          <div className="dbs-check-input-box">
            <label>Branch *</label>
            <select
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setSection("");
              }}
              disabled={!programme}
            >
              <option value="">Select Branch</option>
              {(branchOptions.length > 0 ? branchOptions : DEFAULT_BRANCHES).map((b, idx) => {
                const { code, name } = extractBranch(b);
                if (!code && !name) return null;
                const cleanCode = code === "-" ? "" : code;
                const cleanName = name === "-" ? "" : name;
                const label =
                  cleanCode && cleanName && cleanCode !== cleanName
                    ? `${cleanCode} - ${cleanName}`
                    : cleanName || cleanCode;
                if (!label || label === "-") return null;
                return (
                  <option key={idx} value={cleanCode || cleanName}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Year (sYear) */}
          <div className="dbs-check-input-box">
            <label>Year (sYear) *</label>
            <select
              value={sYear}
              onChange={(e) => {
                setSYear(e.target.value);
                setSection("");
              }}
              disabled={!programme}
            >
              <option value="">Select Year</option>
              {(yearOptions.length > 0 ? yearOptions : DEFAULT_YEARS).map((y, idx) => {
                const { code, name } = extractYear(y);
                if (!code) return null;
                return (
                  <option key={idx} value={code}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Semester */}
          <div className="dbs-check-input-box">
            <label>Semester *</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="">Select Semester</option>
              {DEFAULT_SEMESTERS.map((sem, idx) => (
                <option key={idx} value={sem.code}>
                  {sem.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="dbs-check-input-box">
            <label>Section *</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              disabled={!sYear}
            >
              <option value="">Select Section</option>
              {(sectionOptions.length > 0 ? sectionOptions : DEFAULT_SECTIONS).map((sec, idx) => {
                const { code, name } = extractSection(sec);
                if (!code) return null;
                return (
                  <option key={idx} value={code}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Lecturer */}
          <div className="dbs-check-input-box">
            <label>Lecturer *</label>
            <select
              value={lecturer}
              onChange={(e) => setLecturer(e.target.value)}
            >
              <option value="">Select Lecturer</option>
              {(lecturerOptions.length > 0 ? lecturerOptions : DEFAULT_LECTURERS).map((l, idx) => {
                const { code, name } = extractLecturer(l);
                if (!code && !name) return null;
                const cleanCode = code === "-" ? "" : code;
                const cleanName = name === "-" ? "" : name;
                const label =
                  cleanCode && cleanName && cleanCode !== cleanName
                    ? `${cleanCode} - ${cleanName}`
                    : cleanName || cleanCode;
                if (!label || label === "-") return null;
                return (
                  <option key={idx} value={cleanCode || cleanName}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Period */}
          <div className="dbs-check-input-box">
            <label>Period</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="">Select Period</option>
              {periodsList.length > 0
                ? periodsList.map((p, idx) => {
                    const pNum = String(
                      p.period ?? p.periodNo ?? p.PERIOD ?? p.PERIODNO ?? p.FRM_TO_PERIODS ?? idx + 1
                    );
                    const subj = String(
                      p.SUBJECTNAME ??
                        p.subjectName ??
                        p.sUBJECTNAME ??
                        p.SUBJECT ??
                        p.subject ??
                        ""
                    ).trim();
                    return (
                      <option key={idx} value={pNum}>
                        Period {pNum} {subj ? `(${subj})` : ""}
                      </option>
                    );
                  })
                : [1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={String(num)}>
                      Period {num}
                    </option>
                  ))}
            </select>
          </div>

          {/* Start Roll No */}
          <div className="dbs-check-input-box">
            <label>Start Roll No (srNo)</label>
            <input
              type="text"
              placeholder="e.g. 01"
              value={srNo}
              onChange={(e) => setSrNo(e.target.value)}
            />
          </div>

          {/* End Roll No */}
          <div className="dbs-check-input-box">
            <label>End Roll No (erNo)</label>
            <input
              type="text"
              placeholder="e.g. 60"
              value={erNo}
              onChange={(e) => setErNo(e.target.value)}
            />
          </div>

          {/* Is Practical */}
          <div className="dbs-check-checkbox-box">
            <label className="dbs-practical-label">
              <input
                type="checkbox"
                checked={isPractical}
                onChange={(e) => setIsPractical(e.target.checked)}
              />
              <span>Is Practical Session</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="dbs-check-att-actions">
          {/* Button 1: Load Periods */}
          <button
            type="button"
            className="dbs-btn-load-periods"
            onClick={handleLoadPeriods}
            disabled={loadingPeriods}
          >
            {loadingPeriods ? (
              <Loader2 size={16} className="dbs-spin" />
            ) : (
              <Clock size={16} />
            )}
            <span>Load Periods</span>
          </button>

          {/* Button 2: Load Grid */}
          <button
            type="button"
            className="dbs-btn-load-grid"
            onClick={() => handleLoadStudents()}
            disabled={loadingStudents}
          >
            {loadingStudents ? (
              <Loader2 size={16} className="dbs-spin" />
            ) : (
              <Users size={16} />
            )}
            <span>Load Attendance Grid</span>
          </button>

          {/* Button 3: Reset */}
          <button
            type="button"
            className="dbs-btn-reset"
            onClick={handleReset}
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ================= Periods Section ================= */}
      {hasLoadedPeriods && (
        <div className="dbs-periods-card">
          <div className="dbs-periods-header">
            <h3>
              <Clock size={18} />
              <span>Conducted Periods on {toApiDate(date)}</span>
            </h3>
            <span className="dbs-perm-ay-badge">
              {periodsList.length} Period(s) Available
            </span>
          </div>

          <div className="dbs-periods-grid">
            {periodsList.map((p, idx) => {
              const pNum = String(
                p.period ?? p.periodNo ?? p.PERIOD ?? p.PERIODNO ?? p.FRM_TO_PERIODS ?? (idx + 1)
              );
              const isActive = String(period) === pNum;
              const pTime = p.time || p.TIME || p.periodTime || "Regular";
              const pSubject =
                p.SUBJECTNAME ||
                p.subjectName ||
                p.sUBJECTNAME ||
                p.SUBJECT ||
                p.subject ||
                p.subName ||
                "";
              const pSubCode =
                p.SUBJECTCODE ||
                p.subjectCode ||
                p.SUBCODE ||
                p.subCode ||
                "";

              return (
                <div
                  key={idx}
                  className={`dbs-period-badge-card ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectPeriodCard(pNum)}
                  title="Click to load student attendance for this period"
                >
                  <div className="dbs-period-card-top">
                    <span className="dbs-period-number">Period {pNum}</span>
                    <span className="dbs-period-time">{pTime}</span>
                  </div>
                  {pSubject && (
                    <div className="dbs-period-subject">
                      {pSubject}
                    </div>
                  )}
                  {pSubCode && (
                    <div className="dbs-period-subcode">
                      {pSubCode}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= Attendance Grid & Stats ================= */}
      {hasLoadedStudents && (
        <>
          {/* Summary Stats Cards */}
          <div className="dbs-stats-row">
            <div className="dbs-stat-card">
              <div className="dbs-stat-icon blue">
                <Users size={20} />
              </div>
              <div className="dbs-stat-info">
                <span className="dbs-stat-label">Total Strength</span>
                <span className="dbs-stat-value">{stats.total}</span>
              </div>
            </div>

            <div className="dbs-stat-card">
              <div className="dbs-stat-icon green">
                <CheckCircle2 size={20} />
              </div>
              <div className="dbs-stat-info">
                <span className="dbs-stat-label">Present Count</span>
                <span className="dbs-stat-value">{stats.present}</span>
              </div>
            </div>

            <div className="dbs-stat-card">
              <div className="dbs-stat-icon red">
                <XCircle size={20} />
              </div>
              <div className="dbs-stat-info">
                <span className="dbs-stat-label">Absent Count</span>
                <span className="dbs-stat-value">{stats.absent}</span>
              </div>
            </div>

            <div className="dbs-stat-card">
              <div className="dbs-stat-icon purple">
                <Sparkles size={20} />
              </div>
              <div className="dbs-stat-info">
                <span className="dbs-stat-label">Attendance %</span>
                <span className="dbs-stat-value">{stats.pct}%</span>
              </div>
            </div>
          </div>

          {/* Student Attendance Grid */}
          <div className="dbs-students-grid-card">
            {(activeSubjectName || activeDayTaught) && (
              <div
                style={{
                  padding: "12px 20px",
                  background: "#eff6ff",
                  borderBottom: "1px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px",
                  fontSize: "0.88rem",
                  color: "#1e40af",
                  fontWeight: 600,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <BookOpen size={16} />
                  <span>
                    Subject: <strong>{activeSubjectName}</strong>
                  </span>
                  {activeDayTaught && (
                    <span style={{ color: "#475569", fontWeight: 500, marginLeft: "8px" }}>
                      &bull; Topic: <em>"{activeDayTaught}"</em>
                    </span>
                  )}
                </div>
                {period && (
                  <span
                    style={{
                      fontSize: "0.82rem",
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      padding: "3px 10px",
                      borderRadius: "12px",
                    }}
                  >
                    Period {period}
                  </span>
                )}
              </div>
            )}
            <div className="dbs-students-toolbar">
              <div className="dbs-students-search">
                <Search size={15} className="dbs-students-search-icon" />
                <input
                  type="text"
                  placeholder="Search student name or roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>

              <div className="dbs-students-filters-bar">
                <button
                  type="button"
                  className={`dbs-filter-chip ${statusFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setStatusFilter("ALL")}
                >
                  All ({stats.total})
                </button>
                <button
                  type="button"
                  className={`dbs-filter-chip ${statusFilter === "PRESENT" ? "active" : ""}`}
                  onClick={() => setStatusFilter("PRESENT")}
                >
                  Present ({stats.present})
                </button>
                <button
                  type="button"
                  className={`dbs-filter-chip ${statusFilter === "ABSENT" ? "active" : ""}`}
                  onClick={() => setStatusFilter("ABSENT")}
                >
                  Absent ({stats.absent})
                </button>
              </div>
            </div>

            <div className="dbs-students-table-scroll">
              <table className="dbs-students-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>S.No</th>
                    <th style={{ width: "170px" }}>Reg No / Roll</th>
                    <th>Student Name</th>
                    <th style={{ width: "130px", textAlign: "center" }}>Status</th>
                    <th style={{ width: "150px", textAlign: "center" }}>Parent Mobile</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="dbs-att-empty">
                          <Search className="dbs-att-empty-icon" />
                          <div>No students matching the current filter.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, idx) => {
                      const isAbs = isStudentAbsent(s);
                      const sNo = s.SLNO ?? s.SNO ?? (idx + 1);
                      const regNo = String(
                        s.REGISTRATIONNO ??
                          s.regNo ??
                          s.registrationNo ??
                          s.HTNO ??
                          s.htno ??
                          ""
                      ).trim();
                      const rawRoll = String(s.ROLLNO ?? s.rollNo ?? "").trim();
                      const studentName = String(
                        s.SNAME ??
                          s.sname ??
                          s.studentName ??
                          s.STUDENTNAME ??
                          s.STUDENT_NAME ??
                          s.name ??
                          `Student ${idx + 1}`
                      ).trim();
                      const parentMobile = String(s.PARENTMBNO ?? s.parentMbNo ?? "").trim();

                      return (
                        <tr
                          key={s.STUDENTSERIALNO || s.REGISTRATIONNO || s.id || idx}
                          className={isAbs ? "dbs-row-absent" : ""}
                        >
                          <td>{sNo}</td>
                          <td>
                            <span className="dbs-roll-pill">
                              {regNo || rawRoll || `REG-${idx + 1}`}
                            </span>
                            {rawRoll && regNo && rawRoll !== regNo && (
                              <span
                                style={{
                                  marginLeft: "6px",
                                  fontSize: "0.78rem",
                                  color: "var(--dbs-text-muted)",
                                }}
                              >
                                ({rawRoll})
                              </span>
                            )}
                          </td>
                          <td>
                            <strong>{studentName}</strong>
                            {s.LE && (
                              <span
                                style={{
                                  marginLeft: "6px",
                                  fontSize: "0.68rem",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  fontWeight: 700,
                                }}
                                title="Lateral Entry"
                              >
                                LE
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {isAbs ? (
                              <span className="dbs-att-status-badge absent">
                                <XCircle size={12} />
                                Absent
                              </span>
                            ) : (
                              <span className="dbs-att-status-badge present">
                                <Check size={12} />
                                Present
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {parentMobile ? (
                              <span style={{ fontSize: "0.85rem", color: "var(--dbs-text)" }}>
                                {parentMobile}
                              </span>
                            ) : (
                              <span style={{ color: "var(--dbs-text-muted)" }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckAttendance;