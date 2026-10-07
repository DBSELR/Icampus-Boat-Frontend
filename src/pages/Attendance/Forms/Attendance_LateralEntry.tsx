/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  RotateCcw,
  Calendar,
  GraduationCap,
  GitBranch,
  Layers,
  Hash,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  X,
  Sun,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
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
import "./Attendance_LateralEntry.css";

// Helper: Today's date in YYYY-MM-DD
const getTodayInputDate = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Helper: Convert YYYY-MM-DD to DD-MM-YYYY
const toApiDate = (dateVal: string): string => {
  if (!dateVal) return "";
  const parts = dateVal.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateVal;
};

// Day name extractor
const getDayName = (dateVal: string): string => {
  if (!dateVal) return "Monday";
  const d = new Date(dateVal);
  return isNaN(d.getTime())
    ? "Monday"
    : d.toLocaleDateString("en-US", { weekday: "long" });
};

const AttendanceLateralEntry: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2026-2027";

  // Form Fields State
  const [date, setDate] = useState<string>(getTodayInputDate());
  const [shift, setShift] = useState<string>("1");
  const [programme, setProgramme] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [lecturer, setLecturer] = useState<string>("");
  const [isPractical, setIsPractical] = useState<boolean>(false);
  const [tlm, setTlm] = useState<string>("PPT");
  const [quickAbsentInput, setQuickAbsentInput] = useState<string>("");
  const [absentNumbersStr, setAbsentNumbersStr] = useState<string>("");
  const [chapterTaught, setChapterTaught] = useState<string>("");

  // Dropdown Lists State
  const [programmeOptions, setProgrammeOptions] = useState<any[]>([]);
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [yearOptions, setYearOptions] = useState<any[]>([]);
  const [sectionOptions, setSectionOptions] = useState<any[]>([]);
  const [lecturersList, setLecturersList] = useState<AdminLecturerItem[]>([]);
  const [periodsList, setPeriodsList] = useState<AdminPeriodItem[]>([]);
  const [tlmList, setTlmList] = useState<{ TLM: string }[]>([]);

  // Students Roster & Loading State
  const [students, setStudents] = useState<AdminStudentAttendanceRecord[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [savingAttendance, setSavingAttendance] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 1. Initial Load: Programmes & TLM
  useEffect(() => {
    const init = async () => {
      try {
        const [pRes, tRes] = await Promise.all([getProgramme(), getTLM()]);
        if (Array.isArray(pRes)) setProgrammeOptions(pRes);
        if (Array.isArray(tRes)) setTlmList(tRes);
      } catch (err) {
        console.warn("Failed to load initial lookups:", err);
      }
    };
    init();
  }, []);

  // 2. Cascade Branch & Year on Programme change
  useEffect(() => {
    if (!programme) {
      setBranchOptions([]);
      setYearOptions([]);
      setSectionOptions([]);
      setBranch("");
      setYear("");
      setSection("");
      setStudents([]);
      return;
    }
    const loadCascade = async () => {
      try {
        const [bRes, yRes] = await Promise.all([
          getBranch(programme),
          getYear(programme),
        ]);
        if (Array.isArray(bRes)) setBranchOptions(bRes);
        if (Array.isArray(yRes)) setYearOptions(yRes);
      } catch (err) {
        console.warn("Could not load branch/year cascade:", err);
      }
    };
    loadCascade();
  }, [programme]);

  // 3. Cascade Section on Programme + Branch + Year change
  useEffect(() => {
    if (!programme || !branch || !year) {
      setSectionOptions([]);
      setSection("");
      setStudents([]);
      return;
    }
    const loadSections = async () => {
      try {
        const sRes = await getSections(programme, branch, year);
        if (Array.isArray(sRes)) setSectionOptions(sRes);
      } catch (err) {
        console.warn("Could not load sections cascade:", err);
      }
    };
    loadSections();
  }, [programme, branch, year]);

  // 4. Cascade Lecturers when section is chosen
  useEffect(() => {
    if (!programme || !branch || !year || !section) {
      setLecturersList([]);
      setLecturer("");
      setPeriodsList([]);
      setPeriod("");
      return;
    }
    const loadLecturers = async () => {
      try {
        const payload = {
          academicYear,
          date,
          programme,
          branch,
          sYear: year,
          semester: semester || "1",
          section,
          shift,
          isPractical,
        };
        const res = await loadAdminAttendanceLecturers(payload as any);
        if (Array.isArray(res)) setLecturersList(res);
      } catch (err) {
        console.warn("Could not load lecturers:", err);
      }
    };
    loadLecturers();
  }, [programme, branch, year, section, semester, shift, isPractical, date, academicYear]);

  // 5. Cascade Periods when lecturer is chosen
  useEffect(() => {
    if (!programme || !branch || !year || !section || !lecturer) {
      setPeriodsList([]);
      setPeriod("");
      return;
    }
    const loadPeriodsList = async () => {
      try {
        const payload = {
          academicYear,
          date,
          programme,
          branch,
          sYear: year,
          semester: semester || "1",
          section,
          shift,
          lecturer,
          isPractical,
        };
        const res = await loadAdminAttendancePeriods(payload as any);
        if (Array.isArray(res)) setPeriodsList(res);
      } catch (err) {
        console.warn("Could not load periods:", err);
      }
    };
    loadPeriodsList();
  }, [lecturer, programme, branch, year, section, semester, shift, isPractical, date, academicYear]);

  // 6. Fetch Students Roster when Period changes
  const fetchStudentsRoster = async (selectedPeriod: string) => {
    if (!selectedPeriod) return;
    setLoadingStudents(true);
    try {
      const payload = {
        academicYear,
        date,
        programme,
        branch,
        sYear: year,
        semester: semester || "1",
        section,
        shift,
        lecturer,
        period: selectedPeriod,
        isPractical,
        srNo: "",
        erNo: "",
      };
      const res = await loadAdminAttendanceStudents(payload as any);
      const list: AdminStudentAttendanceRecord[] = res?.data || (Array.isArray(res) ? res : []);

      if (Array.isArray(list) && list.length > 0) {
        const normalized = list.map((st, idx) => ({
          ...st,
          SNO: st.SNO ?? idx + 1,
          ATT: (st.ATT || "").toUpperCase() === "A" ? "A" : "P",
          REMARKS: st.REMARKS || "",
        }));
        setStudents(normalized);
        toast.success(`Loaded ${normalized.length} student attendance records.`);
      } else {
        setStudents([]);
        toast.info("No students found for this class period.");
      }
    } catch (err) {
      console.error("Error loading students roster:", err);
      toast.error("Failed to load students roster.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Handle Period change
  const handlePeriodChange = (val: string) => {
    setPeriod(val);
    setStudents([]);
    if (val) {
      fetchStudentsRoster(val);
    }
  };

  // Sync Absent Numbers textarea string with students attendance state
  useEffect(() => {
    const absents = students
      .filter((s) => (s.ATT || "").toUpperCase() === "A")
      .map((s) => (s.ROLLNO || s.REGISTRATIONNO || String(s.SNO)).trim())
      .filter(Boolean);
    setAbsentNumbersStr(absents.join(", "));
  }, [students]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => (s.ATT || "").toUpperCase() === "P").length;
    const absent = students.filter((s) => (s.ATT || "").toUpperCase() === "A").length;
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
    return { total, present, absent, pct };
  }, [students]);

  // Toggle individual student attendance status
  const handleToggleStudent = (id: string | number) => {
    setStudents((prev) =>
      prev.map((s) => {
        const match =
          s.REGISTRATIONNO === id ||
          s.ROLLNO === id ||
          s.SNO === id ||
          s.STUDENTSERIALNO === id;
        if (!match) return s;
        const nextStatus = (s.ATT || "").toUpperCase() === "A" ? "P" : "A";
        return { ...s, ATT: nextStatus };
      })
    );
  };

  // Mark All Present / Absent
  const handleMarkAll = (markPresent: boolean) => {
    const target = markPresent ? "P" : "A";
    setStudents((prev) => prev.map((s) => ({ ...s, ATT: target })));
    toast.info(`Marked all students as ${markPresent ? "Present" : "Absent"}`);
  };

  // Quick Absent Input handler
  const handleQuickAbsentSubmit = () => {
    const val = quickAbsentInput.trim().toLowerCase();
    if (!val) return;

    const matched = students.find((s) => {
      const sNo = String(s.SNO || "").trim().toLowerCase();
      const roll = (s.ROLLNO || "").trim().toLowerCase();
      const reg = (s.REGISTRATIONNO || "").trim().toLowerCase();
      return sNo === val || roll === val || reg === val;
    });

    if (matched) {
      const identifier = matched.REGISTRATIONNO || matched.ROLLNO || matched.SNO;
      handleToggleStudent(identifier as any);
      const studentName = matched.SNAME || val;
      const nextStatus =
        (matched.ATT || "").toUpperCase() === "A" ? "Present" : "Absent";
      toast.info(`Marked ${studentName} as ${nextStatus}`);
    } else {
      toast.warning(`No student found matching: "${quickAbsentInput}"`);
    }

    setQuickAbsentInput("");
  };

  // Filtered students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter((st) => {
      const sNo = String(st.SNO || "").toLowerCase();
      const roll = (st.ROLLNO || "").toLowerCase();
      const reg = (st.REGISTRATIONNO || "").toLowerCase();
      const name = (st.SNAME || "").toLowerCase();
      return sNo.includes(q) || roll.includes(q) || reg.includes(q) || name.includes(q);
    });
  }, [students, searchQuery]);

  // Save Attendance
  const handleSave = async () => {
    if (students.length === 0) {
      toast.warning("Please load the student roster before saving.");
      return;
    }
    if (!period || !lecturer) {
      toast.warning("Faculty and Period are required to save attendance.");
      return;
    }

    setSavingAttendance(true);
    try {
      const firstRoll = students[0]?.ROLLNO?.trim() || String(students[0]?.SNO || "1");
      const lastRoll =
        students[students.length - 1]?.ROLLNO?.trim() ||
        String(students[students.length - 1]?.SNO || students.length);

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
        semester: semester || "1",
        programme,
        branch,
        sYear: year,
        section,
        period: periodSingle,
        subjects: subjectCode,
        academicYear,
        day: getDayName(date),
        date: toApiDate(date),
        srNo: firstRoll,
        erNo: lastRoll,
        dayTaught: chapterTaught.trim() || "Regular Session",
        attStat: "Y",
        query: "",
        periodRange,
        tlm: tlm || "PPT",
        students: studentItems,
      };

      const res = await saveAdminAttendanceSubjectWise(payload as any);
      if (res?.success) {
        toast.success(res.message || "Lateral Entry attendance saved successfully!");
      } else {
        toast.success("Attendance saved successfully!");
      }
    } catch (err: any) {
      console.error("Error saving lateral entry attendance:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save attendance. Please check your connection."
      );
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
    setYear("");
    setSemester("");
    setSection("");
    setPeriod("");
    setLecturer("");
    setIsPractical(false);
    setTlm("PPT");
    setQuickAbsentInput("");
    setAbsentNumbersStr("");
    setChapterTaught("");
    setStudents([]);
    setBranchOptions([]);
    setYearOptions([]);
    setSectionOptions([]);
    setLecturersList([]);
    setPeriodsList([]);
    toast.info("Form has been reset.");
  };

  return (
    <div className="dbs-late-container">
      {/* 1. Page Header */}
      <div className="dbs-late-header">
        <div className="dbs-late-title-group">
          <div className="dbs-late-icon-wrapper">
            <UserCheck size={26} />
          </div>
          <div className="dbs-late-header-text">
            <h2>Staff Attendance Lateral Entry</h2>
            <p>Record and submit attendance for lateral entry student batches</p>
          </div>
        </div>

        <div className="dbs-late-header-badges">
          <span className="dbs-late-badge">
            Academic Year: <strong>{academicYear}</strong>
          </span>
          <span className="dbs-late-badge le-badge">
            <GraduationCap size={14} />
            Lateral Entry Mode (LE)
          </span>
        </div>
      </div>

      {/* 2. Filter & Scope Criteria Card */}
      <div className="dbs-late-card">
        <div className="dbs-late-card-header">
          <div className="dbs-late-card-title">
            <Layers size={19} className="text-blue-600" />
            <div>
              <h3>Class &amp; Session Criteria</h3>
              <span className="dbs-late-card-subtitle">
                Select scope parameters to load and post lateral entry attendance
              </span>
            </div>
          </div>
          <div className="dbs-late-filter-tip">
            Fields marked with * are required
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="dbs-late-grid">
          {/* 1. Date */}
          <div className="dbs-late-field">
            <label htmlFor="late-date">
              <span className="dbs-late-label-text">
                <Calendar size={14} />
                Attendance Date
                <span className="dbs-late-required">*</span>
              </span>
            </label>
            <div className="dbs-late-input-wrap">
              <input
                id="late-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* 2. Shift */}
          <div className="dbs-late-field">
            <label htmlFor="late-shift">
              <span className="dbs-late-label-text">
                <Sun size={14} />
                Shift
                <span className="dbs-late-required">*</span>
              </span>
            </label>
            <div className="dbs-late-input-wrap">
              <select
                id="late-shift"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
              >
                <option value="1">Shift-1</option>
                <option value="2">Shift-2</option>
              </select>
            </div>
          </div>

          {/* 3. Programme */}
          <div className="dbs-late-field">
            <label htmlFor="late-programme">
              <span className="dbs-late-label-text">
                <GraduationCap size={14} />
                Programme
                <span className="dbs-late-required">*</span>
              </span>
            </label>
            <div className="dbs-late-input-wrap">
              <select
                id="late-programme"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
              >
                <option value="">Select Programme</option>
                {programmeOptions.length > 0 ? (
                  programmeOptions.map((p: any, idx: number) => {
                    const val = String(
                      p.COURSECODE ?? p.COURSE_CODE ?? p.ProgrammeCode ?? p.code ?? p.id ?? ""
                    );
                    const label = String(
                      p.COURSE ?? p.PROGRAMME ?? p.ProgrammeName ?? p.name ?? val
                    );
                    return (
                      <option key={idx} value={val}>
                        {val ? `${val} - ${label}` : label}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="01">01 - B.Tech</option>
                    <option value="02">02 - M.Tech</option>
                    <option value="03">03 - MBA</option>
                    <option value="04">04 - MCA</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 4. Branch */}
          <div className="dbs-late-field">
            <label htmlFor="late-branch">
              <span className="dbs-late-label-text">
                <GitBranch size={14} />
                Branch
                <span className="dbs-late-required">*</span>
              </span>
            </label>
            <div className="dbs-late-input-wrap">
              <select
                id="late-branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={!programme}
              >
                <option value="">Select Branch</option>
                {branchOptions.length > 0 ? (
                  branchOptions.map((b: any, idx: number) => {
                    const val = String(
                      b.BRANCHCODE ?? b.BRANCH_CODE ?? b.code ?? b.id ?? ""
                    );
                    const label = String(
                      b.BRANCHNAME ?? b.BRANCH_NAME ?? b.name ?? val
                    );
                    return (
                      <option key={idx} value={val}>
                        {val && val !== label ? `${val} - ${label}` : label}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="01">01 - Civil Engineering</option>
                    <option value="02">02 - Electrical &amp; Electronics</option>
                    <option value="03">03 - Mechanical Engineering</option>
                    <option value="04">04 - Electronics &amp; Communication</option>
                    <option value="05">05 - Computer Science &amp; Eng.</option>
                    <option value="12">12 - Information Technology</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 5. Year */}
          <div className="dbs-late-field">
            <label htmlFor="late-year">
              <span className="dbs-late-label-text">
                <Calendar size={14} />
                Year
                <span className="dbs-late-required">*</span>
              </span>
            </label>
            <div className="dbs-late-input-wrap">
              <select
                id="late-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={!programme}
              >
                <option value="">Select Year</option>
                {yearOptions.length > 0 ? (
                  yearOptions.map((y: any, idx: number) => {
                    const val = String(
                      y.ID ?? y.YEAR ?? y.SYear ?? y.sYear ?? y.code ?? y.id ?? ""
                    );
                    const label = String(
                      (y.DATA ? `${y.DATA} Year` : "") ||
                        y.YEAR_NAME ||
                        y.NAME ||
                        y.YEAR ||
                        `${val} Year`
                    );
                    return (
                      <option key={idx} value={val}>
                        {label}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="2">2nd Year (Lateral)</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 6. Semester */}
          <div className="dbs-late-field">
            <label htmlFor="late-semester">
              <span className="dbs-late-label-text">
                <Layers size={14} />
                Semester
                <span className="dbs-late-required">*</span>
              </span>
            </label>
            <div className="dbs-late-input-wrap">
              <select
                id="late-semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                disabled={!year}
              >
                <option value="">Select Semester</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
          </div>

          {/* 7. Section */}
          <div className="dbs-late-field">
            <label htmlFor="late-section">
              <span className="dbs-late-label-text">
                <Hash size={14} />
                Section
                <span className="dbs-late-required">*</span>
              </span>
            </label>
            <div className="dbs-late-input-wrap">
              <select
                id="late-section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                disabled={!year || !branch}
              >
                <option value="">Select Section</option>
                {sectionOptions.length > 0 ? (
                  sectionOptions.map((s: any, idx: number) => {
                    const val = String(
                      s.SECTION ?? s.Section ?? s.section ?? s.code ?? s.id ?? ""
                    );
                    return (
                      <option key={idx} value={val}>
                        Section {val}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 8. Lecturer */}
          <div className="dbs-late-field">
            <label htmlFor="late-lecturer">
              <span className="dbs-late-label-text">
                <UserCheck size={14} />
                Faculty Member
                <span className="dbs-late-required">*</span>
              </span>
            </label>
            <div className="dbs-late-input-wrap">
              <select
                id="late-lecturer"
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                disabled={!section}
              >
                <option value="">Select Faculty</option>
                {lecturersList.map((l: any, idx: number) => {
                  const val = String(
                    l.FACULTYID ?? l.facultyId ?? l.code ?? l.id ?? ""
                  );
                  const label = String(
                    l.FACULTYNAME ?? l.facultyName ?? l.name ?? val
                  );
                  return (
                    <option key={idx} value={val}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* 9. Period */}
          <div className="dbs-late-field">
            <label htmlFor="late-period">
              <span className="dbs-late-label-text">
                <Clock size={14} />
                Period
                <span className="dbs-late-required">*</span>
              </span>
            </label>
            <div className="dbs-late-input-wrap">
              <select
                id="late-period"
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value)}
                disabled={!lecturer}
              >
                <option value="">Select Period</option>
                {periodsList.length > 0 ? (
                  periodsList.map((p: any, idx: number) => {
                    const val = String(p.PERIOD ?? p.period ?? p.PERIODNO ?? idx + 1);
                    const sub = String(p.SUBJECTNAME ?? p.subjectName ?? p.SUBJECT ?? "");
                    return (
                      <option key={idx} value={val}>
                        Period {val} {sub ? `- ${sub}` : ""}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="1">Period 1</option>
                    <option value="2">Period 2</option>
                    <option value="3">Period 3</option>
                    <option value="4">Period 4</option>
                    <option value="5">Period 5</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 10. Teaching Method (TLM) */}
          <div className="dbs-late-field">
            <label htmlFor="late-tlm">
              <span className="dbs-late-label-text">
                <BookOpen size={14} />
                Teaching Method
              </span>
              <span className="dbs-late-subtext">Optional</span>
            </label>
            <div className="dbs-late-input-wrap">
              <select
                id="late-tlm"
                value={tlm}
                onChange={(e) => setTlm(e.target.value)}
              >
                {tlmList.length > 0 ? (
                  tlmList.map((t: any, idx: number) => {
                    const val = String(t.TLM ?? t.name ?? t.id ?? "");
                    return (
                      <option key={idx} value={val}>
                        {val}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="PPT">PPT Presentation</option>
                    <option value="Blackboard">Chalk &amp; Blackboard</option>
                    <option value="Lab Practical">Laboratory Practical</option>
                    <option value="Group Discussion">Group Discussion</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 11. Quick Absent Number Input */}
          <div className="dbs-late-field">
            <label>
              <span className="dbs-late-label-text">
                <Users size={14} />
                Quick Absent Toggle
              </span>
              <span className="dbs-late-subtext">Roll No / S.No</span>
            </label>
            <div className="dbs-late-quick-absent">
              <input
                type="text"
                placeholder="Enter Roll / S.No..."
                value={quickAbsentInput}
                onChange={(e) => setQuickAbsentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleQuickAbsentSubmit();
                  }
                }}
                disabled={students.length === 0}
              />
              <button
                type="button"
                className="dbs-late-quick-absent-btn"
                onClick={handleQuickAbsentSubmit}
                disabled={students.length === 0 || !quickAbsentInput.trim()}
              >
                Toggle
              </button>
            </div>
          </div>

          {/* 12. Is Practical Checkbox */}
          <div className="dbs-late-field">
            <label>&nbsp;</label>
            <label className="dbs-late-checkbox-card">
              <input
                type="checkbox"
                checked={isPractical}
                onChange={(e) => setIsPractical(e.target.checked)}
              />
              <span>Is Practical Session</span>
            </label>
          </div>

          {/* 13. Absent Numbers (Auto-synced) */}
          <div className="dbs-late-field full-width">
            <label htmlFor="late-absentees">
              <span className="dbs-late-label-text">
                <XCircle size={14} className="text-red-500" />
                Absent Number(s)
              </span>
              <span className="dbs-late-subtext">Auto-synchronized with roster</span>
            </label>
            <div className="dbs-late-input-wrap">
              <textarea
                id="late-absentees"
                rows={2}
                value={absentNumbersStr}
                onChange={(e) => setAbsentNumbersStr(e.target.value)}
                placeholder="No absent students marked yet..."
              />
            </div>
          </div>

          {/* 14. Chapter / Topic Taught */}
          <div className="dbs-late-field full-width">
            <label htmlFor="late-chapter">
              <span className="dbs-late-label-text">
                <BookOpen size={14} />
                Chapter / Topic Taught
              </span>
              <span className="dbs-late-subtext">Optional</span>
            </label>
            <div className="dbs-late-input-wrap">
              <textarea
                id="late-chapter"
                rows={2}
                value={chapterTaught}
                onChange={(e) => setChapterTaught(e.target.value)}
                placeholder="Enter lecture topics, syllabus coverage, or practical notes..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="dbs-late-actions-row">
          <button
            type="button"
            className="dbs-late-btn dbs-late-btn-secondary"
            onClick={handleReset}
            disabled={savingAttendance}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            type="button"
            className="dbs-late-btn dbs-late-btn-primary"
            onClick={handleSave}
            disabled={savingAttendance || students.length === 0}
          >
            {savingAttendance ? (
              <Loader2 size={16} className="dbs-late-spinner" />
            ) : (
              <Save size={16} />
            )}
            {savingAttendance ? "Saving Attendance..." : "Save Attendance"}
          </button>
        </div>
      </div>

      {/* 3. KPI Statistics Overview Cards (Visible when students loaded) */}
      {students.length > 0 && (
        <div className="dbs-late-stats-grid">
          {/* Total Students */}
          <div className="dbs-late-stat-card total">
            <div className="dbs-late-stat-info">
              <span className="dbs-late-stat-label">Total Students</span>
              <span className="dbs-late-stat-value">{stats.total}</span>
            </div>
            <div className="dbs-late-stat-icon-wrapper">
              <Users size={22} />
            </div>
          </div>

          {/* Present */}
          <div className="dbs-late-stat-card present">
            <div className="dbs-late-stat-info">
              <span className="dbs-late-stat-label">Present</span>
              <span className="dbs-late-stat-value">{stats.present}</span>
            </div>
            <div className="dbs-late-stat-icon-wrapper">
              <CheckCircle2 size={22} />
            </div>
          </div>

          {/* Absent */}
          <div className="dbs-late-stat-card absent">
            <div className="dbs-late-stat-info">
              <span className="dbs-late-stat-label">Absent</span>
              <span className="dbs-late-stat-value">{stats.absent}</span>
            </div>
            <div className="dbs-late-stat-icon-wrapper">
              <XCircle size={22} />
            </div>
          </div>

          {/* Attendance Percentage */}
          <div className="dbs-late-stat-card pct">
            <div className="dbs-late-stat-info">
              <span className="dbs-late-stat-label">Attendance %</span>
              <span className="dbs-late-stat-value">{stats.pct}%</span>
            </div>
            <div className="dbs-late-stat-icon-wrapper">
              <Layers size={22} />
            </div>
          </div>
        </div>
      )}

      {/* 4. Student Attendance Roster Card */}
      {students.length > 0 && (
        <div className="dbs-late-roster-card">
          <div className="dbs-late-roster-toolbar">
            <div className="dbs-late-roster-title">
              <Users size={18} className="text-blue-600" />
              Student Attendance Roster
            </div>

            <div className="dbs-late-roster-actions">
              <div className="dbs-late-mark-btns">
                <button
                  type="button"
                  className="dbs-late-mark-btn present"
                  onClick={() => handleMarkAll(true)}
                  title="Mark all as Present"
                >
                  <CheckCircle2 size={14} />
                  Mark All Present
                </button>
                <button
                  type="button"
                  className="dbs-late-mark-btn absent"
                  onClick={() => handleMarkAll(false)}
                  title="Mark all as Absent"
                >
                  <XCircle size={14} />
                  Mark All Absent
                </button>
              </div>

              <div className="dbs-late-search-box">
                <Search size={15} className="dbs-late-search-icon" />
                <input
                  type="text"
                  className="dbs-late-search-input"
                  placeholder="Search student, roll no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="dbs-late-search-clear"
                    onClick={() => setSearchQuery("")}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="dbs-late-table-scroll">
            <table className="dbs-late-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>S.No</th>
                  <th>Roll / Reg No</th>
                  <th>Student Name</th>
                  <th style={{ width: "130px" }} className="text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingStudents ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="dbs-late-empty">
                        <Loader2 size={32} className="dbs-late-spinner text-blue-600" />
                        <p>Loading student roster...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="dbs-late-empty">
                        <Users size={32} />
                        <p>No student records match the search query.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st, idx) => {
                    const isAbsent = (st.ATT || "").toUpperCase() === "A";
                    const id = st.REGISTRATIONNO || st.ROLLNO || st.SNO || idx + 1;

                    return (
                      <tr
                        key={idx}
                        className={isAbsent ? "student-absent" : ""}
                        onClick={() => handleToggleStudent(id)}
                      >
                        <td>{st.SNO || idx + 1}</td>
                        <td>
                          <span className="dbs-late-regno-pill">
                            {st.ROLLNO || st.REGISTRATIONNO || `SNO-${st.SNO}`}
                          </span>
                        </td>
                        <td className="font-semibold text-slate-800">
                          {st.SNAME || (st as any).studentName || "Lateral Entry Student"}
                        </td>
                        <td className="text-center">
                          {isAbsent ? (
                            <span className="dbs-late-status-badge absent">
                              Absent
                            </span>
                          ) : (
                            <span className="dbs-late-status-badge present">
                              Present
                            </span>
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
      )}
    </div>
  );
};

export default AttendanceLateralEntry;
