import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  RotateCcw,
  Calendar,
  CalendarOff,
  CalendarCheck,
  CalendarRange,
  GraduationCap,
  Layers,
  HelpCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getProgramme, getYear } from "../../../apis/Common";
import DeleteModal from "../../../common/DeleteModal";
import "./AttendancePostingDates.css";

export interface AttendancePostingRecord {
  id: string;
  academicYear: string;
  programme: string;
  programmeName: string;
  year: string;
  semester: string;
  ayStartDate: string;
  attendanceStopDate: string;
  ayEndDate: string;
  releaseDates: boolean;
}

// Helper: Format YYYY-MM-DD to DD-MM-YYYY
const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

// Default initial sample records for preview
const INITIAL_RECORDS: AttendancePostingRecord[] = [
  {
    id: "rec-1",
    academicYear: "2025-2026",
    programme: "01",
    programmeName: "B.Tech - Computer Science & Eng.",
    year: "4",
    semester: "1",
    ayStartDate: "2025-07-01",
    attendanceStopDate: "2025-11-15",
    ayEndDate: "2025-11-30",
    releaseDates: true,
  },
  {
    id: "rec-2",
    academicYear: "2025-2026",
    programme: "01",
    programmeName: "B.Tech - Electronics & Comm.",
    year: "3",
    semester: "1",
    ayStartDate: "2025-07-15",
    attendanceStopDate: "2025-11-20",
    ayEndDate: "2025-12-05",
    releaseDates: false,
  },
];

const StopAttendancePostingDates: React.FC = () => {
  const currentAcademicYear =
    localStorage.getItem("academicYear") || "2025-2026";

  // Form Field States
  const [selectedProgramme, setSelectedProgramme] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [ayStartDate, setAyStartDate] = useState<string>("");
  const [attendanceStopDate, setAttendanceStopDate] = useState<string>("");
  const [ayEndDate, setAyEndDate] = useState<string>("");
  const [releaseDates, setReleaseDates] = useState<boolean>(false);

  // Edit Mode Tracking
  const [editingId, setEditingId] = useState<string | null>(null);

  // Loading States
  const [loadingProgrammes, setLoadingProgrammes] = useState<boolean>(false);
  const [loadingYears, setLoadingYears] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Options Lists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [programmes, setProgrammes] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [years, setYears] = useState<any[]>([]);

  // Records Table State
  const [records, setRecords] = useState<AttendancePostingRecord[]>(INITIAL_RECORDS);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] =
    useState<AttendancePostingRecord | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Table Search Filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 1. Fetch Programmes on Mount
  useEffect(() => {
    const fetchProgrammes = async () => {
      setLoadingProgrammes(true);
      try {
        const res = await getProgramme();
        if (Array.isArray(res) && res.length > 0) {
          setProgrammes(res);
        }
      } catch (err) {
        console.warn("Could not load programmes:", err);
      } finally {
        setLoadingProgrammes(false);
      }
    };
    fetchProgrammes();
  }, []);

  // 2. Cascade Year on Programme Change
  useEffect(() => {
    if (!selectedProgramme) {
      setYears([]);
      setSelectedYear("");
      return;
    }

    const fetchYears = async () => {
      setLoadingYears(true);
      try {
        const res = await getYear(selectedProgramme);
        if (Array.isArray(res) && res.length > 0) {
          setYears(res);
        } else {
          setYears([]);
        }
      } catch (err) {
        console.warn("Could not load years:", err);
        setYears([]);
      } finally {
        setLoadingYears(false);
      }
    };

    fetchYears();
  }, [selectedProgramme]);

  // Selected Programme Display Label
  const selectedProgrammeLabel = useMemo(() => {
    if (!selectedProgramme) return "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = programmes.find(
      (p: any) =>
        String(p.COURSECODE ?? p.COURSE_CODE ?? p.code ?? p.id ?? "") ===
        selectedProgramme
    );
    return found ? found.COURSE ?? found.name ?? selectedProgramme : selectedProgramme;
  }, [selectedProgramme, programmes]);

  // Form Reset
  const handleReset = () => {
    setSelectedProgramme("");
    setSelectedYear("");
    setSelectedSemester("");
    setAyStartDate("");
    setAttendanceStopDate("");
    setAyEndDate("");
    setReleaseDates(false);
    setEditingId(null);
  };

  // Save / Update Handler
  const handleSave = async () => {
    if (!selectedProgramme) {
      toast.error("Please select a Programme.");
      return;
    }
    if (!selectedYear) {
      toast.error("Please select a Year.");
      return;
    }
    if (!selectedSemester) {
      toast.error("Please select a Semester.");
      return;
    }
    if (!ayStartDate) {
      toast.error("Please select A Y Start Date.");
      return;
    }
    if (!attendanceStopDate) {
      toast.error("Please select Attendance Stop Date.");
      return;
    }
    if (!ayEndDate) {
      toast.error("Please select A Y End Date.");
      return;
    }

    // Date validations
    const start = new Date(ayStartDate);
    const stop = new Date(attendanceStopDate);
    const end = new Date(ayEndDate);

    if (start > stop) {
      toast.error("A Y Start Date cannot be after Attendance Stop Date.");
      return;
    }
    if (stop > end) {
      toast.error("Attendance Stop Date cannot be after A Y End Date.");
      return;
    }

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (editingId) {
        // Update existing record
        setRecords((prev) =>
          prev.map((rec) =>
            rec.id === editingId
              ? {
                  ...rec,
                  programme: selectedProgramme,
                  programmeName: selectedProgrammeLabel,
                  year: selectedYear,
                  semester: selectedSemester,
                  ayStartDate,
                  attendanceStopDate,
                  ayEndDate,
                  releaseDates,
                }
              : rec
          )
        );
        toast.success("Attendance Posting Dates updated successfully.");
      } else {
        // Create new record
        const newRecord: AttendancePostingRecord = {
          id: `rec-${Date.now()}`,
          academicYear: currentAcademicYear,
          programme: selectedProgramme,
          programmeName: selectedProgrammeLabel,
          year: selectedYear,
          semester: selectedSemester,
          ayStartDate,
          attendanceStopDate,
          ayEndDate,
          releaseDates,
        };
        setRecords((prev) => [newRecord, ...prev]);
        toast.success("Attendance Posting Dates saved successfully.");
      }

      handleReset();
    } catch (err) {
      console.error("Save Error", err);
      toast.error("Failed to save attendance posting dates.");
    } finally {
      setSaving(false);
    }
  };

  // Populate Form for Editing
  const handleEdit = (record: AttendancePostingRecord) => {
    setEditingId(record.id);
    setSelectedProgramme(record.programme);
    setSelectedYear(record.year);
    setSelectedSemester(record.semester);
    setAyStartDate(record.ayStartDate);
    setAttendanceStopDate(record.attendanceStopDate);
    setAyEndDate(record.ayEndDate);
    setReleaseDates(record.releaseDates);

    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Record loaded into form for editing.");
  };

  // Delete Record Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("Attendance Posting Date record deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete Error", err);
      toast.error("Failed to delete record.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Records for Table
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const query = searchQuery.toLowerCase();
    return records.filter(
      (r) =>
        r.programmeName.toLowerCase().includes(query) ||
        r.academicYear.toLowerCase().includes(query) ||
        `year ${r.year}`.toLowerCase().includes(query) ||
        `sem ${r.semester}`.toLowerCase().includes(query)
    );
  }, [records, searchQuery]);

  return (
    <div className="dbs-groupchange-container dbs-attendance-posting-container">
      {/* 1. Page Header */}
      <div className="dbs-admissions-form-header dbs-posting-header">
        <div className="dbs-posting-title-group">
          <div className="dbs-posting-icon-wrapper">
            <CalendarOff size={24} />
          </div>
          <div>
            <h2>Stop Attendance Posting Dates</h2>
            <p>Configure academic attendance cutoffs and release dates</p>
          </div>
        </div>

        <div className="dbs-posting-header-badges">
          <span className="dbs-posting-badge">
            <Clock size={14} />
            Academic Year: <strong>{currentAcademicYear}</strong>
          </span>
          <span className="dbs-posting-badge dbs-posting-badge-policy">
            <Radio size={14} />
            Attendance Posting Policy
          </span>
        </div>
      </div>

      {/* 2. Main Form Card */}
      <div className="dbs-admissions-stepper-form-card">
        <div className="dbs-form-card">
          <div className="dbs-form-card-title-row">
            <div className="dbs-form-card-title">
              <CalendarRange size={18} className="dbs-card-title-icon" />
              <h3>
                {editingId
                  ? "Edit Attendance Posting Dates"
                  : "Attendance Posting Dates Configuration"}
              </h3>
            </div>
            {editingId && (
              <span className="dbs-editing-badge">Editing Mode</span>
            )}
          </div>

          {/* Form Grid */}
          <div className="dbs-timetable-grid dbs-posting-grid">
            {/* Programme */}
            <div className="dbs-input-box">
              <label htmlFor="post-programme">
                <span className="dbs-input-label-inner">
                  <GraduationCap size={14} />
                  Programme
                  <span className="dbs-required-star">*</span>
                </span>
                {loadingProgrammes && (
                  <Loader2 size={13} className="animate-spin text-blue-600" />
                )}
              </label>

              <select
                id="post-programme"
                value={selectedProgramme}
                onChange={(e) => {
                  setSelectedProgramme(e.target.value);
                  setSelectedYear("");
                }}
              >
                <option value="">Select Programme</option>
                {programmes.length > 0 ? (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  programmes.map((p: any, idx: number) => {
                    const val = String(
                      p.COURSECODE ?? p.COURSE_CODE ?? p.code ?? p.id ?? ""
                    );
                    const label = String(
                      p.COURSE ?? p.PROGRAMME ?? p.name ?? val
                    );
                    return (
                      <option key={idx} value={val}>
                        {val && val !== label ? `${val} - ${label}` : label}
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

            {/* Studying Year */}
            <div className="dbs-input-box">
              <label htmlFor="post-year">
                <span className="dbs-input-label-inner">
                  <Calendar size={14} />
                  Studying Year
                  <span className="dbs-required-star">*</span>
                </span>
                {loadingYears && (
                  <Loader2 size={13} className="animate-spin text-blue-600" />
                )}
              </label>

              <select
                id="post-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Select Year</option>
                {years.length > 0 ? (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  years.map((y: any, idx: number) => {
                    const val = String(
                      y.ID ?? y.YEAR ?? y.SYear ?? y.code ?? y.id ?? ""
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

            {/* Semester */}
            <div className="dbs-input-box">
              <label htmlFor="post-semester">
                <span className="dbs-input-label-inner">
                  <Layers size={14} />
                  Semester
                  <span className="dbs-required-star">*</span>
                </span>
              </label>

              <select
                id="post-semester"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="">Select Semester</option>
                <option value="1">1st Semester (Sem I)</option>
                <option value="2">2nd Semester (Sem II)</option>
              </select>
            </div>

            {/* A Y Start Date */}
            <div className="dbs-input-box">
              <label htmlFor="post-start-date">
                <span className="dbs-input-label-inner">
                  <CalendarCheck size={14} />
                  A Y Start Date
                  <span className="dbs-required-star">*</span>
                </span>
              </label>

              <input
                id="post-start-date"
                type="date"
                value={ayStartDate}
                onChange={(e) => setAyStartDate(e.target.value)}
              />
            </div>

            {/* Attendance Stop Date */}
            <div className="dbs-input-box dbs-input-cutoff">
              <label htmlFor="post-stop-date">
                <span className="dbs-input-label-inner text-red-600">
                  <CalendarOff size={14} />
                  Attendance Stop Date
                  <span className="dbs-required-star">*</span>
                </span>
                <span className="dbs-label-hint">Cutoff</span>
              </label>

              <input
                id="post-stop-date"
                type="date"
                value={attendanceStopDate}
                onChange={(e) => setAttendanceStopDate(e.target.value)}
              />
            </div>

            {/* A Y End Date */}
            <div className="dbs-input-box">
              <label htmlFor="post-end-date">
                <span className="dbs-input-label-inner">
                  <Calendar size={14} />
                  A Y End Date
                  <span className="dbs-required-star">*</span>
                </span>
              </label>

              <input
                id="post-end-date"
                type="date"
                value={ayEndDate}
                onChange={(e) => setAyEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Target Configuration Preview (Visible when fields are filled) */}
          {Boolean(selectedProgramme && selectedYear && ayStartDate && attendanceStopDate) && (
            <div className="dbs-posting-preview-card">
              <div className="dbs-posting-preview-header">
                <div className="dbs-posting-preview-title">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  Target Attendance Posting Schedule Preview
                </div>
                <span
                  className={`dbs-posting-preview-tag ${
                    releaseDates ? "released" : "draft"
                  }`}
                >
                  {releaseDates ? "Dates Release Active" : "Unreleased / Draft"}
                </span>
              </div>

              <div className="dbs-posting-preview-grid">
                <div className="dbs-posting-preview-item">
                  <span className="dbs-posting-preview-label">Programme</span>
                  <span className="dbs-posting-preview-value">
                    {selectedProgrammeLabel || "Selected Programme"}
                  </span>
                </div>

                <div className="dbs-posting-preview-item">
                  <span className="dbs-posting-preview-label">Year &amp; Semester</span>
                  <span className="dbs-posting-preview-value">
                    Year {selectedYear || "-"} • Sem {selectedSemester || "-"}
                  </span>
                </div>

                <div className="dbs-posting-preview-item">
                  <span className="dbs-posting-preview-label">Academic Duration</span>
                  <span className="dbs-posting-preview-value">
                    {formatDateDisplay(ayStartDate)} to {formatDateDisplay(ayEndDate)}
                  </span>
                </div>

                <div className="dbs-posting-preview-item">
                  <span className="dbs-posting-preview-label text-red-600">
                    Attendance Stop Date
                  </span>
                  <span className="dbs-posting-preview-value text-red-600 font-bold">
                    {formatDateDisplay(attendanceStopDate)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Release Dates Toggle & Form Action Footer */}
          <div className="dbs-form-footer-bar">
            {/* Release Dates Interactive Toggle */}
            <div
              className={`dbs-release-toggle-card ${
                releaseDates ? "is-active" : ""
              }`}
              onClick={() => setReleaseDates(!releaseDates)}
            >
              <div className="dbs-toggle-switch">
                <input
                  type="checkbox"
                  id="release-dates-toggle"
                  checked={releaseDates}
                  onChange={(e) => setReleaseDates(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="dbs-toggle-slider" />
              </div>

              <div className="dbs-toggle-info">
                <label htmlFor="release-dates-toggle" className="dbs-toggle-title">
                  Release Dates to Portals
                </label>
                <span className="dbs-toggle-desc">
                  {releaseDates
                    ? "Dates are published and visible to faculty & students"
                    : "Dates are saved in draft mode (hidden from portals)"}
                </span>
              </div>

              <span
                className={`dbs-release-status-chip ${
                  releaseDates ? "chip-active" : "chip-draft"
                }`}
              >
                {releaseDates ? "Released" : "Draft"}
              </span>
            </div>

            {/* Actions: Cancel & Save */}
            <div className="dbs-form-actions-row">
              <button
                type="button"
                className="dbs-form-cancel-btn"
                onClick={handleReset}
                disabled={saving}
              >
                <RotateCcw size={16} />
                Cancel
              </button>

              <button
                type="button"
                className="dbs-form-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Dates"
                  : "Save Dates"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Table / Records Card */}
      <div className="dbs-dashboard-card dbs-datatable-card dbs-posting-table-card">
        <div className="dbs-datatable-header-area">
          <div>
            <h3>Attendance Posting Dates List</h3>
            <p>Configured attendance cutoff dates and release status</p>
          </div>

          <div className="dbs-table-header-meta">
            <span className="dbs-table-count-badge">
              {filteredRecords.length} Record{filteredRecords.length !== 1 ? "s" : ""}
            </span>

            {records.length > 0 && (
              <input
                type="text"
                className="dbs-table-quick-search"
                placeholder="Search programme, year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="dbs-table-container">
          {filteredRecords.length === 0 ? (
            <div className="dbs-empty-state">
              <div className="dbs-empty-state-icon-wrap">
                <HelpCircle className="dbs-empty-state-icon" />
              </div>
              <div className="dbs-empty-state-title">No Records Found</div>
              <div className="dbs-empty-state-desc">
                {searchQuery
                  ? "No matching records found. Try adjusting your search query."
                  : "Add attendance posting dates using the form above to configure stop dates."}
              </div>
            </div>
          ) : (
            <table className="dbs-data-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Programme / Course</th>
                  <th>Studying Year</th>
                  <th>Semester</th>
                  <th>A Y Start Date</th>
                  <th>Attendance Stop Date</th>
                  <th>A Y End Date</th>
                  <th>Release Status</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="dbs-ay-pill">{item.academicYear}</span>
                    </td>
                    <td className="dbs-programme-cell">{item.programmeName}</td>
                    <td className="dbs-cell-center">Year {item.year}</td>
                    <td className="dbs-cell-center">
                      Sem {item.semester === "1" ? "I" : "II"}
                    </td>
                    <td className="dbs-cell-center">
                      {formatDateDisplay(item.ayStartDate)}
                    </td>
                    <td className="dbs-cell-center">
                      <span className="dbs-cutoff-pill">
                        {formatDateDisplay(item.attendanceStopDate)}
                      </span>
                    </td>
                    <td className="dbs-cell-center">
                      {formatDateDisplay(item.ayEndDate)}
                    </td>
                    <td className="dbs-cell-center">
                      <span
                        className={`dbs-status-badge ${
                          item.releaseDates ? "status-released" : "status-draft"
                        }`}
                      >
                        {item.releaseDates ? "Released" : "Draft"}
                      </span>
                    </td>
                    <td className="dbs-cell-center">
                      <button
                        type="button"
                        className="dbs-btn-edit"
                        title="Edit Record"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit3 size={15} />
                      </button>
                    </td>
                    <td className="dbs-cell-center">
                      <button
                        type="button"
                        className="dbs-btn-delete"
                        title="Delete Record"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={Boolean(deleteTarget)}
        title="Confirm Deletion"
        itemName={
          deleteTarget
            ? `attendance stop date for ${deleteTarget.programmeName} (Year ${deleteTarget.year} Sem ${deleteTarget.semester})`
            : undefined
        }
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default StopAttendancePostingDates;
