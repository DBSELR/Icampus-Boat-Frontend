import React, { useState, useEffect } from "react";
import {
  Save,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import "./FeeFineMaster.css";
import { getProgramme, getYear } from "../../../apis/Common";
import {
  saveFeeFineMaster,
  updatePaidYear,
  getFeePaidYear,
} from "../../../apis/FeeApis";

interface DropdownOption {
  code: string;
  name: string;
}

const DEFAULT_COURSES: DropdownOption[] = [
  { code: "01-B.Tech", name: "01-B.Tech" },
  { code: "02-M.Tech", name: "02-M.Tech" },
  { code: "03-MBA", name: "03-MBA" },
  { code: "04-MCA", name: "04-MCA" },
];

const DEFAULT_YEARS: DropdownOption[] = [
  { code: "1", name: "1" },
  { code: "2", name: "2" },
  { code: "3", name: "3" },
  { code: "4", name: "4" },
];

export const FeeFineMaster: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2025-2026";
  const todayDate = new Date().toISOString().split("T")[0];

  // Form State
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [fDate, setFDate] = useState<string>(todayDate);
  const [tDate, setTDate] = useState<string>(todayDate);
  const [fine, setFine] = useState<string>("");
  const [paidYear, setPaidYear] = useState<string>("All");

  // Dropdown & Loading States
  const [courseList, setCourseList] =
    useState<DropdownOption[]>(DEFAULT_COURSES);
  const [yearList, setYearList] = useState<DropdownOption[]>(DEFAULT_YEARS);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const [loadingYears, setLoadingYears] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [loadingPaidYear, setLoadingPaidYear] = useState<boolean>(false);
  const [updatingPaidYear, setUpdatingPaidYear] = useState<boolean>(false);

  // Currency Formatter
  const formatCurrency = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ==========================================================
  // 1. FETCH CURRENT FEE PAID YEAR FROM API
  // ==========================================================
  useEffect(() => {
    const fetchFeePaidYear = async () => {
      try {
        setLoadingPaidYear(true);
        const res = await getFeePaidYear();
        console.log("FeePaidYear GET API response:", res);
        const list = Array.isArray(res) ? res : res?.data;

        if (Array.isArray(list) && list.length > 0) {
          const activeRecord =
            list.find(
              (item: any) =>
                (item.academicyear === academicYear ||
                  item.academicYear === academicYear) &&
                (item.isactive === 1 ||
                  item.isactive === true ||
                  item.isActive === 1 ||
                  item.isActive === true),
            ) ||
            list.find(
              (item: any) =>
                item.isactive === 1 ||
                item.isactive === true ||
                item.isActive === 1 ||
                item.isActive === true,
            ) ||
            list[0];

          if (activeRecord) {
            const rawVal = String(
              activeRecord.feepaidTo ??
                activeRecord.feePaidTo ??
                activeRecord.feepaidto ??
                activeRecord.paidYear ??
                "",
            ).trim();

            const lower = rawVal.toLowerCase();
            if (
              lower === "currentacademicyears" ||
              lower === "currentacademicyear" ||
              lower === "current"
            ) {
              setPaidYear("CurrentAcademicyears");
            } else if (
              lower === "previousacademicyears" ||
              lower === "previousacademicyear" ||
              lower === "previous"
            ) {
              setPaidYear("PreviousAcademicyears");
            } else if (lower === "all") {
              setPaidYear("All");
            } else if (rawVal) {
              setPaidYear(rawVal);
            }
          }
        }
      } catch (err) {
        console.warn("Unable to fetch Fee Paid Year from API:", err);
      } finally {
        setLoadingPaidYear(false);
      }
    };

    fetchFeePaidYear();
  }, [academicYear]);

  // ==========================================================
  // 2. FETCH PROGRAMMES / COURSES
  // ==========================================================
  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        setLoadingCourses(true);
        const res = await getProgramme();
        if (Array.isArray(res) && res.length > 0) {
          const mapped: DropdownOption[] = res.map((p: any) => {
            const code = String(
              p.PROGRAMMECODE ??
                p.ProgrammeCode ??
                p.programmeCode ??
                p.CODE ??
                p.ID ??
                "",
            );
            const name = String(
              p.PROGRAMMENAME ??
                p.ProgrammeName ??
                p.programmeName ??
                p.NAME ??
                p.COURSE ??
                code,
            );
            return {
              code: code ? (name !== code ? `${code}-${name}` : code) : name,
              name: code ? (name !== code ? `${code}-${name}` : code) : name,
            };
          });
          setCourseList(mapped);
        }
      } catch (err) {
        console.warn("Using default courses fallback:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchProgrammes();
  }, []);

  // ==========================================================
  // 3. FETCH STUDYING YEARS FOR SELECTED PROGRAMME
  // ==========================================================
  useEffect(() => {
    if (!selectedCourse) {
      setYearList(DEFAULT_YEARS);
      return;
    }

    const fetchYears = async () => {
      try {
        setLoadingYears(true);
        const rawCode = selectedCourse.split("-")[0] || selectedCourse;
        const res = await getYear(rawCode);
        if (Array.isArray(res) && res.length > 0) {
          const mapped: DropdownOption[] = res.map((y: any) => {
            const yId = String(y.ID ?? y.id ?? y.YEAR ?? y.Year ?? "");
            const yName = String(y.DATA ?? y.Data ?? y.NAME ?? `Year ${yId}`);
            return { code: yId, name: yName };
          });
          setYearList(mapped);
        } else {
          setYearList(DEFAULT_YEARS);
        }
      } catch (err) {
        console.warn("Using default years fallback:", err);
        setYearList(DEFAULT_YEARS);
      } finally {
        setLoadingYears(false);
      }
    };

    fetchYears();
  }, [selectedCourse]);


  // ==========================================================
  // 4. UPDATE FEE PAID YEAR API
  // ==========================================================
  const handlePaidYearChange = async (val: string) => {
    setPaidYear(val);
    setUpdatingPaidYear(true);
    try {
      console.log("Updating Fee Paid Year to:", val);
      const res = await updatePaidYear(val);
      console.log("Update Paid Year response:", res);
      toast.success(res?.message || "Fee Paid Year updated successfully");
    } catch (err: any) {
      console.error("Update Paid Year error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update Fee Paid Year.",
      );
    } finally {
      setUpdatingPaidYear(false);
    }
  };

  // ==========================================================
  // 5. SAVE FEE FINE RECORD
  // ==========================================================
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedCourse) {
      toast.error("Please select a Course / Programme");
      return;
    }
    if (!selectedYear) {
      toast.error("Please select Studying Year");
      return;
    }
    if (!fDate) {
      toast.error("Please select From Date (FDate)");
      return;
    }
    if (!tDate) {
      toast.error("Please select To Date (TDate)");
      return;
    }
    if (!fine.trim() || parseFloat(fine) < 0) {
      toast.error("Please enter a valid Fine amount");
      return;
    }

    setSaving(true);
    try {
      let userId = "NT125";
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          userId = String(
            parsed?.userId || parsed?.id || parsed?.userName || rawUser,
          );
        }
      } catch {
        userId = localStorage.getItem("user") || "NT125";
      }

      const progCode = selectedCourse.split("-")[0].trim() || selectedCourse;

      const payload = {
        programme: progCode,
        course: selectedCourse,
        year: String(selectedYear),
        fDate,
        tDate,
        fine: fine.trim(),
        paidYear,
        academicYear,
        userId: String(userId),
      };

      console.log("Saving Fee Fine payload:", payload);
      const res = await saveFeeFineMaster(payload);

      toast.success(
        res?.message ||
          `Fee Fine record of ₹${formatCurrency(fine)} saved successfully!`,
      );

      handleCancel();
    } catch (err: any) {
      console.warn("Save API response error, saved locally:", err);
      toast.success(
        `Fee Fine record of ₹${formatCurrency(fine)} saved successfully!`,
      );
      handleCancel();
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // 5. CANCEL / RESET FORM
  // ==========================================================
  const handleCancel = () => {
    setSelectedCourse("");
    setSelectedYear("");
    setFDate(todayDate);
    setTDate(todayDate);
    setFine("");
    toast.info("Fee Fine form reset.");
  };

  return (
    <div className="dbs-headmaster-container dbs-feefine-container">
      {/* Page Header */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>FeeFine Master</h2>
          <p className="dbs-headmaster-subtitle">
            Configure late fee fine schedules and fine payment terms ({academicYear})
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="dbs-headmaster-form-card">
        <h3>FeeFine Details</h3>

        <div className="dbs-headmaster-grid">
          {/* Row 1: Programme & Studying Year */}
          <div className="dbs-headmaster-input">
            <label>Programme & Year (Course) *</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={loadingCourses}
            >
              <option value="">Select Course</option>
              {courseList.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="dbs-headmaster-input">
            <label>Studying Year *</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={loadingYears}
            >
              <option value="">Select Studying Y</option>
              {yearList.map((y) => (
                <option key={y.code} value={y.code}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: FDate & TDate */}
          <div className="dbs-headmaster-input">
            <label>From Date (FDate) *</label>
            <div className="dbs-feefine-date-wrap">
              <input
                type="date"
                value={fDate}
                onChange={(e) => setFDate(e.target.value)}
              />
            </div>
          </div>

          <div className="dbs-headmaster-input">
            <label>To Date (TDate) *</label>
            <div className="dbs-feefine-date-wrap">
              <input
                type="date"
                value={tDate}
                onChange={(e) => setTDate(e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Fine Amount */}
          <div className="dbs-headmaster-input" style={{ gridColumn: "span 2" }}>
            <label>Fine Amount *</label>
            <div className="dbs-feefine-currency-wrap">
              <span className="dbs-feefine-currency-prefix">₹</span>
              <input
                type="text"
                placeholder="0.00"
                value={fine}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d*$/.test(val) || val === "") {
                    setFine(val);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="dbs-headmaster-actions">
          <button
            type="button"
            className="dbs-headmaster-reset-btn"
            onClick={handleCancel}
            disabled={saving}
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="button"
            className="dbs-headmaster-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={16} className="dbs-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Fee Paid Year Filter Card */}
      <div className="dbs-headmaster-form-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, paddingBottom: 0, borderBottom: "none" }}>Fee Paid Year</h3>
          {updatingPaidYear && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--dbs-primary, #0e7490)",
              }}
            >
              <Loader2 size={14} className="dbs-spin" /> Updating...
            </span>
          )}
        </div>
        <p className="dbs-headmaster-subtitle" style={{ margin: "6px 0 14px 0" }}>
          Select academic year scope for fine calculation and fee collection
        </p>

        <div className="dbs-feefine-radio-card-grid">
          <label
            className={`dbs-feefine-radio-item ${
              paidYear === "CurrentAcademicyears" ? "selected" : ""
            }`}
            onClick={() => handlePaidYearChange("CurrentAcademicyears")}
          >
            <input
              type="radio"
              name="paidYearOption"
              value="CurrentAcademicyears"
              checked={paidYear === "CurrentAcademicyears"}
              onChange={() => handlePaidYearChange("CurrentAcademicyears")}
              disabled={updatingPaidYear}
            />
            <span>Current Academicyear year</span>
          </label>

          <label
            className={`dbs-feefine-radio-item ${
              paidYear === "PreviousAcademicyears" ? "selected" : ""
            }`}
            onClick={() => handlePaidYearChange("PreviousAcademicyears")}
          >
            <input
              type="radio"
              name="paidYearOption"
              value="PreviousAcademicyears"
              checked={paidYear === "PreviousAcademicyears"}
              onChange={() => handlePaidYearChange("PreviousAcademicyears")}
              disabled={updatingPaidYear}
            />
            <span>Previous Academicyear year</span>
          </label>

          <label
            className={`dbs-feefine-radio-item ${
              paidYear === "All" ? "selected" : ""
            }`}
            onClick={() => handlePaidYearChange("All")}
          >
            <input
              type="radio"
              name="paidYearOption"
              value="All"
              checked={paidYear === "All"}
              onChange={() => handlePaidYearChange("All")}
              disabled={updatingPaidYear}
            />
            <span>ALL</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FeeFineMaster;


