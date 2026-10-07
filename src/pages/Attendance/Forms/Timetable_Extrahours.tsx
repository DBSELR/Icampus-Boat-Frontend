/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Save,
  RotateCcw,
  Search,
  Clock,
  CalendarPlus,
  Loader2,
  Layers,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import "./Timetable_Extrahours.css";
import {
  getExtraCourses,
  getExtraBranches,
  getExtraYears,
  getExtraDepartments,
  getExtraFacultyDept,
  getExtraSubjects,
  getExtraLecturers,
  viewTimeTableExtra,
  saveTimeTableExtra,
  deleteTimeTableExtra,
  ExtraCourseItem,
  ExtraBranchItem,
  ExtraYearItem,
  ExtraDepartmentItem,
  ExtraSubjectItem,
  ExtraLecturerItem,
  ExtraTimetableItem,
} from "../../../apis/AttendanceApis";
import { getSections } from "../../../apis/Common";
import DeleteModal from "../../../common/DeleteModal";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SHIFT_OPTIONS = [
  { code: "1", label: "Shift 1" },
  { code: "2", label: "Shift 2" },
];

const STREAM_OPTIONS = [
  { code: "1", label: "1" },
  { code: "2", label: "2" },
];

const SEMESTER_OPTIONS = [
  { code: "1", label: "Semester 1" },
  { code: "2", label: "Semester 2" },
];

const PERIOD_TYPE_OPTIONS = [
  { code: "Theory", label: "Theory" },
  { code: "Practical", label: "Practical" },
];

// Helper extractors
const extractCourseCode = (item: any): string => {
  return String(
    item.CourseCode ??
      item.Coursecode ??
      item.courseCode ??
      item.code ??
      item.CID ??
      ""
  ).trim();
};

const extractCourseName = (item: any): string => {
  return String(
    item.COURSE ??
      item.Course ??
      item.course ??
      item.CourseName ??
      item.courseName ??
      item.name ??
      extractCourseCode(item)
  ).trim();
};

const extractBranchCode = (item: any): string => {
  return String(
    item.BranchCode ??
      item.Branchcode ??
      item.branchCode ??
      item.code ??
      item.BID ??
      ""
  ).trim();
};

const extractBranchName = (item: any): string => {
  return String(
    item.BRANCHNAME ??
      item.BranchName ??
      item.branchName ??
      item.name ??
      extractBranchCode(item)
  ).trim();
};

const extractYearCode = (item: any): string => {
  return String(item.ID ?? item.id ?? item.code ?? "").trim();
};

const extractYearName = (item: any): string => {
  const data = String(item.DATA ?? item.data ?? item.name ?? "").trim();
  const code = extractYearCode(item);
  return data || (code ? `Year ${code}` : "");
};

const extractSection = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item.trim();
  return String(
    item.Section ??
      item.SECTION ??
      item.section ??
      item.code ??
      item.id ??
      ""
  ).trim();
};

const extractSubjectCode = (item: any): string => {
  return String(
    item.SUBJECTCODE ??
      item.SubjectCode ??
      item.subCode ??
      item.subcode ??
      item.SUB_CODE ??
      item.code ??
      ""
  ).trim();
};

const extractSubjectName = (item: any): string => {
  return String(
    item.SUBJECTNAME ??
      item.SubjectName ??
      item.Subject ??
      item.subject ??
      item.name ??
      extractSubjectCode(item)
  ).trim();
};

const extractLecturerId = (item: any): string => {
  return String(
    item.EmpID ??
      item.empId ??
      item.lecturer ??
      item.Lecturer ??
      item.FacultyID ??
      ""
  ).trim();
};

const extractLecturerName = (item: any): string => {
  return String(
    item.Fname ??
      item.fname ??
      item.FName1 ??
      item.FacultyName ??
      item.name ??
      extractLecturerId(item)
  ).trim();
};

const extractDeptCode = (item: any): string => {
  return String(
    item.DepartmentCode ??
      item.departmentCode ??
      item.code ??
      item.DEPT ??
      item.dept ??
      ""
  ).trim();
};

const extractDeptName = (item: any): string => {
  return String(
    item.Department ??
      item.department ??
      item.name ??
      extractDeptCode(item)
  ).trim();
};

// Date format conversion
const formatToApiDate = (dateVal: string): string => {
  if (!dateVal) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    const [y, m, d] = dateVal.split("-");
    return `${d}-${m}-${y}`;
  }
  return dateVal;
};

const formatToInputDate = (dateVal: string): string => {
  if (!dateVal) return "";
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateVal)) {
    const [d, m, y] = dateVal.split("-");
    return `${y}-${m}-${d}`;
  }
  return dateVal;
};

const TimetableExtraHours: React.FC = () => {
  const [academicYear] = useState<string>(() => {
    return (
      localStorage.getItem("academicYear") ||
      localStorage.getItem("academic_year") ||
      "2026-2027"
    );
  });

  // Filter & Form States
  const [shift, setShift] = useState<string>("1");
  const [programme, setProgramme] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [sYear, setSYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [stream, setStream] = useState<string>("1");
  const [section, setSection] = useState<string>("");
  const [day, setDay] = useState<string>("Monday");
  const [periodType, setPeriodType] = useState<string>("Theory");
  const [subject, setSubject] = useState<string>("");
  const [lecturer, setLecturer] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [wdate, setWdate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [spTime, setSpTime] = useState<string>("05.30PM");

  // Dropdown Lists
  const [programmeList, setProgrammeList] = useState<ExtraCourseItem[]>([]);
  const [branchList, setBranchList] = useState<ExtraBranchItem[]>([]);
  const [yearList, setYearList] = useState<ExtraYearItem[]>([]);
  const [sectionList, setSectionList] = useState<any[]>([]);
  const [departmentList, setDepartmentList] = useState<ExtraDepartmentItem[]>([]);
  const [subjectList, setSubjectList] = useState<ExtraSubjectItem[]>([]);
  const [lecturerList, setLecturerList] = useState<ExtraLecturerItem[]>([]);

  // Extra Timetable Grid
  const [extraTimetable, setExtraTimetable] = useState<ExtraTimetableItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Loading States
  const [loadingProgrammes, setLoadingProgrammes] = useState<boolean>(false);
  const [loadingBranchesYears, setLoadingBranchesYears] = useState<boolean>(false);
  const [loadingSections, setLoadingSections] = useState<boolean>(false);
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  const [loadingLecturers, setLoadingLecturers] = useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<ExtraTimetableItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // 1. Initial Load: Fetch Programmes & Departments
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingProgrammes(true);
      setLoadingDepartments(true);
      try {
        const [cData, dData] = await Promise.all([
          getExtraCourses(academicYear),
          getExtraDepartments(),
        ]);
        setProgrammeList(Array.isArray(cData) ? cData : []);
        setDepartmentList(Array.isArray(dData) ? dData : []);
      } catch (error) {
        console.error("Failed to load initial extra timetable options:", error);
        toast.error("Could not load initial options.");
      } finally {
        setLoadingProgrammes(false);
        setLoadingDepartments(false);
      }
    };
    fetchInitialData();
  }, [academicYear]);

  // 2. Cascade: Fetch Branches & Years when Programme changes
  useEffect(() => {
    if (!programme) {
      setBranchList([]);
      setYearList([]);
      setBranch("");
      setSYear("");
      setSectionList([]);
      setSection("");
      setSubjectList([]);
      setSubject("");
      setLecturerList([]);
      setLecturer("");
      setDepartment("");
      setExtraTimetable([]);
      return;
    }

    const fetchBranchesAndYears = async () => {
      setLoadingBranchesYears(true);
      try {
        const [bData, yData] = await Promise.all([
          getExtraBranches(programme, academicYear),
          getExtraYears(programme, academicYear),
        ]);
        setBranchList(Array.isArray(bData) ? bData : []);
        setYearList(Array.isArray(yData) ? yData : []);
      } catch (error) {
        console.error("Failed to load branches and years:", error);
        toast.error("Could not load branch/year options.");
      } finally {
        setLoadingBranchesYears(false);
      }
    };
    fetchBranchesAndYears();
  }, [programme, academicYear]);

  // 3. Cascade: Fetch Sections when Programme, Branch, and Year are selected
  useEffect(() => {
    if (!programme || !branch || !sYear) {
      setSectionList([]);
      setSection("");
      return;
    }

    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const data = await getSections(programme, branch, sYear, academicYear);
        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
          ? (data as any).data
          : [];
        setSectionList(list);
      } catch (error) {
        console.error("Failed to load sections:", error);
        toast.error("Could not load sections.");
      } finally {
        setLoadingSections(false);
      }
    };
    fetchSections();
  }, [programme, branch, sYear, academicYear]);

  // 4. Cascade: Fetch Subjects when Programme, Branch, Year, Semester, Stream, PeriodType change
  useEffect(() => {
    if (!programme || !branch || !sYear || !semester || !stream || !periodType) {
      setSubjectList([]);
      setSubject("");
      return;
    }

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const data = await getExtraSubjects({
          programme,
          branch,
          year: sYear,
          semister: semester,
          stream,
          periodType,
          lecturer: "",
          regu: "",
          subtype: "",
          acdYr: academicYear,
        });
        setSubjectList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load extra subjects:", error);
        toast.error("Could not load subjects.");
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [programme, branch, sYear, semester, stream, periodType, academicYear]);

  // 5. Cascade: Fetch Lecturers when Subject changes
  useEffect(() => {
    if (!programme || !sYear || !semester || !subject) {
      setLecturerList([]);
      setLecturer("");
      return;
    }

    const fetchLecturers = async () => {
      setLoadingLecturers(true);
      try {
        const data = await getExtraLecturers({
          department: department || "",
          year: sYear,
          semister: semester,
          subcode: subject,
          programme,
        });
        const list = Array.isArray(data) ? data : [];
        setLecturerList(list);
      } catch (error) {
        console.error("Failed to load extra lecturers:", error);
        toast.error("Could not load lecturers.");
      } finally {
        setLoadingLecturers(false);
      }
    };
    fetchLecturers();
  }, [programme, sYear, semester, subject, department]);

  // 6. When Lecturer changes, auto-load their Department via GET /api/Timetable_Extrahours/faculty-dept
  const handleLecturerChange = async (lecturerId: string) => {
    setLecturer(lecturerId);
    if (!lecturerId) return;

    try {
      const deptCode = await getExtraFacultyDept(lecturerId);
      if (deptCode) {
        setDepartment(deptCode);
      }
    } catch (error) {
      console.warn("Failed to auto-fetch department for lecturer:", error);
    }
  };

  // 7. Load Extra Timetable Grid (POST /api/Timetable_Extrahours/view-extra)
  const loadExtraTimetable = useCallback(async () => {
    if (
      !shift ||
      !programme ||
      !branch ||
      !sYear ||
      !semester ||
      !stream ||
      !section
    ) {
      setExtraTimetable([]);
      return;
    }

    setLoadingTable(true);
    try {
      const data = await viewTimeTableExtra({
        year: sYear,
        semister: semester,
        branch,
        stream,
        section,
        shiftNo: shift,
        programme,
      });
      setExtraTimetable(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load extra timetable records:", error);
      setExtraTimetable([]);
    } finally {
      setLoadingTable(false);
    }
  }, [shift, programme, branch, sYear, semester, stream, section]);

  useEffect(() => {
    loadExtraTimetable();
  }, [loadExtraTimetable]);

  // Save Extra Timetable Entry
  const handleSave = async () => {
    if (!programme) {
      toast.warning("Please select Programme.");
      return;
    }
    if (!branch) {
      toast.warning("Please select Branch.");
      return;
    }
    if (!sYear) {
      toast.warning("Please select Year.");
      return;
    }
    if (!semester) {
      toast.warning("Please select Semester.");
      return;
    }
    if (!section) {
      toast.warning("Please select Section.");
      return;
    }
    if (!day) {
      toast.warning("Please select Day.");
      return;
    }
    if (!periodType) {
      toast.warning("Please select Period Type.");
      return;
    }
    if (!subject) {
      toast.warning("Please select Subject.");
      return;
    }
    if (!lecturer) {
      toast.warning("Please select Lecturer.");
      return;
    }
    if (!department) {
      toast.warning("Please select Department.");
      return;
    }
    if (!wdate) {
      toast.warning("Please select Date.");
      return;
    }
    if (!spTime) {
      toast.warning("Please enter Period Timings.");
      return;
    }

    // Find readable subject name
    const selectedSub = subjectList.find(
      (s) => extractSubjectCode(s) === subject
    );
    const subNameRaw = selectedSub
      ? extractSubjectName(selectedSub)
      : subject;
    // Extract clean name without code prefix if separated by '--'
    const subName = subNameRaw.includes("--")
      ? subNameRaw.split("--")[1].trim()
      : subNameRaw;

    setIsSaving(true);
    try {
      const res = await saveTimeTableExtra({
        id: "0",
        wdate: formatToApiDate(wdate),
        shiftNo: shift,
        day,
        programme,
        branch,
        year: sYear,
        semister: semester,
        stream,
        section,
        subject: subName,
        subcode: subject,
        department,
        lecturer,
        spTime,
        periodType,
        epTime: "",
      });

      if (res?.success !== false) {
        toast.success(res?.message || "Extra timetable entry saved successfully.");
        // Refresh grid
        loadExtraTimetable();
      } else {
        toast.error(res?.message || "Failed to save extra timetable entry.");
      }
    } catch (error: any) {
      console.error("Error saving extra timetable entry:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save extra timetable entry."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Extra Timetable Entry
  const openDeleteModal = (item: ExtraTimetableItem) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;
    setIsDeleting(true);
    try {
      const res = await deleteTimeTableExtra(itemToDelete.id);
      if (res?.success !== false) {
        toast.success(res?.message || "Extra timetable entry deleted successfully.");
        setDeleteModalOpen(false);
        setItemToDelete(null);
        loadExtraTimetable();
      } else {
        toast.error(res?.message || "Failed to delete extra timetable entry.");
      }
    } catch (error: any) {
      console.error("Error deleting extra timetable entry:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete extra timetable entry."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset / Clear Form
  const handleClear = () => {
    setShift("1");
    setProgramme("");
    setBranch("");
    setSYear("");
    setSemester("");
    setStream("1");
    setSection("");
    setDay("Monday");
    setPeriodType("Theory");
    setSubject("");
    setLecturer("");
    setDepartment("");
    setWdate(new Date().toISOString().split("T")[0]);
    setSpTime("05.30PM");
    setBranchList([]);
    setYearList([]);
    setSectionList([]);
    setSubjectList([]);
    setLecturerList([]);
    setExtraTimetable([]);
    setSearchQuery("");
    toast.info("Form filters cleared.");
  };

  // Filtered Table Data
  const filteredTable = useMemo(() => {
    if (!searchQuery.trim()) return extraTimetable;
    const q = searchQuery.toLowerCase().trim();
    return extraTimetable.filter(
      (item) =>
        (item.Subject && item.Subject.toLowerCase().includes(q)) ||
        (item.SUB_CODE && item.SUB_CODE.toLowerCase().includes(q)) ||
        (item.Lecturer && item.Lecturer.toLowerCase().includes(q)) ||
        (item.Department && item.Department.toLowerCase().includes(q)) ||
        (item.EDATE && item.EDATE.toLowerCase().includes(q))
    );
  }, [extraTimetable, searchQuery]);

  return (
    <div className="dbs-extrahours-container">
      {/* Header */}
      <div className="dbs-extrahours-header">
        <div className="dbs-extrahours-title-group">
          <div className="dbs-extrahours-icon-wrapper">
            <CalendarPlus size={24} />
          </div>
          <div>
            <h2>Timetable Extra Hours</h2>
            <p>Create & Manage Extra Hour Timetable Allocations</p>
          </div>
        </div>

        <div className="dbs-extrahours-badges">
          <span className="dbs-extrahours-ay-badge">
            Academic Year: <strong>{academicYear}</strong>
          </span>
          <span className="dbs-extrahours-count-badge">
            <Clock size={14} />
            Entries: <strong>{extraTimetable.length}</strong>
          </span>
        </div>
      </div>

      {/* Criteria Form Card */}
      <div className="dbs-extrahours-card">
        <div className="dbs-extrahours-card-header">
          <h3>
            <Layers size={18} />
            Extra Hour Details
          </h3>
        </div>

        <div className="dbs-timetable-grid">
          {/* Shift */}
          <div className="dbs-input-box">
            <label>Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
            >
              {SHIFT_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Programme */}
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
              onChange={(e) => setProgramme(e.target.value)}
              disabled={loadingProgrammes}
            >
              <option value="">Select Programme</option>
              {programmeList.map((item, idx) => {
                const code = extractCourseCode(item);
                const name = extractCourseName(item);
                return (
                  <option key={`${code}-${idx}`} value={code}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Branch */}
          <div className="dbs-input-box">
            <label>
              Branch
              {loadingBranchesYears && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={!programme || loadingBranchesYears}
            >
              <option value="">Select Branch</option>
              {branchList.map((item, idx) => {
                const code = extractBranchCode(item);
                const name = extractBranchName(item);
                return (
                  <option key={`${code}-${idx}`} value={code}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Year & Semester (Double Select) */}
          <div className="dbs-input-box dbs-double-select">
            <label>Year & Semester</label>
            <div>
              <select
                value={sYear}
                onChange={(e) => setSYear(e.target.value)}
                disabled={!programme || loadingBranchesYears}
              >
                <option value="">Select Year</option>
                {yearList.map((item, idx) => {
                  const code = extractYearCode(item);
                  const name = extractYearName(item);
                  return (
                    <option key={`${code}-${idx}`} value={code}>
                      {name}
                    </option>
                  );
                })}
              </select>

              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                disabled={!programme}
              >
                <option value="">Select Semester</option>
                {SEMESTER_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stream & Section (Double Select) */}
          <div className="dbs-input-box dbs-double-select">
            <label>
              Stream & Section
              {loadingSections && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <div>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
              >
                {STREAM_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    Stream {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                disabled={!branch || !sYear || loadingSections}
              >
                <option value="">Select Section</option>
                {sectionList.map((item, idx) => {
                  const sec = extractSection(item);
                  return (
                    <option key={`${sec}-${idx}`} value={sec}>
                      Section {sec}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Day */}
          <div className="dbs-input-box">
            <label>Day</label>
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Period Type */}
          <div className="dbs-input-box">
            <label>Period Type</label>
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)}
            >
              {PERIOD_TYPE_OPTIONS.map((pt) => (
                <option key={pt.code} value={pt.code}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject(s) */}
          <div className="dbs-input-box">
            <label>
              Subject(s)
              {loadingSubjects && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!semester || loadingSubjects}
            >
              <option value="">Select Subject</option>
              {subjectList.map((item, idx) => {
                const code = extractSubjectCode(item);
                const name = extractSubjectName(item);
                return (
                  <option key={`${code}-${idx}`} value={code}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Lecturer */}
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
              disabled={!subject || loadingLecturers}
            >
              <option value="">Select Lecturer</option>
              {lecturerList.map((item, idx) => {
                const id = extractLecturerId(item);
                const name = extractLecturerName(item);
                return (
                  <option key={`${id}-${idx}`} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Department */}
          <div className="dbs-input-box">
            <label>
              Department
              {loadingDepartments && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={loadingDepartments}
            >
              <option value="">Select Department</option>
              {departmentList.map((item, idx) => {
                const code = extractDeptCode(item);
                const name = extractDeptName(item);
                return (
                  <option key={`${code}-${idx}`} value={code}>
                    {name} ({code})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Date */}
          <div className="dbs-input-box">
            <label>Date</label>
            <input
              type="date"
              value={wdate}
              onChange={(e) => setWdate(e.target.value)}
            />
          </div>

          {/* Period(s) Timings */}
          <div className="dbs-input-box">
            <label>Period(s) Timings</label>
            <input
              type="text"
              placeholder="e.g. 05.30PM"
              value={spTime}
              onChange={(e) => setSpTime(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="dbs-form-actions-row">
          <button
            type="button"
            className="dbs-form-save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            className="dbs-form-cancel-btn"
            onClick={handleClear}
            disabled={isSaving}
          >
            <RotateCcw size={16} />
            Clear
          </button>
        </div>
      </div>

      {/* Extra Timetable Grid Card */}
      <div className="dbs-grid-card">
        <div className="dbs-grid-toolbar">
          <div className="dbs-grid-toolbar-title">
            <h3>
              <Clock size={18} />
              Existing Extra Timetable Allocations
            </h3>
          </div>

          {extraTimetable.length > 0 && (
            <div className="dbs-grid-search-wrapper">
              <Search size={16} className="dbs-grid-search-icon" />
              <input
                type="text"
                placeholder="Search extra allocations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="dbs-grid-search-input"
              />
            </div>
          )}
        </div>

        {/* Table */}
        <div className="dbs-table-scroll">
          {loadingTable ? (
            <div className="dbs-table-empty">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <p>Loading extra timetable entries...</p>
            </div>
          ) : filteredTable.length > 0 ? (
            <table className="dbs-extra-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }} className="dbs-text-center">
                    #
                  </th>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Faculty</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Sem</th>
                  <th>Sec</th>
                  <th>Subject</th>
                  <th>Dept</th>
                  <th>Timings</th>
                  <th>Type</th>
                  <th style={{ width: "70px" }} className="dbs-text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTable.map((item, idx) => (
                  <tr key={item.id ?? idx}>
                    <td className="dbs-text-center">{idx + 1}</td>
                    <td>
                      <strong>{item.EDATE || "-"}</strong>
                    </td>
                    <td>Shift {item.Shift || "-"}</td>
                    <td>
                      <span className="dbs-badge-code">
                        {item.Lecturer || "-"}
                      </span>
                    </td>
                    <td>{item.Branch || "-"}</td>
                    <td>{item.Year || "-"}</td>
                    <td>{item.Semister || "-"}</td>
                    <td>{item.Section || "-"}</td>
                    <td>
                      {item.Subject || "-"}
                      {item.SUB_CODE && ` (${item.SUB_CODE})`}
                    </td>
                    <td>{item.Department || "-"}</td>
                    <td>{item.SPTime || "-"}</td>
                    <td>{item.Period_type || "-"}</td>
                    <td className="dbs-text-center">
                      <button
                        type="button"
                        className="dbs-table-delete-btn"
                        title="Delete Extra Entry"
                        onClick={() => openDeleteModal(item)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="dbs-table-empty">
              <AlertCircle size={32} />
              <p>
                {section
                  ? "No extra timetable allocations found for this class & section."
                  : "Select Shift, Programme, Branch, Year, Semester, and Section to load allocations."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        title="Delete Extra Timetable Entry"
        itemName={
          itemToDelete
            ? `${itemToDelete.Subject || "Entry"} (${itemToDelete.EDATE} - ${itemToDelete.Lecturer})`
            : "this entry"
        }
        loading={isDeleting}
        onCancel={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default TimetableExtraHours;
