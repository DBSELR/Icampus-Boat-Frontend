/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Save,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  Check,
  Loader2,
  Clock,
  Layers,
  Calendar,
  GraduationCap,
  GitBranch,
  Hash,
  Sun,
  RefreshCw,
  X,
  CheckSquare,
  Square,
  Table as TableIcon,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProgramme,
  getBranch,
  getYear,
  getSections,
} from "../../../apis/Common";
import {
  getNoAttendanceLecturers,
  saveAdminPermissions,
  NoAttendanceLecturersPayload,
  NoAttendanceLecturerItem,
  SaveAdminPermissionsPayload,
  AdminPermissionItemPayload,
} from "../../../apis/AttendanceApis";
import "./Admin_Permissions.css";

export interface PermissionRow {
  id: string;
  lecturer: string;
  subCode: string;
  periodRange: string;
  date: string;
  day: string;
  semester: string | number;
  sYear: string;
  section: string;
  course: string;
  branchName: string;
  bsName: string;
  raw: NoAttendanceLecturerItem;
}

const parseLecturer = (lecturerStr: string) => {
  const parts = (lecturerStr || "").split("-");
  const code = parts[0] ? parts[0].trim() : "";
  const name = parts.slice(1).join("-").trim() || lecturerStr || "Faculty Member";
  const nameParts = name.trim().split(" ").filter(Boolean);
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : (name.slice(0, 2) || "FC").toUpperCase();
  return { code, name, initials };
};

const formatDateDisplay = (dateStr?: string, dayStr?: string): string => {
  if (!dateStr) return dayStr || "-";
  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = cleanDate.split("-");
  let formatted = cleanDate;
  if (parts.length === 3) {
    // YYYY-MM-DD -> DD-MM-YYYY
    formatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dayStr ? `${formatted} (${dayStr})` : formatted;
};

const formatPeriodDisplay = (periodRange?: string): string => {
  if (!periodRange) return "-";
  const parts = periodRange.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 2 && parts[0] === parts[1]) {
    return `Period ${parts[0]}`;
  }
  if (parts.length > 1) {
    return `Periods ${parts.join(" - ")}`;
  }
  return `Period ${periodRange}`;
};

const AdminPermissions: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2026-2027";

  // Form State
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [shift, setShift] = useState<string>("");
  const [programme, setProgramme] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [section, setSection] = useState<string>("");

  // Dynamic Options from Common APIs
  const [programmeOptions, setProgrammeOptions] = useState<any[]>([]);
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [yearOptions, setYearOptions] = useState<any[]>([]);
  const [sectionOptions, setSectionOptions] = useState<any[]>([]);

  // Saving & Loading states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Records state
  const [records, setRecords] = useState<PermissionRow[]>([]);

  // Filtering & Selection state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "selected" | "pending">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"auto" | "table" | "cards">("auto");

  // Debounce timer ref to prevent rapid spamming on field change
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Programme dropdown on component mount
  useEffect(() => {
    const loadProgrammes = async () => {
      try {
        const res = await getProgramme();
        if (Array.isArray(res) && res.length > 0) {
          setProgrammeOptions(res);
        }
      } catch (e) {
        console.warn("Could not fetch programmes:", e);
      }
    };
    loadProgrammes();
  }, []);

  // Cascading Branch & Year when Programme changes
  useEffect(() => {
    if (!programme) {
      setBranchOptions([]);
      setYearOptions([]);
      setSectionOptions([]);
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
      } catch (e) {
        console.warn("Could not load branch/year cascade:", e);
      }
    };
    loadCascade();
  }, [programme]);

  // Cascading Section from Commonfields when Programme, Branch & Year change
  useEffect(() => {
    if (!programme || !branch || !year) {
      setSectionOptions([]);
      return;
    }
    const loadSectionsCascade = async () => {
      try {
        const sRes = await getSections(programme, branch, year);
        if (Array.isArray(sRes) && sRes.length > 0) {
          setSectionOptions(sRes);
        } else {
          setSectionOptions([]);
        }
      } catch (e) {
        console.warn("Could not load sections from Commonfields:", e);
        setSectionOptions([]);
      }
    };
    loadSectionsCascade();
  }, [programme, branch, year]);

  // Core Data Fetching function
  const fetchDataWithFilters = useCallback(
    async (filters: {
      fromDate?: string;
      toDate?: string;
      programme?: string;
      branch?: string;
      year?: string;
      semester?: string;
      section?: string;
    }) => {
      if (!filters.fromDate || !filters.toDate || !filters.programme) {
        setRecords([]);
        setHasLoaded(false);
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      try {
        const payload: NoAttendanceLecturersPayload = {
          programme: filters.programme,
          branch: filters.branch || "",
          section: filters.section || "",
          day: "",
          semester: filters.semester || "",
          sYear: filters.year || "",
          acdYr: academicYear || "2026-2027",
          date: filters.fromDate,
          toDate: filters.toDate,
        };

        const data = await getNoAttendanceLecturers(payload);

        if (data && data.length > 0) {
          const mapped: PermissionRow[] = data.map((item: any, idx: number) => {
            const fac =
              item.FacultyID ||
              item.facultyID ||
              item.facultyId ||
              item.lecturer ||
              item.Lecturer ||
              "Unknown Lecturer";
            const sub =
              item.aSubject ||
              item.asubject ||
              item.subject ||
              item.subCode ||
              item.SUB_CODE ||
              "-";
            const prange =
              item.Period_Range ||
              item.period_range ||
              item.periodRange ||
              item.period ||
              "-";
            const dateRaw = item.aDate || item.adate || item.date || "";
            const cleanDate =
              typeof dateRaw === "string" && dateRaw.includes("T")
                ? dateRaw.split("T")[0]
                : String(dateRaw || "");
            const day = item.aDay || item.aday || item.day || "";
            const sem =
              item.Semister ?? item.semister ?? item.Semester ?? item.semester ?? "";
            const syear =
              item.SYear ?? item.sYear ?? item.year ?? item.Year ?? "";
            const sec = item.Section || item.section || "";
            const crs = item.Course || item.course || "";
            const brName =
              item.BranchName || item.branchName || item.BSName || item.bsName || "";
            const bs = item.BSName || item.bsName || "";

            return {
              id: `${fac}_${sub}_${prange}_${cleanDate}_${idx}`,
              lecturer: fac,
              subCode: sub,
              periodRange: prange,
              date: cleanDate,
              day: day,
              semester: sem,
              sYear: syear,
              section: sec,
              course: crs,
              branchName: brName,
              bsName: bs,
              raw: item,
            };
          });

          setRecords(mapped);
          setSelectedIds(new Set());
          setHasLoaded(true);
        } else {
          setRecords([]);
          setSelectedIds(new Set());
          setHasLoaded(true);
        }
      } catch (error: any) {
        console.error("Failed to load no-attendance lecturers:", error);
        setRecords([]);
        setHasLoaded(true);
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load records from server. Please check your connection.";
        toast.error(msg);
      } finally {
        setLoadingData(false);
      }
    },
    [academicYear]
  );

  // USER INTERACTION HANDLER: Triggered on user selecting any field in the form
  const handleFieldChange = (field: string, value: string) => {
    let newFromDate = fromDate;
    let newToDate = toDate;
    let newProgramme = programme;
    let newBranch = branch;
    let newYear = year;
    let newSemester = semester;
    let newSection = section;

    if (field === "fromDate") {
      setFromDate(value);
      newFromDate = value;
    } else if (field === "toDate") {
      setToDate(value);
      newToDate = value;
    } else if (field === "shift") {
      setShift(value);
    } else if (field === "programme") {
      setProgramme(value);
      newProgramme = value;
      setBranch("");
      newBranch = "";
      setYear("");
      newYear = "";
      setSection("");
      newSection = "";
    } else if (field === "branch") {
      setBranch(value);
      newBranch = value;
      setSection("");
      newSection = "";
    } else if (field === "year") {
      setYear(value);
      newYear = value;
      setSection("");
      newSection = "";
    } else if (field === "semester") {
      setSemester(value);
      newSemester = value;
    } else if (field === "section") {
      setSection(value);
      newSection = value;
    }

    // Debounce call slightly
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchDataWithFilters({
        fromDate: newFromDate,
        toDate: newToDate,
        programme: newProgramme,
        branch: newBranch,
        year: newYear,
        semester: newSemester,
        section: newSection,
      });
    }, 250);
  };

  // Manual trigger to refresh/fetch
  const handleManualFetch = () => {
    if (!fromDate || !toDate || !programme) {
      toast.warning("Please specify From Date, To Date, and Programme to fetch records.");
      return;
    }
    fetchDataWithFilters({
      fromDate,
      toDate,
      programme,
      branch,
      year,
      semester,
      section,
    });
  };

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = records.length;
    const selected = selectedIds.size;
    const pending = Math.max(0, total - selected);

    const facultySet = new Set<string>();
    records.forEach((r) => {
      const { name } = parseLecturer(r.lecturer);
      if (name) facultySet.add(name);
    });

    return {
      total,
      selected,
      pending,
      uniqueFaculty: facultySet.size,
    };
  }, [records, selectedIds]);

  // Filtered records by search term & filter status tab
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Status Filter
      if (filterStatus === "selected" && !selectedIds.has(r.id)) return false;
      if (filterStatus === "pending" && selectedIds.has(r.id)) return false;

      // 2. Search Filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      const { code, name } = parseLecturer(r.lecturer);

      return (
        name.toLowerCase().includes(term) ||
        code.toLowerCase().includes(term) ||
        r.subCode.toLowerCase().includes(term) ||
        r.branchName.toLowerCase().includes(term) ||
        r.course.toLowerCase().includes(term) ||
        r.section.toLowerCase().includes(term) ||
        r.periodRange.toLowerCase().includes(term) ||
        r.date.toLowerCase().includes(term) ||
        r.day.toLowerCase().includes(term)
      );
    });
  }, [records, searchTerm, filterStatus, selectedIds]);

  // Selection handlers
  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (filteredRecords.length === 0) return;
    const allFilteredSelected = filteredRecords.every((r) =>
      selectedIds.has(r.id)
    );
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredRecords.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredRecords.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  const handleSelectAll = () => {
    const next = new Set<string>();
    records.forEach((r) => next.add(r.id));
    setSelectedIds(next);
    toast.info(`Selected all ${records.length} faculty permission(s).`);
  };

  const handleClearSelections = () => {
    setSelectedIds(new Set());
    toast.info("Cleared all selections.");
  };

  const handleInvertSelection = () => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      records.forEach((r) => {
        if (!prev.has(r.id)) next.add(r.id);
      });
      return next;
    });
    toast.info("Inverted selections.");
  };

  const isAllSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((r) => selectedIds.has(r.id));
  const isSomeSelected =
    filteredRecords.some((r) => selectedIds.has(r.id)) && !isAllSelected;

  // Handle Save Permissions
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!hasLoaded || records.length === 0) {
      toast.warning("Please select filters to load faculty records first.");
      return;
    }

    if (selectedIds.size === 0) {
      toast.warning("Please select at least one lecturer to grant permissions.");
      return;
    }

    const selectedRows = records.filter((r) => selectedIds.has(r.id));
    const permissions: AdminPermissionItemPayload[] = selectedRows.map((r) => {
      const parsed = parseLecturer(r.lecturer);
      return {
        lecturer: parsed.code || r.lecturer,
        subject: r.subCode || "-",
        granted: true,
      };
    });

    const payload: SaveAdminPermissionsPayload = {
      programme: programme || "01",
      branch: branch || "",
      sYear: year || "",
      semester: semester || "1",
      section: section || "",
      fromDate: fromDate || "2026-09-01",
      toDate: toDate || "2026-09-01",
      acdYr: academicYear || "2026-2027",
      permissions,
    };

    setIsSaving(true);
    try {
      const res = await saveAdminPermissions(payload);

      if (res?.success) {
        toast.success(
          res.message ||
            `Admin permissions saved successfully for ${res.totalSaved ?? permissions.length} record(s).`
        );
        setSelectedIds(new Set());
        fetchDataWithFilters({
          fromDate,
          toDate,
          programme,
          branch,
          year,
          semester,
          section,
        });
      } else {
        toast.error(res?.message || "Failed to save permissions.");
      }
    } catch (error: any) {
      console.error("Failed to save admin permissions:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.message ||
        "Failed to save admin permissions. Please check your connection.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Clear / Reset
  const handleClear = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setFromDate("");
    setToDate("");
    setShift("");
    setProgramme("");
    setBranch("");
    setYear("");
    setSemester("");
    setSection("");
    setBranchOptions([]);
    setYearOptions([]);
    setSectionOptions([]);
    setSearchTerm("");
    setFilterStatus("all");
    setRecords([]);
    setHasLoaded(false);
    setSelectedIds(new Set());
    toast.info("Form and selections have been cleared.");
  };

  return (
    <div className="dbs-perm-container">
      {/* 1. Header Section */}
      <div className="dbs-perm-header">
        <div className="dbs-perm-title-group">
          <div className="dbs-perm-icon-wrapper">
            <ShieldCheck size={26} />
          </div>
          <div className="dbs-perm-header-text">
            <h2>Admin Permissions</h2>
            <p>Faculty &amp; Subject Permission Allocation Matrix</p>
          </div>
        </div>

        <div className="dbs-perm-header-badges">
          <span className="dbs-perm-badge">
            Academic Year: <strong>{academicYear}</strong>
          </span>
          <span className="dbs-perm-badge count-badge">
            <Users size={14} />
            Selected: <strong>{selectedIds.size}</strong> of {records.length}
          </span>
        </div>
      </div>

      {/* 2. Scope & Filter Criteria Card */}
      <div className="dbs-perm-card">
        <div className="dbs-perm-card-header">
          <div className="dbs-perm-card-title">
            <Layers size={19} className="text-blue-600" />
            <div>
              <h3>Filter Criteria</h3>
              <span className="dbs-perm-card-subtitle">
                Select scope parameters to identify un-posted faculty attendance sessions
              </span>
            </div>
          </div>
          <div className="dbs-perm-filter-tip">
            <Info size={14} />
            Dates and Programme are required
          </div>
        </div>

        {/* Responsive Balanced Grid */}
        <div className="dbs-perm-grid">
          {/* 1. From Date */}
          <div className="dbs-perm-field">
            <label htmlFor="perm-from-date">
              <span className="dbs-perm-label-text">
                <Calendar size={14} />
                From Date
                <span className="dbs-perm-required">*</span>
              </span>
            </label>
            <div className="dbs-perm-input-wrap">
              <input
                id="perm-from-date"
                type="date"
                value={fromDate}
                onChange={(e) => handleFieldChange("fromDate", e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* 2. To Date */}
          <div className="dbs-perm-field">
            <label htmlFor="perm-to-date">
              <span className="dbs-perm-label-text">
                <Calendar size={14} />
                To Date
                <span className="dbs-perm-required">*</span>
              </span>
            </label>
            <div className="dbs-perm-input-wrap">
              <input
                id="perm-to-date"
                type="date"
                value={toDate}
                onChange={(e) => handleFieldChange("toDate", e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* 3. Programme */}
          <div className="dbs-perm-field">
            <label htmlFor="perm-programme">
              <span className="dbs-perm-label-text">
                <GraduationCap size={14} />
                Programme
                <span className="dbs-perm-required">*</span>
              </span>
            </label>
            <div className="dbs-perm-input-wrap">
              <select
                id="perm-programme"
                value={programme}
                onChange={(e) => handleFieldChange("programme", e.target.value)}
              >
                <option value="">Select Programme</option>
                {programmeOptions.length > 0 ? (
                  programmeOptions.map((p: any, idx: number) => {
                    const val = String(
                      p.COURSECODE ??
                        p.COURSE_CODE ??
                        p.ProgrammeCode ??
                        p.PROGRAMME ??
                        p.code ??
                        p.id ??
                        ""
                    );
                    const label = String(
                      p.COURSE ??
                        p.PROGRAMME ??
                        p.ProgrammeName ??
                        p.COURSENAME ??
                        p.name ??
                        val
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
                    <option value="05">05 - Diploma</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 4. Branch */}
          <div className="dbs-perm-field">
            <label htmlFor="perm-branch">
              <span className="dbs-perm-label-text">
                <GitBranch size={14} />
                Branch
              </span>
              <span className="dbs-perm-subtext">Optional</span>
            </label>
            <div className="dbs-perm-input-wrap">
              <select
                id="perm-branch"
                value={branch}
                onChange={(e) => handleFieldChange("branch", e.target.value)}
                disabled={!programme}
              >
                <option value="">Select Branch (All)</option>
                {branchOptions.length > 0 ? (
                  branchOptions.map((b: any, idx: number) => {
                    const val = String(
                      b.BRANCHCODE ??
                        b.BRANCH_CODE ??
                        b.BRANCH ??
                        b.code ??
                        b.id ??
                        ""
                    );
                    const label = String(
                      b.BRANCHNAME ??
                        b.BRANCH_NAME ??
                        b.BRANCH ??
                        b.name ??
                        val
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
                    <option value="02">02 - Electrical & Electronics</option>
                    <option value="03">03 - Mechanical Engineering</option>
                    <option value="04">04 - Electronics & Communication</option>
                    <option value="05">05 - Computer Science & Eng.</option>
                    <option value="12">12 - Information Technology</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 5. Year */}
          <div className="dbs-perm-field">
            <label htmlFor="perm-year">
              <span className="dbs-perm-label-text">
                <Calendar size={14} />
                Year
              </span>
              <span className="dbs-perm-subtext">Optional</span>
            </label>
            <div className="dbs-perm-input-wrap">
              <select
                id="perm-year"
                value={year}
                onChange={(e) => handleFieldChange("year", e.target.value)}
                disabled={!programme}
              >
                <option value="">Select Year (All)</option>
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
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 6. Semester */}
          <div className="dbs-perm-field">
            <label htmlFor="perm-semester">
              <span className="dbs-perm-label-text">
                <Layers size={14} />
                Semester
              </span>
              <span className="dbs-perm-subtext">Optional</span>
            </label>
            <div className="dbs-perm-input-wrap">
              <select
                id="perm-semester"
                value={semester}
                onChange={(e) => handleFieldChange("semester", e.target.value)}
                disabled={!year}
              >
                <option value="">Select Semester (All)</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
          </div>

          {/* 7. Section */}
          <div className="dbs-perm-field">
            <label htmlFor="perm-section">
              <span className="dbs-perm-label-text">
                <Hash size={14} />
                Section
              </span>
              <span className="dbs-perm-subtext">Optional</span>
            </label>
            <div className="dbs-perm-input-wrap">
              <select
                id="perm-section"
                value={section}
                onChange={(e) => handleFieldChange("section", e.target.value)}
                disabled={!year || !branch}
              >
                <option value="">Select Section (All)</option>
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
                    <option value="D">Section D</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 8. Shift */}
          <div className="dbs-perm-field">
            <label htmlFor="perm-shift">
              <span className="dbs-perm-label-text">
                <Sun size={14} />
                Shift
              </span>
              <span className="dbs-perm-subtext">Optional</span>
            </label>
            <div className="dbs-perm-input-wrap">
              <select
                id="perm-shift"
                value={shift}
                onChange={(e) => handleFieldChange("shift", e.target.value)}
              >
                <option value="">Select Shift (All)</option>
                <option value="1">Shift-1</option>
                <option value="2">Shift-2</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="dbs-perm-actions-row">
          <div className="dbs-perm-actions-left">
            {records.length > 0 ? (
              <span>
                Found <strong>{records.length}</strong> un-posted attendance session(s).
              </span>
            ) : (
              <span>Fill in required criteria to search faculty sessions.</span>
            )}
          </div>

          <div className="dbs-perm-actions-right">
            <button
              type="button"
              className="dbs-perm-btn dbs-perm-btn-outline"
              onClick={handleManualFetch}
              disabled={loadingData || !fromDate || !toDate || !programme}
              title="Refresh / Query records"
            >
              <RefreshCw
                size={16}
                className={loadingData ? "dbs-perm-spinner" : ""}
              />
              {loadingData ? "Fetching..." : "Query Records"}
            </button>

            <button
              type="button"
              className="dbs-perm-btn dbs-perm-btn-secondary"
              onClick={handleClear}
              disabled={isSaving}
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              type="button"
              className="dbs-perm-btn dbs-perm-btn-primary"
              onClick={() => handleSave()}
              disabled={isSaving || !hasLoaded || records.length === 0 || selectedIds.size === 0}
            >
              {isSaving ? (
                <Loader2 size={16} className="dbs-perm-spinner" />
              ) : (
                <Save size={16} />
              )}
              {isSaving
                ? "Saving..."
                : `Save Permissions (${selectedIds.size})`}
            </button>
          </div>
        </div>
      </div>

      {/* 3. KPI Statistics Overview Cards (Visible when records loaded) */}
      {hasLoaded && records.length > 0 && (
        <div className="dbs-perm-stats-grid">
          {/* Card 1: Total Sessions */}
          <div className="dbs-perm-stat-card total">
            <div className="dbs-perm-stat-info">
              <span className="dbs-perm-stat-label">Total Sessions</span>
              <span className="dbs-perm-stat-value">{stats.total}</span>
            </div>
            <div className="dbs-perm-stat-icon-wrapper">
              <Layers size={22} />
            </div>
          </div>

          {/* Card 2: Selected to Grant */}
          <div className="dbs-perm-stat-card selected">
            <div className="dbs-perm-stat-info">
              <span className="dbs-perm-stat-label">Selected to Grant</span>
              <span className="dbs-perm-stat-value">{stats.selected}</span>
            </div>
            <div className="dbs-perm-stat-icon-wrapper">
              <ShieldCheck size={22} />
            </div>
          </div>

          {/* Card 3: Pending Review */}
          <div className="dbs-perm-stat-card pending">
            <div className="dbs-perm-stat-info">
              <span className="dbs-perm-stat-label">Pending Review</span>
              <span className="dbs-perm-stat-value">{stats.pending}</span>
            </div>
            <div className="dbs-perm-stat-icon-wrapper">
              <Clock size={22} />
            </div>
          </div>

          {/* Card 4: Unique Faculty */}
          <div className="dbs-perm-stat-card faculty">
            <div className="dbs-perm-stat-info">
              <span className="dbs-perm-stat-label">Faculty Members</span>
              <span className="dbs-perm-stat-value">{stats.uniqueFaculty}</span>
            </div>
            <div className="dbs-perm-stat-icon-wrapper">
              <Users size={22} />
            </div>
          </div>
        </div>
      )}

      {/* 4. Matrix & Roster Table Card */}
      <div className="dbs-perm-matrix-card">
        {/* Toolbar */}
        <div className="dbs-perm-toolbar">
          <div className="dbs-perm-toolbar-left">
            <h3 className="dbs-perm-toolbar-title">
              <Users size={18} className="text-blue-600" />
              Faculty Permissions Matrix
            </h3>

            {/* Filter Tabs */}
            {hasLoaded && records.length > 0 && (
              <div className="dbs-perm-filter-tabs">
                <button
                  type="button"
                  className={`dbs-perm-tab-btn ${filterStatus === "all" ? "active" : ""}`}
                  onClick={() => setFilterStatus("all")}
                >
                  All
                  <span className="dbs-perm-tab-count">{records.length}</span>
                </button>
                <button
                  type="button"
                  className={`dbs-perm-tab-btn ${filterStatus === "selected" ? "active" : ""}`}
                  onClick={() => setFilterStatus("selected")}
                >
                  Selected
                  <span className="dbs-perm-tab-count">{selectedIds.size}</span>
                </button>
                <button
                  type="button"
                  className={`dbs-perm-tab-btn ${filterStatus === "pending" ? "active" : ""}`}
                  onClick={() => setFilterStatus("pending")}
                >
                  Pending
                  <span className="dbs-perm-tab-count">
                    {Math.max(0, records.length - selectedIds.size)}
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="dbs-perm-toolbar-right">
            {/* Quick Select Buttons */}
            {hasLoaded && records.length > 0 && (
              <div className="dbs-perm-quick-btns">
                <button
                  type="button"
                  className="dbs-perm-quick-btn"
                  onClick={handleSelectAll}
                  title="Select all records"
                >
                  <CheckSquare size={14} />
                  Select All
                </button>
                <button
                  type="button"
                  className="dbs-perm-quick-btn"
                  onClick={handleClearSelections}
                  title="Clear all selections"
                  disabled={selectedIds.size === 0}
                >
                  <Square size={14} />
                  Deselect
                </button>
                <button
                  type="button"
                  className="dbs-perm-quick-btn"
                  onClick={handleInvertSelection}
                  title="Invert current selections"
                >
                  Invert
                </button>
              </div>
            )}

            {/* Search Box */}
            <div className="dbs-perm-search-box">
              <Search size={15} className="dbs-perm-search-icon" />
              <input
                type="text"
                className="dbs-perm-search-input"
                placeholder="Search faculty, subject, period..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!hasLoaded || records.length === 0}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="dbs-perm-search-clear"
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Desktop View Switcher */}
            {hasLoaded && records.length > 0 && (
              <div className="dbs-perm-view-toggle">
                <button
                  type="button"
                  className={`dbs-perm-view-btn ${viewMode === "table" || viewMode === "auto" ? "active" : ""}`}
                  onClick={() => setViewMode("table")}
                  title="Table View"
                >
                  <TableIcon size={16} />
                </button>
                <button
                  type="button"
                  className={`dbs-perm-view-btn ${viewMode === "cards" ? "active" : ""}`}
                  onClick={() => setViewMode("cards")}
                  title="Cards View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content View: Loading, Empty, Table or Cards */}
        {loadingData ? (
          <div className="dbs-perm-empty">
            <Loader2 size={36} className="dbs-perm-spinner text-blue-600" />
            <h4>Loading Faculty Permissions</h4>
            <p>Scanning un-posted attendance sessions matching selected criteria...</p>
          </div>
        ) : !hasLoaded ? (
          <div className="dbs-perm-empty">
            <div className="dbs-perm-empty-icon">
              <Calendar size={28} />
            </div>
            <h4>Ready to Query Attendance Permissions</h4>
            <p>
              Please specify the <strong>From Date</strong>, <strong>To Date</strong>, and{" "}
              <strong>Programme</strong> in the filter card above to load faculty permissions.
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="dbs-perm-empty">
            <div className="dbs-perm-empty-icon">
              <ShieldCheck size={28} />
            </div>
            <h4>No Sessions Found</h4>
            <p>
              {searchTerm || filterStatus !== "all"
                ? "No faculty permission records match the active search query or filter tab."
                : "No un-posted attendance records found matching the specified parameters. All attendance sessions might already be posted."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Matrix Table */}
            <div
              className={`dbs-perm-table-wrap ${
                viewMode === "cards" ? "hidden" : viewMode === "auto" ? "auto-hide" : ""
              }`}
            >
              <table className="dbs-perm-table">
                <thead>
                  <tr>
                    <th style={{ width: "54px" }} className="dbs-text-center">
                      <input
                        type="checkbox"
                        className="dbs-perm-checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeSelected;
                        }}
                        onChange={handleToggleAll}
                        title="Toggle Visible All"
                      />
                    </th>
                    <th>Faculty Member</th>
                    <th>Subject &amp; Branch</th>
                    <th>Schedule &amp; Period</th>
                    <th style={{ width: "120px" }} className="dbs-text-center">
                      Permission
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    const { code, name, initials } = parseLecturer(item.lecturer);

                    return (
                      <tr
                        key={item.id}
                        className={isSelected ? "row-selected" : ""}
                        onClick={() => handleToggleRow(item.id)}
                      >
                        {/* Checkbox */}
                        <td
                          className="dbs-text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="dbs-perm-checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRow(item.id)}
                            aria-label={`Select ${name}`}
                          />
                        </td>

                        {/* Faculty Info */}
                        <td>
                          <div className="dbs-perm-faculty-cell">
                            <div className="dbs-perm-faculty-avatar">{initials}</div>
                            <div className="dbs-perm-faculty-info">
                              <span className="dbs-perm-faculty-name">{name}</span>
                              <span className="dbs-perm-code-pill">
                                ID: {code || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Subject & Branch Info */}
                        <td>
                          <div className="dbs-perm-subject-cell">
                            <span className="dbs-perm-subcode-pill">{item.subCode}</span>
                            {(item.branchName || item.course) && (
                              <span className="dbs-perm-subject-subtext">
                                {item.course ? `${item.course} • ` : ""}
                                {item.branchName || item.bsName}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Period & Schedule Info */}
                        <td>
                          <div className="dbs-perm-schedule-cell">
                            <div className="dbs-perm-period-pill">
                              <Clock size={11} />
                              <span>{formatPeriodDisplay(item.periodRange)}</span>
                            </div>
                            <div className="dbs-perm-schedule-meta">
                              {formatDateDisplay(item.date, item.day)}
                            </div>
                            {(item.sYear || item.semester || item.section) && (
                              <div className="dbs-perm-schedule-class">
                                {item.sYear ? `Yr ${item.sYear}` : ""}
                                {item.semester ? ` • Sem ${item.semester}` : ""}
                                {item.section ? ` • Sec ${item.section}` : ""}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status Pill */}
                        <td className="dbs-text-center">
                          {isSelected ? (
                            <span className="dbs-perm-status-pill granted">
                              <Check size={11} />
                              Granted
                            </span>
                          ) : (
                            <span className="dbs-perm-status-pill idle">Idle</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Compact Cards Grid */}
            <div
              className={`dbs-perm-cards-grid ${
                viewMode === "table" ? "hidden" : viewMode === "auto" ? "auto-show" : ""
              }`}
              style={{
                display: viewMode === "cards" ? "grid" : undefined,
              }}
            >
              {filteredRecords.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const { code, name, initials } = parseLecturer(item.lecturer);

                return (
                  <div
                    key={item.id}
                    className={`dbs-perm-mobile-card ${isSelected ? "card-selected" : ""}`}
                    onClick={() => handleToggleRow(item.id)}
                  >
                    {/* Card Top */}
                    <div className="dbs-perm-card-top">
                      <div className="dbs-perm-card-user">
                        <div className="dbs-perm-faculty-avatar">{initials}</div>
                        <div>
                          <div className="dbs-perm-faculty-name">{name}</div>
                          <span className="dbs-perm-code-pill">ID: {code || "N/A"}</span>
                        </div>
                      </div>

                      <div
                        className="dbs-perm-card-top-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isSelected ? (
                          <span className="dbs-perm-status-pill granted">
                            <Check size={11} />
                            Granted
                          </span>
                        ) : (
                          <span className="dbs-perm-status-pill idle">Idle</span>
                        )}
                        <input
                          type="checkbox"
                          className="dbs-perm-checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(item.id)}
                          aria-label={`Select ${name}`}
                        />
                      </div>
                    </div>

                    {/* Card Details Box */}
                    <div className="dbs-perm-card-details">
                      <div className="dbs-perm-card-row">
                        <span className="text-gray-500">Subject:</span>
                        <span className="dbs-perm-subcode-pill">{item.subCode}</span>
                      </div>

                      {(item.branchName || item.course) && (
                        <div className="dbs-perm-card-row">
                          <span className="text-gray-500">Branch:</span>
                          <span className="font-semibold text-gray-800 text-right">
                            {item.course ? `${item.course} - ` : ""}
                            {item.branchName || item.bsName}
                          </span>
                        </div>
                      )}

                      <div className="dbs-perm-card-row">
                        <span className="text-gray-500">Period:</span>
                        <div className="dbs-perm-period-pill">
                          <Clock size={11} />
                          <span>{formatPeriodDisplay(item.periodRange)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="dbs-perm-card-footer">
                      <span className="font-medium text-gray-700">
                        {formatDateDisplay(item.date, item.day)}
                      </span>
                      {(item.sYear || item.semester || item.section) && (
                        <span>
                          {item.sYear ? `Yr ${item.sYear}` : ""}
                          {item.semester ? ` • Sem ${item.semester}` : ""}
                          {item.section ? ` • Sec ${item.section}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary */}
            <div className="dbs-perm-footer">
              <div>
                Showing <strong>{filteredRecords.length}</strong> of{" "}
                <strong>{records.length}</strong> record(s)
              </div>
              <div>
                <strong>{selectedIds.size}</strong> faculty session(s) marked for permission grant
              </div>
            </div>
          </>
        )}
      </div>

      {/* 5. Sticky Floating Action Dock (Appears when any rows are selected) */}
      {selectedIds.size > 0 && (
        <div className="dbs-perm-floating-bar">
          <div className="dbs-perm-floating-text">
            <span className="dbs-perm-floating-badge">{selectedIds.size}</span>
            <span>Selected to Grant</span>
          </div>

          <div className="dbs-perm-floating-actions">
            <button
              type="button"
              className="dbs-perm-floating-btn-clear"
              onClick={handleClearSelections}
              title="Clear selections"
            >
              Clear
            </button>
            <button
              type="button"
              className="dbs-perm-floating-btn-save"
              onClick={() => handleSave()}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 size={15} className="dbs-perm-spinner" />
              ) : (
                <ShieldCheck size={15} />
              )}
              {isSaving ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPermissions;
