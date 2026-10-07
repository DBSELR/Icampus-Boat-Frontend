import React, { useState, useEffect } from "react";
import { Save, RotateCcw, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DeleteModal from "../../../common/DeleteModal";
import {
  getProgramme,
  getBranch,
  getYear,
  getReguList,
} from "../../../apis/Common";
import {
  getTimeTableDepartments,
  getTimeTableSubjects,
  getTimeTableLecturers,
  getTimeTableView,
  saveTimeTable,
  deleteTimeTable,
  DeleteTimeTablePayload,
  TimeTableDepartment,
  TimeTableSubject,
  TimeTableLecturer,
  TimeTableViewRow,
} from "../../../apis/AttendanceApis";
import "./TimeTable.css";

const PERIOD_NUMBERS = ["1", "2", "3", "4", "5", "6"];

const DAYS_LIST = [
  { value: "1", label: "Monday", name: "Monday" },
  { value: "2", label: "Tuesday", name: "Tuesday" },
  { value: "3", label: "Wednesday", name: "Wednesday" },
  { value: "4", label: "Thursday", name: "Thursday" },
  { value: "5", label: "Friday", name: "Friday" },
  { value: "6", label: "Saturday", name: "Saturday" },
  { value: "7", label: "Sunday", name: "Sunday" },
];

const PERIOD_TIMINGS_MAP: Record<string, string> = {
  "1": "09:10-10:00",
  "2": "10:00-10:50",
  "3": "11:00-11:50",
  "4": "11:50-12:40",
  "5": "01:30-02:20",
  "6": "02:20-03:10",
  "7": "03:10-04:00",
  "8": "04:00-04:50",
};

const DAY_NAME_MAP: Record<string, string> = {
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
  "7": "Sunday",
};

interface StagedItem {
  id: string;
  faculty: string;
  facultyName: string;
  subject: string;
  subcode: string;
  subjectName: string;
  day: string;
  dayName: string;
  dayLabel: string;
  periodFrom: string;
  periodTo: string;
  spTime: string;
  periodType: string;
  department: string;
  subtype: string;
  efrmdate: string;
}

const TimeTable: React.FC = () => {
  // Academic Year
  const academicYear = localStorage.getItem("academicYear") || "2025-2026";

  // Form Fields State
  const [shift, setShift] = useState<string>("1");
  const [stream, setStream] = useState<string>("1");
  const [semester, setSemester] = useState<string>("1");

  // Dynamic Options Lists from Common APIs
  const [programmeList, setProgrammeList] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [yearList, setYearList] = useState<any[]>([]);
  const [reguList, setReguList] = useState<any[]>([]);
  const [departmentList, setDepartmentList] = useState<TimeTableDepartment[]>(
    [],
  );

  // Selected Common Values
  const [programme, setProgramme] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [section, setSection] = useState<string>("A");
  const [regu, setRegu] = useState<string>("R23");

  // Date & Day
  const [day, setDay] = useState<string>("1");
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  // Period Type & Period Range
  const [periodType, setPeriodType] = useState<string>("1");
  const [periodFrom, setPeriodFrom] = useState<string>("1");
  const [periodTo, setPeriodTo] = useState<string>("1");

  // Department & Subtype
  const [department, setDepartment] = useState<string>("0");
  const [subtype, setSubtype] = useState<string>("0");

  // Subjects & Lecturers Data from APIs
  const [subjectList, setSubjectList] = useState<TimeTableSubject[]>([]);
  const [lecturerList, setLecturerList] = useState<TimeTableLecturer[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [lecturer, setLecturer] = useState<string>("");

  // Loading States
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  const [loadingLecturers, setLoadingLecturers] = useState<boolean>(false);
  const [loadingTableView, setLoadingTableView] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Staged Faculty-Subject Items (Preview Table on ADD)
  const [stagedList, setStagedList] = useState<StagedItem[]>([]);

  // Timetable Matrix View from Backend API
  const [tableViewRows, setTableViewRows] = useState<TimeTableViewRow[]>([]);

  // 1. Initial Load: Programmes, Regulations, Departments
  useEffect(() => {
    const initData = async () => {
      try {
        const [progData, regData, deptData] = await Promise.allSettled([
          getProgramme(),
          getReguList(),
          getTimeTableDepartments(),
        ]);

        if (progData.status === "fulfilled" && Array.isArray(progData.value)) {
          setProgrammeList(progData.value);
          if (progData.value.length > 0) {
            const firstProg = progData.value[0]?.COURSECODE || "";
            if (firstProg) setProgramme(firstProg);
          }
        }

        if (regData.status === "fulfilled" && Array.isArray(regData.value)) {
          setReguList(regData.value);
          if (regData.value.length > 0) {
            const firstItem = regData.value[0];
            const firstReg =
              typeof firstItem === "string"
                ? firstItem
                : firstItem?.regulation ||
                  firstItem?.REGULATION ||
                  firstItem?.Regu ||
                  firstItem?.REGU ||
                  firstItem?.Regulation ||
                  "R23";
            setRegu(String(firstReg));
          }
        }

        if (deptData.status === "fulfilled" && Array.isArray(deptData.value)) {
          setDepartmentList(deptData.value);
        }
      } catch (err) {
        console.error("Initial load error:", err);
      }
    };

    initData();
  }, []);

  // 2. When Programme Changes -> Fetch Branch & Year
  useEffect(() => {
    if (!programme) return;

    const fetchBranchAndYear = async () => {
      try {
        const [bData, yData] = await Promise.allSettled([
          getBranch(programme),
          getYear(programme),
        ]);

        if (bData.status === "fulfilled" && Array.isArray(bData.value)) {
          setBranchList(bData.value);
          if (bData.value.length > 0) {
            setBranch(bData.value[0]?.BRANCHCODE || "");
          }
        }

        if (yData.status === "fulfilled" && Array.isArray(yData.value)) {
          setYearList(yData.value);
          if (yData.value.length > 0) {
            setYear(String(yData.value[0]?.ID || yData.value[0]?.YEAR || "1"));
          }
        }
      } catch (err) {
        console.error("Branch/Year load error:", err);
      }
    };

    fetchBranchAndYear();
  }, [programme]);

  // 3. Fetch Subjects when dependencies change
  useEffect(() => {
    if (!programme || !branch || !year || !semester) return;

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const typeParam = periodType === "2" ? "Practical" : "Theory";
        const subTypeParam = subtype && subtype !== "0" ? subtype : "";

        const payload = {
          acdYr: academicYear,
          programme: programme,
          branch: branch,
          year: year,
          semister: semester,
          stream: stream || "1",
          periodType: typeParam,
          lecturer: "",
          regu: regu || "R23",
          subtype: subTypeParam,
        };

        const list = await getTimeTableSubjects(payload);
        const validSubjects = list.filter(
          (s) => s.SUBJECTCODE && s.SUBJECTCODE !== "0",
        );
        setSubjectList(validSubjects);

        if (validSubjects.length > 0) {
          setSubject(validSubjects[0].SUBJECTCODE);
        } else {
          setSubject("");
        }
      } catch (err) {
        console.error("Subjects fetch error:", err);
        setSubjectList([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [
    academicYear,
    programme,
    branch,
    year,
    semester,
    stream,
    periodType,
    regu,
    subtype,
  ]);

  // 4. Fetch Lecturers when Subject or Department changes
  useEffect(() => {
    if (!programme || !year || !semester || !subject) {
      setLecturerList([]);
      setLecturer("");
      return;
    }

    const fetchLecturers = async () => {
      setLoadingLecturers(true);
      try {
        const payload = {
          programme: programme,
          year: year,
          semister: semester,
          subcode: subject,
          department: department || "0",
        };

        const list = await getTimeTableLecturers(payload);
        setLecturerList(list);

        if (list.length > 0) {
          setLecturer(list[0].EmpID || list[0].Fname);
        } else {
          setLecturer("");
        }
      } catch (err) {
        console.error("Lecturers fetch error:", err);
        setLecturerList([]);
      } finally {
        setLoadingLecturers(false);
      }
    };

    fetchLecturers();
  }, [programme, year, semester, subject, department]);

  // 5. Fetch Timetable Schedule Matrix View
  const fetchTimeTableView = async () => {
    if (!programme || !branch || !year || !semester || !section) return;

    setLoadingTableView(true);
    try {
      const payload = {
        shiftNo: shift || "1",
        programme: programme,
        branch: branch,
        year: year,
        semister: semester,
        section: section || "A",
        stream: stream || "1",
        acdYr: academicYear,
      };

      const data = await getTimeTableView(payload);
      setTableViewRows(data);
    } catch (err) {
      console.error("TimeTable view error:", err);
    } finally {
      setLoadingTableView(false);
    }
  };

  useEffect(() => {
    fetchTimeTableView();
  }, [shift, programme, branch, year, semester, section, stream, academicYear]);

  // Sync Day dropdown when Date is chosen
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    try {
      const dObj = new Date(newDate);
      if (!isNaN(dObj.getTime())) {
        const jsDay = dObj.getDay(); // 0 is Sun, 1 is Mon, 6 is Sat
        const dayMap: Record<number, string> = {
          1: "1", // Mon
          2: "2", // Tue
          3: "3", // Wed
          4: "4", // Thu
          5: "5", // Fri
          6: "6", // Sat
          0: "7", // Sun
        };
        const mappedDay = dayMap[jsDay];
        if (mappedDay) {
          setDay(mappedDay);
        }
      }
    } catch {
      // Keep existing day
    }
  };

  // Add Subject & Lecturer to Staged Preview List
  const handleAdd = () => {
    if (!subject) {
      toast.error("Please select a Subject");
      return;
    }
    if (!lecturer) {
      toast.error("Please select a Lecturer");
      return;
    }

    const selectedSubjObj = subjectList.find((s) => s.SUBJECTCODE === subject);
    const subjectFullName = selectedSubjObj
      ? selectedSubjObj.SUBJECTNAME
      : subject;
    const subjectTitle = subjectFullName.includes("--")
      ? subjectFullName.split("--")[1].trim()
      : subjectFullName;

    const selectedLectObj = lecturerList.find(
      (l) => l.EmpID === lecturer || l.Fname === lecturer,
    );
    const facultyEmpId = selectedLectObj ? selectedLectObj.EmpID : lecturer;
    const lecturerDisplayName = selectedLectObj
      ? selectedLectObj.Fname
      : lecturer;

    const dayName = DAY_NAME_MAP[day] || "Monday";
    const spTimeStr = PERIOD_TIMINGS_MAP[periodFrom] || "09:10-10:00";
    const periodTypeStr = periodType === "2" ? "Practical" : "Theory";
    const subTypeStr = subtype && subtype !== "0" ? subtype : "";

    const newItem: StagedItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      faculty: facultyEmpId,
      facultyName: lecturerDisplayName,
      subject: subjectTitle,
      subcode: subject,
      subjectName: subjectFullName,
      day: day,
      dayName: dayName,
      dayLabel: dayName,
      periodFrom: periodFrom,
      periodTo: periodTo || periodFrom,
      spTime: spTimeStr,
      periodType: periodTypeStr,
      department: department || "0",
      subtype: subTypeStr,
      efrmdate: date,
    };

    setStagedList((prev) => [...prev, newItem]);
    toast.info("Added to list. Click Save to commit timetable schedule.");
  };

  // Remove Staged Item
  const handleRemoveStaged = (id: string) => {
    setStagedList((prev) => prev.filter((item) => item.id !== id));
    toast.info("Removed faculty-subject from list");
  };

  // Save Timetable (POST /api/TimeTable/save)
  const handleSave = async () => {
    if (stagedList.length === 0 && !subject) {
      toast.error(
        "Please click ADD to add faculty and subject first, then click Save.",
      );
      return;
    }

    setSaving(true);
    try {
      if (stagedList.length > 0) {
        // Save each staged item
        const savePromises = stagedList.map((item) => {
          const payload = {
            id: "",
            shiftNo: shift || "1",
            day: item.dayName,
            programme: programme,
            branch: branch,
            year: year,
            semister: semester,
            stream: stream || "1",
            section: section || "A",
            period: item.periodFrom,
            subject: item.subject,
            department: item.department || "0",
            lecturer: item.faculty,
            spTime: item.spTime,
            periodType: item.periodType,
            toperiod: item.periodTo,
            frrom_To_Periods: `${item.periodFrom},${item.periodTo}`,
            subcode: item.subcode,
            epTime: "",
            academicYear: academicYear,
            lecStatus: "",
            efrmdate: item.efrmdate || date,
            subtype: item.subtype || "",
          };
          return saveTimeTable(payload);
        });

        const results = await Promise.all(savePromises);
        const allOk = results.every(
          (r: any) => r?.success === true || r?.affectedRows > 0 || r?.message,
        );

        if (allOk) {
          toast.success("TimeTable saved successfully.");
          setStagedList([]);
          fetchTimeTableView();
        } else {
          toast.error("Failed to save some timetable records.");
        }
      } else {
        // Direct save for currently filled fields
        const selectedSubjObj = subjectList.find(
          (s) => s.SUBJECTCODE === subject,
        );
        const subjectFullName = selectedSubjObj
          ? selectedSubjObj.SUBJECTNAME
          : subject;
        const subjectTitle = subjectFullName.includes("--")
          ? subjectFullName.split("--")[1].trim()
          : subjectFullName;

        const selectedLectObj = lecturerList.find(
          (l) => l.EmpID === lecturer || l.Fname === lecturer,
        );
        const facultyEmpId = selectedLectObj ? selectedLectObj.EmpID : lecturer;

        const payload = {
          id: "",
          shiftNo: shift || "1",
          day: DAY_NAME_MAP[day] || "Monday",
          programme: programme,
          branch: branch,
          year: year,
          semister: semester,
          stream: stream || "1",
          section: section || "A",
          period: periodFrom || "1",
          subject: subjectTitle,
          department: department || "0",
          lecturer: facultyEmpId,
          spTime: PERIOD_TIMINGS_MAP[periodFrom] || "09:10-10:00",
          periodType: periodType === "2" ? "Practical" : "Theory",
          toperiod: periodTo || periodFrom || "1",
          frrom_To_Periods: `${periodFrom || "1"},${periodTo || periodFrom || "1"}`,
          subcode: subject,
          epTime: "",
          academicYear: academicYear,
          lecStatus: "",
          efrmdate: date,
          subtype: subtype && subtype !== "0" ? subtype : "",
        };

        const res = await saveTimeTable(payload);
        if (res?.success === true || res?.affectedRows > 0 || res?.message) {
          toast.success(res?.message || "TimeTable saved successfully.");
          fetchTimeTableView();
        } else {
          toast.error("Failed to save TimeTable.");
        }
      }
    } catch (err: any) {
      console.error("Save TimeTable Error:", err);
      toast.error(err?.response?.data?.message || "Error saving TimeTable.");
    } finally {
      setSaving(false);
    }
  };

  // Reset / Cancel Form
  const handleReset = () => {
    setShift("1");
    setStream("1");
    setSemester("1");
    setSection("A");
    setDay("1");
    setPeriodType("1");
    setPeriodFrom("1");
    setPeriodTo("1");
    setDepartment("0");
    setSubtype("0");
    setStagedList([]);
    toast.info("Form reset");
  };

  // Open Delete Confirmation Modal
  const handleDeleteClick = () => {
    if (!programme) {
      toast.error("Please select a Programme.");
      return;
    }
    if (!branch) {
      toast.error("Please select a Branch.");
      return;
    }
    if (!year) {
      toast.error("Please select a Year.");
      return;
    }
    if (!subject) {
      toast.error("Please select a Subject to delete.");
      return;
    }
    setShowDeleteModal(true);
  };

  // Confirm and Execute Delete (POST /api/TimeTable/delete)
  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const payload: DeleteTimeTablePayload = {
        shiftNo: shift || "1",
        day: DAY_NAME_MAP[day] || "Monday",
        branch: branch,
        year: year,
        semister: semester,
        section: section || "A",
        stream: stream || "1",
        frrom_To_Periods: `${periodFrom || "1"},${periodTo || periodFrom || "1"}`,
        subcode: subject,
        proc_type: "TT", // static for every delete
        wdate: date,
      };

      const res = await deleteTimeTable(payload);
      if (res?.success === true || res?.affectedRows > 0 || res?.message) {
        toast.success(res?.message || "TimeTable entry deleted successfully.");
        setShowDeleteModal(false);
        fetchTimeTableView();
      } else {
        toast.error(res?.message || "Failed to delete TimeTable entry.");
      }
    } catch (err: any) {
      console.error("Delete TimeTable Error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error deleting TimeTable entry.",
      );
    } finally {
      setDeleting(false);
    }
  };

  // Helper to parse cell content from API format: "Subject * \rFaculty * 1,1"
  const parseCellContent = (cellValue: string | null | undefined) => {
    if (!cellValue) return null;
    const parts = cellValue.split("*").map((s) => s.trim());
    const subjectName = parts[0] || cellValue;
    const facultyName = parts[1]
      ? parts[1]
          .replace(/^[\r\n]+/, "")
          .replace(/^_/, "")
          .trim()
      : "";
    const periodRange = parts[2] ? parts[2].trim() : "";
    return { subjectName, facultyName, periodRange };
  };

  return (
    <div className="dbs-timetable-container">
      {/* 1. Page Header */}
      <div className="dbs-timetable-header">
        <div>
          <h2>Time Table</h2>
          <p className="dbs-timetable-subtitle">
            Create & Manage Class Timetable Schedule
          </p>
        </div>
      </div>

      {/* 2. Form Card */}
      <div className="dbs-timetable-form-card">
        <h3>Time Table Details</h3>

        <div className="dbs-timetable-grid">
          {/* Row 1 Left: Shift (static value 1) */}
          <div className="dbs-timetable-input">
            <label>Shift</label>
            <select value={shift} onChange={(e) => setShift(e.target.value)}>
              <option value="1">1</option>
            </select>
          </div>

          {/* Row 1 Right: Programme (dynamic Common API) */}
          <div className="dbs-timetable-input">
            <label>Programme</label>
            <select
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
            >
              <option value="">Select Programme</option>
              {programmeList.map((p, idx) => (
                <option
                  key={p?.CID || p?.COURSECODE || idx}
                  value={p?.COURSECODE || String(p)}
                >
                  {p?.COURSE || p?.PROGRAMME || p?.COURSECODE || String(p)}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2 Left: Branch (dynamic Common API) */}
          <div className="dbs-timetable-input">
            <label>Branch</label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="">Select Branch</option>
              {branchList.map((b, idx) => (
                <option
                  key={b?.BID || b?.BRANCHCODE || idx}
                  value={b?.BRANCHCODE || String(b)}
                >
                  {b?.BRANCH || b?.BRANCHNAME || b?.BRANCHCODE || String(b)}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2 Right: Year & Sem */}
          <div className="dbs-timetable-input">
            <label>Year & Sem</label>
            <div className="dbs-timetable-dual-input">
              {/* Year (dynamic Common API) */}
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Select Year</option>
                {yearList.map((y, idx) => (
                  <option
                    key={y?.ID || y?.YEAR || idx}
                    value={String(y?.ID || y?.YEAR)}
                  >
                    {y?.DATA || y?.YEAR || String(y?.ID)}
                  </option>
                ))}
              </select>

              {/* Sem (static values 1 and 2 only) */}
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
          </div>

          {/* Row 3 Left: Stream & Section */}
          <div className="dbs-timetable-input">
            <label>Stream & Section</label>
            <div className="dbs-timetable-dual-input">
              {/* Stream (static value 1) */}
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
              >
                <option value="1">1</option>
              </select>

              {/* Section (dynamic / options A, B, C, D, E, F) */}
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>

          {/* Row 3 Right: Day & Date */}
          <div className="dbs-timetable-input">
            <label>Day & Date</label>
            <div className="dbs-timetable-dual-input">
              {/* Day (values from 1 to 7) */}
              <select value={day} onChange={(e) => setDay(e.target.value)}>
                {DAYS_LIST.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.value} - {d.label}
                  </option>
                ))}
              </select>

              {/* Date (Calendar input) */}
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>
          </div>

          {/* Row 4 Left: Period Type & Regu */}
          <div className="dbs-timetable-input">
            <label>Period Type & Regu</label>
            <div className="dbs-timetable-dual-input">
              {/* Period Type (static data: THEORY (1), PRACTICAL (2)) */}
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
              >
                <option value="1">THEORY</option>
                <option value="2">PRACTICAL</option>
              </select>

              {/* Regu (dynamic from Common API) */}
              <select value={regu} onChange={(e) => setRegu(e.target.value)}>
                <option value="">Select Regulation</option>
                {reguList.map((r, idx) => {
                  const regValue =
                    typeof r === "string"
                      ? r
                      : r?.regulation ||
                        r?.REGULATION ||
                        r?.Regu ||
                        r?.REGU ||
                        r?.Regulation ||
                        r?.name ||
                        `R${idx + 1}`;
                  return (
                    <option
                      key={r?.rid || r?.id || idx}
                      value={String(regValue)}
                    >
                      {String(regValue)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Row 4 Right: Period From & To (values 1 to 6) */}
          <div className="dbs-timetable-input">
            <label>Period From & To</label>
            <div className="dbs-timetable-dual-input">
              <select
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
              >
                {PERIOD_NUMBERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
              >
                {PERIOD_NUMBERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5 Left: Department & Subtype */}
          <div className="dbs-timetable-input">
            <label>Department & Subtype</label>
            <div className="dbs-timetable-dual-input">
              {/* Department (GET /api/TimeTable/departments) */}
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="0">Select Department</option>
                {departmentList.map((d) => (
                  <option key={d.DepartmentCode} value={d.DepartmentCode}>
                    {d.Department}
                  </option>
                ))}
              </select>

              {/* Subtype (static values: 0 (default), Minor (1), Honor (2)) */}
              <select
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
              >
                <option value="0">Select Subtype</option>
                <option value="1">Minor</option>
                <option value="2">Honor</option>
              </select>
            </div>
          </div>

          {/* Row 5 Right: Period(s) Timings */}
          <div className="dbs-timetable-input">
            <label>Period(s) Timings</label>
            <input
              type="text"
              className="disabled"
              value={`Period ${periodFrom} to ${periodTo}`}
              readOnly
              disabled
            />
          </div>

          {/* Row 6 Left: Subject (POST /api/TimeTable/subjects) */}
          <div className="dbs-timetable-input">
            <label>
              Subject I{" "}
              {loadingSubjects && (
                <Loader2 size={13} className="animate-spin inline ml-1" />
              )}
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">Select Subject</option>
              {subjectList.map((s, idx) => (
                <option key={s.SUBJECTCODE || idx} value={s.SUBJECTCODE}>
                  {s.SUBJECTNAME}
                </option>
              ))}
            </select>
          </div>

          {/* Row 6 Right: Lecturer (POST /api/TimeTable/lecturers) + ADD Button */}
          <div className="dbs-timetable-input">
            <label>
              Lecturer{" "}
              {loadingLecturers && (
                <Loader2 size={13} className="animate-spin inline ml-1" />
              )}
            </label>
            <div className="dbs-timetable-lecturer-row">
              <select
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
              >
                <option value="">Select Lecturer</option>
                {lecturerList.map((l, idx) => (
                  <option key={l.EmpID || idx} value={l.EmpID || l.Fname}>
                    {l.Fname}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="dbs-timetable-add-btn"
                onClick={handleAdd}
              >
                <Plus size={16} />
                <span>ADD</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2b. Staged Faculty & Subject Preview Table (Added on ADD, matching uploaded screenshot) */}
        {stagedList.length > 0 && (
          <div className="dbs-timetable-staged-container">
            <table className="dbs-timetable-staged-table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Subject</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {stagedList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.facultyName}</td>
                    <td>{item.subjectName}</td>
                    <td>
                      <button
                        type="button"
                        className="dbs-timetable-staged-delete-btn"
                        onClick={() => handleRemoveStaged(item.id)}
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Buttons: Save, Cancel, Delete */}
        <div className="dbs-timetable-actions">
          <button
            type="button"
            className="dbs-timetable-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>

          <button
            type="button"
            className="dbs-timetable-reset-btn"
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            className="dbs-timetable-delete-btn"
            onClick={handleDeleteClick}
            disabled={saving || deleting}
          >
            {deleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            <span>{deleting ? "Deleting..." : "Delete"}</span>
          </button>
        </div>
      </div>

      {/* 3. Timetable Matrix Table Section (POST /api/TimeTable/view) */}
      <div className="dbs-timetable-table-header">
        <div>
          <h2>Time Table Schedule List</h2>
          <p>
            Configured weekly class periods and staff allocation
            {loadingTableView && (
              <span className="ml-2 text-sky-600 font-semibold">
                (Loading schedule...)
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="dbs-timetable-table-container">
        <div className="dbs-timetable-table-card">
          <div className="dbs-timetable-table-scroll">
            <table className="dbs-timetable-data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  {PERIOD_NUMBERS.map((period) => (
                    <th key={period}>Period {period}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableViewRows.length > 0
                  ? tableViewRows.map((row, rIdx) => (
                      <tr key={row.ODAY || rIdx}>
                        <td className="dbs-timetable-day-cell">
                          {row.DAY || `Day ${row.ODAY || rIdx + 1}`}
                        </td>
                        {PERIOD_NUMBERS.map((pNum) => {
                          const cellVal = row[pNum];
                          const parsed = parseCellContent(cellVal);
                          return (
                            <td key={pNum}>
                              {parsed ? (
                                <div
                                  className="dbs-tt-cell-badge"
                                  title={`${parsed.subjectName} - ${parsed.facultyName}`}
                                >
                                  <span className="dbs-tt-cell-subject">
                                    {parsed.subjectName}
                                  </span>
                                  {parsed.facultyName && (
                                    <span className="dbs-tt-cell-lecturer">
                                      {parsed.facultyName}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="dbs-tt-cell-empty">
                                  &mdash;
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  : DAYS_LIST.slice(0, 6).map((d) => (
                      <tr key={d.value}>
                        <td className="dbs-timetable-day-cell">{d.label}</td>
                        {PERIOD_NUMBERS.map((pNum) => (
                          <td key={pNum}>
                            <span className="dbs-tt-cell-empty">&mdash;</span>
                          </td>
                        ))}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={showDeleteModal}
        title="Delete TimeTable Entry"
        itemName={`${DAY_NAME_MAP[day] || "Monday"} Period ${periodFrom}${
          periodTo && periodTo !== periodFrom ? ` to ${periodTo}` : ""
        } - ${
          subjectList.find((s) => s.SUBJECTCODE === subject)?.SUBJECTNAME ||
          subject ||
          "Selected TimeTable Entry"
        }`}
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default TimeTable;
