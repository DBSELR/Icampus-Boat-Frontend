/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Search,
  RotateCcw,
  UserCheck,
  Loader2,
  ChevronDown,
  ChevronUp,
  Save,
  Filter,
  Users,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProgramme,
  getBranch,
  getYear,
  getSections,
  getAcademicYear,
} from "../../../apis/Common";
import {
  loadAddAttendanceList,
  loadStudentAbsSubjects,
  loadStudentAbsentDetails,
  saveAddAttendanceApi,
  AddAttendanceStudentItem,
  StudentAbsSubjectItem,
  StudentAbsentDetailItem,
} from "../../../apis/AttendanceApis";
import "./AddAttendance.css";

// Helper to extract academic year string
const extractAcademicYear = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item.trim();
  return String(
    item.ACADEMICYEAR ??
      item.academicYear ??
      item.AcademicYear ??
      item.academicyear ??
      item.acdYr ??
      item.year ??
      "",
  ).trim();
};

// Robust Extractor Helpers for Backend API Shapes
const extractCourse = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string") {
    const s = item.trim();
    if (!s || s === "-" || s === "0") return { code: "", name: "" };
    return { code: s, name: s };
  }
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
      "",
  ).trim();

  const rawName = String(
    item.COURSE ??
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
      item.NAME ??
      item.name ??
      rawCode,
  ).trim();

  const code = rawCode === "-" || rawCode === "0" ? "" : rawCode;
  const name = rawName === "-" || rawName === "0" ? "" : rawName;
  if (!code) return { code: "", name: "" };
  return { code, name: name || code };
};

const extractBranch = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string") {
    const s = item.trim();
    if (!s || s === "-" || s === "0") return { code: "", name: "" };
    return { code: s, name: s };
  }
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
      "",
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
      rawCode,
  ).trim();

  const code = rawCode === "-" || rawCode === "0" ? "" : rawCode;
  const name = rawName === "-" || rawName === "0" ? "" : rawName;
  if (!code) return { code: "", name: "" };
  return { code, name: name || code };
};

const extractYear = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string" || typeof item === "number") {
    const s = String(item).trim();
    if (!s || s === "-" || s === "0") return { code: "", name: "" };
    const roman =
      s === "1"
        ? "I"
        : s === "2"
          ? "II"
          : s === "3"
            ? "III"
            : s === "4"
              ? "IV"
              : s;
    return { code: s, name: roman };
  }
  const rawCode = String(
    item.ID ??
      item.id ??
      item.YEAR ??
      item.Year ??
      item.year ??
      item.SYEAR ??
      item.sYear ??
      item.syear ??
      item.code ??
      item.CODE ??
      "",
  ).trim();

  const rawName = String(
    item.DATA ??
      item.data ??
      item.NAME ??
      item.name ??
      item.YEARNAME ??
      item.yearName ??
      rawCode,
  ).trim();

  const code = rawCode === "-" || rawCode === "0" ? "" : rawCode;
  if (!code) return { code: "", name: "" };
  const roman =
    code === "1"
      ? "I"
      : code === "2"
        ? "II"
        : code === "3"
          ? "III"
          : code === "4"
            ? "IV"
            : rawName || code;
  return { code, name: roman || code };
};

const extractSection = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string") {
    const s = item.trim();
    return { code: s, name: s };
  }
  const rawCode = String(
    item.SECTION ??
      item.Section ??
      item.section ??
      item.SECTIONNAME ??
      item.sectionName ??
      item.ID ??
      item.id ??
      item.DATA ??
      item.data ??
      item.code ??
      item.CODE ??
      "",
  ).trim();

  const code = rawCode === "-" ? "" : rawCode;
  return { code, name: code };
};

// Formats date string to DD-MM-YYYY
const formatDisplayDate = (val: any): string => {
  if (!val) return "";
  const str = String(val).trim();
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str;
  const datePart = str.includes("T") ? str.split("T")[0] : str;
  const parts = datePart.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return str;
};

interface StudentTableItem {
  registrationNo: string;
  totalClasses: number;
  presentClasses: number;
  presentPercentage: number;
  raw: AddAttendanceStudentItem;
}

// Extractor helper to map student items accurately from backend response keys
const extractStudentTableItem = (item: any): StudentTableItem => {
  const reg = String(
    item.REGNO ??
      item.regno ??
      item.RegistrationNo ??
      item.REGISTRATIONNO ??
      item.regNo ??
      item.HTNO ??
      "",
  ).trim();

  const total = Number(
    item.TH ??
      item.TotalClasses ??
      item.TOTAL_CLASSES ??
      item.TOTALCLASSES ??
      item.total ??
      item.totalClasses ??
      0,
  );

  const present = Number(
    item.TP ??
      item.PresentClasses ??
      item.PRESENT_CLASSES ??
      item.PRESENTCLASSES ??
      item.present ??
      item.presentClasses ??
      0,
  );

  const rawPct =
    item.perc ??
    item.TCLASS ??
    item.PresentPercentage ??
    item.PRESENT_PERCENTAGE ??
    item.PRESENTPERCENTAGE ??
    item.percentage ??
    item.presentPct;

  let pct = 0;
  if (rawPct !== undefined && rawPct !== null && String(rawPct).trim() !== "") {
    pct = Number(parseFloat(String(rawPct).trim()));
  } else if (total > 0) {
    pct = Number(((present / total) * 100).toFixed(2));
  }

  return {
    registrationNo: reg,
    totalClasses: isNaN(total) ? 0 : total,
    presentClasses: isNaN(present) ? 0 : present,
    presentPercentage: isNaN(pct) ? 0 : pct,
    raw: item,
  };
};

interface AbsenceTableRow extends StudentAbsentDetailItem {
  displayDate: string;
  displaySubject: string;
  displayFaculty: string;
  displayPeriod: string;
  displayStatus: string;
  selected: boolean;
}

const AddAttendance: React.FC = () => {
  const [academicYear, setAcademicYear] = useState<string>(
    localStorage.getItem("academicYear") || "",
  );
  const [academicYearList, setAcademicYearList] = useState<string[]>([]);
  const [loadingAcademicYears, setLoadingAcademicYears] =
    useState<boolean>(false);

  // Ref to scroll smoothly to Table 2 when opened
  const table2Ref = useRef<HTMLDivElement>(null);

  // Extract User ID safely without mock fallback
  const rawUser = localStorage.getItem("user");
  let userId = "";
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      userId =
        parsed.userId ||
        parsed.id ||
        parsed.username ||
        parsed.empId ||
        parsed.user ||
        "";
    } catch {
      userId = rawUser;
    }
  }
  if (!userId) {
    userId =
      localStorage.getItem("userId") || localStorage.getItem("username") || "";
  }

  // Card header collapse state
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);

  // Filter criteria state - initially empty
  const [programme, setProgramme] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [fromPercentage, setFromPercentage] = useState<string>("");
  const [toPercentage, setToPercentage] = useState<string>("");

  // Dynamic dropdown options and loading states
  const [programmeOptions, setProgrammeOptions] = useState<any[]>([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState<boolean>(false);

  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState<boolean>(false);

  const [yearOptions, setYearOptions] = useState<any[]>([]);
  const [loadingYears, setLoadingYears] = useState<boolean>(false);

  const [sectionOptions, setSectionOptions] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState<boolean>(false);

  // Table 1 (Students list) state
  const [studentsList, setStudentsList] = useState<StudentTableItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [hasLoadedTable1, setHasLoadedTable1] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState<string>("");

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return studentsList;
    const q = studentSearch.toLowerCase();
    return studentsList.filter((s) =>
      s.registrationNo.toLowerCase().includes(q),
    );
  }, [studentsList, studentSearch]);

  // Table 2 (Selected student & absence details) state
  const [selectedStudent, setSelectedStudent] =
    useState<StudentTableItem | null>(null);
  const [subjectsList, setSubjectsList] = useState<StudentAbsSubjectItem[]>([]);
  const [selectedSubcode, setSelectedSubcode] = useState<string>("");
  const [absentDetails, setAbsentDetails] = useState<AbsenceTableRow[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  const [loadingAbsentDetails, setLoadingAbsentDetails] =
    useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 0. Initial Load: Fetch Academic Years
  useEffect(() => {
    let isMounted = true;
    const fetchAcademicYears = async () => {
      setLoadingAcademicYears(true);
      try {
        const res = await getAcademicYear();
        if (!isMounted) return;
        if (Array.isArray(res) && res.length > 0) {
          const years = res.map(extractAcademicYear).filter(Boolean);
          if (years.length > 0) {
            const uniqueYears = Array.from(new Set(years));
            setAcademicYearList(uniqueYears);
            setAcademicYear((prev) => {
              if (prev && uniqueYears.includes(prev)) return prev;
              const stored = localStorage.getItem("academicYear");
              if (stored && uniqueYears.includes(stored)) return stored;
              const chosen = uniqueYears[0];
              localStorage.setItem("academicYear", chosen);
              return chosen;
            });
          }
        }
      } catch (err) {
        console.warn("Error loading academic years:", err);
      } finally {
        if (isMounted) setLoadingAcademicYears(false);
      }
    };
    fetchAcademicYears();
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Fetch Programmes when Academic Year is available or changed
  useEffect(() => {
    if (!academicYear) return;
    let isMounted = true;
    const fetchProgrammes = async () => {
      setLoadingProgrammes(true);
      try {
        const res = await getProgramme(academicYear);
        if (!isMounted) return;
        setProgrammeOptions(Array.isArray(res) ? res : []);
      } catch (err) {
        console.warn("Error loading programmes:", err);
        if (isMounted) setProgrammeOptions([]);
      } finally {
        if (isMounted) setLoadingProgrammes(false);
      }
    };
    fetchProgrammes();
    return () => {
      isMounted = false;
    };
  }, [academicYear]);

  // 2. Cascade: Fetch Branch & Year when Programme changes
  useEffect(() => {
    if (!programme) {
      setBranchOptions([]);
      setYearOptions([]);
      setSectionOptions([]);
      return;
    }

    let isMounted = true;
    const fetchBranchAndYear = async () => {
      setLoadingBranches(true);
      setLoadingYears(true);
      try {
        const [bRes, yRes] = await Promise.all([
          getBranch(programme, academicYear),
          getYear(programme, academicYear),
        ]);
        if (!isMounted) return;
        setBranchOptions(Array.isArray(bRes) ? bRes : []);

        let years = Array.isArray(yRes) ? yRes : [];
        if (years.length === 0) {
          const selectedProg = programmeOptions.find((p) => {
            const { code } = extractCourse(p);
            return code === programme;
          });
          const maxYear = Number(selectedProg?.YEAR ?? selectedProg?.year ?? 0);
          if (maxYear > 0) {
            years = Array.from({ length: maxYear }, (_, i) => ({
              code: String(i + 1),
              name: ["I", "II", "III", "IV", "V", "VI"][i] || String(i + 1),
            }));
          }
        }
        setYearOptions(years);
      } catch (err) {
        console.warn("Error loading branches/years:", err);
        if (isMounted) {
          setBranchOptions([]);
          setYearOptions([]);
        }
      } finally {
        if (isMounted) {
          setLoadingBranches(false);
          setLoadingYears(false);
        }
      }
    };
    fetchBranchAndYear();
    return () => {
      isMounted = false;
    };
  }, [programme, academicYear]);

  // 3. Cascade: Fetch Sections when Programme, Branch & Year change
  useEffect(() => {
    if (!programme || !branch || !year) {
      setSectionOptions([]);
      return;
    }

    let isMounted = true;
    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const sRes = await getSections(programme, branch, year);
        if (!isMounted) return;
        setSectionOptions(Array.isArray(sRes) ? sRes : []);
      } catch (err) {
        console.warn("Error loading sections:", err);
        if (isMounted) setSectionOptions([]);
      } finally {
        if (isMounted) setLoadingSections(false);
      }
    };
    fetchSections();
    return () => {
      isMounted = false;
    };
  }, [programme, branch, year]);

  // 4. Load Table 1: POST /api/AddAttendance/attendance-list
  const fetchAttendanceList = useCallback(
    async (isManual = false) => {
      if (!programme) {
        if (isManual) toast.warning("Please select Programme.");
        return;
      }
      if (!branch) {
        if (isManual) toast.warning("Please select Branch.");
        return;
      }
      if (!year) {
        if (isManual) toast.warning("Please select Year.");
        return;
      }
      if (!semester) {
        if (isManual) toast.warning("Please select Semister.");
        return;
      }
      if (!section) {
        if (isManual) toast.warning("Please select Section.");
        return;
      }
      if (fromPercentage === "" || isNaN(Number(fromPercentage))) {
        if (isManual) toast.warning("Please enter From Percentage.");
        return;
      }
      if (toPercentage === "" || isNaN(Number(toPercentage))) {
        if (isManual) toast.warning("Please enter To Percentage.");
        return;
      }

      setLoadingStudents(true);
      setSelectedStudent(null);
      setAbsentDetails([]);
      setSubjectsList([]);
      setSelectedSubcode("");

      try {
        const data = await loadAddAttendanceList({
          semister: semester,
          programme: programme,
          branch: branch,
          year: year,
          section: section,
          academicYear: academicYear,
          fPerc: String(fromPercentage).trim(),
          tPerc: String(toPercentage).trim(),
        });

        if (Array.isArray(data) && data.length > 0) {
          const mapped: StudentTableItem[] = data.map(extractStudentTableItem);
          setStudentsList(mapped);
          if (isManual) {
            toast.success(
              `Loaded ${mapped.length} student attendance record(s).`,
            );
          }
        } else {
          setStudentsList([]);
          if (isManual) {
            toast.info(
              `No students found within ${fromPercentage}% - ${toPercentage}% range for ${academicYear}.`,
            );
          }
        }
        setHasLoadedTable1(true);
      } catch (err) {
        console.error("Error loading attendance list:", err);
        if (isManual) toast.error("Failed to load attendance list.");
        setStudentsList([]);
        setHasLoadedTable1(true);
      } finally {
        setLoadingStudents(false);
      }
    },
    [
      programme,
      branch,
      year,
      semester,
      section,
      fromPercentage,
      toPercentage,
      academicYear,
    ],
  );

  const handleLoadAttendanceList = () => {
    fetchAttendanceList(true);
  };

  // Automatically trigger attendance list load when all criteria are selected/entered (with debounce)
  useEffect(() => {
    if (
      !programme ||
      !branch ||
      !year ||
      !semester ||
      !section ||
      fromPercentage === "" ||
      toPercentage === ""
    ) {
      return;
    }

    const timer = setTimeout(() => {
      fetchAttendanceList(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [
    programme,
    branch,
    year,
    semester,
    section,
    fromPercentage,
    toPercentage,
    fetchAttendanceList,
  ]);

  // Helper to fetch absent details grid
  const fetchAbsentDetails = async (regno: string, subcodeParam: string) => {
    setLoadingAbsentDetails(true);
    try {
      const data = await loadStudentAbsentDetails({
        programme: programme,
        branch: branch,
        year: year,
        semister: semester,
        section: section,
        regno: regno,
        subcode: subcodeParam,
        academicYear: academicYear,
      });

      if (Array.isArray(data) && data.length > 0) {
        const rows: AbsenceTableRow[] = data.map((item) => ({
          ...item,
          displayDate: formatDisplayDate(
            item.ADATE ??
              item.ENTRYDATE ??
              item.Date ??
              item.date ??
              item.DATE ??
              item.ATTDATE ??
              "",
          ),
          displaySubject: String(
            item.ASUBJECT ??
              item.Subject ??
              item.subject ??
              item.SUBJECT ??
              item.subcode ??
              item.SUB_CODE ??
              "",
          ).trim(),
          displayFaculty: String(
            item.FACULTYNAME ??
              item.FACULTYID ??
              item.FACULTY ??
              item.Faculty ??
              item.faculty ??
              item.lecturer ??
              "",
          ).trim(),
          displayPeriod: String(
            item.PEROID ??
              item.PERIOD ??
              item.Period ??
              item.period ??
              item.PERIOD_RANGE ??
              "",
          ).trim(),
          displayStatus: String(
            item.STATUS ??
              item.Status ??
              item.status ??
              item.ATT ??
              item.att ??
              "A",
          ).trim(),
          selected: false,
        }));
        setAbsentDetails(rows);
      } else {
        setAbsentDetails([]);
      }
    } catch (err) {
      console.error("Error loading student-absent-details:", err);
      toast.error("Failed to load absent details.");
      setAbsentDetails([]);
    } finally {
      setLoadingAbsentDetails(false);
    }
  };

  // 5. Load Table 2 data when a student RegistrationNo is clicked
  const handleSelectStudent = (student: StudentTableItem) => {
    setSelectedStudent(student);
    setSelectedSubcode("");
    setAbsentDetails([]);
    setLoadingSubjects(true);
    setLoadingAbsentDetails(true);

    toast.info(`Opening absent details for ${student.registrationNo}...`);

    // Smooth scroll down to Table 2
    setTimeout(() => {
      if (table2Ref.current) {
        table2Ref.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 60);

    // Call subjects dropdown and absent details in parallel
    const progCode = String(
      student.raw?.CLASS ??
        student.raw?.PROGRAMME ??
        student.raw?.programme ??
        programme,
    );
    const brCode = String(
      student.raw?.GRPID ??
        student.raw?.BRANCH ??
        student.raw?.branch ??
        branch,
    );
    const yrCode = String(
      student.raw?.SYEAR ?? student.raw?.YEAR ?? student.raw?.year ?? year,
    );
    const semCode = String(
      student.raw?.SEMISTER ??
        student.raw?.semister ??
        student.raw?.semester ??
        semester,
    );
    const secCode = String(
      student.raw?.SECTION ?? student.raw?.section ?? section,
    );

    loadStudentAbsSubjects({
      programme: progCode,
      branch: brCode,
      year: yrCode,
      semister: semCode,
      section: secCode,
      regno: student.registrationNo,
      subcode: "",
    })
      .then((subjs) => {
        setSubjectsList(Array.isArray(subjs) ? subjs : []);
      })
      .catch((err) => {
        console.warn("Error loading student-abs-subjects:", err);
        setSubjectsList([]);
      })
      .finally(() => {
        setLoadingSubjects(false);
      });

    fetchAbsentDetails(student.registrationNo, "");
  };

  // When subject dropdown in Table 2 changes
  const handleSubjectChange = (newSubcode: string) => {
    setSelectedSubcode(newSubcode);
    if (selectedStudent) {
      fetchAbsentDetails(selectedStudent.registrationNo, newSubcode);
    }
  };

  // Toggle individual row checkbox in Table 2
  const handleToggleRow = (index: number) => {
    setAbsentDetails((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], selected: !next[index].selected };
      return next;
    });
  };

  // Toggle select all in Table 2
  const isAllSelected = useMemo(() => {
    return absentDetails.length > 0 && absentDetails.every((r) => r.selected);
  }, [absentDetails]);

  const handleToggleSelectAll = () => {
    const target = !isAllSelected;
    setAbsentDetails((prev) => prev.map((r) => ({ ...r, selected: target })));
  };

  // Dynamic Percentage Calculation for Table 2 (Image 2)
  const countChecked = useMemo(() => {
    return absentDetails.filter((r) => r.selected).length;
  }, [absentDetails]);

  const currentPctDisplay = useMemo(() => {
    if (!selectedStudent) return "0.00";
    return Number(selectedStudent.presentPercentage).toFixed(2);
  }, [selectedStudent]);

  const projectedPctDisplay = useMemo(() => {
    if (!selectedStudent || selectedStudent.totalClasses <= 0)
      return currentPctDisplay;
    const newPresent = selectedStudent.presentClasses + countChecked;
    const pct = (newPresent / selectedStudent.totalClasses) * 100;
    return pct.toFixed(2);
  }, [selectedStudent, countChecked, currentPctDisplay]);

  // Save Added Attendance: POST /api/AddAttendance/save-add-attendance
  const handleSaveAttendance = async () => {
    if (!selectedStudent) {
      toast.warning("Please select a student from the list first.");
      return;
    }

    const selectedRows = absentDetails.filter((r) => r.selected);
    if (selectedRows.length === 0) {
      toast.warning(
        "Please select at least one absence period to add attendance.",
      );
      return;
    }

    setIsSaving(true);
    try {
      const absenceItems = selectedRows.map((r) => ({
        date: r.displayDate,
        faculty: r.displayFaculty,
        subcode: r.displaySubject,
        period: r.displayPeriod,
        selected: true,
      }));

      const payload = {
        id: "",
        regno: selectedStudent.registrationNo,
        programme: programme,
        branch: branch,
        year: year,
        semister: semester,
        section: section,
        academicYear: academicYear,
        userId: userId,
        fPerc: fromPercentage,
        tPerc: toPercentage,
        absenceItems: absenceItems,
      };

      const res = await saveAddAttendanceApi(payload);

      if (res?.success !== false) {
        toast.success(
          `Attendance added successfully for ${selectedStudent.registrationNo}!`,
        );
        // Refresh Table 1 and Table 2
        await handleLoadAttendanceList();
        if (selectedStudent) {
          await fetchAbsentDetails(
            selectedStudent.registrationNo,
            selectedSubcode,
          );
        }
      } else {
        toast.error(res?.message || "Failed to save added attendance.");
      }
    } catch (err) {
      console.error("Error saving add attendance:", err);
      toast.error("An error occurred while saving attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setProgramme("");
    setBranch("");
    setYear("");
    setSemester("");
    setSection("");
    setFromPercentage("");
    setToPercentage("");
    setBranchOptions([]);
    setYearOptions([]);
    setSectionOptions([]);
    setStudentsList([]);
    setSelectedStudent(null);
    setAbsentDetails([]);
    setSubjectsList([]);
    setSelectedSubcode("");
    setHasLoadedTable1(false);
    setStudentSearch("");
    toast.info("Filters and tables reset.");
  };

  return (
    <div className="dbs-add-att-container">
      {/* ================= Page Header ================= */}
      <div className="dbs-add-att-header">
        <div className="dbs-add-att-title-group">
          <div className="dbs-add-att-icon-wrapper">
            <UserCheck size={24} />
          </div>
          <div>
            <h2>Add Attendance</h2>
            <p>
              Filter students by attendance percentage and grant attendance for
              missed sessions
            </p>
          </div>
        </div>

        <div className="dbs-add-att-badges">
          <div className="dbs-add-att-ay-badge">
            <span>Academic Year:</span>
            {loadingAcademicYears ? (
              <span className="dbs-ay-loading">
                <Loader2 size={13} className="dbs-spin" />
                <span>Loading...</span>
              </span>
            ) : academicYearList.length > 0 ? (
              <select
                value={academicYear}
                onChange={(e) => {
                  const newAy = e.target.value;
                  setAcademicYear(newAy);
                  localStorage.setItem("academicYear", newAy);
                  setProgramme("");
                  setBranch("");
                  setYear("");
                  setSemester("");
                  setSection("");
                  setBranchOptions([]);
                  setYearOptions([]);
                  setSectionOptions([]);
                  setHasLoadedTable1(false);
                  setStudentsList([]);
                  setSelectedStudent(null);
                  setAbsentDetails([]);
                }}
                className="dbs-ay-select"
                title="Select Academic Year"
              >
                {academicYearList.map((ay, idx) => (
                  <option key={idx} value={ay}>
                    {ay}
                  </option>
                ))}
              </select>
            ) : (
              <strong>{academicYear || "—"}</strong>
            )}
          </div>
        </div>
      </div>

      {/* ================= Filter Card ================= */}
      <div className="dbs-add-att-card">
        <div className="dbs-add-att-card-header">
          <h3>
            <Filter size={18} />
            <span>Attendance Criteria &amp; Percentage Range</span>
          </h3>
          <button
            type="button"
            className="dbs-card-collapse-btn"
            onClick={() => setIsFormCollapsed((prev) => !prev)}
            title={isFormCollapsed ? "Expand Form" : "Collapse Form"}
          >
            {isFormCollapsed ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronUp size={18} />
            )}
          </button>
        </div>

        {!isFormCollapsed && (
          <div className="dbs-add-att-form-body">
            <div className="dbs-add-att-grid">
              {/* Programme */}
              <div className="dbs-add-att-input-box">
                <label className="dbs-label-with-loader">
                  <span>Programme *</span>
                  {loadingProgrammes && (
                    <Loader2 size={13} className="dbs-spin dbs-field-spinner" />
                  )}
                </label>
                <select
                  value={programme}
                  onChange={(e) => {
                    setProgramme(e.target.value);
                    setBranch("");
                    setYear("");
                    setSection("");
                    setBranchOptions([]);
                    setYearOptions([]);
                    setSectionOptions([]);
                    setStudentsList([]);
                    setSelectedStudent(null);
                    setAbsentDetails([]);
                    setHasLoadedTable1(false);
                  }}
                  disabled={loadingProgrammes}
                >
                  <option value="">
                    {loadingProgrammes
                      ? "Loading Programmes..."
                      : "Select Programme"}
                  </option>
                  {programmeOptions.map((item, idx) => {
                    const { code, name } = extractCourse(item);
                    if (!code) return null;
                    const label =
                      name.startsWith(`${code}-`) ||
                      name.startsWith(`${code} - `) ||
                      name.startsWith(`${code} `)
                        ? name
                        : code && name && code !== name
                          ? `${code}-${name}`
                          : name || code;
                    return (
                      <option key={idx} value={code}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Branch */}
              <div className="dbs-add-att-input-box">
                <label className="dbs-label-with-loader">
                  <span>Branch *</span>
                  {loadingBranches && (
                    <Loader2 size={13} className="dbs-spin dbs-field-spinner" />
                  )}
                </label>
                <select
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    setSection("");
                    setSectionOptions([]);
                    setStudentsList([]);
                    setSelectedStudent(null);
                    setAbsentDetails([]);
                    setHasLoadedTable1(false);
                  }}
                  disabled={!programme || loadingBranches}
                >
                  <option value="">
                    {loadingBranches
                      ? "Loading Branches..."
                      : !programme
                        ? "Select Programme First"
                        : branchOptions.length === 0
                          ? "No Branches Available"
                          : "Select Branch"}
                  </option>
                  {branchOptions.map((item, idx) => {
                    const { code, name } = extractBranch(item);
                    if (!code) return null;
                    const label =
                      name.startsWith(`${code}-`) ||
                      name.startsWith(`${code} - `) ||
                      name.startsWith(`${code} `)
                        ? name
                        : code && name && code !== name
                          ? `${code}-${name}`
                          : name || code;
                    return (
                      <option key={idx} value={code}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Year */}
              <div className="dbs-add-att-input-box">
                <label className="dbs-label-with-loader">
                  <span>Year *</span>
                  {loadingYears && (
                    <Loader2 size={13} className="dbs-spin dbs-field-spinner" />
                  )}
                </label>
                <select
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setSection("");
                    setSectionOptions([]);
                    setStudentsList([]);
                    setSelectedStudent(null);
                    setAbsentDetails([]);
                    setHasLoadedTable1(false);
                  }}
                  disabled={!programme || loadingYears}
                >
                  <option value="">
                    {loadingYears
                      ? "Loading Years..."
                      : !programme
                        ? "Select Programme First"
                        : yearOptions.length === 0
                          ? "No Years Available"
                          : "Select Year"}
                  </option>
                  {yearOptions.map((item, idx) => {
                    const { code, name } = extractYear(item);
                    if (!code) return null;
                    return (
                      <option key={idx} value={code}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Semister */}
              <div className="dbs-add-att-input-box">
                <label>Semister *</label>
                <select
                  value={semester}
                  onChange={(e) => {
                    setSemester(e.target.value);
                    setStudentsList([]);
                    setSelectedStudent(null);
                    setAbsentDetails([]);
                    setHasLoadedTable1(false);
                  }}
                >
                  <option value="">Select Semister</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>

              {/* Section */}
              <div className="dbs-add-att-input-box">
                <label className="dbs-label-with-loader">
                  <span>Section *</span>
                  {loadingSections && (
                    <Loader2 size={13} className="dbs-spin dbs-field-spinner" />
                  )}
                </label>
                <select
                  value={section}
                  onChange={(e) => {
                    setSection(e.target.value);
                    setStudentsList([]);
                    setSelectedStudent(null);
                    setAbsentDetails([]);
                    setHasLoadedTable1(false);
                  }}
                  disabled={!programme || !branch || !year || loadingSections}
                >
                  <option value="">
                    {loadingSections
                      ? "Loading Sections..."
                      : !programme || !branch || !year
                        ? "Select Programme, Branch & Year First"
                        : sectionOptions.length === 0
                          ? "No Sections Available"
                          : "Select Section"}
                  </option>
                  {sectionOptions.map((item, idx) => {
                    const { code, name } = extractSection(item);
                    if (!code) return null;
                    return (
                      <option key={idx} value={code}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Attendance % Range */}
              <div className="dbs-add-att-input-box">
                <label>Attendance % Range *</label>
                <div className="dbs-percentage-range-wrapper">
                  <div className="dbs-percentage-input-group">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={fromPercentage}
                      onChange={(e) => setFromPercentage(e.target.value)}
                      placeholder="e.g. 60"
                    />
                    <span className="dbs-pct-symbol">%</span>
                  </div>
                  <span className="dbs-range-separator">to</span>
                  <div className="dbs-percentage-input-group">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={toPercentage}
                      onChange={(e) => setToPercentage(e.target.value)}
                      placeholder="e.g. 70"
                    />
                    <span className="dbs-pct-symbol">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Action Buttons */}
            <div className="dbs-add-att-actions">
              <button
                type="button"
                className="dbs-btn-search"
                onClick={handleLoadAttendanceList}
                disabled={loadingStudents}
              >
                {loadingStudents ? (
                  <Loader2 size={16} className="dbs-spin" />
                ) : (
                  <Search size={16} />
                )} 
                <span>Find Students</span>
              </button>

              <button
                type="button"
                className="dbs-btn-reset"
                onClick={handleResetFilters}
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= TABLE 1: STUDENTS ATTENDANCE LIST ================= */}
      {(hasLoadedTable1 || loadingStudents) && (
        <div className="dbs-add-att-table-card">
          <div className="dbs-table-header-area">
            <div className="dbs-table-title-group">
              <div className="dbs-table-title-row">
                <Users size={18} />
                <h3>Student Attendance Records</h3>
                <span className="dbs-table-count-badge">
                  {loadingStudents ? (
                    <Loader2 size={13} className="dbs-spin" />
                  ) : (
                    `${filteredStudents.length} Students`
                  )}
                </span>
              </div>
              <p>
                Click on any student's Registration No or row to view absent
                details and grant attendance
              </p>
            </div>

            {studentsList.length > 0 && !loadingStudents && (
              <div className="dbs-table-search-box">
                <Search size={15} className="dbs-table-search-icon" />
                <input
                  type="text"
                  placeholder="Search Registration No..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="dbs-table-search-input"
                />
              </div>
            )}
          </div>

          <div className="dbs-table-wrapper">
            <table className="dbs-add-attendance-table">
              <thead>
                <tr>
                  <th style={{ width: "28%" }}>Registration No</th>
                  <th style={{ width: "24%" }}>Total Classes</th>
                  <th style={{ width: "24%" }}>Present Classes</th>
                  <th style={{ width: "24%" }}>Present %</th>
                </tr>
              </thead>
              <tbody>
                {loadingStudents ? (
                  <tr>
                    <td colSpan={4} className="dbs-table-empty-cell">
                      <div className="dbs-table-loading-container">
                        <Loader2 size={24} className="dbs-spin" />
                        <span>Loading student attendance records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="dbs-table-empty-cell">
                      {studentsList.length === 0 ? (
                        <div className="dbs-empty-records-notice">
                          <p>
                            No students found within the{" "}
                            <strong>{fromPercentage}%</strong> -{" "}
                            <strong>{toPercentage}%</strong> range for{" "}
                            <strong>{academicYear}</strong>.
                          </p>
                          <p className="dbs-empty-hint">
                            Try adjusting the percentage range (e.g. 0% to 100%)
                            or switch Academic Year in the top right.
                          </p>
                        </div>
                      ) : (
                        "No students matching your search."
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((item, idx) => {
                    const isSelected =
                      selectedStudent?.registrationNo === item.registrationNo;
                    return (
                      <tr
                        key={idx}
                        className={isSelected ? "dbs-row-selected" : ""}
                        onClick={() => handleSelectStudent(item)}
                      >
                        <td>
                          <button
                            type="button"
                            className="dbs-regno-link-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectStudent(item);
                            }}
                            title="Click to view absent sessions and add attendance"
                          >
                            {item.registrationNo}
                          </button>
                        </td>
                        <td>{item.totalClasses}</td>
                        <td>{item.presentClasses}</td>
                        <td>
                          <span
                            className={`dbs-pct-badge ${
                              item.presentPercentage >= 75
                                ? "high"
                                : item.presentPercentage >= 65
                                  ? "medium"
                                  : "low"
                            }`}
                          >
                            {item.presentPercentage.toFixed(2)}%
                          </span>
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

      {/* ================= TABLE 2: STUDENT ABSENT DETAILS ================= */}
      {selectedStudent && (
        <div ref={table2Ref} className="dbs-add-att-table-card dbs-table2-card">
          <div className="dbs-table-header-area">
            <div className="dbs-table-title-group">
              <div className="dbs-table-title-row">
                <CalendarCheck size={18} />
                <h3>Absent Sessions for {selectedStudent.registrationNo}</h3>
                <span className="dbs-table-count-badge">
                  {absentDetails.length} Absent Periods
                </span>
              </div>
              <p>
                Select the absent periods you want to mark as present, then
                click Save
              </p>
            </div>

            {/* Dynamic Percentage Comparison Widget */}
            <div className="dbs-pct-comparison-group">
              <div className="dbs-pct-metric">
                <span className="dbs-pct-metric-label">Current Attendance</span>
                <span className="dbs-pct-box-current" title="Current Present %">
                  {currentPctDisplay}%
                </span>
              </div>

              <span className="dbs-pct-arrows">&gt;&gt;&gt;</span>

              <div className="dbs-pct-metric">
                <span className="dbs-pct-metric-label">
                  Projected Attendance
                </span>
                <span
                  className="dbs-pct-box-projected"
                  title="Projected Present %"
                >
                  {projectedPctDisplay}%
                </span>
              </div>
            </div>
          </div>

          {/* Table 2 Toolbar */}
          <div className="dbs-table2-control-bar">
            {/* REGNO Box */}
            <div className="dbs-table2-regno-group">
              <label className="dbs-table2-label">REGNO</label>
              <input
                type="text"
                readOnly
                value={selectedStudent.registrationNo}
                className="dbs-table2-regno-input"
              />
            </div>

            {/* SUBJECTS Dropdown */}
            <div className="dbs-table2-subjects-group">
              <label className="dbs-table2-label">SUBJECTS</label>
              <div className="dbs-subject-select-wrapper">
                <select
                  value={selectedSubcode}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="dbs-table2-subjects-select"
                  disabled={loadingSubjects}
                >
                  <option value="">Select SubjectName</option>
                  {subjectsList.map((s, idx) => {
                    const code = String(
                      s.SUBJECTCODE ?? s.SUB_CODE ?? s.subcode ?? s.code ?? "",
                    ).trim();
                    const name = String(
                      s.SUBJECTNAME ?? s.subjectName ?? s.name ?? code,
                    ).trim();
                    return (
                      <option key={idx} value={code}>
                        {name || code}
                      </option>
                    );
                  })}
                </select>
                {loadingSubjects && (
                  <Loader2
                    size={16}
                    className="dbs-spin dbs-subject-loading-spinner"
                  />
                )}
              </div>
            </div>

            {countChecked > 0 && (
              <div className="dbs-checked-counter-chip">
                <CheckCircle2 size={14} />
                <span>{countChecked} period(s) selected</span>
              </div>
            )}
          </div>

          {/* Table 2 Body */}
          <div className="dbs-table-wrapper">
            <table className="dbs-add-attendance-table dbs-table-2">
              <thead>
                <tr>
                  <th style={{ width: "20%" }}>Date</th>
                  <th style={{ width: "25%" }}>Subject</th>
                  <th style={{ width: "22%" }}>FACULTY</th>
                  <th style={{ width: "14%" }}>PERIOD</th>
                  <th style={{ width: "11%" }}>STATUS</th>
                  <th style={{ width: "8%", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      title="Select/Deselect All"
                      className="dbs-custom-checkbox"
                      disabled={absentDetails.length === 0}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingAbsentDetails ? (
                  <tr>
                    <td colSpan={6} className="dbs-table-empty-cell">
                      <div className="dbs-table-loading-container">
                        <Loader2 size={24} className="dbs-spin" />
                        <span>
                          Loading absent records for{" "}
                          {selectedStudent.registrationNo}...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : absentDetails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="dbs-table-empty-cell">
                      No absent periods found for the selected subject.
                    </td>
                  </tr>
                ) : (
                  absentDetails.map((row, idx) => (
                    <tr
                      key={idx}
                      className={row.selected ? "dbs-row-checked" : ""}
                      onClick={() => handleToggleRow(idx)}
                    >
                      <td>{row.displayDate}</td>
                      <td>{row.displaySubject}</td>
                      <td>{row.displayFaculty}</td>
                      <td>{row.displayPeriod}</td>
                      <td>
                        <span className="dbs-status-pill-absent">
                          {row.displayStatus || "A"}
                        </span>
                      </td>
                      <td
                        style={{ textAlign: "center" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => handleToggleRow(idx)}
                          className="dbs-custom-checkbox"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Save Button */}
          <div className="dbs-save-btn-container">
            <button
              type="button"
              className="dbs-btn-teal-save"
              onClick={handleSaveAttendance}
              disabled={
                isSaving || absentDetails.length === 0 || countChecked === 0
              }
            >
              {isSaving ? (
                <Loader2 size={16} className="dbs-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>Save</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAttendance;
