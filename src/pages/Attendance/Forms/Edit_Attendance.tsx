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
  BookOpen,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
import "./Edit_Attendance.css";
import {
  getProgramme,
  getBranch,
  getYear,
  getSections,
} from "../../../apis/Common";
import {
  loadEditAttendanceTlm,
  loadEditAttendancePeriods,
  loadEditAttendanceLecturers,
  loadEditAttendanceOldLecturers,
  loadEditAttendanceStudents,
  saveEditAttendanceSubjectWise,
} from "../../../apis/AttendanceApis";

interface PeriodItem {
  FRM_TO_PERIODS?: string;
  period?: string;
}

interface LecturerItem {
  Lecturer?: string;
  LECTURER?: string;
  lecturer?: string;
  FNAME?: string;
  fname?: string;
  FacultyName?: string;
  name?: string;
}

interface StudentAttendanceRecord {
  SNO?: number;
  ROLLNO?: string;
  REGNO?: string;
  SName?: string;
  ATT?: string | null;
  REMARKS?: string | null;
  DAYTAUGHT?: string | null;
  SUB_CODE?: string;
  SUBJECTNAME?: string;
  PROGRAMME?: string;
  BRANCH?: string;
  SYEAR?: number | string;
  SSEMESTER?: number | string;
  SECTION?: string;
}

// Format helper: YYYY-MM-DD -> DD-MM-YYYY
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
      "",
  ).trim();

  const rawName = String(
    item.COURSE ??
      item.COURSENAME ??
      item.CourseName ??
      item.PROGRAMMENAME ??
      item.name ??
      rawCode,
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
      "",
  ).trim();

  const rawName = String(
    item.BRANCHNAME ??
      item.BRANCH_NAME ??
      item.BranchName ??
      item.branchName ??
      rawCode,
  ).trim();

  return { code: rawCode, name: rawName || rawCode };
};

const extractYear = (item: any): { code: string; name: string } => {
  if (!item) return { code: "", name: "" };
  if (typeof item === "string" || typeof item === "number") {
    return { code: String(item), name: `Year ${item}` };
  }
  const rawCode = String(
    item.ID ?? item.id ?? item.YEAR ?? item.Year ?? item.code ?? "",
  ).trim();

  const rawData = String(
    item.DATA ??
      item.data ??
      item.YEARNAME ??
      item.YearName ??
      item.name ??
      rawCode,
  ).trim();

  return {
    code: rawCode,
    name: rawData ? `${rawCode} (${rawData})` : `Year ${rawCode}`,
  };
};

const extractSection = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item.trim();
  return String(
    item.SECTION ?? item.section ?? item.Section ?? item.SECTIONNAME ?? "",
  ).trim();
};

const ModifyAttendance: React.FC = () => {
  // Academic Year obtained from localStorage as standard
  const [academicYear] = useState<string>(() => {
    return (
      localStorage.getItem("academicYear") ||
      localStorage.getItem("academic_year") ||
      "2026-2027"
    );
  });

  // Logged-in Staff details
  const staffInfo = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return { id: "", name: "" };
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      const rawId =
        parsed.userId ??
        parsed.UserId ??
        parsed.userID ??
        parsed.empId ??
        parsed.FacultyID ??
        parsed.facultyId ??
        parsed.lecturer ??
        parsed.id ??
        "";
      const id = String(rawId).trim();
      const name =
        parsed.userName ||
        parsed.name ||
        parsed.FacultyName ||
        parsed.Fname ||
        parsed.displayName ||
        "Faculty Staff";
      return { id, name };
    } catch {
      return { id: "", name: "" };
    }
  }, []);

  const userLoginId =
    staffInfo.id ||
    localStorage.getItem("userId") ||
    localStorage.getItem("username") ||
    "";

  // Filter criteria states
  const [date, setDate] = useState<string>("");
  const [shift, setShift] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [isPractical, setIsPractical] = useState<boolean>(false);
  const [srNo, setSrNo] = useState<string>("");
  const [erNo, setErNo] = useState<string>("");

  // Dropdown list states
  const [programmesList, setProgrammesList] = useState<
    { code: string; name: string }[]
  >([]);
  const [programme, setProgramme] = useState<string>("");

  const [branchesList, setBranchesList] = useState<
    { code: string; name: string }[]
  >([]);
  const [branch, setBranch] = useState<string>("");

  const [yearsList, setYearsList] = useState<{ code: string; name: string }[]>(
    [],
  );
  const [sYear, setSYear] = useState<string>("");

  const [sectionsList, setSectionsList] = useState<string[]>([]);
  const [section, setSection] = useState<string>("");

  // Faculty re-allocation states (Old Lecturer & New Lecturer)
  const [oldLecturersList, setOldLecturersList] = useState<LecturerItem[]>([]);
  const [newLecturersList, setNewLecturersList] = useState<LecturerItem[]>([]);
  const [oldLecturer, setOldLecturer] = useState<string>("");
  const [newLecturer, setNewLecturer] = useState<string>("");

  const [periodsList, setPeriodsList] = useState<PeriodItem[]>([]);
  const [period, setPeriod] = useState<string>("");

  const [tlmData, setTlmData] = useState<{ TLM: string }[]>([]);
  const [tlm, setTlm] = useState<string>("");

  // Quick inputs & remarks
  const [absentNumberInput, setAbsentNumberInput] = useState<string>("");
  const [absentNumbersStr, setAbsentNumbersStr] = useState<string>("");
  const [dayTaught, setDayTaught] = useState<string>("");

  // Students roster & search filtering
  const [students, setStudents] = useState<StudentAttendanceRecord[]>([]);
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

  // 1. Initial Load: Fetch TLM and Programmes for academicYear
  useEffect(() => {
    const fetchInitialLookups = async () => {
      // Load TLM using loadEditAttendanceTlm
      try {
        const tlmRes = await loadEditAttendanceTlm(academicYear);
        const list = Array.isArray(tlmRes?.data)
          ? tlmRes.data
          : Array.isArray(tlmRes)
            ? tlmRes
            : [];
        setTlmData(list);
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

  // 2. Fetch Periods when all session criteria are selected
  useEffect(() => {
    if (
      !programme ||
      !branch ||
      !sYear ||
      !semester ||
      !section ||
      !date ||
      !academicYear
    ) {
      setPeriodsList([]);
      setPeriod("");
      return;
    }

    const fetchPeriods = async () => {
      setLoadingPeriods(true);
      try {
        const payload = {
          date: date,
          programme: programme,
          branch: branch,
          sYear: sYear,
          section: section,
          semester: semester,
          acdYr: academicYear,
        };
        const response = await loadEditAttendancePeriods(payload);
        console.log("-------Periods data loaded--------:", response);
        const list: PeriodItem[] = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        setPeriodsList(list);
        if (list.length === 0) {
          toast.info(
            "No posted attendance periods found for selected criteria.",
          );
        }
      } catch (error) {
        console.error("Error while fetching periods:", error);
        setPeriodsList([]);
        toast.error("Failed to load periods for selected criteria.");
      } finally {
        setLoadingPeriods(false);
      }
    };

    fetchPeriods();
  }, [date, programme, branch, sYear, semester, section, academicYear]);

  // 3. Handle Programme selection -> Load Branches & Years
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
    setOldLecturer("");
    setNewLecturer("");
    setOldLecturersList([]);
    setNewLecturersList([]);
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

      const bList = Array.isArray(branchRes)
        ? branchRes
        : branchRes?.data || [];
      setBranchesList(
        bList
          .map(extractBranch)
          .filter((b: { code: string; name: string }) => Boolean(b.code)),
      );

      const yList = Array.isArray(yearRes) ? yearRes : yearRes?.data || [];
      setYearsList(
        yList
          .map(extractYear)
          .filter((y: { code: string; name: string }) => Boolean(y.code)),
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

  // 4. Handle Branch selection
  const handleBranchChange = (selectedBranch: string) => {
    setBranch(selectedBranch);
    setSection("");
    setSectionsList([]);
    setOldLecturer("");
    setNewLecturer("");
    setOldLecturersList([]);
    setNewLecturersList([]);
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

  // 5. Handle Year selection
  const handleYearChange = (selectedYear: string) => {
    setSYear(selectedYear);
    setSection("");
    setSectionsList([]);
    setOldLecturer("");
    setNewLecturer("");
    setOldLecturersList([]);
    setNewLecturersList([]);
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

  // Helper to load lecturers and students when a period is selected
  const fetchLecturersAndStudents = async (selectedPeriod: string) => {
    if (
      !selectedPeriod ||
      !programme ||
      !branch ||
      !sYear ||
      !semester ||
      !section ||
      !date ||
      !academicYear
    ) {
      setOldLecturersList([]);
      setNewLecturersList([]);
      setOldLecturer("");
      setNewLecturer("");
      return;
    }

    setLoadingLecturers(true);
    try {
      const commonPayload = {
        acdYr: academicYear,
        lecturer: userLoginId,
        programme: programme,
        branch: branch,
        sYear: sYear,
        semester: semester,
        section: section,
        periodRange: selectedPeriod,
        date: toApiDate(date),
      };

      const [oldRes, newRes] = await Promise.allSettled([
        loadEditAttendanceOldLecturers(commonPayload),
        loadEditAttendanceLecturers({
          ...commonPayload,
          shift: shift || "1",
        }),
      ]);

      let oldList: LecturerItem[] = [];
      if (oldRes.status === "fulfilled") {
        const val = oldRes.value;
        oldList = Array.isArray(val?.data)
          ? val.data
          : Array.isArray(val)
            ? val
            : [];
      } else {
        console.error("Error loading old lecturers:", oldRes.reason);
      }

      let newList: LecturerItem[] = [];
      if (newRes.status === "fulfilled") {
        const val = newRes.value;
        newList = Array.isArray(val?.data)
          ? val.data
          : Array.isArray(val)
            ? val
            : [];
      } else {
        console.error("Error loading new lecturers:", newRes.reason);
      }

      setOldLecturersList(oldList);
      setNewLecturersList(newList);

      const firstOldLec =
        oldList[0]?.Lecturer ||
        oldList[0]?.LECTURER ||
        oldList[0]?.lecturer ||
        userLoginId;

      setOldLecturer(firstOldLec);
      setNewLecturer(firstOldLec);

      // Fetch students for this period and old lecturer
      fetchStudentsRoster(selectedPeriod, firstOldLec);
    } catch (error) {
      console.error("Error loading lecturers for period:", error);
      setOldLecturersList([]);
      setNewLecturersList([]);
      setOldLecturer("");
      setNewLecturer("");
    } finally {
      setLoadingLecturers(false);
    }
  };

  // 6. Handle Semester change
  const handleSemesterChange = (selectedSem: string) => {
    setSemester(selectedSem);
    setOldLecturer("");
    setNewLecturer("");
    setOldLecturersList([]);
    setNewLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setDayTaught("");
    setAbsentNumbersStr("");
    setSearchQuery("");
  };

  // 7. Handle Section change
  const handleSectionChange = (selectedSec: string) => {
    setSection(selectedSec);
    setOldLecturer("");
    setNewLecturer("");
    setOldLecturersList([]);
    setNewLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setDayTaught("");
    setAbsentNumbersStr("");
    setSearchQuery("");
  };

  // 8. Handle Date & Shift changes
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setOldLecturer("");
    setNewLecturer("");
    setOldLecturersList([]);
    setNewLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setSearchQuery("");
  };

  const handleShiftChange = (newShift: string) => {
    setShift(newShift);
    setOldLecturer("");
    setNewLecturer("");
    setOldLecturersList([]);
    setNewLecturersList([]);
    setPeriod("");
    setPeriodsList([]);
    setStudents([]);
    setSearchQuery("");
  };

  // 9. Handle Old Lecturer selection
  const handleOldLecturerChange = (selectedLec: string) => {
    setOldLecturer(selectedLec);
    if (!newLecturer) {
      setNewLecturer(selectedLec);
    }
    if (period) {
      fetchStudentsRoster(period, selectedLec);
    }
  };

  // 10. Load Students Roster
  const fetchStudentsRoster = async (
    selectedPeriod: string,
    currentLecturer?: string,
  ) => {
    if (
      !selectedPeriod ||
      !programme ||
      !branch ||
      !sYear ||
      !semester ||
      !section ||
      !date
    ) {
      return;
    }

    const effectiveLecturer = currentLecturer || oldLecturer || userLoginId;

    setLoadingStudents(true);
    try {
      const payload = {
        lecturer: effectiveLecturer,
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

      const res = await loadEditAttendanceStudents(payload);
      const studentRecords: StudentAttendanceRecord[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      if (studentRecords.length === 0) {
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

      toast.success(`Loaded ${normalized.length} students for modification.`);
    } catch (err) {
      console.error("Error loading students:", err);
      toast.error("Failed to load student attendance roster.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // 11. Handle Period selection -> Load Students & Lecturers
  const handlePeriodChange = (selectedPeriod: string) => {
    setPeriod(selectedPeriod);
    setStudents([]);
    setDayTaught("");
    setAbsentNumbersStr("");
    setSearchQuery("");

    if (selectedPeriod) {
      fetchLecturersAndStudents(selectedPeriod);
    } else {
      setOldLecturersList([]);
      setNewLecturersList([]);
      setOldLecturer("");
      setNewLecturer("");
    }
  };

  // Synchronize absent numbers string with current attendance
  useEffect(() => {
    const absents = students
      .filter((st) => (st.ATT || "").toUpperCase() === "A")
      .map((st) => {
        const roll = (st.ROLLNO || "").trim();
        return roll || st.REGNO || String(st.SNO);
      });
    setAbsentNumbersStr(absents.join(", "));
  }, [students]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter(
      (s) => (s.ATT || "").toUpperCase() === "P",
    ).length;
    const absent = students.filter(
      (s) => (s.ATT || "").toUpperCase() === "A",
    ).length;
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
      const reg = (st.REGNO || "").toLowerCase();
      const name = (st.SName || "").toLowerCase();
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
  const handleToggleStudentAttendance = (
    studentIdentifier: string | number,
  ) => {
    setStudents((prev) =>
      prev.map((st) => {
        const match =
          (st.REGNO && st.REGNO === studentIdentifier) ||
          st.SNO === studentIdentifier;
        if (match) {
          const current = (st.ATT || "").toUpperCase() === "A" ? "A" : "P";
          return {
            ...st,
            ATT: current === "P" ? "A" : "P",
          };
        }
        return st;
      }),
    );
  };

  // Remarks change by identifier
  const handleRemarksChange = (
    studentIdentifier: string | number,
    val: string,
  ) => {
    setStudents((prev) =>
      prev.map((st) => {
        const match =
          (st.REGNO && st.REGNO === studentIdentifier) ||
          st.SNO === studentIdentifier;
        if (match) {
          return { ...st, REMARKS: val };
        }
        return st;
      }),
    );
  };

  // Toggle all students Present / Absent
  const handleToggleAll = (markPresent: boolean) => {
    const targetStatus = markPresent ? "P" : "A";
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        ATT: targetStatus,
      })),
    );
    toast.info(`Marked all students as ${markPresent ? "Present" : "Absent"}`);
  };

  // Quick toggle by Serial No. or Roll No.
  const handleQuickAbsentToggle = () => {
    const query = absentNumberInput.trim().toLowerCase();
    if (!query) return;

    const matchedStudent = students.find((st) => {
      const sNo = String(st.SNO || "")
        .trim()
        .toLowerCase();
      const rollNo = (st.ROLLNO || "").trim().toLowerCase();
      const regNo = (st.REGNO || "").trim().toLowerCase();
      return sNo === query || rollNo === query || regNo === query;
    });

    if (matchedStudent) {
      const identifier = matchedStudent.REGNO || (matchedStudent.SNO ?? "");
      handleToggleStudentAttendance(identifier);
      const studentName = matchedStudent.SName || query;
      const nextStatus =
        (matchedStudent.ATT || "").toUpperCase() === "A" ? "Present" : "Absent";
      toast.info(`Marked ${studentName} as ${nextStatus}`);
    } else {
      toast.warning(`No student found matching: "${absentNumberInput}"`);
    }

    setAbsentNumberInput("");
  };

  // Save Attendance Modifications
  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      toast.error(
        "Please select all session fields and load students before saving.",
      );
      return;
    }

    const effectiveLecturer = newLecturer || oldLecturer || userLoginId;
    if (!effectiveLecturer || !period) {
      toast.error("Faculty and Period are required to save attendance.");
      return;
    }

    setSavingAttendance(true);
    try {
      const firstRoll =
        students[0]?.ROLLNO?.trim() || students[0]?.SNO?.toString() || "1";
      const lastRoll =
        students[students.length - 1]?.ROLLNO?.trim() ||
        students[students.length - 1]?.SNO?.toString() ||
        String(students.length);

      const periodSingle = period.includes(",")
        ? period.split(",")[0].trim()
        : period;
      const periodRange = period.includes(",") ? period : `${period},${period}`;
      const subjectCode = students[0]?.SUB_CODE || "";

      const studentItems = students.map((st, idx) => ({
        sNo: typeof st.SNO === "number" ? st.SNO : idx + 1,
        regNo: st.REGNO || null,
        status: (st.ATT || "").toUpperCase() === "A" ? "A" : "P",
        remarks: st.REMARKS || "",
      }));

      const payload = {
        lecturer: effectiveLecturer,
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

      const res = await saveEditAttendanceSubjectWise(payload);
      if (res?.success) {
        toast.success(
          res.message || "Attendance modifications saved successfully!",
        );
      } else {
        toast.warning(res?.message || "Attendance saved with warnings.");
      }
    } catch (err: any) {
      console.error("Error saving attendance modifications:", err);
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save attendance.",
      );
    } finally {
      setSavingAttendance(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    setDate("");
    setShift("");
    setProgramme("");
    setBranch("");
    setBranchesList([]);
    setSYear("");
    setYearsList([]);
    setSemester("");
    setSection("");
    setSectionsList([]);
    setOldLecturer("");
    setNewLecturer("");
    setOldLecturersList([]);
    setNewLecturersList([]);
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
            <CalendarCheck size={24} />
          </div>
          <div>
            <h2>Modify Attendance</h2>
            <p>Modify &amp; Reassign Student Attendance Records</p>
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

      {/* Attendance Modification Details Card */}
      <div className="dbs-batches-card">
        <div className="dbs-batches-card-header">
          <h3>
            <Layers size={18} />
            Attendance Modification Details
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
                <option value="">Select Shift</option>
                <option value="1">Shift-1</option>
                <option value="2">Shift-2</option>
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
                <option value="1">1</option>
                <option value="2">2</option>
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

          {/* 6. Period(s) */}
          <div className="dbs-input-box">
            <label>
              Period(s)
              {loadingPeriods && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" />
                  Loading...
                </span>
              )}
            </label>

            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              disabled={loadingPeriods || periodsList.length === 0}
            >
              <option value="">
                {loadingPeriods
                  ? "Loading periods..."
                  : periodsList.length === 0
                    ? "No periods available"
                    : "Select Period"}
              </option>

              {periodsList.map((p, idx) => {
                const periodVal =
                  typeof p === "string"
                    ? p
                    : p.FRM_TO_PERIODS || (p as any).period || "";
                const parts = periodVal.includes(",")
                  ? periodVal.split(",")
                  : [periodVal, periodVal];
                const from = parts[0]?.trim();
                const to = parts[1]?.trim() || from;

                return (
                  <option key={idx} value={periodVal}>
                    {from === to ? `Period ${from}` : `Period ${from} - ${to}`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 7. Old Lecturer */}
          <div className="dbs-input-box">
            <label>
              Old Lecturer
              {loadingLecturers && (
                <span className="dbs-loading-inline">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              value={oldLecturer}
              onChange={(e) => handleOldLecturerChange(e.target.value)}
              disabled={loadingLecturers || oldLecturersList.length === 0}
            >
              <option value="">
                {loadingLecturers
                  ? "Loading lecturers..."
                  : oldLecturersList.length === 0
                    ? "No old lecturer found"
                    : "Select Old Lecturer"}
              </option>
              {oldLecturersList.map((lec: any, idx) => {
                const val = lec.Lecturer || lec.LECTURER || lec.lecturer || "";
                const label =
                  lec.FNAME || lec.fname || lec.FacultyName || lec.name || val;
                return (
                  <option key={idx} value={val}>
                    {label === val ? `Faculty ID: ${val}` : `${label} (${val})`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 8. New Lecturer (For reassignment) */}
          <div className="dbs-input-box">
            <label>
              New Lecturer (Reassign)
              <span className="dbs-sub-label">Optional substitute</span>
            </label>
            <select
              value={newLecturer}
              onChange={(e) => setNewLecturer(e.target.value)}
              disabled={
                loadingLecturers ||
                (newLecturersList.length === 0 && !oldLecturer)
              }
            >
              <option value="">Keep Same or Reassign</option>
              {oldLecturer &&
                !newLecturersList.some(
                  (l: any) =>
                    (l.Lecturer || l.LECTURER || l.lecturer) === oldLecturer,
                ) && (
                  <option value={oldLecturer}>Keep Same ({oldLecturer})</option>
                )}
              {newLecturersList.map((lec: any, idx) => {
                const val = lec.Lecturer || lec.LECTURER || lec.lecturer || "";
                const label =
                  lec.FNAME || lec.fname || lec.FacultyName || lec.name || val;
                return (
                  <option key={idx} value={val}>
                    {label === val ? `Faculty ID: ${val}` : `${label} (${val})`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 9. Teaching Method */}
          <div className="dbs-input-box">
            <label>Teaching Method</label>
            <select value={tlm} onChange={(e) => setTlm(e.target.value)}>
              <option value="">Select Learning Method</option>
              {tlmData.map((data, index) => (
                <option key={index} value={data.TLM}>
                  {data.TLM}
                </option>
              ))}
            </select>
          </div>

          {/* 10. Practical Session */}
          <div className="dbs-input-box">
            <label>Session Type</label>
            <label
              className="dbs-custom-checkbox-wrapper"
              htmlFor="modifyPracticalCheck"
            >
              <input
                type="checkbox"
                id="modifyPracticalCheck"
                checked={isPractical}
                onChange={(e) => setIsPractical(e.target.checked)}
              />
              <span>Is Practical</span>
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

          {/* 11. Quick Mark Absent */}
          <div className="dbs-input-box">
            <label>
              Quick Toggle Absent
              <span className="dbs-sub-label">Enter Serial or Roll No</span>
            </label>
            <div className="dbs-quick-absent-group">
              <input
                type="text"
                placeholder="Enter Serial No."
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

          {/* 12. Absent Number(s) */}
          <div className="dbs-input-box dbs-full-width">
            <label>
              Absent Number(s)
              <span className="dbs-sub-label">
                Auto-generated from marked absentees
              </span>
            </label>
            <textarea
              rows={2}
              placeholder="Enter absent numbers..."
              value={absentNumbersStr}
              readOnly
              className="dbs-readonly-textarea"
            />
          </div>

          {/* 13. Taught Chapter */}
          <div className="dbs-input-box dbs-full-width">
            <label>Taught Chapter</label>
            <textarea
              rows={2}
              placeholder="Enter taught chapter..."
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
            {savingAttendance ? "Saving..." : "Save"}
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
              {activeSubjectInfo.subCode
                ? `[${activeSubjectInfo.subCode}] `
                : ""}
              {activeSubjectInfo.subjectName}
            </span>
          </div>
          <div className="dbs-subject-meta">
            <span>
              Date: <strong>{date ? toApiDate(date) : "-"}</strong>
            </span>
            <span>
              Day: <strong>{date ? getDayName(date) : "-"}</strong>
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
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st, index) => {
                  const isAbsent = (st.ATT || "").toUpperCase() === "A";
                  const roll =
                    (st.ROLLNO || "").trim() || String(st.SNO ?? index + 1);
                  const identifier = st.REGNO || st.SNO || index;

                  return (
                    <tr
                      key={identifier}
                      className={isAbsent ? "dbs-student-absent" : ""}
                    >
                      <td className="dbs-text-center font-semibold">
                        {st.SNO ?? index + 1}
                      </td>

                      <td>
                        <span className="dbs-regno-badge">
                          {st.REGNO || "-"}
                        </span>
                      </td>
                      <td>
                        <strong>{st.SName || "-"}</strong>
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
                            onChange={() =>
                              handleToggleStudentAttendance(identifier)
                            }
                            title={
                              isAbsent
                                ? "Click to mark Present"
                                : "Click to mark Absent"
                            }
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
                  : "Select all session details (Date, Shift, Programme, Branch, Year, Section, Lecturer, and Period) above to view and modify attendance records."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModifyAttendance;
