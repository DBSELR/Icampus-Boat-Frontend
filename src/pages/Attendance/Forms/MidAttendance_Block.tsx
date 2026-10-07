import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  RotateCcw,
  Calendar,
  Clock,
  ShieldAlert,
  Loader2,
  Trash2,
  HelpCircle,
  GraduationCap,
  GitBranch,
  Layers,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { getProgramme, getBranch, getYear } from "../../../apis/Common";
import DeleteModal from "../../../common/DeleteModal";
import "./MidAttendance_Block.css";

interface BlockRecord {
  id: string;
  programme: string;
  programmeName: string;
  branch: string;
  branchName: string;
  year: string;
  semester: string;
  period: string;
  fromDate: string;
  toDate: string;
  status: "Blocked" | "Active";
}

const DEFAULT_PERIODS = [
  { id: "all", label: "All Periods" },
  { id: "1", label: "Period 1 (09:00 - 09:50)" },
  { id: "2", label: "Period 2 (09:50 - 10:40)" },
  { id: "3", label: "Period 3 (10:50 - 11:40)" },
  { id: "4", label: "Period 4 (11:40 - 12:30)" },
  { id: "5", label: "Period 5 (01:20 - 02:10)" },
  { id: "6", label: "Period 6 (02:10 - 03:00)" },
  { id: "7", label: "Period 7 (03:00 - 03:50)" },
  { id: "8", label: "Period 8 (03:50 - 04:40)" },
];

// Helper: Format YYYY-MM-DD to DD-MM-YYYY
const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

// Helper: Today's date YYYY-MM-DD
const getTodayInputDate = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const MidAttendanceBlock: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2025-2026";

  // Form Fields State
  const [selectedProgramme, setSelectedProgramme] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>(getTodayInputDate());
  const [toDate, setToDate] = useState<string>(getTodayInputDate());

  // Loading States
  const [loadingProgrammes, setLoadingProgrammes] = useState<boolean>(false);
  const [loadingBranches, setLoadingBranches] = useState<boolean>(false);
  const [loadingYears, setLoadingYears] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Options Lists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [programmeOptions, setProgrammeOptions] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [yearOptions, setYearOptions] = useState<any[]>([]);

  // Blocked Records Table
  const [records, setRecords] = useState<BlockRecord[]>([]);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<BlockRecord | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // 1. Initial Load: Fetch Programmes
  useEffect(() => {
    const fetchProgrammes = async () => {
      setLoadingProgrammes(true);
      try {
        const res = await getProgramme();
        if (Array.isArray(res) && res.length > 0) {
          setProgrammeOptions(res);
        }
      } catch (err) {
        console.warn("Could not load programmes:", err);
      } finally {
        setLoadingProgrammes(false);
      }
    };
    fetchProgrammes();
  }, []);

  // 2. Cascade Branch & Year on Programme change
  useEffect(() => {
    if (!selectedProgramme) {
      setBranchOptions([]);
      setYearOptions([]);
      setSelectedBranch("");
      setSelectedYear("");
      return;
    }

    const loadCascades = async () => {
      setLoadingBranches(true);
      setLoadingYears(true);
      try {
        const [bRes, yRes] = await Promise.allSettled([
          getBranch(selectedProgramme),
          getYear(selectedProgramme),
        ]);

        if (bRes.status === "fulfilled" && Array.isArray(bRes.value)) {
          setBranchOptions(bRes.value);
        } else {
          setBranchOptions([]);
        }

        if (yRes.status === "fulfilled" && Array.isArray(yRes.value)) {
          setYearOptions(yRes.value);
        } else {
          setYearOptions([]);
        }
      } catch (err) {
        console.warn("Could not load branch/year cascade:", err);
      } finally {
        setLoadingBranches(false);
        setLoadingYears(false);
      }
    };

    loadCascades();
  }, [selectedProgramme]);

  // Labels for target preview
  const selectedProgrammeLabel = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = programmeOptions.find(
      (p: any) =>
        String(p.COURSECODE ?? p.COURSE_CODE ?? p.code ?? p.id ?? "") ===
        selectedProgramme
    );
    return found ? found.COURSE ?? found.name ?? selectedProgramme : selectedProgramme;
  }, [selectedProgramme, programmeOptions]);

  const selectedBranchLabel = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = branchOptions.find(
      (b: any) =>
        String(b.BRANCHCODE ?? b.BRANCH_CODE ?? b.code ?? b.id ?? "") === selectedBranch
    );
    return found ? found.BRANCHNAME ?? found.name ?? selectedBranch : selectedBranch;
  }, [selectedBranch, branchOptions]);

  // Handle Programme Change
  const handleProgrammeChange = (val: string) => {
    setSelectedProgramme(val);
    setSelectedBranch("");
    setSelectedYear("");
  };

  // Check form validity
  const isFormValid = useMemo(() => {
    return Boolean(
      selectedProgramme &&
      selectedBranch &&
      selectedYear &&
      selectedSemester &&
      selectedPeriod &&
      fromDate &&
      toDate
    );
  }, [
    selectedProgramme,
    selectedBranch,
    selectedYear,
    selectedSemester,
    selectedPeriod,
    fromDate,
    toDate,
  ]);

  // Save Block
  const handleSave = async () => {
    if (!selectedProgramme) {
      toast.error("Please select a Programme.");
      return;
    }
    if (!selectedBranch) {
      toast.error("Please select a Branch.");
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
    if (!selectedPeriod) {
      toast.error("Please select a Period.");
      return;
    }
    if (!fromDate || !toDate) {
      toast.error("Please specify both From and To dates.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("From Date cannot be later than To Date.");
      return;
    }

    setSaving(true);
    try {
      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 600));

      const newRecord: BlockRecord = {
        id: `${Date.now()}`,
        programme: selectedProgramme,
        programmeName: selectedProgrammeLabel,
        branch: selectedBranch,
        branchName: selectedBranchLabel,
        year: selectedYear,
        semester: selectedSemester,
        period:
          selectedPeriod === "all"
            ? "All Periods"
            : `Period ${selectedPeriod}`,
        fromDate,
        toDate,
        status: "Blocked",
      };

      setRecords((prev) => [newRecord, ...prev]);
      toast.success("Mid Attendance Block saved successfully.");

      // Reset Period and Dates
      setSelectedPeriod("");
    } catch (err: unknown) {
      console.error("Error saving mid attendance block:", err);
      toast.error("Failed to save Mid Attendance Block.");
    } finally {
      setSaving(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    setSelectedProgramme("");
    setSelectedBranch("");
    setSelectedYear("");
    setSelectedSemester("");
    setSelectedPeriod("");
    setFromDate(getTodayInputDate());
    setToDate(getTodayInputDate());
    setBranchOptions([]);
    setYearOptions([]);
    toast.info("Mid Attendance Block form has been reset.");
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("Mid Attendance Block deleted successfully.");
      setDeleteTarget(null);
    } catch (err: unknown) {
      console.error("Error deleting mid attendance block:", err);
      toast.error("Failed to delete record.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dbs-midatt-container">
      {/* 1. Page Header (Period Adjustment UI Standard) */}
      <div className="dbs-midatt-header">
        <div className="dbs-midatt-title-group">
          <div className="dbs-midatt-icon-wrapper">
            <Clock size={24} />
          </div>
          <div className="dbs-midatt-header-text">
            <h2>Mid Attendance Block</h2>
            <p className="dbs-midatt-subtitle">
              Configure &amp; Manage Mid Attendance Block Restrictions
            </p>
          </div>
        </div>

        <div className="dbs-midatt-header-badges">
          <span className="dbs-midatt-badge">
            <Calendar size={14} />
            Academic Year: <strong>{academicYear}</strong>
          </span>
          <span className="dbs-midatt-badge dbs-midatt-badge-warning">
            <ShieldAlert size={14} />
            Attendance Restriction
          </span>
        </div>
      </div>

      {/* 2. Form Card */}
      <div className="dbs-midatt-form-card">
        <h3>Mid Attendance Block Details</h3>

        <div className="dbs-midatt-grid">
          {/* Programme */}
          <div className="dbs-midatt-input">
            <label htmlFor="midatt-programme">
              <span className="dbs-midatt-label-text">
                <GraduationCap size={14} />
                Programme
                <span className="dbs-midatt-required">*</span>
              </span>
              {loadingProgrammes && (
                <Loader2 size={13} className="animate-spin text-blue-600" />
              )}
            </label>
            <select
              id="midatt-programme"
              value={selectedProgramme}
              onChange={(e) => handleProgrammeChange(e.target.value)}
            >
              <option value="">Select Programme</option>
              {programmeOptions.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                programmeOptions.map((p: any, idx: number) => {
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

          {/* Branch */}
          <div className="dbs-midatt-input">
            <label htmlFor="midatt-branch">
              <span className="dbs-midatt-label-text">
                <GitBranch size={14} />
                Branch
                <span className="dbs-midatt-required">*</span>
              </span>
              {loadingBranches && (
                <Loader2 size={13} className="animate-spin text-blue-600" />
              )}
            </label>
            <select
              id="midatt-branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={!selectedProgramme}
            >
              <option value="">Select Branch</option>
              {branchOptions.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

          {/* Year */}
          <div className="dbs-midatt-input">
            <label htmlFor="midatt-year">
              <span className="dbs-midatt-label-text">
                <Calendar size={14} />
                Year
                <span className="dbs-midatt-required">*</span>
              </span>
              {loadingYears && (
                <Loader2 size={13} className="animate-spin text-blue-600" />
              )}
            </label>
            <select
              id="midatt-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={!selectedProgramme}
            >
              <option value="">Select Year</option>
              {yearOptions.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                yearOptions.map((y: any, idx: number) => {
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
          <div className="dbs-midatt-input">
            <label htmlFor="midatt-sem">
              <span className="dbs-midatt-label-text">
                <Layers size={14} />
                Semester
                <span className="dbs-midatt-required">*</span>
              </span>
            </label>
            <select
              id="midatt-sem"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="">Select Semester</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
            </select>
          </div>

          {/* Period */}
          <div className="dbs-midatt-input">
            <label htmlFor="midatt-period">
              <span className="dbs-midatt-label-text">
                <Clock size={14} />
                Period
                <span className="dbs-midatt-required">*</span>
              </span>
            </label>
            <select
              id="midatt-period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="">Select Period</option>
              {DEFAULT_PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* From & To Date (Dual Input Pairing) */}
          <div className="dbs-midatt-input">
            <label>
              <span className="dbs-midatt-label-text">
                <Calendar size={14} />
                From &amp; To Date
                <span className="dbs-midatt-required">*</span>
              </span>
            </label>
            <div className="dbs-midatt-dual-input">
              <div className="dbs-midatt-date-item">
                <input
                  type="date"
                  aria-label="From Date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <span className="dbs-midatt-date-hint">From Date</span>
              </div>
              <div className="dbs-midatt-date-item">
                <input
                  type="date"
                  aria-label="To Date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                <span className="dbs-midatt-date-hint">To Date</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Target Block Preview (Visible when fields are selected) */}
        {Boolean(selectedProgramme && selectedBranch && selectedYear) && (
          <div className="dbs-midatt-preview-card">
            <div className="dbs-midatt-preview-header">
              <div className="dbs-midatt-preview-title">
                <CheckCircle2 size={16} className="text-blue-600" />
                Target Mid Attendance Block Preview
              </div>
              <span className="dbs-midatt-preview-tag">
                {selectedPeriod
                  ? selectedPeriod === "all"
                    ? "All Periods"
                    : `Period ${selectedPeriod}`
                  : "Period Pending"}
              </span>
            </div>

            <div className="dbs-midatt-preview-grid">
              <div className="dbs-midatt-preview-item">
                <span className="dbs-midatt-preview-label">Programme &amp; Branch</span>
                <span className="dbs-midatt-preview-value">
                  {selectedProgrammeLabel} - {selectedBranchLabel}
                </span>
              </div>

              <div className="dbs-midatt-preview-item">
                <span className="dbs-midatt-preview-label">Year &amp; Semester</span>
                <span className="dbs-midatt-preview-value">
                  Year {selectedYear} • Sem {selectedSemester || "1"}
                </span>
              </div>

              <div className="dbs-midatt-preview-item">
                <span className="dbs-midatt-preview-label">Period</span>
                <span className="dbs-midatt-preview-value">
                  {selectedPeriod
                    ? selectedPeriod === "all"
                      ? "All Periods"
                      : `Period ${selectedPeriod}`
                    : "Not selected"}
                </span>
              </div>

              <div className="dbs-midatt-preview-item">
                <span className="dbs-midatt-preview-label">Block Date Range</span>
                <span className="dbs-midatt-preview-value">
                  {formatDateDisplay(fromDate)} to {formatDateDisplay(toDate)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Action Buttons Area */}
        <div className="dbs-midatt-actions">
          <button
            type="button"
            className="dbs-midatt-save-btn"
            onClick={handleSave}
            disabled={!isFormValid || saving}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? "Saving Block..." : "Save Block"}</span>
          </button>

          <button
            type="button"
            className="dbs-midatt-reset-btn"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw size={16} />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* 5. Blocked Mid Attendance Records Table Card */}
      <div className="dbs-midatt-table-card">
        <div className="dbs-midatt-table-header">
          <div>
            <h3>Blocked Mid Attendance Records</h3>
            <p className="dbs-midatt-table-subtitle">
              Configured mid attendance block restrictions for {academicYear}
            </p>
          </div>

          <div className="dbs-midatt-table-badges">
            <span className="dbs-midatt-badge dbs-midatt-badge-ay">
              AY: {academicYear}
            </span>
            <span className="dbs-midatt-badge dbs-midatt-badge-count">
              {records.length} Record{records.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="dbs-midatt-table-scroll">
          {records.length === 0 ? (
            <div className="dbs-midatt-empty-state">
              <HelpCircle className="dbs-midatt-empty-icon" />
              <div className="dbs-midatt-empty-title">No Records Found</div>
              <div className="dbs-midatt-empty-desc">
                No mid attendance blocks configured yet. Configure and save blocks
                using the form above.
              </div>
            </div>
          ) : (
            <table className="dbs-midatt-data-table">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Semester</th>
                  <th>Period</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{r.programmeName || r.programme}</td>
                    <td>{r.branchName || r.branch}</td>
                    <td className="dbs-midatt-td-center">Year {r.year}</td>
                    <td className="dbs-midatt-td-center">Sem {r.semester}</td>
                    <td className="dbs-midatt-td-center">{r.period}</td>
                    <td className="dbs-midatt-td-center">{formatDateDisplay(r.fromDate)}</td>
                    <td className="dbs-midatt-td-center">{formatDateDisplay(r.toDate)}</td>
                    <td className="dbs-midatt-td-center">
                      <span className="dbs-midatt-status-pill blocked">
                        <Ban size={12} />
                        {r.status}
                      </span>
                    </td>
                    <td className="dbs-midatt-td-center">
                      <button
                        type="button"
                        className="dbs-midatt-action-btn dbs-midatt-action-delete"
                        title="Delete Block"
                        onClick={() => setDeleteTarget(r)}
                      >
                        <Trash2 size={16} />
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
        title="Confirm Mid Attendance Block Deletion"
        itemName={
          deleteTarget
            ? `block restriction for ${deleteTarget.programmeName} (${deleteTarget.branchName}, Year ${deleteTarget.year} Sem ${deleteTarget.semester})`
            : undefined
        }
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default MidAttendanceBlock;
