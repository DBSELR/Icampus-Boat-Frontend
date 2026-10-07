import React, { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  Layers,
  Users,
  CheckCircle2,
  FolderMinus,
  Loader2,
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
  loadBatchDeletePeriods,
  loadBatchDeleteFaculty,
  loadBatchDeleteStudents,
  deleteBatchApi,
} from "../../../apis/AttendanceApis";
import DeleteModal from "../../../common/DeleteModal";
import "./BatchDelete.css";

const DAYS_OF_WEEK = [
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
];

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

// Robust Extractor Helpers for Backend API Shapes
const extractCourse = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string") return { code: item, name: item };
  const rawCode = String(
    item.COURSECODE ??
      item.COURSE_CODE ??
      item.CourseCode ??
      item.courseCode ??
      item.coursecode ??
      item.PROGRAMMECODE ??
      item.PROGRAMME_CODE ??
      item.ProgrammeCode ??
      item.programmecode ??
      item.PROGRAMME ??
      item.Programme ??
      item.programme ??
      item.code ??
      item.id ??
      item.CID ??
      item.cid ??
      item.COURSE ??
      item.Course ??
      item.course ??
      ""
  ).trim();

  const rawName = String(
    item.COURSE ??
      item.Course ??
      item.course ??
      item.COURSENAME ??
      item.COURSE_NAME ??
      item.CourseName ??
      item.courseName ??
      item.coursename ??
      item.PROGRAMMENAME ??
      item.PROGRAMME_NAME ??
      item.ProgrammeName ??
      item.programmeName ??
      item.programmename ??
      item.PROGRAMME ??
      item.Programme ??
      item.programme ??
      item.NAME ??
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
      item.branchCode ??
      item.branchcode ??
      item.BRANCH ??
      item.Branch ??
      item.branch ??
      item.code ??
      item.id ??
      item.BID ??
      item.bid ??
      item.NAME ??
      ""
  ).trim();

  const rawName = String(
    item.BRANCHNAME ??
      item.BRANCH_NAME ??
      item.BranchName ??
      item.branchName ??
      item.branchname ??
      item.BRANCH ??
      item.Branch ??
      item.branch ??
      item.NAME ??
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
      item.yearName ??
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

const extractPeriod = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string" || typeof item === "number") {
    const s = String(item).trim();
    return { code: s, name: s };
  }
  const code = String(
    item.FRM_TO_PERIODS ??
      item.frm_to_periods ??
      item.FrmToPeriods ??
      item.period ??
      item.Period ??
      item.PERIOD ??
      item.Period_Range ??
      item.PeriodRange ??
      item.periodRange ??
      item.id ??
      ""
  ).trim();

  const subj = String(
    item.SUBJECTNAME ??
      item.subjectName ??
      item.sUBJECTNAME ??
      item.SUBJECT ??
      item.subject ??
      ""
  ).trim();

  const periodName = String(
    item.FRM_TO_PERIODS ??
      item.frm_to_periods ??
      item.FrmToPeriods ??
      item.periodName ??
      item.PERIODNAME ??
      item.PeriodName ??
      item.period ??
      item.Period ??
      code
  ).trim();

  const name = subj
    ? periodName && periodName !== subj
      ? `${periodName} (${subj})`
      : subj
    : periodName;

  return { code, name: name || code };
};

const extractFaculty = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string" || typeof item === "number") {
    const s = String(item).trim();
    return { code: s, name: s };
  }
  const code = String(
    item.lecturer ??
      item.Lecturer ??
      item.LECTURER ??
      item.empId ??
      item.EmpId ??
      item.EMPID ??
      item.FacultyID ??
      item.facultyId ??
      item.FACULTYID ??
      item.faculty_id ??
      item.facultyNo ??
      item.FacultyNo ??
      item.FACULTYNO ??
      item.empNo ??
      item.EmpNo ??
      item.EMPNO ??
      item.staffId ??
      item.StaffId ??
      item.STAFFID ??
      item.code ??
      item.id ??
      ""
  ).trim();

  const name = String(
    item.facultyName ??
      item.FacultyName ??
      item.FACULTYNAME ??
      item.lecturerName ??
      item.LecturerName ??
      item.LECTURERNAME ??
      item.Fname ??
      item.fname ??
      item.name ??
      item.Faculty ??
      item.FACULTY ??
      code
  ).trim();

  return { code, name: name || code };
};

const BatchDelete: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2026-2027";

  // Extract User ID from localStorage
  const rawUser = localStorage.getItem("user");
  let userId = "NT125";
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      userId =
        parsed.userId ||
        parsed.id ||
        parsed.username ||
        parsed.empId ||
        parsed.user ||
        "NT125";
    } catch {
      userId = rawUser;
    }
  }

  // Form criteria state
  const [day, setDay] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [sYear, setSYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");

  // Dynamic dropdown options
  const [programmeOptions, setProgrammeOptions] = useState<any[]>([]);
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [yearOptions, setYearOptions] = useState<any[]>([]);
  const [sectionOptions, setSectionOptions] = useState<any[]>([]);
  const [periodOptions, setPeriodOptions] = useState<any[]>([]);
  const [facultyOptions, setFacultyOptions] = useState<any[]>([]);

  // Students grid state
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Loading states
  const [loadingCommon, setLoadingCommon] = useState<boolean>(false);
  const [loadingPeriods, setLoadingPeriods] = useState<boolean>(false);
  const [loadingFaculty, setLoadingFaculty] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  // 1. FETCH COURSES / PROGRAMMES FROM COMMON API
  useEffect(() => {
    const fetchProgrammes = async () => {
      setLoadingCommon(true);
      try {
        const res = await getProgramme();
        const list = Array.isArray(res)
          ? res
          : Array.isArray((res as any)?.data)
          ? (res as any).data
          : Array.isArray((res as any)?.result)
          ? (res as any).result
          : [];
        if (list.length > 0) {
          setProgrammeOptions(list);
        } else {
          setProgrammeOptions(DEFAULT_PROGRAMMES);
        }
      } catch (err) {
        console.warn("Could not fetch programmes from Common API:", err);
        setProgrammeOptions(DEFAULT_PROGRAMMES);
      } finally {
        setLoadingCommon(false);
      }
    };
    fetchProgrammes();
  }, []);

  // 2. FETCH BRANCH & YEAR CASCADE FROM COMMON API
  useEffect(() => {
    if (!course) {
      setBranchOptions([]);
      setYearOptions([]);
      setSectionOptions([]);
      setBranch("");
      setSYear("");
      setSection("");
      setPeriodOptions([]);
      setFacultyOptions([]);
      setPeriod("");
      setFaculty("");
      return;
    }

    const fetchBranchAndYear = async () => {
      try {
        const [bRes, yRes] = await Promise.all([
          getBranch(course),
          getYear(course),
        ]);
        const bList = Array.isArray(bRes)
          ? bRes
          : Array.isArray((bRes as any)?.data)
          ? (bRes as any).data
          : Array.isArray((bRes as any)?.result)
          ? (bRes as any).result
          : [];
        const yList = Array.isArray(yRes)
          ? yRes
          : Array.isArray((yRes as any)?.data)
          ? (yRes as any).data
          : Array.isArray((yRes as any)?.result)
          ? (yRes as any).result
          : [];

        if (bList.length > 0) setBranchOptions(bList);
        else setBranchOptions(DEFAULT_BRANCHES);

        if (yList.length > 0) setYearOptions(yList);
        else setYearOptions(DEFAULT_YEARS);
      } catch (err) {
        console.warn("Could not load branch/year cascade from Common API:", err);
        setBranchOptions(DEFAULT_BRANCHES);
        setYearOptions(DEFAULT_YEARS);
      }
    };

    fetchBranchAndYear();
  }, [course]);

  // 3. FETCH SECTIONS CASCADE FROM COMMON API
  useEffect(() => {
    if (!course || !branch || !sYear) {
      setSectionOptions([]);
      setSection("");
      return;
    }

    const fetchSections = async () => {
      try {
        const sRes = await getSections(course, branch, sYear);
        const sList = Array.isArray(sRes)
          ? sRes
          : Array.isArray((sRes as any)?.data)
          ? (sRes as any).data
          : Array.isArray((sRes as any)?.result)
          ? (sRes as any).result
          : [];
        if (sList.length > 0) {
          setSectionOptions(sList);
        } else {
          setSectionOptions(DEFAULT_SECTIONS);
        }
      } catch (err) {
        console.warn("Could not load sections from Common API:", err);
        setSectionOptions(DEFAULT_SECTIONS);
      }
    };

    fetchSections();
  }, [course, branch, sYear]);

  // 4. FETCH PERIODS: POST /api/BatchDelete/period-load
  useEffect(() => {
    if (!day || !course || !branch || !sYear || !semester || !section) {
      setPeriodOptions([]);
      setPeriod("");
      return;
    }

    const fetchPeriods = async () => {
      setLoadingPeriods(true);
      try {
        const data = await loadBatchDeletePeriods({
          shift: "1",
          programme: course,
          branch: branch,
          sYear: sYear,
          semester: semester,
          stream: "1",
          section: section,
          day: day.toLowerCase(),
          academicYear: academicYear,
        });

        if (Array.isArray(data) && data.length > 0) {
          setPeriodOptions(data);
          toast.success(`Loaded ${data.length} period(s) for the schedule.`);
        } else {
          setPeriodOptions([]);
          toast.info("No active periods found for this schedule.");
        }
      } catch (err) {
        console.warn("Error fetching periods from /api/BatchDelete/period-load:", err);
        setPeriodOptions([]);
      } finally {
        setLoadingPeriods(false);
      }
    };

    fetchPeriods();
  }, [day, course, branch, sYear, semester, section, academicYear]);

  // 5. FETCH FACULTY: POST /api/BatchDelete/faculty
  useEffect(() => {
    if (!day || !course || !branch || !sYear || !section || !semester || !period) {
      setFacultyOptions([]);
      setFaculty("");
      return;
    }

    const fetchFaculty = async () => {
      setLoadingFaculty(true);
      try {
        const data = await loadBatchDeleteFaculty({
          day: day.toLowerCase(),
          programme: course,
          branch: branch,
          sYear: sYear,
          section: section,
          semester: semester,
          academicYear: academicYear,
          period: period,
        });

        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
          ? (data as any).data
          : data && typeof data === "object" && Object.keys(data).length > 0
          ? [data]
          : [];

        if (list.length > 0) {
          setFacultyOptions(list);
          const first = extractFaculty(list[0]);
          const autoVal = first.code || first.name;
          if (autoVal) {
            setFaculty(autoVal);
          }
          toast.success(`Loaded faculty: ${autoVal || list.length}`);
        } else {
          setFacultyOptions([]);
          setFaculty("");
          toast.info("No faculty allocated for the selected period.");
        }
      } catch (err) {
        console.warn("Error fetching faculty from /api/BatchDelete/faculty:", err);
        setFacultyOptions([]);
        setFaculty("");
      } finally {
        setLoadingFaculty(false);
      }
    };

    fetchFaculty();
  }, [day, course, branch, sYear, section, semester, period, academicYear]);

  // 6. FETCH TABLE DATA (STUDENTS GRID): POST /api/BatchDelete/batch-students
  const handleLoadStudents = async () => {
    if (!day || !course || !branch || !sYear || !section || !semester) {
      toast.warning("Please select Day, Course, Branch, Year, Semester and Section.");
      return;
    }

    setLoadingStudents(true);
    try {
      const data = await loadBatchDeleteStudents({
        day: day.toLowerCase(),
        programme: course,
        branch: branch,
        sYear: sYear,
        section: section,
        semester: semester,
        lecturer: faculty || "",
        academicYear: academicYear,
        period: period || "",
      });

      if (Array.isArray(data) && data.length > 0) {
        setStudentsList(data);
        toast.success(`Loaded ${data.length} student batch record(s).`);
      } else {
        setStudentsList([]);
        toast.info("No student batch records found for the selected criteria.");
      }
      setShowPreview(true);
    } catch (err) {
      console.warn("Error loading batch students from /api/BatchDelete/batch-students:", err);
      setStudentsList([]);
      toast.error("Failed to load students grid from server.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // 7. OPEN DELETE CONFIRMATION
  const handleInitiateDelete = () => {
    if (!day || !course || !branch || !sYear || !section || !semester) {
      toast.warning("Please select all criteria before deleting.");
      return;
    }
    if (!period) {
      toast.warning("Please select a Period to delete.");
      return;
    }
    if (!faculty) {
      toast.warning("Please select Faculty to proceed with batch deletion.");
      return;
    }
    setDeleteModalOpen(true);
  };

  // 8. CONFIRM DELETE BATCH: POST /api/BatchDelete/delete-batch
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteBatchApi({
        day: day.toLowerCase(),
        programme: course,
        branch: branch,
        sYear: sYear,
        section: section,
        semester: semester,
        lecturer: faculty,
        academicYear: academicYear,
        userId: userId,
        period: period,
      });

      toast.success(
        res?.message ||
          `Batch for Period ${period} (${day}) deleted successfully.`
      );
      setDeleteModalOpen(false);

      // Refresh student grid after deletion
      setStudentsList([]);
      setPeriod("");
      setFaculty("");
      setFacultyOptions([]);
    } catch (err: any) {
      console.error("Error deleting batch via /api/BatchDelete/delete-batch:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete batch. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Reset
  const handleReset = () => {
    setDay("");
    setCourse("");
    setBranch("");
    setSYear("");
    setSemester("");
    setSection("");
    setPeriod("");
    setFaculty("");
    setPeriodOptions([]);
    setFacultyOptions([]);
    setStudentsList([]);
    setShowPreview(false);
    toast.info("Form and grid reset.");
  };

  // Helpers to get display labels for items
  const getCourseName = () => {
    const found = programmeOptions.find((p) => {
      const { code } = extractCourse(p);
      return code === course;
    });
    if (found) {
      const { name, code } = extractCourse(found);
      return name || code || course;
    }
    const def = DEFAULT_PROGRAMMES.find((p) => p.code === course);
    return def ? def.name : course;
  };

  const getBranchName = () => {
    const found = branchOptions.find((b) => {
      const { code } = extractBranch(b);
      return code === branch;
    });
    if (found) {
      const { name, code } = extractBranch(found);
      return name || code || branch;
    }
    const def = DEFAULT_BRANCHES.find((b) => b.code === branch);
    return def ? def.name : branch;
  };

  return (
    <div className="dbs-batch-del-container">
      {/* ================= PAGE HEADER ================= */}
      <div className="dbs-batch-del-header">
        <div className="dbs-batch-del-title-group">
          <div className="dbs-batch-del-icon-wrapper">
            <FolderMinus size={24} />
          </div>
          <div>
            <h2>BATCH DELETE</h2>
            <p>Select schedule filters and remove existing student batch allocations</p>
          </div>
        </div>

        <div className="dbs-batch-del-badges">
          <div className="dbs-batch-del-ay-badge">
            Academic Year: <strong>{academicYear}</strong>
          </div>
        </div>
      </div>

      {/* ================= CAUTION ALERT BANNER ================= */}
      <div className="dbs-batch-del-alert">
        <AlertTriangle size={18} className="dbs-batch-del-alert-icon" />
        <span>
          <strong>Caution:</strong> Deleting a batch permanently removes student-to-batch group mappings and timetable period schedule allocations. This operation cannot be undone.
        </span>
      </div>

      {/* ================= BATCH CRITERIA CARD ================= */}
      <div className="dbs-batch-del-card">
        <div className="dbs-batch-del-card-header">
          <h3>
            <SlidersHorizontal size={18} />
            <span>Batch Criteria</span>
          </h3>
          <span className="dbs-card-badge">Required Filters</span>
        </div>

        <div className="dbs-batch-del-grid">
          {/* Day */}
          <div className="dbs-batch-del-input-box">
            <label>Day *</label>
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">Select Day</option>
              {DAYS_OF_WEEK.map((d, idx) => (
                <option key={idx} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Course / Programme */}
          <div className="dbs-batch-del-input-box">
            <label>Course (Programme) *</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            >
              <option value="">Select Course</option>
              {programmeOptions.length > 0
                ? programmeOptions.map((item, idx) => {
                    const { code, name } = extractCourse(item);
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
                  })
                : DEFAULT_PROGRAMMES.map((prog, idx) => (
                    <option key={idx} value={prog.code}>
                      {prog.code} - {prog.name}
                    </option>
                  ))}
            </select>
          </div>

          {/* Branch */}
          <div className="dbs-batch-del-input-box">
            <label>Branch *</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={!course}
            >
              <option value="">Select Branch</option>
              {branchOptions.length > 0
                ? branchOptions.map((item, idx) => {
                    const { code, name } = extractBranch(item);
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
                  })
                : DEFAULT_BRANCHES.map((br, idx) => (
                    <option key={idx} value={br.code}>
                      {br.code} - {br.name}
                    </option>
                  ))}
            </select>
          </div>

          {/* Year (sYear) */}
          <div className="dbs-batch-del-input-box">
            <label>Year (sYear) *</label>
            <select
              value={sYear}
              onChange={(e) => setSYear(e.target.value)}
              disabled={!course}
            >
              <option value="">Select Year</option>
              {yearOptions.length > 0
                ? yearOptions.map((item, idx) => {
                    const { code, name } = extractYear(item);
                    if (!code) return null;
                    return (
                      <option key={idx} value={code}>
                        {name}
                      </option>
                    );
                  })
                : DEFAULT_YEARS.map((yr, idx) => (
                    <option key={idx} value={yr.code}>
                      {yr.name}
                    </option>
                  ))}
            </select>
          </div>

          {/* Semester */}
          <div className="dbs-batch-del-input-box">
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
          <div className="dbs-batch-del-input-box">
            <label>Section *</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              disabled={!sYear}
            >
              <option value="">Select Section</option>
              {sectionOptions.length > 0
                ? sectionOptions.map((item, idx) => {
                    const { code, name } = extractSection(item);
                    if (!code) return null;
                    return (
                      <option key={idx} value={code}>
                        {name}
                      </option>
                    );
                  })
                : DEFAULT_SECTIONS.map((sec, idx) => (
                    <option key={idx} value={sec}>
                      Section {sec}
                    </option>
                  ))}
            </select>
          </div>

          {/* Period (Loaded via /api/BatchDelete/period-load) */}
          <div className="dbs-batch-del-input-box">
            <label>
              Period *{" "}
              {loadingPeriods && (
                <Loader2
                  size={13}
                  className="dbs-spin"
                  style={{ display: "inline-block", marginLeft: 4 }}
                />
              )}
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              disabled={loadingPeriods || (!section && periodOptions.length === 0)}
            >
              <option value="">
                {loadingPeriods
                  ? "Loading periods..."
                  : periodOptions.length > 0
                  ? "Select Period"
                  : "Select Section first"}
              </option>
              {periodOptions.map((item, idx) => {
                const { code, name } = extractPeriod(item);
                if (!code) return null;
                return (
                  <option key={idx} value={code}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Faculty (Loaded via /api/BatchDelete/faculty) */}
          <div className="dbs-batch-del-input-box">
            <label>
              Faculty *{" "}
              {loadingFaculty && (
                <Loader2
                  size={13}
                  className="dbs-spin"
                  style={{ display: "inline-block", marginLeft: 4 }}
                />
              )}
            </label>
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              disabled={loadingFaculty || (!period && facultyOptions.length === 0)}
            >
              <option value="">
                {loadingFaculty
                  ? "Loading faculty..."
                  : facultyOptions.length > 0
                  ? "Select Faculty"
                  : "Select Period first"}
              </option>
              {facultyOptions.map((item, idx) => {
                const { code, name } = extractFaculty(item);
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
        </div>

        {/* Action Buttons Row */}
        <div className="dbs-batch-del-actions">
          <button
            className="dbs-btn-delete"
            onClick={handleInitiateDelete}
            disabled={!period || !faculty || isDeleting}
          >
            <Trash2 size={16} />
            Delete Batch
          </button>

          <button
            className="dbs-btn-find"
            onClick={handleLoadStudents}
            disabled={loadingStudents || !section}
          >
            {loadingStudents ? (
              <Loader2 size={16} className="dbs-spin" />
            ) : (
              <Search size={16} />
            )}
            Load Students Grid
          </button>

          <button className="dbs-btn-reset" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* ================= STUDENTS GRID / BATCHES TABLE ================= */}
      {showPreview && (
        <div className="dbs-batch-results-card">
          <div className="dbs-batch-table-header">
            <div className="dbs-batch-table-title-group">
              <Layers size={20} color="var(--dbs-primary)" />
              <div>
                <h3>Students Batch Allocation Grid</h3>
                <p>
                  {getCourseName()} &bull; {getBranchName()} &bull; Year {sYear} &bull; Sem {semester} &bull; Sec {section}
                </p>
              </div>
              <span className="dbs-batch-count-badge">
                <Users size={14} />
                {studentsList.length} Student{studentsList.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="dbs-batch-table-wrapper">
            {studentsList.length === 0 ? (
              <div className="dbs-batch-empty-state">
                <div className="dbs-batch-empty-icon">
                  <FolderMinus size={28} />
                </div>
                <h4>No Student Batch Records Found</h4>
                <p>
                  There are no student allocations registered for the chosen Day, Course, Branch, and Section.
                </p>
              </div>
            ) : (
              <table className="dbs-batch-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Roll / Reg No</th>
                    <th>Student Name</th>
                    <th>Batch</th>
                    <th>Course & Branch</th>
                    <th>Year & Sem</th>
                    <th>Section</th>
                    <th>Period</th>
                  </tr>
                </thead>

                <tbody>
                  {studentsList.map((item, index) => {
                    const rollNo =
                      item.regNo ||
                      item.rollNo ||
                      item.RegNo ||
                      item.HTNO ||
                      item.StudentRollNo ||
                      item.id ||
                      "-";
                    const name =
                      item.studentName ||
                      item.name ||
                      item.StudentName ||
                      item.STUDENTNAME ||
                      "-";
                    const batchVal =
                      item.batch ||
                      item.batchName ||
                      item.batchNo ||
                      item.Batch ||
                      item.BatchName ||
                      `Batch-${section || "1"}`;
                    const periodVal = item.period || period || "-";

                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <span className="dbs-batch-name-badge">
                            {rollNo}
                          </span>
                        </td>
                        <td>
                          <strong>{name}</strong>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: "var(--dbs-primary-light)",
                              color: "var(--dbs-primary)",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            {batchVal}
                          </span>
                        </td>
                        <td>
                          {getCourseName()} - {getBranchName()}
                        </td>
                        <td>
                          Year {sYear}, Sem {semester}
                        </td>
                        <td>Sec {section}</td>
                        <td>{periodVal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ================= CONFIRMATION DELETE MODAL ================= */}
      <DeleteModal
        open={deleteModalOpen}
        title="Delete Batch Allocation"
        itemName={`Period ${period} (${day}) - Faculty: ${faculty}`}
        loading={isDeleting}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default BatchDelete;

