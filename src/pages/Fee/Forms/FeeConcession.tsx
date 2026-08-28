import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  X,
  Search,
  Loader2,
  Calendar,
  BadgePercent,
  GraduationCap,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";
import "./FeeConcession.css";
import {
  getSSNo,
  getStudentData,
  getFeeDues,
  feeChallanaAdmissionLoad,
  saveFeeConcession,
  getFeeConcessionReceiptNo,
} from "../../../apis/FeeApis";

export interface FeeConcessionItem {
  sNo: number;
  feeName: string;
  feeType: string;
  amount: number;
  paid: number;
  givenCon: number;
  givenRefund: number;
  due: number;
  concession: string | number;
  feeId?: number | string;
  fEEID?: number | string;
  id?: number | string;
  iD?: number | string;
  cid?: number | string;
  cID?: number | string;
  CID?: number | string;
  fYear?: string;
  fYEAR?: string;
  caste?: string;
  cASTE?: string;
  year?: number | string;
  yEAR?: number | string;
  term?: number | string;
  tERMNO?: number | string;
}

export interface YearDueItem {
  year: number | string;
  due: number | string;
}

const CATEGORY_TYPES = [
  "Convener",
  "Management",
  "Merit Scholarship",
  "Sports Quota",
  "Staff Ward",
  "EWS",
  "General",
  "Other",
];

export const FeeConcession: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2026-2027";
  const todayFormatted = new Date()
    .toISOString()
    .split("T")[0]
    .split("-")
    .reverse()
    .join("-");

  // Form States
  const [concessionId, setConcessionId] = useState<string>("");
  const [concessionDate, setConcessionDate] = useState<string>(todayFormatted);
  const [regNo, setRegNo] = useState<string>("");
  const [ssNo, setSsNo] = useState<string>("");
  const [quota, setQuota] = useState<string>("");
  const [categoryType, setCategoryType] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [courseBranch, setCourseBranch] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [paid, setPaid] = useState<number>(0);
  const [remark, setRemark] = useState<string>("");

  // Tables States
  const [yearDues, setYearDues] = useState<YearDueItem[]>([]);
  const [feeItems, setFeeItems] = useState<FeeConcessionItem[]>([]);

  // Loading States
  const [searching, setSearching] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Currency Formatter
  const formatCurrency = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Fetch initial Concession / Receipt Number on mount
  const fetchReceiptNumber = async () => {
    try {
      const res = await getFeeConcessionReceiptNo(academicYear);
      console.log("GetReceiptNo response:", res);
      if (Array.isArray(res) && res.length > 0) {
        const no =
          res[0]?.cONCNO ??
          res[0]?.concno ??
          res[0]?.CONCNO ??
          res[0]?.receiptNo;
        if (no !== undefined && no !== null) {
          setConcessionId(String(no));
        }
      } else if (res?.cONCNO || res?.concno) {
        setConcessionId(String(res.cONCNO || res.concno));
      }
    } catch (err) {
      console.warn("Fetch Receipt No error fallback:", err);
    }
  };

  useEffect(() => {
    fetchReceiptNumber();
  }, [academicYear]);

  // Total concession amount computed from table inputs
  const totalConcessionAmount = useMemo(() => {
    return feeItems.reduce((sum, item) => {
      const val = parseFloat(String(item.concession)) || 0;
      return sum + val;
    }, 0);
  }, [feeItems]);

  // Dynamic remaining due amount
  const computedDue = useMemo(() => {
    return Math.max(0, total - paid - totalConcessionAmount);
  }, [total, paid, totalConcessionAmount]);

  // Total Dues from the Mini Year-Due Card
  const totalYearDues = useMemo(() => {
    return yearDues.reduce((sum, item) => {
      const val = parseFloat(String(item.due)) || 0;
      return sum + val;
    }, 0);
  }, [yearDues]);

  // Table Totals Footer
  const tableTotals = useMemo(() => {
    return feeItems.reduce(
      (acc, item) => ({
        amount: acc.amount + Number(item.amount || 0),
        paid: acc.paid + Number(item.paid || 0),
        givenCon: acc.givenCon + Number(item.givenCon || 0),
        givenRefund: acc.givenRefund + Number(item.givenRefund || 0),
        due: acc.due + Number(item.due || 0),
      }),
      { amount: 0, paid: 0, givenCon: 0, givenRefund: 0, due: 0 },
    );
  }, [feeItems]);

  // Handle concession input change in fee items table
  const handleItemConcessionChange = (index: number, val: string) => {
    if (!/^\d*\.?\d*$/.test(val) && val !== "") return;

    setFeeItems((prev) => {
      const updated = [...prev];
      const maxDue = updated[index].due;
      const numVal = parseFloat(val) || 0;

      if (numVal > maxDue && maxDue > 0) {
        toast.warning(
          `Concession cannot exceed due amount of ₹${formatCurrency(maxDue)}`,
        );
      }

      updated[index] = {
        ...updated[index],
        concession: val,
      };
      return updated;
    });
  };

  // ==========================================================
  // LOAD FEE CHALLANA ADMISSION TABLE
  // ==========================================================
  const loadFeeTableData = async (
    targetSsNo: string,
    targetTerm: string | number,
    targetYear: string | number,
  ) => {
    if (!targetSsNo) return;
    try {
      console.log(
        `Step 4: Calling FeeChallanaAdmissionLoad with ssNo=${targetSsNo}, term=${targetTerm}, year=${targetYear}`,
      );
      const tableRes = await feeChallanaAdmissionLoad(
        targetSsNo,
        targetTerm || "1",
        targetYear || "3",
      );
      console.log("FeeChallanaAdmissionLoad response:", tableRes);

      if (Array.isArray(tableRes) && tableRes.length > 0) {
        const mappedItems: FeeConcessionItem[] = tableRes.map(
          (item: any, idx: number) => ({
            sNo: idx + 1,
            feeName: item.fEENAME ?? item.feeName ?? "Fee",
            feeType: item.fEETYPE ?? item.feeType ?? "General",
            amount: Number(item.aMOUNT ?? item.amount ?? 0),
            paid: Number(item.pAIDAMOUNT ?? item.paid ?? 0),
            givenCon: Number(item.cONCESSION ?? item.givenCon ?? 0),
            givenRefund: Number(item.refundAmt ?? item.givenRefund ?? 0),
            due: Number(item.bALANCE ?? item.totBALANCE ?? item.due ?? 0),
            concession: "",
            feeId: item.fEEID ?? item.feeId ?? 0,
            fEEID: item.fEEID ?? item.feeId ?? 0,
            id: item.iD ?? item.id ?? item.cid ?? item.cID ?? 0,
            iD: item.iD ?? item.id ?? item.cid ?? item.cID ?? 0,
            cid: item.cid ?? item.cID ?? item.CID ?? item.iD ?? item.id ?? 0,
            cID: item.cID ?? item.cid ?? item.CID ?? item.iD ?? item.id ?? 0,
            CID: item.CID ?? item.cid ?? item.cID ?? item.iD ?? item.id ?? 0,
            fYear: item.fYEAR ?? item.fYear ?? "Apr-2017 to Mar-2018",
            fYEAR: item.fYEAR ?? item.fYear ?? "Apr-2017 to Mar-2018",
            caste: item.cASTE ?? item.caste ?? "",
            cASTE: item.cASTE ?? item.caste ?? "",
            year: item.yEAR ?? item.year ?? "",
            yEAR: item.yEAR ?? item.year ?? "",
            term: item.tERMNO ?? item.term ?? "",
            tERMNO: item.tERMNO ?? item.term ?? "",
          }),
        );
        setFeeItems(mappedItems);

        const sumAmt = mappedItems.reduce((acc, curr) => acc + curr.amount, 0);
        const sumPaid = mappedItems.reduce((acc, curr) => acc + curr.paid, 0);
        if (sumAmt > 0) setTotal(sumAmt);
        setPaid(sumPaid);
      }
    } catch (err) {
      console.warn("FeeChallanaAdmissionLoad error:", err);
    }
  };

  // ==========================================================
  // 1. SEARCH STUDENT CONCESSION DATA (getSSNo -> getStudentData -> getFeeDues -> feeChallanaAdmissionLoad)
  // ==========================================================
  const handleSearchStudent = async (targetRegNo?: string) => {
    const searchNo = (targetRegNo !== undefined ? targetRegNo : regNo).trim();
    if (!searchNo) {
      toast.error("Please enter a Registration Number");
      return;
    }

    setSearching(true);
    try {
      console.log(`Step 1: Calling GetSSNo for: ${searchNo}`);
      const ssRes = await getSSNo(searchNo);
      console.log("GetSSNo response:", ssRes);

      let studentSerialNo = "";
      if (Array.isArray(ssRes) && ssRes.length > 0) {
        studentSerialNo =
          ssRes[0]?.studentSerialNo ?? ssRes[0]?.sTUDENTSERIALNO ?? "";
      } else if (ssRes?.studentSerialNo || ssRes?.sTUDENTSERIALNO) {
        studentSerialNo = ssRes.studentSerialNo || ssRes.sTUDENTSERIALNO;
      }

      if (!studentSerialNo) {
        toast.error(`No Student Serial No found for registration number ${searchNo}`);
        return;
      }

      setSsNo(studentSerialNo);

      console.log(`Step 2: Calling GetStudentData for SSNo: ${studentSerialNo}`);
      const stdRes = await getStudentData(studentSerialNo);
      console.log("GetStudentData response:", stdRes);

      const std = Array.isArray(stdRes) && stdRes.length > 0 ? stdRes[0] : stdRes;

      if (std) {
        const sName = std.sNAME ?? std.sName ?? std.studentName ?? "";
        const course = std.cOURSE ?? std.course ?? "";
        const branch = std.bSName ?? std.bRANCHNAME ?? std.branch ?? "";
        const courseBranchVal =
          course && branch ? `${course}-${branch}` : course || branch || "";
        const caste = std.cASTE ?? std.quota ?? std.category ?? "";
        const admMode = std.modeofAdm ?? std.categoryType ?? "";
        const sYear = std.sYEAR !== undefined ? String(std.sYEAR) : "";
        const sSem =
          std.sSemester !== undefined
            ? String(std.sSemester)
            : std.aYEAR !== undefined
              ? String(std.aYEAR)
              : "";
        const schAmt =
          std.sCHAMOUNT !== undefined
            ? parseFloat(String(std.sCHAMOUNT)) || 0
            : std.total !== undefined
              ? Number(std.total)
              : 0;

        setStudentName(sName);
        setCourseBranch(courseBranchVal);
        setQuota(caste);
        if (admMode) {
          setCategoryType(admMode);
        }
        if (sYear) setYear(sYear);
        if (sSem) setTerm(sSem);
        if (schAmt) {
          setTotal(schAmt);
          setPaid(0);
        }

        // Step 3: Calling GetFeeDues
        try {
          console.log(`Step 3: Calling GetFeeDues for SSNo: ${studentSerialNo}`);
          const duesRes = await getFeeDues(studentSerialNo);
          console.log("GetFeeDues response:", duesRes);
          if (Array.isArray(duesRes) && duesRes.length > 0) {
            const mappedDues: YearDueItem[] = duesRes.map((d: any) => ({
              year: d.yEAR ?? d.year ?? "",
              due: Number(d.dUE ?? d.due ?? 0),
            }));
            setYearDues(mappedDues);
          }
        } catch (duesErr) {
          console.warn("GetFeeDues fetch error:", duesErr);
        }

        // Step 4: Calling FeeChallanaAdmissionLoad to populate main fee table
        await loadFeeTableData(studentSerialNo, sSem || "1", sYear || "3");

        toast.success(`Loaded details for student ${sName || searchNo}`);
      } else {
        toast.info(`No student details found for SSNo ${studentSerialNo}`);
      }
    } catch (err: any) {
      console.warn("Student search error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch student details.",
      );
    } finally {
      setSearching(false);
    }
  };

  // ==========================================================
  // 2. SAVE CONCESSION
  // ==========================================================
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!regNo.trim()) {
      toast.error("Please enter a Registration Number");
      return;
    }
    if (!concessionId) {
      toast.error("Receipt Number is required");
      return;
    }

    const itemsToSave = feeItems.filter(
      (item) => (parseFloat(String(item.concession)) || 0) > 0,
    );

    if (itemsToSave.length === 0) {
      toast.error("Please enter a concession amount in the table");
      return;
    }

    setSaving(true);
    try {
      // Format date to ISO format YYYY-MM-DDT00:00:00
      let formattedDate = concessionDate;
      if (concessionDate && concessionDate.includes("-")) {
        const parts = concessionDate.split("-");
        if (parts.length === 3) {
          if (parts[0].length === 2 && parts[2].length === 4) {
            formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`;
          } else if (parts[0].length === 4) {
            formattedDate = `${concessionDate}T00:00:00`;
          }
        }
      }

      // Save each fee item having a concession amount
      for (const item of itemsToSave) {
        const payload = {
          ReceiptNO: String(concessionId ?? ""),
          receiptNO: String(concessionId ?? ""),
          receiptNo: String(concessionId ?? ""),
          CONCNO: String(concessionId ?? ""),
          Date: String(formattedDate ?? ""),
          date: String(formattedDate ?? ""),
          DATE: String(formattedDate ?? ""),
          SSNo: String(ssNo || regNo || ""),
          ssNo: String(ssNo || regNo || ""),
          SSNO: String(ssNo || regNo || ""),
          AcademicYear: String(academicYear ?? ""),
          academicYear: String(academicYear ?? ""),
          ACADEMICYEAR: String(academicYear ?? ""),
          FYear: String(item.fYEAR || item.fYear || "Apr-2017 to Mar-2018"),
          fYear: String(item.fYEAR || item.fYear || "Apr-2017 to Mar-2018"),
          FYEAR: String(item.fYEAR || item.fYear || "Apr-2017 to Mar-2018"),
          Year: String(year || item.yEAR || item.year || "3"),
          year: String(year || item.yEAR || item.year || "3"),
          YEAR: String(year || item.yEAR || item.year || "3"),
          Caste: String(quota || item.cASTE || item.caste || ""),
          caste: String(quota || item.cASTE || item.caste || ""),
          CASTE: String(quota || item.cASTE || item.caste || ""),
          Term: String(term || item.tERMNO || item.term || "1"),
          term: String(term || item.tERMNO || item.term || "1"),
          TERM: String(term || item.tERMNO || item.term || "1"),
          Remark: String(remark || "Fee Concession"),
          remark: String(remark || "Fee Concession"),
          REMARK: String(remark || "Fee Concession"),
          FeeId: String(item.fEEID ?? item.feeId ?? "0"),
          feeId: String(item.fEEID ?? item.feeId ?? "0"),
          FEEID: String(item.fEEID ?? item.feeId ?? "0"),
          FeeName: String(item.feeName ?? ""),
          feeName: String(item.feeName ?? ""),
          FEENAME: String(item.feeName ?? ""),
          FeeType: String(item.feeType ?? ""),
          feeType: String(item.feeType ?? ""),
          FEETYPE: String(item.feeType ?? ""),
          Fee: String(item.amount ?? "0"),
          fee: String(item.amount ?? "0"),
          FEE: String(item.amount ?? "0"),
          PayAmount: String(item.concession ?? "0"),
          payAmount: String(item.concession ?? "0"),
          PAYAMOUNT: String(item.concession ?? "0"),
          CID: String(item.iD ?? item.id ?? item.cid ?? "0"),
          cid: String(item.iD ?? item.id ?? item.cid ?? "0"),
          Ctype: String(categoryType || "Convener"),
          ctype: String(categoryType || "Convener"),
          CategoryType: String(categoryType || "Convener"),
          categoryType: String(categoryType || "Convener"),
          CATEGORYTYPE: String(categoryType || "Convener"),
        };

        console.log("Saving Fee Concession payload for item:", payload);
        const res = await saveFeeConcession(payload);
        console.log("Save Fee Concession response:", res);
      }

      toast.success(
        `Fee Concession of ₹${formatCurrency(totalConcessionAmount)} saved successfully!`,
      );

      // Fetch next updated receipt / concession ID from server
      await fetchReceiptNumber();
      handleCancel(false);
    } catch (err: any) {
      console.error("Save Fee Concession error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save fee concession.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // 3. CANCEL / RESET FORM
  // ==========================================================
  const handleCancel = (showToast = true) => {
    setRegNo("");
    setSsNo("");
    setQuota("");
    setCategoryType("");
    setStudentName("");
    setCourseBranch("");
    setYear("");
    setTerm("");
    setTotal(0);
    setPaid(0);
    setRemark("");
    setYearDues([]);
    setFeeItems([]);
    fetchReceiptNumber();
    if (showToast) {
      toast.info("Fee Concession form reset.");
    }
  };

  return (
    <div className="dbs-headmaster-container dbs-feeconcession-container">
      {/* Page Header */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>Fee Concession</h2>
          <p className="dbs-headmaster-subtitle">
            Manage student fee concessions, adjustments, and waiver records ({academicYear})
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="dbs-headmaster-form-card">
        <h3>Fee Concession</h3>

        {/* 3-Column Top Grid */}
        <div className="dbs-feeconcession-main-grid">
          {/* Column 1: Concession ID, Student Name, Year/Term, Concession/Due */}
          <div className="dbs-feeconcession-form-col">
            {/* Concession ID & Date */}
            <div className="dbs-headmaster-input">
              <label>Concession ID & Date</label>
              <div className="dbs-feeconcession-dual-input">
                <input
                  type="text"
                  placeholder="Receipt No"
                  value={concessionId}
                  readOnly
                  className="dbs-feeconcession-input-red"
                  title="Concession ID"
                />
                <input
                  type="text"
                  value={concessionDate}
                  onChange={(e) => setConcessionDate(e.target.value)}
                  title="Concession Date (DD-MM-YYYY)"
                />
              </div>
            </div>

            {/* Student Name */}
            <div className="dbs-headmaster-input">
              <label>Student Name</label>
              <input
                type="text"
                placeholder="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className={studentName ? "dbs-feeconcession-input-readonly" : ""}
              />
            </div>

            {/* Year & Term */}
            <div className="dbs-headmaster-input">
              <label>Year & Term</label>
              <div className="dbs-feeconcession-dual-input">
                <select
                  value={year}
                  onChange={(e) => {
                    const newYear = e.target.value;
                    setYear(newYear);
                    if (ssNo) {
                      loadFeeTableData(ssNo, term || "1", newYear);
                    }
                  }}
                >
                  <option value="">Select Year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
                <select
                  value={term}
                  onChange={(e) => {
                    const newTerm = e.target.value;
                    setTerm(newTerm);
                    if (ssNo) {
                      loadFeeTableData(ssNo, newTerm, year || "3");
                    }
                  }}
                >
                  <option value="">Select Term</option>
                  <option value="1">Term 1</option>
                  <option value="2">Term 2</option>
                </select>
              </div>
            </div>

            {/* Concession & Due */}
            <div className="dbs-headmaster-input">
              <label>Concession & Due</label>
              <div className="dbs-feeconcession-dual-input">
                <input
                  type="text"
                  value={formatCurrency(totalConcessionAmount)}
                  readOnly
                  className="dbs-feeconcession-input-green"
                  title="Total Concession Amount"
                />
                <input
                  type="text"
                  value={formatCurrency(computedDue)}
                  readOnly
                  className="dbs-feeconcession-input-red"
                  title="Remaining Due"
                />
              </div>
            </div>
          </div>

          {/* Column 2: S.S.No./Reg.No., Course/Branch, Category Type, Total/Paid, Remark */}
          <div className="dbs-feeconcession-form-col">
            {/* S.S.No. / Reg.No. */}
            <div className="dbs-headmaster-input">
              <label>S.S.No. / Reg.No. *</label>
              <div className="dbs-feeconcession-dual-input">
                <div className="dbs-feeconcession-search-wrap">
                  <input
                    type="text"
                    placeholder="Reg No"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    onBlur={() => {
                      if (regNo.trim()) {
                        handleSearchStudent(regNo);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchStudent(regNo);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchStudent(regNo)}
                    title="Search Student (Enter)"
                    className="dbs-feeconcession-search-btn"
                  >
                    {searching ? (
                      <Loader2 size={16} className="dbs-spin" />
                    ) : (
                      <Search size={16} />
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Quota"
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  title="Quota / Category (e.g. EBC, OC)"
                />
              </div>
            </div>

            {/* Course & Branch */}
            <div className="dbs-headmaster-input">
              <label>Course & Branch</label>
              <input
                type="text"
                placeholder="Course & Branch"
                value={courseBranch}
                onChange={(e) => setCourseBranch(e.target.value)}
                className={courseBranch ? "dbs-feeconcession-input-readonly" : ""}
              />
            </div>

            {/* Category Type Dropdown */}
            <div className="dbs-headmaster-input">
              <label>Category Type</label>
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
              >
                <option value="">Select Category Type</option>
                {CATEGORY_TYPES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Total & Paid */}
            <div className="dbs-headmaster-input">
              <label>Total & Paid</label>
              <div className="dbs-feeconcession-dual-input">
                <input
                  type="text"
                  value={formatCurrency(total)}
                  readOnly
                  className="dbs-feeconcession-input-red"
                  title="Total Fee Amount"
                />
                <input
                  type="text"
                  value={formatCurrency(paid)}
                  readOnly
                  className="dbs-feeconcession-input-green"
                  title="Paid Amount"
                />
              </div>
            </div>

            {/* Remark */}
            <div className="dbs-headmaster-input">
              <label>Remark</label>
              <input
                type="text"
                placeholder="Enter remarks..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
          </div>

          {/* Column 3: Mini Year-Due Table Card */}
          <div className="dbs-feeconcession-due-card">
            <div className="dbs-feeconcession-due-card-header">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={14} /> Yearly Dues Summary
              </span>
            </div>

            <table className="dbs-feeconcession-due-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Due Amount</th>
                </tr>
              </thead>
              <tbody>
                {yearDues.length > 0 ? (
                  yearDues.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: "var(--dbs-primary, #0e7490)" }}>
                        Year {item.year}
                      </td>
                      <td>₹ {typeof item.due === "number" ? formatCurrency(item.due) : item.due}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        textAlign: "center",
                        color: "var(--dbs-text-muted, #64748b)",
                        padding: "16px 8px",
                        fontSize: "0.82rem",
                      }}
                    >
                      No dues records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="dbs-feeconcession-due-footer">
              <span>Total Dues:</span>
              <span className="total-val">₹ {formatCurrency(totalYearDues)}</span>
            </div>
          </div>
        </div>

        {/* Action & Total Summary Row */}
        <div className="dbs-feeconcession-actions">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="dbs-feeconcession-total-badge">
              <Calculator size={18} color="var(--dbs-primary, #0e7490)" />
              <span>Total Concession Amount :</span>
              <span className="amount">₹ {formatCurrency(totalConcessionAmount)}</span>
            </div>
          </div>
          
          <div className="dbs-feeconcession-btn-group">
            <button
              type="button"
              className="dbs-headmaster-reset-btn"
              onClick={() => handleCancel(true)}
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

        {/* Fee Concession Breakdown Table */}
        {feeItems.length > 0 ? (
          <div className="dbs-feeconcession-table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "5%", textAlign: "center" }}>S.No.</th>
                  <th style={{ width: "20%" }}>Fee Name</th>
                  <th style={{ width: "16%" }}>Fee Type</th>
                  <th style={{ width: "11%", textAlign: "right" }}>Amount</th>
                  <th style={{ width: "9%", textAlign: "right" }}>Paid</th>
                  <th style={{ width: "10%", textAlign: "right" }}>Given Con.</th>
                  <th style={{ width: "10%", textAlign: "right" }}>Given Refund.</th>
                  <th style={{ width: "10%", textAlign: "right" }}>Due</th>
                  <th style={{ width: "9%", textAlign: "center" }}>Concession</th>
                </tr>
              </thead>
              <tbody>
                {feeItems.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{item.sNo}</td>
                    <td style={{ fontWeight: 600, color: "var(--dbs-text, #1e293b)" }}>
                      {item.feeName}
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#f1f5f9",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                      >
                        {item.feeType}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                      ₹ {formatCurrency(item.amount)}
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", color: "#059669", fontWeight: 600 }}>
                      ₹ {formatCurrency(item.paid)}
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                      ₹ {formatCurrency(item.givenCon)}
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                      ₹ {formatCurrency(item.givenRefund)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: item.due > 0 ? "#dc2626" : "inherit",
                      }}
                    >
                      ₹ {formatCurrency(item.due)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="dbs-feeconcession-table-input-wrap">
                        <span className="dbs-feeconcession-table-currency-prefix">₹</span>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={item.concession}
                          onChange={(e) => handleItemConcessionChange(idx, e.target.value)}
                          className="dbs-feeconcession-table-input"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: "right", fontWeight: 700 }}>
                    Summary Totals:
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>
                    ₹ {formatCurrency(tableTotals.amount)}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", color: "#059669", fontWeight: 700 }}>
                    ₹ {formatCurrency(tableTotals.paid)}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>
                    ₹ {formatCurrency(tableTotals.givenCon)}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>
                    ₹ {formatCurrency(tableTotals.givenRefund)}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", color: "#dc2626", fontWeight: 700 }}>
                    ₹ {formatCurrency(tableTotals.due)}
                  </td>
                  <td style={{ textAlign: "center", fontFamily: "monospace", color: "#059669", fontWeight: 800 }}>
                    ₹ {formatCurrency(totalConcessionAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: "36px 16px",
              textAlign: "center",
              color: "var(--dbs-text-muted, #64748b)",
              background: "#f8fafc",
              borderRadius: "6px",
              marginTop: "18px",
              border: "1px dashed var(--dbs-border, #e2e8f0)",
            }}
          >
            <Search size={26} style={{ margin: "0 auto 8px auto", opacity: 0.5, display: "block" }} />
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.94rem", color: "var(--dbs-text, #1e293b)" }}>
              No Fee Items Loaded
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.84rem" }}>
              Enter a student Registration Number and press Enter to search and load concession breakdown.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeConcession;



