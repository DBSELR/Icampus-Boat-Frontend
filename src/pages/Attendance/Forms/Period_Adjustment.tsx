import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Save,
  RotateCcw,
  Loader2,
  Calendar,
  Search,
  Trash2,
  X,
  Clock,
  Users,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { getProgramme } from "../../../apis/Common";
import {
  getPeriodAdjustmentDepartments,
  getPeriodAdjustmentFaculty,
  getAbsentFacultyTimetable,
  getAvailableFaculty,
  getAvailableFacultySubjects,
  savePeriodAdjustment,
  deletePeriodAdjustment,
  AbsentFacultyTimetableRow,
  AvailableFacultyItem,
  AvailableFacultySubjectItem,
  SaveAdjustmentPayload,
  DeleteAdjustmentPayload,
} from "../../../apis/AttendanceApis";
import DeleteModal from "../../../common/DeleteModal";
import "./Period_Adjustment.css";

interface DropdownOption {
  label: string;
  value: string;
}

const STATIC_FACULTY_TYPE_OPTIONS: DropdownOption[] = [
  { label: "Select Faculty", value: "0" },
  { label: "Free Fac. within class", value: "1" },
  { label: "All Fac. within class", value: "2" },
  { label: "Free Fac. with same Subject", value: "3" },
  { label: "All Fac. with same Subject", value: "4" },
  { label: "Self Faculty", value: "5" },
];

const PeriodAdjustment: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2025-2026";

  // Form Field States
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [selectedProgramme, setSelectedProgramme] = useState<string>("");
  const [selectedSem, setSelectedSem] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Loading States
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);
  const [loadingFaculties, setLoadingFaculties] = useState<boolean>(false);
  const [loadingProgrammes, setLoadingProgrammes] = useState<boolean>(false);
  const [loadingGrid, setLoadingGrid] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Dynamic Options Lists
  const [departmentOptions, setDepartmentOptions] = useState<DropdownOption[]>(
    [],
  );
  const [facultyOptions, setFacultyOptions] = useState<DropdownOption[]>([]);
  const [programmeList, setProgrammeList] = useState<any[]>([]);

  // Grid Data (absent-faculty-timetable)
  const [gridData, setGridData] = useState<AbsentFacultyTimetableRow[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"auto" | "table" | "cards">("auto");

  // Modal States ("Change Faculty" Pop up)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRowForModal, setSelectedRowForModal] =
    useState<AbsentFacultyTimetableRow | null>(null);
  const [modalFromPeriod, setModalFromPeriod] = useState<string>("1");
  const [modalToPeriod, setModalToPeriod] = useState<string>("1");
  const [modalFacType, setModalFacType] = useState<string>("0");
  const [modalAvailableFacultyList, setModalAvailableFacultyList] = useState<
    AvailableFacultyItem[]
  >([]);
  const [modalSelectedFaculty, setModalSelectedFaculty] = useState<string>("");
  const [modalMergeWith, setModalMergeWith] = useState<string>("");
  const [modalSubjectsList, setModalSubjectsList] = useState<
    AvailableFacultySubjectItem[]
  >([]);
  const [modalSelectedSubjectCode, setModalSelectedSubjectCode] =
    useState<string>("");
  const [modalReason, setModalReason] = useState<string>("");
  const [modalPeriodOptions, setModalPeriodOptions] = useState<string[]>([]);

  // Modal Loading States
  const [modalLoadingFaculty, setModalLoadingFaculty] =
    useState<boolean>(false);
  const [modalLoadingSubjects, setModalLoadingSubjects] =
    useState<boolean>(false);
  const [modalSaving, setModalSaving] = useState<boolean>(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    row: AbsentFacultyTimetableRow;
    index: number;
  } | null>(null);
  const [deletingAdjustment, setDeletingAdjustment] = useState<boolean>(false);

  // Track dynamically adjusted / deleted periods so they sync immediately on reload
  const [adjustmentsMap, setAdjustmentsMap] = useState<
    Record<
      string,
      {
        presentSubject: string;
        presentLecturer: string;
        wdate: string;
        status: "active" | "deleted";
      }
    >
  >({});
  const adjustmentsMapRef = useRef(adjustmentsMap);
  adjustmentsMapRef.current = adjustmentsMap;

  // Helper: Derive lowercase day name from date string (e.g. "wednesday")
  const getDayNameFromDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    }
    return "";
  };

  // Helper: Format YYYY-MM-DD to DD-MM-YYYY
  const formatToDDMMYYYY = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    }
    return dateStr;
  };

  const currentDayName = getDayNameFromDate(selectedDate);

  // Helper: Unique identifier for each timetable schedule row
  const getRowKey = (row: AbsentFacultyTimetableRow): string => {
    const datePart = formatToDDMMYYYY(
      String(row.WDate || row.wdate || selectedDate),
    );
    const shift = String(row.SHIFT ?? "1");
    const day = String(row.DAY ?? currentDayName ?? "").toLowerCase();
    const branch = String(
      row.Branch ?? row.BRANCH ?? row.branch ?? row.DEPT ?? "",
    );
    const year = String(row.YEAR ?? row.year ?? "");
    const sem = String(row.SEMISTER ?? row.semister ?? "");
    const sec = String(row.SECTION ?? row.section ?? "").toUpperCase();
    const stream = String(row.STREAM ?? row.stream ?? "1");
    const period = String(row.PERIOD ?? row.period ?? "");
    return `${datePart}_${shift}_${day}_${branch}_${year}_${sem}_${sec}_${stream}_${period}`;
  };

  // Helper: Parse "From To Periods" range (e.g. "2,2" -> { options: ["2"], from: "2", to: "2" }, "4,5" -> { options: ["4", "5"], from: "4", to: "5" })
  const parsePeriodRange = (
    frmToPeriods?: string | null,
    fallbackPeriod?: string | number | null,
  ): { options: string[]; from: string; to: string } => {
    if (frmToPeriods && typeof frmToPeriods === "string") {
      const parts = frmToPeriods
        .split(/[,-]/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (parts.length >= 2) {
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);

        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.min(start, end);
          const max = Math.max(start, end);
          const range: string[] = [];
          for (let i = min; i <= max; i++) {
            range.push(String(i));
          }
          return {
            options: range.length > 0 ? range : [parts[0], parts[1]],
            from: String(parts[0]),
            to: String(parts[1]),
          };
        } else {
          const unique = Array.from(new Set([parts[0], parts[1]]));
          return {
            options: unique,
            from: parts[0],
            to: parts[1],
          };
        }
      } else if (parts.length === 1) {
        return {
          options: [parts[0]],
          from: parts[0],
          to: parts[0],
        };
      }
    }

    const p = fallbackPeriod ? String(fallbackPeriod).trim() : "1";
    return {
      options: [p],
      from: p,
      to: p,
    };
  };

  // 1. Initial Load: GET /api/Period_Adjustment/departments (Empid='' and Access='ALL') & Programmes
  useEffect(() => {
    const initData = async () => {
      setLoadingDepartments(true);
      setLoadingProgrammes(true);
      try {
        const [deptData, progData] = await Promise.allSettled([
          getPeriodAdjustmentDepartments("", "ALL"),
          getProgramme(),
        ]);

        if (deptData.status === "fulfilled" && Array.isArray(deptData.value)) {
          const mapped: DropdownOption[] = deptData.value.map((dept: any) => {
            const code = String(
              dept.DEPARTMENTCODE ??
                dept.DepartmentCode ??
                dept.deptId ??
                dept.departmentCode ??
                dept.DeptCode ??
                dept.id ??
                dept.code ??
                "",
            );
            const name =
              dept.DEPARTMENT ??
              dept.Department ??
              dept.departmentName ??
              dept.deptName ??
              dept.DeptName ??
              dept.description ??
              code;
            const label = name.startsWith(code)
              ? name
              : code && name && code !== name
                ? `${code}-${name}`
                : name || code;
            return {
              value: code || name,
              label: label,
            };
          });

          setDepartmentOptions(mapped);
        }

        if (progData.status === "fulfilled" && Array.isArray(progData.value)) {
          setProgrammeList(progData.value);
        }
      } catch (err) {
        console.error("Error loading initial data for Period Adjustment:", err);
      } finally {
        setLoadingDepartments(false);
        setLoadingProgrammes(false);
      }
    };

    initData();
  }, []);

  // 2. Department Change: POST /api/Period_Adjustment/faculty
  useEffect(() => {
    if (!selectedDepartment) {
      setFacultyOptions([]);
      setSelectedFaculty("");
      return;
    }

    const fetchFaculty = async () => {
      setLoadingFaculties(true);
      try {
        const deptParam =
          selectedDepartment === "all" ? "" : selectedDepartment;
        const response = await getPeriodAdjustmentFaculty({
          empId: "",
          dept: deptParam,
          workMode: "Teaching",
          access: "All",
        });

        if (Array.isArray(response) && response.length > 0) {
          const mapped: DropdownOption[] = response.map((emp: any) => {
            const empId = String(
              emp.EMPID ??
                emp.EmpID ??
                emp.empId ??
                emp.eMPID ??
                emp.lecturer ??
                emp.id ??
                "",
            );
            const fname =
              emp.Fname ??
              emp.fname ??
              emp.FName1 ??
              emp.name ??
              emp.facultyName ??
              emp.lecturerName ??
              empId;
            const designation = emp.Designation ?? emp.designation ?? "";

            let displayLabel = fname;
            if (
              empId &&
              !displayLabel.toLowerCase().includes(empId.toLowerCase())
            ) {
              displayLabel = `${empId}- ${displayLabel}`;
            }
            if (designation && !displayLabel.includes(designation)) {
              displayLabel = `${displayLabel} (${designation})`;
            }

            return {
              label: displayLabel,
              value: empId || fname,
            };
          });

          setFacultyOptions(mapped);

          const hasPrev = mapped.find((fac) => fac.value === selectedFaculty);
          if (!hasPrev) {
            setSelectedFaculty("");
          }
        } else {
          setFacultyOptions([]);
          setSelectedFaculty("");
        }
      } catch (err) {
        console.error("Error fetching faculty for Period Adjustment:", err);
        setFacultyOptions([]);
        setSelectedFaculty("");
      } finally {
        setLoadingFaculties(false);
      }
    };

    fetchFaculty();
  }, [selectedDepartment]);

  // 3. Load Grid: POST /api/Period_Adjustment/absent-faculty-timetable
  const handleLoadGrid = useCallback(
    async (showNotification: boolean = true) => {
      if (!selectedDepartment) {
        if (showNotification) toast.error("Please select a Department.");
        return;
      }
      if (!selectedFaculty) {
        if (showNotification) toast.error("Please select a Faculty.");
        return;
      }
      if (!selectedProgramme) {
        if (showNotification) toast.error("Please select a Programme.");
        return;
      }
      if (!selectedSem) {
        if (showNotification) toast.error("Please select a Semester.");
        return;
      }
      if (!selectedDate) {
        if (showNotification) toast.error("Please select a Date.");
        return;
      }

      const day = getDayNameFromDate(selectedDate);
      setLoadingGrid(true);

      try {
        const formattedDate = formatToDDMMYYYY(selectedDate);
        const payload = {
          lecturer: selectedFaculty,
          day: day,
          wdate: formattedDate || "",
          programme: selectedProgramme,
          semister: selectedSem,
          acdYr: academicYear,
        };

        const result = await getAbsentFacultyTimetable(payload);

        // Merge any tracked adjustments so Present_Subject and Present_Lecturer stay in sync
        const currentMap = adjustmentsMapRef.current;
        const mergedResult = result.map((r) => {
          const key = getRowKey(r);
          const adj = currentMap[key];
          if (adj) {
            if (adj.status === "active") {
              return {
                ...r,
                P_Subject:
                  r.P_Subject || r.Present_Subject || adj.presentSubject,
                Present_Subject:
                  r.Present_Subject || r.P_Subject || adj.presentSubject,
                Present_Lecturer:
                  r.Present_Lecturer || r.PL || adj.presentLecturer,
                PL: r.PL || r.Present_Lecturer || adj.presentLecturer,
                WDate: r.WDate || adj.wdate,
              };
            } else if (adj.status === "deleted") {
              return {
                ...r,
                P_Subject: null,
                Present_Subject: null,
                Present_Lecturer: null,
                PL: null,
                WDate: null,
              };
            }
          }
          return r;
        });

        setGridData(mergedResult);
        setHasSearched(true);

        if (showNotification) {
          if (result.length > 0) {
            toast.success(`Loaded ${result.length} timetable record(s).`);
          } else {
            toast.info(
              `No scheduled classes found for the selected faculty on ${day.toUpperCase()}.`,
            );
          }
        }
      } catch (err: any) {
        console.error("Error loading absent faculty timetable:", err);
        if (showNotification) {
          toast.error(
            err?.response?.data?.message ||
              "Failed to load absent faculty timetable.",
          );
        }
        setGridData([]);
      } finally {
        setLoadingGrid(false);
      }
    },
    [
      selectedDepartment,
      selectedFaculty,
      selectedProgramme,
      selectedSem,
      selectedDate,
      academicYear,
    ],
  );

  // Auto-fetch grid when required fields are available
  useEffect(() => {
    if (
      selectedDepartment &&
      selectedFaculty &&
      selectedProgramme &&
      selectedSem &&
      selectedDate
    ) {
      handleLoadGrid(false);
    }
  }, [
    selectedDepartment,
    selectedFaculty,
    selectedProgramme,
    selectedSem,
    selectedDate,
    handleLoadGrid,
  ]);

  // Trigger Delete Confirmation Modal
  const handleCancelAdjustClick = (
    row: AbsentFacultyTimetableRow,
    index: number,
  ) => {
    const key = getRowKey(row);
    const hasAdjustment = Boolean(
      row.Present_Subject ||
      row.P_Subject ||
      row.Present_Lecturer ||
      row.PL ||
      row.WDate ||
      row.wdate ||
      (adjustmentsMapRef.current[key] &&
        adjustmentsMapRef.current[key].status === "active"),
    );

    if (!hasAdjustment) {
      toast.info("This period has not been adjusted yet.");
      return;
    }

    setDeleteTarget({ row, index });
  };

  // Confirm Delete: POST /api/Period_Adjustment/delete-adjustment
  const handleConfirmDeleteAdjustment = async () => {
    if (!deleteTarget) return;
    const { row, index } = deleteTarget;

    const rawFromTo =
      row.FRM_TO_PERIODS ??
      row.frrom_To_Periods ??
      row.From_To_Periods ??
      row.frm_to_periods;

    let periodFromTo = "";
    if (rawFromTo && typeof rawFromTo === "string" && rawFromTo.includes(",")) {
      periodFromTo = rawFromTo.trim();
    } else if (
      rawFromTo &&
      typeof rawFromTo === "string" &&
      rawFromTo.includes("-")
    ) {
      periodFromTo = rawFromTo.replace("-", ",").trim();
    } else {
      const p = String(row.PERIOD ?? "1").trim();
      periodFromTo = `${p},${p}`;
    }

    const rowWdate = row.WDate ?? row.wdate ?? row.WDATE;
    const formattedWdate = rowWdate
      ? formatToDDMMYYYY(String(rowWdate))
      : formatToDDMMYYYY(selectedDate);

    const rawDay = (row.DAY || currentDayName || "").trim();
    const formattedDay = rawDay
      ? rawDay.charAt(0).toUpperCase() + rawDay.slice(1).toLowerCase()
      : "";

    const payload: DeleteAdjustmentPayload = {
      shiftNo: String(row.SHIFT ?? "1"),
      day: formattedDay,
      branch: String(row.Branch ?? row.BRANCH ?? row.branch ?? ""),
      year: String(row.YEAR ?? row.year ?? ""),
      semister: String(row.SEMISTER ?? row.semister ?? selectedSem ?? ""),
      section: String(row.SECTION ?? row.section ?? ""),
      stream: String(row.STREAM ?? row.stream ?? "1"),
      frrom_To_Periods: periodFromTo,
      proc_type: "TT_ADJUST",
      wdate: formattedWdate,
    };

    console.log("Period Adjustment Delete Payload:", payload);

    setDeletingAdjustment(true);
    try {
      const result = await deletePeriodAdjustment(payload);
      if (result.success !== false) {
        if (result.affectedRows === 0) {
          toast.warning(
            "No matching adjustment record was found in the database (0 rows affected). Verify if this period has an active adjustment saved for this date.",
          );
        } else {
          toast.success(
            result.message || "Period adjustment deleted successfully.",
          );
        }

        // Parse range to update all covered periods if multi-period
        const periodRange = parsePeriodRange(periodFromTo, row.PERIOD);
        const minP = parseInt(periodRange.from, 10);
        const maxP = parseInt(periodRange.to, 10);

        const updatedMap = { ...adjustmentsMapRef.current };
        for (let p = minP; p <= maxP; p++) {
          const dummyRow = { ...row, PERIOD: p };
          const key = getRowKey(dummyRow);
          updatedMap[key] = {
            presentSubject: "",
            presentLecturer: "",
            wdate: "",
            status: "deleted",
          };
        }
        adjustmentsMapRef.current = updatedMap;
        setAdjustmentsMap(updatedMap);

        // Clear Present_Subject, Present_Lecturer, and WDate from table row (DO NOT REMOVE ROW)
        setGridData((prev) =>
          prev.map((r, i) => {
            const rP = parseInt(String(r.PERIOD), 10);
            const isTarget =
              i === index ||
              getRowKey(r) === getRowKey(row) ||
              (!isNaN(rP) &&
                rP >= minP &&
                rP <= maxP &&
                String(r.Branch ?? r.BRANCH ?? "") ===
                  String(row.Branch ?? row.BRANCH ?? "") &&
                String(r.SECTION ?? "").toUpperCase() ===
                  String(row.SECTION ?? "").toUpperCase());

            if (isTarget) {
              return {
                ...r,
                P_Subject: null,
                Present_Subject: null,
                Present_Lecturer: null,
                PL: null,
                WDate: null,
                wdate: null,
              };
            }
            return r;
          }),
        );

        setDeleteTarget(null);

        // Reload the table data from backend
        if (
          selectedDepartment &&
          selectedFaculty &&
          selectedProgramme &&
          selectedSem &&
          selectedDate
        ) {
          await handleLoadGrid(false);
        }
      } else {
        toast.error(result.message || "Failed to delete period adjustment.");
      }
    } catch (err: any) {
      console.error("Error deleting period adjustment:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete period adjustment.",
      );
    } finally {
      setDeletingAdjustment(false);
    }
  };

  // Fetch available faculty for modal: POST /api/Period_Adjustment/available-faculty
  const fetchAvailableFaculty = useCallback(
    async (
      facType: string,
      fromP: string,
      toP: string,
      row: AbsentFacultyTimetableRow,
    ) => {
      setModalLoadingFaculty(true);
      try {
        const payload = {
          fac: facType,
          year: String(row.YEAR ?? ""),
          semister: String(row.SEMISTER ?? selectedSem ?? ""),
          branch: String(row.Branch ?? row.BRANCH ?? ""),
          section: String(row.SECTION ?? ""),
          day: currentDayName || row.DAY?.toLowerCase() || "",
          periodFrom: String(fromP),
          periodTo: String(toP),
          programme: String(row.PROGRAMME ?? selectedProgramme ?? ""),
          wdate: "",
          lecturer: String(row.LECTURER ?? selectedFaculty ?? ""),
          acdYr: academicYear,
        };

        const result = await getAvailableFaculty(payload);
        setModalAvailableFacultyList(result);
      } catch (err) {
        console.error("Error fetching available faculty:", err);
        setModalAvailableFacultyList([]);
      } finally {
        setModalLoadingFaculty(false);
      }
    },
    [
      academicYear,
      currentDayName,
      selectedFaculty,
      selectedProgramme,
      selectedSem,
    ],
  );

  // Fetch available faculty subjects for modal: POST /api/Period_Adjustment/available-faculty-subjects
  const fetchAvailableFacultySubjects = useCallback(
    async (
      facultyLecturer: string,
      fromP: string,
      toP: string,
      row: AbsentFacultyTimetableRow,
    ) => {
      setModalLoadingSubjects(true);
      try {
        const payload = {
          year: String(row.YEAR ?? ""),
          semister: String(row.SEMISTER ?? selectedSem ?? ""),
          branch: String(row.Branch ?? row.BRANCH ?? ""),
          section: String(row.SECTION ?? ""),
          day: currentDayName || row.DAY?.toLowerCase() || "",
          periodFrom: String(fromP),
          periodTo: String(toP),
          programme: String(row.PROGRAMME ?? selectedProgramme ?? ""),
          wdate: "",
          lecturer: facultyLecturer,
          acdYr: academicYear,
        };

        const result = await getAvailableFacultySubjects(payload);
        setModalSubjectsList(result);
        if (result.length > 0) {
          setModalSelectedSubjectCode(result[0].SUB_CODE || result[0].Subject);
        } else {
          setModalSelectedSubjectCode("");
        }
      } catch (err) {
        console.error("Error fetching available faculty subjects:", err);
        setModalSubjectsList([]);
        setModalSelectedSubjectCode("");
      } finally {
        setModalLoadingSubjects(false);
      }
    },
    [academicYear, currentDayName, selectedProgramme, selectedSem],
  );

  // Open modal on clicking Period cell number
  const handleOpenChangeFacultyModal = (row: AbsentFacultyTimetableRow) => {
    setSelectedRowForModal(row);

    const rawFromTo =
      row.FRM_TO_PERIODS ??
      row.frrom_To_Periods ??
      row.From_To_Periods ??
      row.frm_to_periods;

    const periodRange = parsePeriodRange(rawFromTo, row.PERIOD);

    setModalPeriodOptions(periodRange.options);
    setModalFromPeriod(periodRange.from);
    setModalToPeriod(periodRange.to);

    setModalFacType("0");
    setModalAvailableFacultyList([]);
    setModalSelectedFaculty("");
    setModalMergeWith("");
    setModalSubjectsList([]);
    setModalSelectedSubjectCode("");
    setModalReason("");
    setIsModalOpen(true);
  };

  // Static Faculty type change (0 = Select Faculty, 1..5 for dynamic fetch)
  const handleFacTypeChange = (newFacType: string) => {
    setModalFacType(newFacType);
    setModalSelectedFaculty("");
    setModalSubjectsList([]);
    setModalSelectedSubjectCode("");

    if (newFacType === "0" || !selectedRowForModal) {
      setModalAvailableFacultyList([]);
      return;
    }

    fetchAvailableFaculty(
      newFacType,
      modalFromPeriod,
      modalToPeriod,
      selectedRowForModal,
    );
  };

  // Available Faculty selection change
  const handleModalFacultyChange = (lecturerId: string) => {
    setModalSelectedFaculty(lecturerId);
    setModalSelectedSubjectCode("");

    if (!lecturerId || !selectedRowForModal) {
      setModalSubjectsList([]);
      return;
    }

    fetchAvailableFacultySubjects(
      lecturerId,
      modalFromPeriod,
      modalToPeriod,
      selectedRowForModal,
    );
  };

  // Modal Period change (From Period or To Period)
  const handleModalPeriodChange = (type: "from" | "to", val: string) => {
    const newFrom = type === "from" ? val : modalFromPeriod;
    const newTo = type === "to" ? val : modalToPeriod;

    if (type === "from") setModalFromPeriod(val);
    if (type === "to") setModalToPeriod(val);

    if (selectedRowForModal && modalFacType && modalFacType !== "0") {
      fetchAvailableFaculty(modalFacType, newFrom, newTo, selectedRowForModal);
      if (modalSelectedFaculty) {
        fetchAvailableFacultySubjects(
          modalSelectedFaculty,
          newFrom,
          newTo,
          selectedRowForModal,
        );
      }
    }
  };

  // Save Modal Adjustment ("Yes" button) -> POST /api/Period_Adjustment/save-adjustment
  const handleSaveModalAdjustment = async () => {
    if (!selectedRowForModal) return;

    if (!modalFacType || modalFacType === "0") {
      toast.error("Please select a Faculty type.");
      return;
    }
    if (!modalSelectedFaculty) {
      toast.error("Please select an available Faculty.");
      return;
    }
    if (!modalSelectedSubjectCode) {
      toast.error("Please select a Subject.");
      return;
    }

    const chosenSubject = modalSubjectsList.find(
      (s) =>
        s.SUB_CODE === modalSelectedSubjectCode ||
        s.Subject === modalSelectedSubjectCode,
    );

    let avL_Subject = chosenSubject?.Subject || modalSelectedSubjectCode;
    if (chosenSubject?.Subject && chosenSubject.Subject.includes("--")) {
      avL_Subject = chosenSubject.Subject.split("--")[1];
    }

    const p_SubjectCode = chosenSubject?.SUB_CODE || modalSelectedSubjectCode;

    setModalSaving(true);
    try {
      const payload: SaveAdjustmentPayload = {
        shiftNo: String(selectedRowForModal.SHIFT ?? "1"),
        day: currentDayName || selectedRowForModal.DAY?.toLowerCase() || "",
        wdate:
          formatToDDMMYYYY(selectedDate) || selectedRowForModal.WDate || "",
        programme: String(
          selectedRowForModal.PROGRAMME ?? selectedProgramme ?? "",
        ),
        branch: String(
          selectedRowForModal.Branch ?? selectedRowForModal.BRANCH ?? "",
        ),
        year: String(selectedRowForModal.YEAR ?? ""),
        semister: String(selectedRowForModal.SEMISTER ?? selectedSem ?? ""),
        section: String(selectedRowForModal.SECTION ?? ""),
        period: String(modalFromPeriod),
        subject: String(selectedRowForModal.SUBJECT ?? ""),
        avL_Subject: avL_Subject,
        department: String(
          selectedDepartment ||
            selectedRowForModal.DEPT ||
            selectedRowForModal.DEPARTMENT ||
            "",
        ),
        lecturer: String(selectedRowForModal.LECTURER ?? selectedFaculty ?? ""),
        avL_Lecturert: modalSelectedFaculty,
        stream: String(selectedRowForModal.STREAM ?? "1"),
        spTime: String(selectedRowForModal.SPTIME ?? ""),
        periodType: String(selectedRowForModal.PERIOD_TYPE ?? ""),
        frrom_To_Periods: `${modalFromPeriod},${modalToPeriod}`,
        toperiod: String(modalToPeriod),
        reason: modalReason,
        p_SubjectCode: p_SubjectCode,
        l_SubjectCode: String(selectedRowForModal.SUB_CODE ?? ""),
      };

      const result = await savePeriodAdjustment(payload);
      if (result.success !== false) {
        toast.success(
          result.message || "Period adjustment saved successfully.",
        );

        const chosenFaculty = modalAvailableFacultyList.find(
          (f) => (f.Lecturer || f.lecturer) === modalSelectedFaculty,
        );
        const facultyDisplay =
          chosenFaculty?.Fname || chosenFaculty?.fname || modalSelectedFaculty;
        const formattedDate =
          formatToDDMMYYYY(selectedDate) || selectedRowForModal.WDate || "";

        const fromP = parseInt(modalFromPeriod, 10);
        const toP = parseInt(modalToPeriod, 10);
        const minP = isNaN(fromP) ? 1 : fromP;
        const maxP = isNaN(toP) ? minP : toP;

        // Update tracked adjustments map for all periods in the adjusted range
        const updatedMap = { ...adjustmentsMapRef.current };
        for (let p = minP; p <= maxP; p++) {
          const dummyRow = { ...selectedRowForModal, PERIOD: p };
          const key = getRowKey(dummyRow);
          updatedMap[key] = {
            presentSubject: avL_Subject,
            presentLecturer: facultyDisplay,
            wdate: formattedDate,
            status: "active",
          };
        }
        adjustmentsMapRef.current = updatedMap;
        setAdjustmentsMap(updatedMap);

        // Optimistically fill Present_Subject and Present_Lecturer in table data
        setGridData((prev) =>
          prev.map((r) => {
            const rP = parseInt(String(r.PERIOD), 10);
            const isTarget =
              (!isNaN(rP) &&
                rP >= minP &&
                rP <= maxP &&
                String(r.Branch ?? r.BRANCH ?? "") ===
                  String(
                    selectedRowForModal.Branch ??
                      selectedRowForModal.BRANCH ??
                      "",
                  ) &&
                String(r.SECTION ?? "").toUpperCase() ===
                  String(selectedRowForModal.SECTION ?? "").toUpperCase()) ||
              getRowKey(r) === getRowKey(selectedRowForModal);

            if (isTarget) {
              return {
                ...r,
                P_Subject: avL_Subject,
                Present_Subject: avL_Subject,
                Present_Lecturer: facultyDisplay,
                PL: facultyDisplay,
                WDate: formattedDate,
                wdate: formattedDate,
              };
            }
            return r;
          }),
        );

        setIsModalOpen(false);
        setSelectedRowForModal(null);

        // Refresh grid
        await handleLoadGrid(false);
      } else {
        toast.error(result.message || "Failed to save period adjustment.");
      }
    } catch (err: any) {
      console.error("Error saving period adjustment:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save period adjustment.",
      );
    } finally {
      setModalSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRowForModal(null);
  };

  // Save handler
  const handleSave = async () => {
    if (!selectedDepartment) {
      toast.error("Please select a Department.");
      return;
    }
    if (!selectedFaculty) {
      toast.error("Please select a Faculty.");
      return;
    }
    if (!selectedProgramme) {
      toast.error("Please select a Programme.");
      return;
    }
    if (!selectedSem) {
      toast.error("Please select a Semester.");
      return;
    }
    if (!selectedDate) {
      toast.error("Please select a Date.");
      return;
    }

    setSaving(true);
    try {
      toast.success("Period Adjustment details saved successfully.");
    } catch (err: any) {
      console.error("Error saving Period Adjustment:", err);
      toast.error(
        err?.response?.data?.message || "Error saving Period Adjustment.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset / Cancel handler
  const handleReset = () => {
    setSelectedDepartment("");
    setSelectedFaculty("");
    setFacultyOptions([]);
    setSelectedProgramme("");
    setSelectedSem("");
    setSelectedDate("");
    setGridData([]);
    setHasSearched(false);
    toast.info("Form reset");
  };

  const selectedFacultyLabel =
    facultyOptions.find((f) => f.value === selectedFaculty)?.label ||
    selectedFaculty;

  return (
    <div className="dbs-period-adj-container">
      {/* 1. Page Header (Standard Application Theme) */}
      <div className="dbs-period-adj-header">
        <div className="dbs-period-adj-title-group">
          <div className="dbs-period-adj-icon-wrapper">
            <Clock size={24} />
          </div>
          <div className="dbs-period-adj-header-text">
            <h2>Period Adjustment</h2>
            <p className="dbs-period-adj-subtitle">
              Create &amp; Manage Faculty Period Adjustment Details
            </p>
          </div>
        </div>

        <div className="dbs-period-adj-header-badges">
          <span className="dbs-period-adj-badge">
            <Calendar size={14} />
            Academic Year: <strong>{academicYear}</strong>
          </span>
          {gridData.length > 0 && (
            <span className="dbs-period-adj-badge">
              <Users size={14} />
              Periods: <strong>{gridData.length}</strong>
            </span>
          )}
        </div>
      </div>

      {/* 2. Form Card (Standard Application Theme) */}
      <div className="dbs-period-adj-form-card">
        <h3>Period Adjustment Details</h3>

        <div className="dbs-period-adj-grid">
          {/* Department */}
          <div className="dbs-period-adj-input">
            <label>
              Department{" "}
              {loadingDepartments && (
                <Loader2 size={13} className="animate-spin inline ml-1" />
              )}
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedFaculty("");
              }}
            >
              <option value="">Select Department</option>
              <option value="all">All</option>
              {departmentOptions.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty */}
          <div className="dbs-period-adj-input">
            <label>
              Faculty{" "}
              {loadingFaculties && (
                <Loader2 size={13} className="animate-spin inline ml-1" />
              )}
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
            >
              <option value="">Select Employee</option>
              {facultyOptions.map((fac) => (
                <option key={fac.value} value={fac.value}>
                  {fac.label}
                </option>
              ))}
            </select>
          </div>

          {/* Programme */}
          <div className="dbs-period-adj-input">
            <label>
              Programme{" "}
              {loadingProgrammes && (
                <Loader2 size={13} className="animate-spin inline ml-1" />
              )}
            </label>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
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

          {/* Date */}
          <div className="dbs-period-adj-input">
            <label>
              Date
              {currentDayName && (
                <span className="dbs-period-adj-day-tag">{currentDayName}</span>
              )}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Semester */}
          <div className="dbs-period-adj-input">
            <label>Semester</label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
            >
              <option value="">Select Semester</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: Load Grid, Save, Cancel */}
        <div className="dbs-period-adj-actions">
          <button
            type="button"
            className="dbs-period-adj-load-btn"
            onClick={() => handleLoadGrid(true)}
            disabled={loadingGrid}
          >
            {loadingGrid ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span>{loadingGrid ? "Loading Grid..." : "Load Grid"}</span>
          </button>

          <button
            type="button"
            className="dbs-period-adj-save-btn"
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
            className="dbs-period-adj-reset-btn"
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* 3. Timetable Grid Card (14 Columns, Standard Application Theme) */}
      <div className="dbs-period-adj-table-card">
        <div className="dbs-period-adj-table-header">
          <div>
            <h3>Absent Faculty Timetable Schedule</h3>
            <p className="dbs-period-adj-table-subtitle">
              {selectedFaculty
                ? `Timetable for ${selectedFacultyLabel} on ${currentDayName ? currentDayName.toUpperCase() : "selected day"}`
                : "Select filters and click 'Load Grid' to view timetable"}
            </p>
          </div>

          <div className="dbs-period-adj-table-badges">
            {currentDayName && (
              <span className="dbs-period-adj-badge dbs-period-adj-badge-day">
                <Calendar size={13} />
                {currentDayName.toUpperCase()}
              </span>
            )}
            <span className="dbs-period-adj-badge dbs-period-adj-badge-ay">
              AY: {academicYear}
            </span>
            {gridData.length > 0 && (
              <span className="dbs-period-adj-badge dbs-period-adj-badge-count">
                {gridData.length} Record{gridData.length > 1 ? "s" : ""}
              </span>
            )}

            {gridData.length > 0 && (
              <div className="dbs-period-adj-view-toggle">
                <button
                  type="button"
                  className={`dbs-period-adj-view-btn ${viewMode === "table" || viewMode === "auto" ? "active" : ""}`}
                  onClick={() => setViewMode("table")}
                  title="Table View"
                >
                  <TableIcon size={16} />
                </button>
                <button
                  type="button"
                  className={`dbs-period-adj-view-btn ${viewMode === "cards" ? "active" : ""}`}
                  onClick={() => setViewMode("cards")}
                  title="Cards View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 14-Column Table */}
        <div
          className={`dbs-period-adj-table-scroll ${
            viewMode === "cards" ? "hidden" : viewMode === "auto" ? "auto-hide" : ""
          }`}
        >
          <table className="dbs-period-adj-data-table">
            <thead>
              <tr>
                <th>Present_Subject</th>
                <th>Present_Lecturer</th>
                <th>Shift</th>
                <th>Day</th>
                <th>Year</th>
                <th>Semister</th>
                <th>DeptName</th>
                <th>Section</th>
                <th>Period</th>
                <th>Subject</th>
                <th>Timings</th>
                <th>Period Type</th>
                <th>From To Periods</th>
                <th>Cancel Adjust Period</th>
              </tr>
            </thead>
            <tbody>
              {loadingGrid ? (
                <tr>
                  <td colSpan={14} className="dbs-period-adj-loading-cell">
                    <div className="dbs-period-adj-loading-inline">
                      <Loader2
                        size={18}
                        className="animate-spin text-sky-600"
                      />
                      <span>Loading Absent Faculty Timetable...</span>
                    </div>
                  </td>
                </tr>
              ) : gridData.length > 0 ? (
                gridData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.P_Subject || row.Present_Subject || ""}</td>
                    <td>{row.Present_Lecturer || row.PL || ""}</td>
                    <td className="dbs-period-adj-td-center">
                      {row.SHIFT ?? ""}
                    </td>
                    <td className="dbs-period-adj-td-center">
                      {row.DAY ?? ""}
                    </td>
                    <td className="dbs-period-adj-td-center">
                      {row.YEAR ?? ""}
                    </td>
                    <td className="dbs-period-adj-td-center">
                      {row.SEMISTER ?? ""}
                    </td>
                    <td className="dbs-period-adj-td-center">
                      {row.DEPT || row.DeptName || row.DEPARTMENT || ""}
                    </td>
                    <td className="dbs-period-adj-td-center">
                      {row.SECTION ?? ""}
                    </td>
                    <td className="dbs-period-adj-td-center">
                      <button
                        type="button"
                        className="dbs-period-adj-period-pill"
                        onClick={() => handleOpenChangeFacultyModal(row)}
                        title="Click to change faculty for this period"
                      >
                        P{row.PERIOD ?? ""}
                      </button>
                    </td>
                    <td>{row.SUBJECT ?? ""}</td>
                    <td className="dbs-period-adj-td-center">
                      {row.SPTIME ?? ""}
                    </td>
                    <td className="dbs-period-adj-td-center">
                      {row.PERIOD_TYPE ?? ""}
                    </td>
                    <td className="dbs-period-adj-td-center">
                      {row.FRM_TO_PERIODS ?? ""}
                    </td>
                    <td className="dbs-period-adj-td-center">
                      <button
                        type="button"
                        className={`dbs-period-adj-trash-btn ${
                          !(
                            row.P_Subject ||
                            row.Present_Subject ||
                            row.Present_Lecturer ||
                            row.PL ||
                            row.WDate ||
                            row.wdate ||
                            adjustmentsMap[getRowKey(row)]?.status === "active"
                          )
                            ? "dbs-period-adj-trash-btn-disabled"
                            : ""
                        }`}
                        onClick={() => handleCancelAdjustClick(row, index)}
                        title={
                          row.P_Subject ||
                          row.Present_Subject ||
                          row.Present_Lecturer ||
                          row.PL ||
                          row.WDate ||
                          row.wdate ||
                          adjustmentsMap[getRowKey(row)]?.status === "active"
                            ? "Cancel Adjust Period"
                            : "Period not adjusted yet"
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} className="dbs-period-adj-empty-cell">
                    {hasSearched
                      ? `No timetable schedule found for the selected faculty on ${currentDayName ? currentDayName.toUpperCase() : "selected day"}.`
                      : "Select filters and click 'Load Grid' to view the timetable."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / Responsive Cards Grid */}
        {gridData.length > 0 && (
          <div
            className={`dbs-period-adj-cards-grid ${
              viewMode === "table" ? "hidden" : viewMode === "auto" ? "auto-show" : ""
            }`}
            style={{
              display: viewMode === "cards" ? "grid" : undefined,
            }}
          >
            {gridData.map((row, index) => {
              const rowKey = getRowKey(row);
              const isAdjusted = Boolean(
                row.P_Subject ||
                row.Present_Subject ||
                row.Present_Lecturer ||
                row.PL ||
                row.WDate ||
                row.wdate ||
                adjustmentsMap[rowKey]?.status === "active"
              );
              const presentFaculty =
                adjustmentsMap[rowKey]?.presentLecturer ||
                row.Present_Lecturer ||
                row.PL;
              const presentSubject =
                adjustmentsMap[rowKey]?.presentSubject ||
                row.P_Subject ||
                row.Present_Subject;

              return (
                <div
                  key={`card-${index}`}
                  className={`dbs-period-adj-mobile-card ${isAdjusted ? "is-adjusted" : ""}`}
                >
                  {/* Top Bar: Period Badge & Timings */}
                  <div className="dbs-period-adj-card-top">
                    <span className="dbs-period-adj-card-period-badge">
                      <Clock size={13} />
                      Period {row.PERIOD ?? ""}
                    </span>
                    <span className="dbs-period-adj-card-timings">
                      {row.SPTIME || "No timings set"}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="dbs-period-adj-card-body">
                    <div className="dbs-period-adj-card-title">
                      <span>{row.SUBJECT || "Unassigned Subject"}</span>
                      {row.PERIOD_TYPE && (
                        <span className="dbs-period-adj-card-type-tag">
                          {row.PERIOD_TYPE}
                        </span>
                      )}
                    </div>

                    <div className="dbs-period-adj-card-meta">
                      <span className="dbs-period-adj-card-meta-item">
                        <strong>Dept:</strong> {row.DEPT || row.DeptName || "N/A"}
                      </span>
                      <span className="dbs-period-adj-card-meta-item">
                        <strong>Sec:</strong> {row.SECTION ?? "N/A"}
                      </span>
                      <span className="dbs-period-adj-card-meta-item">
                        <strong>Yr:</strong> {row.YEAR ?? "N/A"}
                      </span>
                      <span className="dbs-period-adj-card-meta-item">
                        <strong>Sem:</strong> {row.SEMISTER ?? "N/A"}
                      </span>
                      {row.SHIFT && (
                        <span className="dbs-period-adj-card-meta-item">
                          <strong>Shift:</strong> {row.SHIFT}
                        </span>
                      )}
                    </div>

                    {/* Adjustment Details Box */}
                    <div
                      className={`dbs-period-adj-card-adjustment-box ${
                        isAdjusted ? "has-faculty" : ""
                      }`}
                    >
                      <div className="dbs-period-adj-card-adj-label">
                        {isAdjusted ? "Assigned Replacement Faculty" : "Adjustment Status"}
                      </div>
                      <div className={`dbs-period-adj-card-adj-val ${isAdjusted ? "success" : ""}`}>
                        {isAdjusted
                          ? `${presentFaculty || "Assigned"} (${presentSubject || "Subject Assigned"})`
                          : "Not adjusted yet (Free / Absent)"}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="dbs-period-adj-card-actions">
                    <button
                      type="button"
                      className="dbs-period-adj-card-adjust-btn"
                      onClick={() => handleOpenChangeFacultyModal(row)}
                    >
                      <Users size={15} />
                      <span>{isAdjusted ? "Change Faculty" : "Assign Faculty"}</span>
                    </button>

                    <button
                      type="button"
                      className="dbs-period-adj-card-trash-btn"
                      disabled={!isAdjusted}
                      onClick={() => handleCancelAdjustClick(row, index)}
                      title={isAdjusted ? "Cancel Adjust Period" : "Period not adjusted yet"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Change Faculty Modal Dialog */}
      {isModalOpen && (
        <div
          className="dbs-period-adj-modal-overlay"
          onClick={handleCloseModal}
        >
          <div
            className="dbs-period-adj-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="dbs-period-adj-modal-header">
              <h4 className="dbs-period-adj-modal-title">Change Faculty</h4>
              <button
                type="button"
                className="dbs-period-adj-modal-close"
                onClick={handleCloseModal}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="dbs-period-adj-modal-body">
              <div className="dbs-period-adj-modal-grid">
                {/* Row 1: From Period & To Period */}
                <div className="dbs-period-adj-modal-field">
                  <label className="dbs-period-adj-modal-label">
                    From Period
                  </label>
                  <select
                    className="dbs-period-adj-modal-control"
                    value={modalFromPeriod}
                    onChange={(e) =>
                      handleModalPeriodChange("from", e.target.value)
                    }
                  >
                    {(modalPeriodOptions.length > 0
                      ? modalPeriodOptions
                      : [modalFromPeriod || "1"]
                    ).map((p) => (
                      <option key={`from-${p}`} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="dbs-period-adj-modal-field">
                  <label className="dbs-period-adj-modal-label">
                    To Period
                  </label>
                  <select
                    className="dbs-period-adj-modal-control"
                    value={modalToPeriod}
                    onChange={(e) =>
                      handleModalPeriodChange("to", e.target.value)
                    }
                  >
                    {(modalPeriodOptions.length > 0
                      ? modalPeriodOptions
                      : [modalToPeriod || "1"]
                    ).map((p) => (
                      <option key={`to-${p}`} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 2: Faculty (Static) & Faculty (Available) */}
                <div className="dbs-period-adj-modal-field">
                  <label className="dbs-period-adj-modal-label">Faculty</label>
                  <select
                    className="dbs-period-adj-modal-control"
                    value={modalFacType}
                    onChange={(e) => handleFacTypeChange(e.target.value)}
                  >
                    {STATIC_FACULTY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="dbs-period-adj-modal-field">
                  <label className="dbs-period-adj-modal-label">
                    Faculty{" "}
                    {modalLoadingFaculty && (
                      <Loader2 size={12} className="animate-spin inline ml-1" />
                    )}
                  </label>
                  <select
                    className="dbs-period-adj-modal-control"
                    value={modalSelectedFaculty}
                    onChange={(e) => handleModalFacultyChange(e.target.value)}
                    disabled={
                      modalLoadingFaculty ||
                      modalAvailableFacultyList.length === 0
                    }
                  >
                    <option value="">
                      {modalLoadingFaculty ? "Loading..." : "Select Faculty"}
                    </option>
                    {modalAvailableFacultyList.map((fac, idx) => {
                      const lecturer = fac.Lecturer || fac.lecturer || "";
                      const name = fac.Fname || fac.fname || lecturer;
                      return (
                        <option key={`${lecturer}-${idx}`} value={lecturer}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Row 3: Merge With & Subjects */}
                <div className="dbs-period-adj-modal-field">
                  <label className="dbs-period-adj-modal-label">
                    Merge With
                  </label>
                  <input
                    type="text"
                    className="dbs-period-adj-modal-control"
                    value={modalMergeWith}
                    onChange={(e) => setModalMergeWith(e.target.value)}
                    disabled
                  />
                </div>

                <div className="dbs-period-adj-modal-field">
                  <label className="dbs-period-adj-modal-label">
                    Subjects{" "}
                    {modalLoadingSubjects && (
                      <Loader2 size={12} className="animate-spin inline ml-1" />
                    )}
                  </label>
                  <select
                    className="dbs-period-adj-modal-control"
                    value={modalSelectedSubjectCode}
                    onChange={(e) =>
                      setModalSelectedSubjectCode(e.target.value)
                    }
                    disabled={
                      modalLoadingSubjects || modalSubjectsList.length === 0
                    }
                  >
                    <option value="">
                      {modalLoadingSubjects ? "Loading..." : "Select Subject"}
                    </option>
                    {modalSubjectsList.map((sub, idx) => (
                      <option
                        key={`${sub.SUB_CODE || idx}`}
                        value={sub.SUB_CODE || sub.Subject}
                      >
                        {sub.Subject || sub.SUB_CODE}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 4: Reason */}
                <div className="dbs-period-adj-modal-field dbs-period-adj-modal-field-reason">
                  <label className="dbs-period-adj-modal-label">Reason</label>
                  <input
                    type="text"
                    className="dbs-period-adj-modal-control"
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    placeholder="Enter reason"
                  />
                </div>
              </div>

              {/* Modal Actions: Yes & No */}
              <div className="dbs-period-adj-modal-actions">
                <button
                  type="button"
                  className="dbs-period-adj-modal-yes-btn"
                  onClick={handleSaveModalAdjustment}
                  disabled={modalSaving}
                >
                  {modalSaving && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  <span>{modalSaving ? "Saving..." : "Yes"}</span>
                </button>

                <button
                  type="button"
                  className="dbs-period-adj-modal-no-btn"
                  onClick={handleCloseModal}
                  disabled={modalSaving}
                >
                  <span>No</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Adjustment Confirmation Modal */}
      <DeleteModal
        open={!!deleteTarget}
        title="Cancel Period Adjustment"
        itemName={
          deleteTarget
            ? `Period ${deleteTarget.row.PERIOD ?? ""} - ${deleteTarget.row.SUBJECT ?? "Adjustment"}`
            : ""
        }
        loading={deletingAdjustment}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteAdjustment}
      />
    </div>
  );
};

export default PeriodAdjustment;
