/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CalendarClock,
  RotateCcw,
  Loader2,
  SlidersHorizontal,
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { getAcademicYear } from "../../../apis/Common";
import {
  getEditEFRMProgrammes,
  getEditEFRMBranches,
  getEditEFRMYears,
  getEditEFRMSections,
  getEditEFRMPeriods,
  getEditEFRMTimeTableData,
  updateEditEFRMDateApi,
  EditEFRMProgrammeItem,
  EditEFRMBranchItem,
  EditEFRMYearItem,
  EditEFRMSectionItem,
  EditEFRMPeriodItem,
  EditEFRMTimeTableItem,
  UpdateEFromDatePayload,
} from "../../../apis/AttendanceApis";
import "./EditEFRMDate.css";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SEMESTER_OPTIONS = [
  { code: "1", label: "Semester 1" },
  { code: "2", label: "Semester 2" },
];

/**
 * Format raw date string (e.g. 2026-06-29T00:00:00) into DD-MM-YYYY
 */
const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return "-";
  try {
    const clean = dateStr.split("T")[0];
    const parts = clean.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return clean;
  } catch {
    return dateStr;
  }
};

/**
 * Convert raw date string into YYYY-MM-DD for HTML <input type="date">
 */
const toInputDateFormat = (dateStr?: string): string => {
  if (!dateStr) return "";
  try {
    const clean = dateStr.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      return clean;
    }
    const parts = clean.split("-");
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return clean;
  } catch {
    return "";
  }
};

/**
 * Convert HTML date (YYYY-MM-DD) into DD-MM-YYYY for backend update payload
 */
const formatPayloadDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const clean = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const parts = clean.split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY e.g. 30-09-2026
  }
  return clean;
};

const EditEFRMDate: React.FC = () => {
  // Academic Year State
  const [academicYear, setAcademicYear] = useState<string>(() => {
    return (
      localStorage.getItem("academicYear") ||
      localStorage.getItem("academic_year") ||
      "2026-2027"
    );
  });
  const [academicYearList, setAcademicYearList] = useState<string[]>([]);

  // User ID
  const userId =
    localStorage.getItem("user") ||
    localStorage.getItem("userId") ||
    "NT125";

  // Form collapse state
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);

  // Form Field States
  const [day, setDay] = useState<string>("");
  const [programme, setProgramme] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [periodFrom, setPeriodFrom] = useState<string>("");
  const [newEFRMDate, setNewEFRMDate] = useState<string>("");

  // Data Options Lists
  const [programmesList, setProgrammesList] = useState<EditEFRMProgrammeItem[]>([]);
  const [yearsList, setYearsList] = useState<EditEFRMYearItem[]>([]);
  const [branchesList, setBranchesList] = useState<EditEFRMBranchItem[]>([]);
  const [sectionsList, setSectionsList] = useState<EditEFRMSectionItem[]>([]);
  const [periodsList, setPeriodsList] = useState<EditEFRMPeriodItem[]>([]);

  // Timetable Grid Data & Row Selection
  const [tableRows, setTableRows] = useState<EditEFRMTimeTableItem[]>([]);
  const [selectedRow, setSelectedRow] = useState<EditEFRMTimeTableItem | null>(null);
  const [tableSearch, setTableSearch] = useState<string>("");

  // Loading States
  const [loadingProgrammes, setLoadingProgrammes] = useState<boolean>(false);
  const [loadingBranchesYears, setLoadingBranchesYears] = useState<boolean>(false);
  const [loadingSections, setLoadingSections] = useState<boolean>(false);
  const [loadingPeriods, setLoadingPeriods] = useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Fetch Academic Year list on mount
  useEffect(() => {
    const fetchAyList = async () => {
      try {
        const res = await getAcademicYear();
        const list = Array.isArray(res)
          ? res
              .map((item: any) =>
                typeof item === "string"
                  ? item
                  : item.ACADEMICYEAR ||
                    item.AcademicYear ||
                    item.academicYear ||
                    item.AY ||
                    ""
              )
              .filter(Boolean)
          : [];
        if (list.length > 0) {
          setAcademicYearList(list);
          if (!list.includes(academicYear)) {
            setAcademicYear(list[0]);
          }
        }
      } catch {
        // ignore
      }
    };
    fetchAyList();
  }, [academicYear]);

  // 2. Fetch Programmes when academicYear changes
  useEffect(() => {
    let isMounted = true;
    const loadProgrammes = async () => {
      setLoadingProgrammes(true);
      try {
        const data = await getEditEFRMProgrammes(academicYear);
        if (isMounted) {
          setProgrammesList(data || []);
        }
      } catch (err) {
        console.error("Error loading programmes:", err);
        if (isMounted) setProgrammesList([]);
      } finally {
        if (isMounted) setLoadingProgrammes(false);
      }
    };

    loadProgrammes();
    return () => {
      isMounted = false;
    };
  }, [academicYear]);

  // 3. Fetch Branches and Years when Programme changes
  useEffect(() => {
    if (!programme) {
      setBranchesList([]);
      setYearsList([]);
      return;
    }

    let isMounted = true;
    const loadBranchesAndYears = async () => {
      setLoadingBranchesYears(true);
      try {
        const [branchData, yearData] = await Promise.all([
          getEditEFRMBranches(programme, academicYear),
          getEditEFRMYears(programme, academicYear),
        ]);

        if (isMounted) {
          setBranchesList(branchData || []);
          setYearsList(yearData || []);
        }
      } catch (err) {
        console.error("Error loading branches and years:", err);
        if (isMounted) {
          setBranchesList([]);
          setYearsList([]);
        }
      } finally {
        if (isMounted) setLoadingBranchesYears(false);
      }
    };

    loadBranchesAndYears();
    return () => {
      isMounted = false;
    };
  }, [programme, academicYear]);

  // 4. Fetch Sections when Programme, Branch, Year, and Semester are all selected
  useEffect(() => {
    if (!programme || !branch || !year || !semester) {
      setSectionsList([]);
      return;
    }

    let isMounted = true;
    const loadSections = async () => {
      setLoadingSections(true);
      try {
        const data = await getEditEFRMSections({
          academicYear,
          programme,
          branch,
          sYear: year,
          semester,
        });
        if (isMounted) {
          setSectionsList(data || []);
        }
      } catch (err) {
        console.error("Error loading sections:", err);
        if (isMounted) setSectionsList([]);
      } finally {
        if (isMounted) setLoadingSections(false);
      }
    };

    loadSections();
    return () => {
      isMounted = false;
    };
  }, [programme, branch, year, semester, academicYear]);

  // 5. Fetch Periods when all criteria are selected
  useEffect(() => {
    if (!programme || !branch || !year || !semester || !section || !day) {
      setPeriodsList([]);
      return;
    }

    let isMounted = true;
    const loadPeriods = async () => {
      setLoadingPeriods(true);
      try {
        const data = await getEditEFRMPeriods({
          shift: "1",
          stream: "1",
          academicYear,
          programme,
          branch,
          sYear: year,
          semester,
          section,
          day,
        });
        if (isMounted) {
          setPeriodsList(data || []);
        }
      } catch (err) {
        console.error("Error loading periods:", err);
        if (isMounted) setPeriodsList([]);
      } finally {
        if (isMounted) setLoadingPeriods(false);
      }
    };

    loadPeriods();
    return () => {
      isMounted = false;
    };
  }, [programme, branch, year, semester, section, day, academicYear]);

  // 6. Fetch Timetable Grid Data
  // Triggered as soon as Day, Course, Year, and Semester are selected
  const loadTimetableGrid = useCallback(async () => {
    if (!day || !programme || !year || !semester) {
      setTableRows([]);
      return;
    }

    setLoadingTable(true);
    try {
      const data = await getEditEFRMTimeTableData({
        shift: "1",
        stream: "1",
        academicYear,
        programme,
        branch: branch || "",
        sYear: year,
        semester,
        section: section || "",
        day,
        periodFrom: "", // Empty string loads all records for that day & criteria
      });

      if (Array.isArray(data)) {
        setTableRows(data);
      } else {
        setTableRows([]);
      }
    } catch (err) {
      console.error("Error loading timetable grid data:", err);
      setTableRows([]);
    } finally {
      setLoadingTable(false);
    }
  }, [day, programme, year, semester, branch, section, academicYear]);

  useEffect(() => {
    loadTimetableGrid();
  }, [loadTimetableGrid]);

  // 7. Table Row Click Handler
  const handleRowClick = async (row: EditEFRMTimeTableItem) => {
    setSelectedRow(row);

    if (row.Day) setDay(row.Day);

    // Match branch in branchesList
    if (row.Branch && branchesList.length > 0) {
      const bFound = branchesList.find(
        (b) =>
          b.BranchName?.toLowerCase().includes(row.Branch!.toLowerCase()) ||
          b.Branchcode === row.Branch
      );
      if (bFound && bFound.Branchcode) {
        setBranch(bFound.Branchcode);

        // Fetch sections for this branch
        try {
          const secs = await getEditEFRMSections({
            academicYear,
            programme,
            branch: bFound.Branchcode,
            sYear: String(row.year || year),
            semester: String(row.Sem || semester),
          });
          setSectionsList(secs || []);
        } catch {
          // ignore
        }
      }
    }

    if (row.Section) setSection(row.Section);
    if (row.FRM_TO_PERIODS) setPeriodFrom(row.FRM_TO_PERIODS);

    if (row.EFRMDate) {
      setNewEFRMDate(toInputDateFormat(row.EFRMDate));
    }
  };

  // Form Field Handlers
  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDay(e.target.value);
    setPeriodFrom("");
    setNewEFRMDate("");
    setSelectedRow(null);
  };

  const handleProgrammeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProgramme(e.target.value);
    setYear("");
    setSemester("");
    setBranch("");
    setSection("");
    setPeriodFrom("");
    setNewEFRMDate("");
    setSelectedRow(null);
    setTableRows([]);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
    setSection("");
    setPeriodFrom("");
    setNewEFRMDate("");
    setSelectedRow(null);
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSemester(e.target.value);
    setSection("");
    setPeriodFrom("");
    setNewEFRMDate("");
    setSelectedRow(null);
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBranch(e.target.value);
    setSection("");
    setPeriodFrom("");
    setNewEFRMDate("");
    setSelectedRow(null);
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSection(e.target.value);
    setPeriodFrom("");
    setNewEFRMDate("");
    setSelectedRow(null);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPeriodFrom(val);
    if (val && tableRows.length > 0) {
      const match = tableRows.find(
        (r) =>
          r.FRM_TO_PERIODS === val &&
          (!section || r.Section === section) &&
          (!branch ||
            !r.Branch ||
            branchesList.some(
              (b) =>
                b.Branchcode === branch &&
                b.BranchName?.toLowerCase().includes(r.Branch!.toLowerCase())
            ))
      );
      if (match) {
        setSelectedRow(match);
        if (match.EFRMDate) {
          setNewEFRMDate(toInputDateFormat(match.EFRMDate));
        }
      }
    }
  };

  // Reset Form
  const handleReset = () => {
    setDay("");
    setProgramme("");
    setYear("");
    setSemester("");
    setBranch("");
    setSection("");
    setPeriodFrom("");
    setNewEFRMDate("");
    setSelectedRow(null);
    setTableRows([]);
    setBranchesList([]);
    setYearsList([]);
    setSectionsList([]);
    setPeriodsList([]);
    setTableSearch("");
    toast.info("Form filters and records have been reset.");
  };

  // Submit Update EFRM Date
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!day) {
      toast.warning("Please select a Day.");
      return;
    }
    if (!programme) {
      toast.warning("Please select a Course.");
      return;
    }
    if (!year) {
      toast.warning("Please select a Year.");
      return;
    }
    if (!semester) {
      toast.warning("Please select a Semester.");
      return;
    }

    // Determine active branch, section, period
    const activeBranch =
      branch ||
      (selectedRow?.Branch &&
        branchesList.find((b) =>
          b.BranchName?.toLowerCase().includes(selectedRow.Branch!.toLowerCase())
        )?.Branchcode) ||
      "";

    const activeSection = section || selectedRow?.Section || "";
    const activePeriod = periodFrom || selectedRow?.FRM_TO_PERIODS || "";

    if (!activeBranch) {
      toast.warning("Please select a Branch or click a row from the table.");
      return;
    }
    if (!activeSection) {
      toast.warning("Please select a Section or click a row from the table.");
      return;
    }
    if (!activePeriod) {
      toast.warning("Please select FromToPeriod or click a row from the table.");
      return;
    }
    if (!newEFRMDate) {
      toast.warning("Please select a New EFRM Date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdateEFromDatePayload = {
        shift: "1",
        stream: "1",
        academicYear,
        programme,
        branch: activeBranch,
        sYear: year,
        semester,
        section: activeSection,
        day,
        periodFrom: activePeriod,
        newEFromDate: formatPayloadDate(newEFRMDate),
        userId,
      };

      const res = await updateEditEFRMDateApi(payload);

      if (res?.success !== false) {
        toast.success(
          res?.message ||
            `Effective-from date updated successfully to ${formatPayloadDate(
              newEFRMDate
            )}!`
        );
        // Refresh grid table
        await loadTimetableGrid();
      } else {
        toast.error(res?.message || "Failed to update EFRM Date.");
      }
    } catch (err: any) {
      console.error("Error updating EFRM Date:", err);
      toast.error(
        err?.response?.data?.message ||
          "An error occurred while updating the EFRM Date."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered rows based on quick search
  const filteredRows = useMemo(() => {
    if (!tableSearch.trim()) return tableRows;
    const q = tableSearch.toLowerCase().trim();
    return tableRows.filter((r) => {
      return (
        r.Course?.toLowerCase().includes(q) ||
        r.Branch?.toLowerCase().includes(q) ||
        r.Section?.toLowerCase().includes(q) ||
        r.Lecturer?.toLowerCase().includes(q) ||
        r.Sub_Code?.toLowerCase().includes(q) ||
        r.FRM_TO_PERIODS?.toLowerCase().includes(q) ||
        formatDisplayDate(r.EFRMDate).toLowerCase().includes(q)
      );
    });
  }, [tableRows, tableSearch]);

  return (
    <div className="dbs-efrm-container">
      {/* ================= Page Header ================= */}
      <div className="dbs-efrm-header">
        <div className="dbs-efrm-title-group">
          <div className="dbs-efrm-icon-wrapper">
            <CalendarClock size={24} />
          </div>
          <div>
            <h2>Edit EFRM Date</h2>
            <p>Update Effective From (EFRM) date for scheduled timetable periods</p>
          </div>
        </div>

        <div className="dbs-efrm-badges">
          <div className="dbs-efrm-ay-badge">
            <span>Academic Year:</span>
            {academicYearList.length > 0 ? (
              <select
                value={academicYear}
                onChange={(e) => {
                  const newAy = e.target.value;
                  setAcademicYear(newAy);
                  localStorage.setItem("academicYear", newAy);
                  handleReset();
                }}
                className="dbs-efrm-ay-select"
                title="Select Academic Year"
              >
                {academicYearList.map((ay, idx) => (
                  <option key={idx} value={ay}>
                    {ay}
                  </option>
                ))}
              </select>
            ) : (
              <strong>{academicYear}</strong>
            )}
          </div>
        </div>
      </div>

      {/* ================= Criteria Form Card ================= */}
      <div className="dbs-efrm-card">
        <div className="dbs-efrm-card-header">
          <h3>
            <SlidersHorizontal size={18} />
            <span>EFRM Details &amp; Criteria</span>
          </h3>
          <button
            type="button"
            className="dbs-card-collapse-btn"
            onClick={() => setIsFormCollapsed((prev) => !prev)}
            title={isFormCollapsed ? "Expand Form" : "Collapse Form"}
          >
            {isFormCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>

        {!isFormCollapsed && (
          <form onSubmit={handleUpdate} className="dbs-efrm-form-body">
            <div className="dbs-efrm-grid">
              {/* Field 1: Day */}
              <div className="dbs-efrm-input-box">
                <label>
                  Day <span className="dbs-required-star">*</span>
                </label>
                <select value={day} onChange={handleDayChange}>
                  <option value="">Select Day</option>
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Course */}
              <div className="dbs-efrm-input-box">
                <label>
                  Course <span className="dbs-required-star">*</span>
                </label>
                <select
                  value={programme}
                  onChange={handleProgrammeChange}
                  disabled={loadingProgrammes}
                >
                  <option value="">
                    {loadingProgrammes ? "Loading Courses..." : "Select Course"}
                  </option>
                  {programmesList.map((item) => (
                    <option key={item.Coursecode} value={item.Coursecode}>
                      {item.Course}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: Year & Semester (Double Select) */}
              <div className="dbs-efrm-input-box dbs-efrm-double-box">
                <label>
                  Year &amp; Semester <span className="dbs-required-star">*</span>
                </label>
                <div className="dbs-efrm-double-inputs">
                  <select
                    value={year}
                    onChange={handleYearChange}
                    disabled={!programme || loadingBranchesYears}
                    title="Select Year"
                  >
                    <option value="">
                      {loadingBranchesYears ? "Loading..." : "Select Year"}
                    </option>
                    {yearsList.map((item) => (
                      <option key={item.ID} value={item.ID}>
                        {item.DATA}
                      </option>
                    ))}
                  </select>

                  <select
                    value={semester}
                    onChange={handleSemesterChange}
                    disabled={!programme}
                    title="Select Semester"
                  >
                    <option value="">Select Semester</option>
                    {SEMESTER_OPTIONS.map((sem) => (
                      <option key={sem.code} value={sem.code}>
                        {sem.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 4: Branch & Section (Double Select) */}
              <div className="dbs-efrm-input-box dbs-efrm-double-box">
                <label>
                  Branch &amp; Section <span className="dbs-required-star">*</span>
                </label>
                <div className="dbs-efrm-double-inputs">
                  <select
                    value={branch}
                    onChange={handleBranchChange}
                    disabled={!programme || loadingBranchesYears}
                    title="Select Branch"
                  >
                    <option value="">
                      {loadingBranchesYears ? "Loading..." : "Select Branch"}
                    </option>
                    {branchesList.map((item) => (
                      <option key={item.Branchcode} value={item.Branchcode}>
                        {item.BranchName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={section}
                    onChange={handleSectionChange}
                    disabled={!programme || !branch || !year || !semester || loadingSections}
                    title="Select Section"
                  >
                    <option value="">
                      {loadingSections ? "Loading..." : "Select Section"}
                    </option>
                    {sectionsList.map((item) => (
                      <option key={item.Section} value={item.Section}>
                        Section {item.Section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 5: FromToPeriod */}
              <div className="dbs-efrm-input-box">
                <label>
                  FromToPeriod <span className="dbs-required-star">*</span>
                </label>
                <select
                  value={periodFrom}
                  onChange={handlePeriodChange}
                  disabled={periodsList.length === 0 && tableRows.length === 0}
                >
                  <option value="">
                    {loadingPeriods ? "Loading Periods..." : "Select Period"}
                  </option>
                  {periodsList.length > 0
                    ? periodsList.map((item, idx) => (
                        <option key={idx} value={item.FRM_TO_PERIODS}>
                          {item.FRM_TO_PERIODS}
                        </option>
                      ))
                    : // Fallback to unique periods from loaded timetable rows
                      Array.from(
                        new Set(
                          tableRows
                            .map((r) => r.FRM_TO_PERIODS)
                            .filter((p): p is string => Boolean(p))
                        )
                      ).map((p, idx) => (
                        <option key={idx} value={p}>
                          {p}
                        </option>
                      ))}
                </select>
              </div>

              {/* Field 6: New EFRMDate */}
              <div className="dbs-efrm-input-box">
                <label>
                  New EFRM Date <span className="dbs-required-star">*</span>
                </label>
                <input
                  type="date"
                  value={newEFRMDate}
                  onChange={(e) => setNewEFRMDate(e.target.value)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>

            {/* Actions Row */}
            <div className="dbs-efrm-actions-row">
              <button
                type="button"
                className="dbs-efrm-btn-secondary"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                className="dbs-efrm-btn-primary"
                disabled={isSubmitting || !day || !programme || !year || !semester}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="dbs-spin" size={16} />
                    <span>Updating Date...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck size={16} />
                    <span>Edit EFRM Date</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ================= Timetable Grid Card (10 Columns strictly following Application Theme) ================= */}
      {day && programme && year && semester && (
        <div className="dbs-efrm-table-card">
          <div className="dbs-efrm-table-card-header">
            <div className="dbs-efrm-table-title-group">
              <CalendarDays size={20} />
              <div>
                <h3>Timetable Schedule for {day}</h3>
                <p>Click any row to select its period and edit its EFRM Date</p>
              </div>
            </div>

            <div className="dbs-efrm-table-tools">
              <span className="dbs-efrm-count-pill">
                {filteredRows.length} Record{filteredRows.length !== 1 ? "s" : ""}
              </span>

              <div className="dbs-efrm-search-input-wrapper">
                <Search size={16} className="dbs-search-icon" />
                <input
                  type="text"
                  placeholder="Search branch, section, faculty, subcode..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="dbs-table-search-field"
                />
              </div>
            </div>
          </div>

          <div className="dbs-efrm-table-wrapper">
            {loadingTable ? (
              <div className="dbs-table-loading-box">
                <Loader2 className="dbs-spin" size={28} />
                <span>Loading timetable schedule for {day}...</span>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="dbs-table-empty-box">
                <AlertCircle size={32} />
                <p>No timetable records found matching the selected criteria.</p>
              </div>
            ) : (
              <table className="dbs-efrm-theme-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Branch</th>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>Section</th>
                    <th>Day</th>
                    <th>FacultyId</th>
                    <th>SubCode</th>
                    <th>FromToPeriods</th>
                    <th>EFRM Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, idx) => {
                    const isSelected =
                      selectedRow === row ||
                      (periodFrom === row.FRM_TO_PERIODS &&
                        section === row.Section);

                    return (
                      <tr
                        key={idx}
                        className={isSelected ? "dbs-row-selected" : ""}
                        onClick={() => handleRowClick(row)}
                        title="Click to select this period for editing"
                      >
                        <td>
                          <span className="dbs-course-badge">{row.Course || "-"}</span>
                        </td>
                        <td>
                          <strong>{row.Branch || "-"}</strong>
                        </td>
                        <td style={{ textAlign: "center" }}>{row.year ?? "-"}</td>
                        <td style={{ textAlign: "center" }}>{row.Sem ?? "-"}</td>
                        <td style={{ textAlign: "center" }}>
                          <span className="dbs-section-badge">{row.Section || "-"}</span>
                        </td>
                        <td>{row.Day || "-"}</td>
                        <td>
                          <span className="dbs-faculty-cell">{row.Lecturer || "-"}</span>
                        </td>
                        <td>
                          <strong className="dbs-subcode-cell">{row.Sub_Code || "-"}</strong>
                        </td>
                        <td>
                          <span className="dbs-period-chip">
                            <Clock size={12} />
                            <span>{row.FRM_TO_PERIODS || "-"}</span>
                          </span>
                        </td>
                        <td>
                          <span className="dbs-efrm-date-chip">
                            {isSelected && <CheckCircle2 size={13} />}
                            {formatDisplayDate(row.EFRMDate)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEFRMDate;
