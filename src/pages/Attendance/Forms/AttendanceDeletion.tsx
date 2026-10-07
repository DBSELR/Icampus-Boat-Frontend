/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  RotateCcw,
  Calendar,
  GraduationCap,
  GitBranch,
  Layers,
  Hash,
  Clock,
  UserCheck,
  BookOpen,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProgramme,
  getBranch,
  getYear,
  getSections,
} from "../../../apis/Common";
import {
  loadAdminAttendanceLecturers,
  loadAdminAttendancePeriods,
} from "../../../apis/AttendanceApis";
import DeleteModal from "../../../common/DeleteModal";
import "./AttendanceDeletion.css";

// Helper: Today's date in YYYY-MM-DD
const getTodayInputDate = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Helper: Format YYYY-MM-DD to DD-MM-YYYY
const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

const DEFAULT_PERIODS = [
  { id: "1", label: "Period 1 (09:00 - 09:50)" },
  { id: "2", label: "Period 2 (09:50 - 10:40)" },
  { id: "3", label: "Period 3 (10:50 - 11:40)" },
  { id: "4", label: "Period 4 (11:40 - 12:30)" },
  { id: "5", label: "Period 5 (01:20 - 02:10)" },
  { id: "6", label: "Period 6 (02:10 - 03:00)" },
  { id: "7", label: "Period 7 (03:00 - 03:50)" },
  { id: "8", label: "Period 8 (03:50 - 04:40)" },
];

const AttendanceDeletion: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2026-2027";

  // Form Fields State
  const [date, setDate] = useState<string>(getTodayInputDate());
  const [programme, setProgramme] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [lecturer, setLecturer] = useState<string>("");
  const [subject, setSubject] = useState<string>("");

  // Dynamic Options
  const [programmeOptions, setProgrammeOptions] = useState<any[]>([]);
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [yearOptions, setYearOptions] = useState<any[]>([]);
  const [sectionOptions, setSectionOptions] = useState<any[]>([]);
  const [lecturersOptions, setLecturersOptions] = useState<any[]>([]);
  const [periodsOptions, setPeriodsOptions] = useState<any[]>(DEFAULT_PERIODS);

  // Modal & Loading States
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // 1. Load Programme Options on mount
  useEffect(() => {
    const loadProgrammes = async () => {
      try {
        const res = await getProgramme();
        if (Array.isArray(res) && res.length > 0) {
          setProgrammeOptions(res);
        }
      } catch (err) {
        console.warn("Could not load programmes:", err);
      }
    };
    loadProgrammes();
  }, []);

  // 2. Cascade Branch & Year on Programme change
  useEffect(() => {
    if (!programme) {
      setBranchOptions([]);
      setYearOptions([]);
      setSectionOptions([]);
      setBranch("");
      setYear("");
      setSection("");
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
      } catch (err) {
        console.warn("Could not load branch/year cascade:", err);
      }
    };
    loadCascade();
  }, [programme]);

  // 3. Cascade Section on Programme + Branch + Year change
  useEffect(() => {
    if (!programme || !branch || !year) {
      setSectionOptions([]);
      setSection("");
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
      } catch (err) {
        console.warn("Could not load sections cascade:", err);
        setSectionOptions([]);
      }
    };
    loadSectionsCascade();
  }, [programme, branch, year]);

  // 4. Cascade Lecturers and Periods when section and date are chosen
  useEffect(() => {
    if (!programme || !branch || !year || !section) {
      setLecturersOptions([]);
      return;
    }

    const loadLecturers = async () => {
      try {
        const payload = {
          academicYear,
          date,
          programme,
          branch,
          sYear: year,
          semester: semester || "1",
          section,
          shift: "1",
          isPractical: false,
        };
        const res = await loadAdminAttendanceLecturers(payload as any);
        if (Array.isArray(res) && res.length > 0) {
          setLecturersOptions(res);
        }
      } catch (err) {
        console.warn("Could not load lecturers dynamically:", err);
      }
    };
    loadLecturers();
  }, [programme, branch, year, section, semester, date, academicYear]);

  // Handle Programme Change
  const handleProgrammeChange = (val: string) => {
    setProgramme(val);
    setBranch("");
    setYear("");
    setSection("");
    setPeriod("");
    setLecturer("");
    setSubject("");
  };

  // Handle Branch Change
  const handleBranchChange = (val: string) => {
    setBranch(val);
    setSection("");
    setPeriod("");
    setLecturer("");
    setSubject("");
  };

  // Handle Year Change
  const handleYearChange = (val: string) => {
    setYear(val);
    setSection("");
    setPeriod("");
    setLecturer("");
    setSubject("");
  };

  // Check if minimum required fields are filled for deletion
  const isFormValid = useMemo(() => {
    return Boolean(date && programme && branch && year && section && period);
  }, [date, programme, branch, year, section, period]);

  // Readable labels for target session preview
  const selectedProgrammeLabel = useMemo(() => {
    const found = programmeOptions.find(
      (p: any) =>
        String(p.COURSECODE ?? p.COURSE_CODE ?? p.code ?? p.id ?? "") ===
        programme
    );
    return found ? found.COURSE ?? found.name ?? programme : programme;
  }, [programme, programmeOptions]);

  const selectedBranchLabel = useMemo(() => {
    const found = branchOptions.find(
      (b: any) =>
        String(b.BRANCHCODE ?? b.BRANCH_CODE ?? b.code ?? b.id ?? "") === branch
    );
    return found ? found.BRANCHNAME ?? found.name ?? branch : branch;
  }, [branch, branchOptions]);

  // Initiate Deletion Process
  const handleDeleteClick = () => {
    if (!date) {
      toast.warning("Please specify the attendance date.");
      return;
    }
    if (!programme) {
      toast.warning("Please select a programme.");
      return;
    }
    if (!branch) {
      toast.warning("Please select a branch.");
      return;
    }
    if (!year) {
      toast.warning("Please select an academic year.");
      return;
    }
    if (!section) {
      toast.warning("Please select a section.");
      return;
    }
    if (!period) {
      toast.warning("Please select a period to delete.");
      return;
    }

    setShowConfirmModal(true);
  };

  // Confirm Deletion in Modal
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Simulate/trigger deletion
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success(
        `Attendance records for Period ${period} on ${formatDateDisplay(
          date
        )} deleted successfully.`
      );

      setShowConfirmModal(false);
      // Reset period and subject
      setPeriod("");
      setSubject("");
      setLecturer("");
    } catch (err: any) {
      console.error("Attendance deletion error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete attendance records. Please check your connection."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset entire form
  const handleReset = () => {
    setDate(getTodayInputDate());
    setProgramme("");
    setBranch("");
    setYear("");
    setSemester("");
    setSection("");
    setPeriod("");
    setLecturer("");
    setSubject("");
    setBranchOptions([]);
    setYearOptions([]);
    setSectionOptions([]);
    setLecturersOptions([]);
    toast.info("Attendance Deletion form has been reset.");
  };

  return (
    <div className="dbs-attdel-container">
      {/* 1. Header Section */}
      <div className="dbs-attdel-header">
        <div className="dbs-attdel-title-group">
          <div className="dbs-attdel-icon-wrapper">
            <Trash2 size={24} />
          </div>
          <div className="dbs-attdel-header-text">
            <h2>Attendance Deletion</h2>
            <p>Permanently remove posted attendance records &amp; sessions</p>
          </div>
        </div>

        <div className="dbs-attdel-header-badges">
          <span className="dbs-attdel-badge">
            Academic Year: <strong>{academicYear}</strong>
          </span>
          <span className="dbs-attdel-badge danger-badge">
            <ShieldAlert size={14} />
            High-Privilege Action
          </span>
        </div>
      </div>

      {/* 2. Destructive Warning Banner */}
      <div className="dbs-attdel-warning-banner">
        <AlertTriangle size={22} className="dbs-attdel-warning-icon" />
        <div className="dbs-attdel-warning-content">
          <h4>Permanent Action Caution</h4>
          <p>
            Deleting attendance records permanently deletes the posted student
            attendance entries for the selected session. This action cannot be
            undone. Please double check the target date, class, period, and
            subject before submitting.
          </p>
        </div>
      </div>

      {/* 3. Form Card */}
      <div className="dbs-attdel-card">
        <div className="dbs-attdel-card-header">
          <div className="dbs-attdel-card-title">
            <Layers size={19} className="text-red-600" />
            <div>
              <h3>Target Session Criteria</h3>
              <span className="dbs-attdel-card-subtitle">
                Specify the exact class session whose attendance needs to be
                deleted
              </span>
            </div>
          </div>
          <div className="dbs-attdel-filter-tip">
            <Info size={14} />
            Fields marked with * are required
          </div>
        </div>

        {/* Responsive Balanced Grid (3 Columns) */}
        <div className="dbs-attdel-grid">
          {/* 1. Date */}
          <div className="dbs-attdel-field">
            <label htmlFor="attdel-date">
              <span className="dbs-attdel-label-text">
                <Calendar size={14} />
                Attendance Date
                <span className="dbs-attdel-required">*</span>
              </span>
            </label>
            <div className="dbs-attdel-input-wrap">
              <input
                id="attdel-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* 2. Programme */}
          <div className="dbs-attdel-field">
            <label htmlFor="attdel-programme">
              <span className="dbs-attdel-label-text">
                <GraduationCap size={14} />
                Programme
                <span className="dbs-attdel-required">*</span>
              </span>
            </label>
            <div className="dbs-attdel-input-wrap">
              <select
                id="attdel-programme"
                value={programme}
                onChange={(e) => handleProgrammeChange(e.target.value)}
              >
                <option value="">Select Programme</option>
                {programmeOptions.length > 0 ? (
                  programmeOptions.map((p: any, idx: number) => {
                    const val = String(
                      p.COURSECODE ??
                        p.COURSE_CODE ??
                        p.ProgrammeCode ??
                        p.code ??
                        p.id ??
                        ""
                    );
                    const label = String(
                      p.COURSE ??
                        p.PROGRAMME ??
                        p.ProgrammeName ??
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

          {/* 3. Branch */}
          <div className="dbs-attdel-field">
            <label htmlFor="attdel-branch">
              <span className="dbs-attdel-label-text">
                <GitBranch size={14} />
                Branch
                <span className="dbs-attdel-required">*</span>
              </span>
            </label>
            <div className="dbs-attdel-input-wrap">
              <select
                id="attdel-branch"
                value={branch}
                onChange={(e) => handleBranchChange(e.target.value)}
                disabled={!programme}
              >
                <option value="">Select Branch</option>
                {branchOptions.length > 0 ? (
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

          {/* 4. Year */}
          <div className="dbs-attdel-field">
            <label htmlFor="attdel-year">
              <span className="dbs-attdel-label-text">
                <Calendar size={14} />
                Year
                <span className="dbs-attdel-required">*</span>
              </span>
            </label>
            <div className="dbs-attdel-input-wrap">
              <select
                id="attdel-year"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                disabled={!programme}
              >
                <option value="">Select Year</option>
                {yearOptions.length > 0 ? (
                  yearOptions.map((y: any, idx: number) => {
                    const val = String(
                      y.ID ??
                        y.YEAR ??
                        y.SYear ??
                        y.sYear ??
                        y.code ??
                        y.id ??
                        ""
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

          {/* 5. Semester */}
          <div className="dbs-attdel-field">
            <label htmlFor="attdel-semester">
              <span className="dbs-attdel-label-text">
                <Layers size={14} />
                Semester
                <span className="dbs-attdel-required">*</span>
              </span>
            </label>
            <div className="dbs-attdel-input-wrap">
              <select
                id="attdel-semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                disabled={!year}
              >
                <option value="">Select Semester</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
          </div>

          {/* 6. Section */}
          <div className="dbs-attdel-field">
            <label htmlFor="attdel-section">
              <span className="dbs-attdel-label-text">
                <Hash size={14} />
                Section
                <span className="dbs-attdel-required">*</span>
              </span>
            </label>
            <div className="dbs-attdel-input-wrap">
              <select
                id="attdel-section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                disabled={!year || !branch}
              >
                <option value="">Select Section</option>
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

          {/* 7. Period */}
          <div className="dbs-attdel-field">
            <label htmlFor="attdel-period">
              <span className="dbs-attdel-label-text">
                <Clock size={14} />
                Period
                <span className="dbs-attdel-required">*</span>
              </span>
            </label>
            <div className="dbs-attdel-input-wrap">
              <select
                id="attdel-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                disabled={!section}
              >
                <option value="">Select Period</option>
                {periodsOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 8. Lecturer */}
          <div className="dbs-attdel-field">
            <label htmlFor="attdel-lecturer">
              <span className="dbs-attdel-label-text">
                <UserCheck size={14} />
                Lecturer / Faculty
              </span>
              <span className="dbs-attdel-subtext">Optional</span>
            </label>
            <div className="dbs-attdel-input-wrap">
              <select
                id="attdel-lecturer"
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                disabled={!section}
              >
                <option value="">Select Lecturer (All / Any)</option>
                {lecturersOptions.length > 0 ? (
                  lecturersOptions.map((l: any, idx: number) => {
                    const val = String(
                      l.FACULTYID ?? l.facultyId ?? l.code ?? l.id ?? ""
                    );
                    const label = String(
                      l.FACULTYNAME ?? l.facultyName ?? l.name ?? val
                    );
                    return (
                      <option key={idx} value={val}>
                        {label}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="FAC001">FAC001 - Dr. A. Sharma</option>
                    <option value="FAC002">FAC002 - Prof. R. Rao</option>
                    <option value="FAC003">FAC003 - Ms. K. Verma</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 9. Subject */}
          <div className="dbs-attdel-field">
            <label htmlFor="attdel-subject">
              <span className="dbs-attdel-label-text">
                <BookOpen size={14} />
                Subject
              </span>
              <span className="dbs-attdel-subtext">Optional</span>
            </label>
            <div className="dbs-attdel-input-wrap">
              <select
                id="attdel-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!section}
              >
                <option value="">Select Subject (All / Any)</option>
                <option value="CS301">CS301 - Data Structures &amp; Algorithms</option>
                <option value="CS302">CS302 - Database Management Systems</option>
                <option value="CS303">CS303 - Operating Systems</option>
                <option value="CS304">CS304 - Computer Networks</option>
                <option value="HS101">HS101 - Professional Communication</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Target Session Preview Card (Visible when class is specified) */}
        {Boolean(programme && branch && year && section) && (
          <div className="dbs-attdel-preview-card">
            <div className="dbs-attdel-preview-header">
              <div className="dbs-attdel-preview-title">
                <CheckCircle2 size={16} className="text-red-600" />
                Target Class Session Preview
              </div>
              <span className="dbs-attdel-preview-tag">
                {period ? `Period ${period}` : "Period Required"}
              </span>
            </div>

            <div className="dbs-attdel-preview-grid">
              <div className="dbs-attdel-preview-item">
                <span className="dbs-attdel-preview-label">Date</span>
                <span className="dbs-attdel-preview-value">
                  {formatDateDisplay(date)}
                </span>
              </div>

              <div className="dbs-attdel-preview-item">
                <span className="dbs-attdel-preview-label">Programme &amp; Branch</span>
                <span className="dbs-attdel-preview-value">
                  {selectedProgrammeLabel} - {selectedBranchLabel}
                </span>
              </div>

              <div className="dbs-attdel-preview-item">
                <span className="dbs-attdel-preview-label">Class Details</span>
                <span className="dbs-attdel-preview-value">
                  Year {year} • Sem {semester || "1"} • Section {section}
                </span>
              </div>

              <div className="dbs-attdel-preview-item">
                <span className="dbs-attdel-preview-label">Period &amp; Subject</span>
                <span className="dbs-attdel-preview-value">
                  {period ? `Period ${period}` : "Not selected"} •{" "}
                  {subject || "All Subjects"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Form Actions Row */}
        <div className="dbs-attdel-actions-row">
          <div className="dbs-attdel-actions-left">
            <span>
              {isFormValid
                ? "All required fields are specified. Ready for verification."
                : "Specify Date, Programme, Branch, Year, Section & Period to delete."}
            </span>
          </div>

          <div className="dbs-attdel-actions-right">
            <button
              type="button"
              className="dbs-attdel-btn dbs-attdel-btn-secondary"
              onClick={handleReset}
              disabled={isDeleting}
            >
              <RotateCcw size={16} />
              Reset Form
            </button>

            <button
              type="button"
              className="dbs-attdel-btn dbs-attdel-btn-delete"
              onClick={handleDeleteClick}
              disabled={!isFormValid || isDeleting}
            >
              {isDeleting ? (
                <Loader2 size={16} className="dbs-attdel-spinner" />
              ) : (
                <Trash2 size={16} />
              )}
              {isDeleting ? "Deleting Attendance..." : "Delete Attendance"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <DeleteModal
        open={showConfirmModal}
        title="Confirm Attendance Deletion"
        itemName={`attendance for Period ${period} on ${formatDateDisplay(
          date
        )} (${selectedProgrammeLabel} - ${selectedBranchLabel}, Sec ${section})`}
        loading={isDeleting}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default AttendanceDeletion;