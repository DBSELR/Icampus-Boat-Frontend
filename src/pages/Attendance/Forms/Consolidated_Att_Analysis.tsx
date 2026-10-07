/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import {
  Send,
  RotateCcw,
  ChartNoAxesCombined,
  Calendar,
  GraduationCap,
  GitBranch,
  Layers,
  Clock,
  BookOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  getACademicyear,
  getProgramme,
  getBranch,
  getRegulation,
} from "../../../apis/Common";
import "./Consolidated_Att_Analysis.css";

// Helper: Today's date in YYYY-MM-DD
const getTodayInputDate = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const ConsolidatedAttendanceAnalysis: React.FC = () => {
  const defaultAcdYr = localStorage.getItem("academicYear") || "2026-2027";

  // Form Fields State
  const [academicYear, setAcademicYear] = useState<string>(defaultAcdYr);
  const [programme, setProgramme] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [semType, setSemType] = useState<string>("Odd");
  const [semester, setSemester] = useState<string>("");
  const [regulation, setRegulation] = useState<string>("");
  const [cutoffDate, setCutoffDate] = useState<string>(getTodayInputDate());

  // Dynamic Options
  const [academicYearsList, setAcademicYearsList] = useState<any[]>([]);
  const [programmeOptions, setProgrammeOptions] = useState<any[]>([]);
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [regulationOptions, setRegulationOptions] = useState<any[]>([]);

  // Push & Analytics Result State
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushResults, setPushResults] = useState<{
    totalStudents: number;
    eligible: number;
    condonation: number;
    detained: number;
  } | null>(null);

  // 1. Initial Load: Academic Years, Programmes, Regulations
  useEffect(() => {
    const init = async () => {
      try {
        const [ayRes, pRes, rRes] = await Promise.all([
          getACademicyear(),
          getProgramme(),
          getRegulation(),
        ]);
        if (Array.isArray(ayRes) && ayRes.length > 0) {
          setAcademicYearsList(ayRes);
        }
        if (Array.isArray(pRes) && pRes.length > 0) {
          setProgrammeOptions(pRes);
        }
        if (Array.isArray(rRes) && rRes.length > 0) {
          setRegulationOptions(rRes);
        }
      } catch (err) {
        console.warn("Could not load initial lookups:", err);
      }
    };
    init();
  }, []);

  // 2. Cascade Branch when Programme changes
  useEffect(() => {
    if (!programme) {
      setBranchOptions([]);
      setBranch("");
      return;
    }
    const loadBranches = async () => {
      try {
        const bRes = await getBranch(programme, academicYear);
        if (Array.isArray(bRes)) setBranchOptions(bRes);
      } catch (err) {
        console.warn("Could not load branches:", err);
      }
    };
    loadBranches();
  }, [programme, academicYear]);

  // Compute available Semesters based on Sem Type
  const availableSemesters = useMemo(() => {
    if (semType === "Odd") {
      return [
        { val: "1", label: "Semester 1 (I Year)" },
        { val: "3", label: "Semester 3 (II Year)" },
        { val: "5", label: "Semester 5 (III Year)" },
        { val: "7", label: "Semester 7 (IV Year)" },
      ];
    } else if (semType === "Even") {
      return [
        { val: "2", label: "Semester 2 (I Year)" },
        { val: "4", label: "Semester 4 (II Year)" },
        { val: "6", label: "Semester 6 (III Year)" },
        { val: "8", label: "Semester 8 (IV Year)" },
      ];
    }
    return [
      { val: "1", label: "Semester 1" },
      { val: "2", label: "Semester 2" },
      { val: "3", label: "Semester 3" },
      { val: "4", label: "Semester 4" },
      { val: "5", label: "Semester 5" },
      { val: "6", label: "Semester 6" },
      { val: "7", label: "Semester 7" },
      { val: "8", label: "Semester 8" },
    ];
  }, [semType]);

  // Format label helpers for Preview
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

  // Form Validation
  const isFormValid = useMemo(() => {
    return Boolean(academicYear && programme && branch && semType && semester);
  }, [academicYear, programme, branch, semType, semester]);

  // Push Data Action
  const handlePushData = async () => {
    if (!isFormValid) {
      toast.warning("Please complete all required fields (*) before pushing data.");
      return;
    }

    setIsPushing(true);
    try {
      // Simulate backend push & aggregation processing
      await new Promise((resolve) => setTimeout(resolve, 900));

      setPushResults({
        totalStudents: 68,
        eligible: 54,
        condonation: 10,
        detained: 4,
      });

      toast.success(
        `Consolidated attendance pushed successfully for ${selectedProgrammeLabel} - ${selectedBranchLabel}, Sem ${semester}!`
      );
    } catch (err: any) {
      console.error("Push data error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to push consolidated attendance data."
      );
    } finally {
      setIsPushing(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    setAcademicYear(defaultAcdYr);
    setProgramme("");
    setBranch("");
    setSemType("Odd");
    setSemester("");
    setRegulation("");
    setCutoffDate(getTodayInputDate());
    setBranchOptions([]);
    setPushResults(null);
    toast.info("Form has been reset to defaults.");
  };

  return (
    <div className="dbs-cons-container">
      {/* 1. Header Section */}
      <div className="dbs-cons-header">
        <div className="dbs-cons-title-group">
          <div className="dbs-cons-icon-wrapper">
            <ChartNoAxesCombined size={26} />
          </div>
          <div className="dbs-cons-header-text">
            <h2>Consolidated Attendance Analysis</h2>
            <p>Aggregate, analyze, and push consolidated semester attendance metrics</p>
          </div>
        </div>

        <div className="dbs-cons-header-badges">
          <span className="dbs-cons-badge">
            Academic Year: <strong>{academicYear}</strong>
          </span>
          <span className="dbs-cons-badge active-badge">
            <TrendingUp size={14} />
            Analytics Engine Active
          </span>
        </div>
      </div>

      {/* 2. Informational Banner */}
      <div className="dbs-cons-info-banner">
        <Info size={22} className="dbs-cons-info-icon" />
        <div className="dbs-cons-info-content">
          <h4>Consolidated Attendance Synchronization</h4>
          <p>
            Consolidating attendance processes all posted timetable periods up to the
            selected cutoff date, computing cumulative attendance percentages for
            examination hall tickets, condonation lists, and detention thresholds.
          </p>
        </div>
      </div>

      {/* 3. Filter & Scope Card */}
      <div className="dbs-cons-card">
        <div className="dbs-cons-card-header">
          <div className="dbs-cons-card-title">
            <Layers size={19} className="text-blue-600" />
            <div>
              <h3>Analysis Scope Parameters</h3>
              <span className="dbs-cons-card-subtitle">
                Select target course, branch, and semester to consolidate
              </span>
            </div>
          </div>
          <div className="dbs-cons-filter-tip">
            Fields marked with * are required
          </div>
        </div>

        {/* Responsive Grid (3 Columns) */}
        <div className="dbs-cons-grid">
          {/* 1. Academic Year */}
          <div className="dbs-cons-field">
            <label htmlFor="cons-ay">
              <span className="dbs-cons-label-text">
                <Calendar size={14} />
                Academic Year
                <span className="dbs-cons-required">*</span>
              </span>
            </label>
            <div className="dbs-cons-input-wrap">
              <select
                id="cons-ay"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                {academicYearsList.length > 0 ? (
                  academicYearsList.map((ay: any, idx: number) => {
                    const val = String(ay.ACADEMICYEAR ?? ay.year ?? ay.id ?? "");
                    return (
                      <option key={idx} value={val}>
                        {val}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="2026-2027">2026-2027</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 2. Course / Programme */}
          <div className="dbs-cons-field">
            <label htmlFor="cons-programme">
              <span className="dbs-cons-label-text">
                <GraduationCap size={14} />
                Course / Programme
                <span className="dbs-cons-required">*</span>
              </span>
            </label>
            <div className="dbs-cons-input-wrap">
              <select
                id="cons-programme"
                value={programme}
                onChange={(e) => {
                  setProgramme(e.target.value);
                  setBranch("");
                  setPushResults(null);
                }}
              >
                <option value="">Select Programme</option>
                {programmeOptions.length > 0 ? (
                  programmeOptions.map((p: any, idx: number) => {
                    const val = String(
                      p.COURSECODE ?? p.COURSE_CODE ?? p.ProgrammeCode ?? p.code ?? p.id ?? ""
                    );
                    const label = String(
                      p.COURSE ?? p.PROGRAMME ?? p.ProgrammeName ?? p.name ?? val
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
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 3. Branch */}
          <div className="dbs-cons-field">
            <label htmlFor="cons-branch">
              <span className="dbs-cons-label-text">
                <GitBranch size={14} />
                Branch
                <span className="dbs-cons-required">*</span>
              </span>
            </label>
            <div className="dbs-cons-input-wrap">
              <select
                id="cons-branch"
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setPushResults(null);
                }}
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
                    <option value="02">02 - Electrical &amp; Electronics</option>
                    <option value="03">03 - Mechanical Engineering</option>
                    <option value="04">04 - Electronics &amp; Communication</option>
                    <option value="05">05 - Computer Science &amp; Eng.</option>
                    <option value="12">12 - Information Technology</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 4. Sem Type */}
          <div className="dbs-cons-field">
            <label htmlFor="cons-sem-type">
              <span className="dbs-cons-label-text">
                <Layers size={14} />
                Semester Type
                <span className="dbs-cons-required">*</span>
              </span>
            </label>
            <div className="dbs-cons-input-wrap">
              <select
                id="cons-sem-type"
                value={semType}
                onChange={(e) => {
                  setSemType(e.target.value);
                  setSemester("");
                  setPushResults(null);
                }}
              >
                <option value="Odd">Odd Semester (1, 3, 5, 7)</option>
                <option value="Even">Even Semester (2, 4, 6, 8)</option>
              </select>
            </div>
          </div>

          {/* 5. Semester */}
          <div className="dbs-cons-field">
            <label htmlFor="cons-semester">
              <span className="dbs-cons-label-text">
                <Clock size={14} />
                Semester
                <span className="dbs-cons-required">*</span>
              </span>
            </label>
            <div className="dbs-cons-input-wrap">
              <select
                id="cons-semester"
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setPushResults(null);
                }}
              >
                <option value="">Select Semester</option>
                {availableSemesters.map((s) => (
                  <option key={s.val} value={s.val}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. Regulation */}
          <div className="dbs-cons-field">
            <label htmlFor="cons-regulation">
              <span className="dbs-cons-label-text">
                <BookOpen size={14} />
                Regulation
              </span>
              <span className="dbs-cons-subtext">Optional</span>
            </label>
            <div className="dbs-cons-input-wrap">
              <select
                id="cons-regulation"
                value={regulation}
                onChange={(e) => setRegulation(e.target.value)}
              >
                <option value="">Select Regulation (All)</option>
                {regulationOptions.length > 0 ? (
                  regulationOptions.map((r: any, idx: number) => {
                    const val = String(r.REGULATION ?? r.name ?? r.id ?? "");
                    return (
                      <option key={idx} value={val}>
                        {val}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="R23">R23 Regulation</option>
                    <option value="R20">R20 Regulation</option>
                    <option value="R19">R19 Regulation</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 7. Cutoff Date */}
          <div className="dbs-cons-field">
            <label htmlFor="cons-cutoff">
              <span className="dbs-cons-label-text">
                <Calendar size={14} />
                Cutoff Date
              </span>
              <span className="dbs-cons-subtext">Optional</span>
            </label>
            <div className="dbs-cons-input-wrap">
              <input
                id="cons-cutoff"
                type="date"
                value={cutoffDate}
                onChange={(e) => setCutoffDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 4. Target Class Session Preview */}
        {Boolean(programme && branch && semester) && (
          <div className="dbs-cons-preview-card">
            <div className="dbs-cons-preview-header">
              <div className="dbs-cons-preview-title">
                <CheckCircle2 size={16} className="text-blue-600" />
                Target Consolidation Scope Preview
              </div>
              <span className="dbs-cons-preview-tag">
                {academicYear} • Sem {semester}
              </span>
            </div>

            <div className="dbs-cons-preview-grid">
              <div className="dbs-cons-preview-item">
                <span className="dbs-cons-preview-label">Academic Year</span>
                <span className="dbs-cons-preview-value">{academicYear}</span>
              </div>

              <div className="dbs-cons-preview-item">
                <span className="dbs-cons-preview-label">Course &amp; Branch</span>
                <span className="dbs-cons-preview-value">
                  {selectedProgrammeLabel} - {selectedBranchLabel}
                </span>
              </div>

              <div className="dbs-cons-preview-item">
                <span className="dbs-cons-preview-label">Semester Scope</span>
                <span className="dbs-cons-preview-value">
                  {semType} Term • Semester {semester}
                </span>
              </div>

              <div className="dbs-cons-preview-item">
                <span className="dbs-cons-preview-label">Regulation / Cutoff</span>
                <span className="dbs-cons-preview-value">
                  {regulation || "Standard"} • {cutoffDate || "Today"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Form Actions */}
        <div className="dbs-cons-actions-row">
          <div className="dbs-cons-actions-left">
            <span>
              {isFormValid
                ? "Parameters configured. Ready to push consolidated attendance data."
                : "Select Course, Branch, Semester Type, and Semester to proceed."}
            </span>
          </div>

          <div className="dbs-cons-actions-right">
            <button
              type="button"
              className="dbs-cons-btn dbs-cons-btn-secondary"
              onClick={handleReset}
              disabled={isPushing}
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              type="button"
              className="dbs-cons-btn dbs-cons-btn-push"
              onClick={handlePushData}
              disabled={!isFormValid || isPushing}
            >
              {isPushing ? (
                <Loader2 size={16} className="dbs-cons-spinner" />
              ) : (
                <Send size={16} />
              )}
              {isPushing ? "Pushing Data..." : "Push Data"}
            </button>
          </div>
        </div>
      </div>

      {/* 6. Push Analytics KPI Summary Cards (Displayed after pushing) */}
      {pushResults && (
        <div className="dbs-cons-stats-grid">
          {/* Card 1: Total Enrolled */}
          <div className="dbs-cons-stat-card total">
            <div className="dbs-cons-stat-info">
              <span className="dbs-cons-stat-label">Total Students</span>
              <span className="dbs-cons-stat-value">
                {pushResults.totalStudents}
              </span>
            </div>
            <div className="dbs-cons-stat-icon-wrapper">
              <Users size={22} />
            </div>
          </div>

          {/* Card 2: Eligible (>= 75%) */}
          <div className="dbs-cons-stat-card eligible">
            <div className="dbs-cons-stat-info">
              <span className="dbs-cons-stat-label">Eligible (≥ 75%)</span>
              <span className="dbs-cons-stat-value">{pushResults.eligible}</span>
            </div>
            <div className="dbs-cons-stat-icon-wrapper">
              <CheckCircle2 size={22} />
            </div>
          </div>

          {/* Card 3: Condonation (65% - 74%) */}
          <div className="dbs-cons-stat-card condonation">
            <div className="dbs-cons-stat-info">
              <span className="dbs-cons-stat-label">Condonation (65%-74%)</span>
              <span className="dbs-cons-stat-value">
                {pushResults.condonation}
              </span>
            </div>
            <div className="dbs-cons-stat-icon-wrapper">
              <AlertTriangle size={22} />
            </div>
          </div>

          {/* Card 4: Detained (< 65%) */}
          <div className="dbs-cons-stat-card detained">
            <div className="dbs-cons-stat-info">
              <span className="dbs-cons-stat-label">Shortage (&lt; 65%)</span>
              <span className="dbs-cons-stat-value">{pushResults.detained}</span>
            </div>
            <div className="dbs-cons-stat-icon-wrapper">
              <XCircle size={22} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsolidatedAttendanceAnalysis;
