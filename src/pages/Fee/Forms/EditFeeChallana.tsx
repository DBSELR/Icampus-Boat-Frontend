import React, { useState, useMemo } from "react";
import {
  Save,
  X,
  Search,
  Receipt,
  Loader2,
  Printer,
  Calendar,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import "./EditFeeChallana.css";
import {
  loadFeeChallanaAdmission,
  saveFeeChallana,
} from "../../../apis/FeeApis";

export interface FeeChallanaAdmissionLoadPayload {
  fid?: string;
  feeId?: string;
  feeName?: string;
  feeType?: string;
  receiptNO?: string;
  academicYear?: string;
  fYear?: string;
  ssNo?: string;
  term?: string;
  date?: string;
  course?: string;
  group?: string;
  studentName?: string;
  status?: string;
  year?: string;
  caste?: string;
  paymentMode?: string;
  remark?: string;
  fee?: string;
  oldFee?: string;
  newFee?: string;
  totalAmount?: string;
  concession?: string;
  paidAmount?: string;
  dueAmount?: string;
  payAmount?: string;
  cid?: string;
  id?: string;
}

export interface ApiFeeChallanaAdmissionRecord {
  iD?: number;
  rECPTNO?: string;
  receiptNO?: string;
  registrationno?: string;
  dATE?: string;
  sSNO?: string;
  sNAME?: string;
  studentName?: string;
  aCADEMICYEAR?: string;
  cOURSE?: string;
  course?: string;
  bRANCHNAME?: string;
  bSName?: string;
  group?: string;
  yEAR?: number | string;
  year?: number | string;
  cASTE?: string;
  caste?: string;
  tERM?: number | string;
  term?: number | string;
  rEMARK?: string;
  remark?: string;
  fEEID?: number;
  fEENAME?: string;
  feeName?: string;
  fEETYPE?: string;
  feeType?: string;
  fEE?: number;
  fee?: number;
  aMOUNT?: number;
  amount?: number;
  pAYMENTMODE?: string;
  paymentMode?: string;
  cID?: string;
  cid?: string;
}

// Interface for table rows
export interface ChallanFeeItem {
  id: number | string;
  feeId?: number | string;
  feeName: string;
  feeType: string;
  fee: number;
  paidAmount: number;
  amount: string | number;
  cid?: string;
}

export const EditFeeChallana: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2025-2026";

  // ==========================================================
  // 1. ALL FORM STATES (INITIALIZED EMPTY)
  // ==========================================================
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [regNo, setRegNo] = useState<string>("");
  const [ssNo, setSsNo] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [caste, setCaste] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<string>("");
  const [remark, setRemark] = useState<string>("");
  const [fYear, setFYear] = useState<string>("Apr-2017 to Mar-2018");

  // ==========================================================
  // 2. TABLE DATA STATE (INITIALIZED EMPTY)
  // ==========================================================
  const [feeItems, setFeeItems] = useState<ChallanFeeItem[]>([]);

  // Loading States
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Format currency
  const formatAmount = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate live total amount from editable rows
  const totalAmount = useMemo(() => {
    return feeItems.reduce(
      (sum, item) => sum + (parseFloat(String(item.amount)) || 0),
      0,
    );
  }, [feeItems]);

  const totalOriginalFee = useMemo(() => {
    return feeItems.reduce((sum, item) => sum + (Number(item.fee) || 0), 0);
  }, [feeItems]);

  const totalPaidAmount = useMemo(() => {
    return feeItems.reduce(
      (sum, item) => sum + (Number(item.paidAmount) || 0),
      0,
    );
  }, [feeItems]);

  // Handle amount change in table
  const handleAmountChange = (id: number | string, val: string) => {
    if (/^\d*\.?\d*$/.test(val) || val === "") {
      setFeeItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, amount: val } : item)),
      );
    }
  };

  // ==========================================================
  // 3. FETCH ADMISSION & CHALLAN DATA BY RECEIPT NO / REG NO
  // ==========================================================
  const handleFetchChallanaData = async (overrideReceipt?: string) => {
    const searchReceiptNo =
      overrideReceipt !== undefined ? overrideReceipt.trim() : receiptNo.trim();

    if (!searchReceiptNo && !regNo.trim()) {
      toast.error("Please enter a Receipt Number to search.");
      return;
    }

    setLoadingData(true);
    try {
      const payload: FeeChallanaAdmissionLoadPayload = {
        fid: "string",
        feeId: "string",
        feeName: "string",
        feeType: "string",
        receiptNO: searchReceiptNo || "string",
        academicYear,
        fYear: fYear || "Apr-2017 to Mar-2018",
        ssNo: regNo.trim() || "string",
        term: "string",
        date: "string",
        course: "string",
        group: "string",
        studentName: "string",
        status: "string",
        year: "string",
        caste: "string",
        paymentMode: "string",
        remark: "string",
        fee: "string",
        oldFee: "string",
        newFee: "string",
        totalAmount: "string",
        concession: "string",
        paidAmount: "string",
        dueAmount: "string",
        payAmount: "string",
        cid: "string",
        id: "string",
      };

      console.log("Calling FeeChallanaAdmissionLoad with payload:", payload);
      const data = await loadFeeChallanaAdmission(payload);
      const records = Array.isArray(data) ? data : data?.data;

      if (Array.isArray(records) && records.length > 0) {
        const firstRecord = records[0];

        // 1. Store form fields individually into separate states
        if (firstRecord.rECPTNO || firstRecord.receiptNO) {
          setReceiptNo(String(firstRecord.rECPTNO ?? firstRecord.receiptNO));
        }
        if (firstRecord.registrationno || firstRecord.sSNO) {
          setRegNo(String(firstRecord.registrationno ?? firstRecord.sSNO));
        }
        if (firstRecord.sSNO) {
          setSsNo(String(firstRecord.sSNO));
        }
        if (firstRecord.dATE) {
          setDate(firstRecord.dATE.substring(0, 10));
        }
        if (firstRecord.sNAME || firstRecord.studentName) {
          setStudentName(String(firstRecord.sNAME ?? firstRecord.studentName));
        }
        if (firstRecord.cOURSE || firstRecord.course) {
          setCourse(String(firstRecord.cOURSE ?? firstRecord.course));
        }
        if (firstRecord.bSName || firstRecord.bRANCHNAME || firstRecord.group) {
          setGroup(
            String(
              firstRecord.bSName ??
                firstRecord.bRANCHNAME ??
                firstRecord.group,
            ),
          );
        }
        if (firstRecord.yEAR !== undefined || firstRecord.year !== undefined) {
          setYear(String(firstRecord.yEAR ?? firstRecord.year));
        }
        if (firstRecord.cASTE || firstRecord.caste) {
          setCaste(String(firstRecord.cASTE ?? firstRecord.caste));
        }
        if (firstRecord.tERM !== undefined || firstRecord.term !== undefined) {
          setTerm(String(firstRecord.tERM ?? firstRecord.term));
        }
        if (firstRecord.pAYMENTMODE || firstRecord.paymentMode) {
          setPaymentMode(
            String(firstRecord.pAYMENTMODE ?? firstRecord.paymentMode),
          );
        }
        if (firstRecord.rEMARK !== undefined || firstRecord.remark !== undefined) {
          setRemark(String(firstRecord.rEMARK ?? firstRecord.remark ?? ""));
        }
        if (firstRecord.fYEAR || firstRecord.fYear) {
          setFYear(String(firstRecord.fYEAR ?? firstRecord.fYear));
        }

        // 2. Store table data into separate state
        const mappedTableItems: ChallanFeeItem[] = records.map((item, idx) => ({
          id: item.iD ?? item.id ?? item.fEEID ?? idx + 1,
          feeId: item.fEEID ?? item.feeId,
          feeName: item.fEENAME ?? item.feeName ?? "",
          feeType: item.fEETYPE ?? item.feeType ?? "",
          fee: Number(item.fEE ?? item.fee) || 0,
          paidAmount: Number(item.aMOUNT ?? item.amount) || 0,
          amount:
            item.aMOUNT !== undefined && item.aMOUNT !== null
              ? Number(item.aMOUNT).toFixed(2)
              : item.amount !== undefined && item.amount !== null
              ? Number(item.amount).toFixed(2)
              : "0.00",
          cid: item.cID ?? item.cid ?? "NT125",
        }));

        setFeeItems(mappedTableItems);

        toast.success(
          `Loaded Challan #${searchReceiptNo} details for ${
            firstRecord.sNAME || firstRecord.registrationno || "Student"
          }`,
        );
      } else {
        toast.warning(
          `No challan record found for Receipt No "${searchReceiptNo}"`,
        );
        // Clear dependent data if not found
        clearChallanDataExceptReceipt();
      }
    } catch (err: any) {
      console.error("Error loading challan data:", err);
      toast.error("Failed to load challan data. Please check connection.");
    } finally {
      setLoadingData(false);
    }
  };

  const clearChallanDataExceptReceipt = () => {
    setDate("");
    setRegNo("");
    setSsNo("");
    setStudentName("");
    setCourse("");
    setGroup("");
    setYear("");
    setCaste("");
    setTerm("");
    setPaymentMode("");
    setRemark("");
    setFYear("Apr-2017 to Mar-2018");
    setFeeItems([]);
  };

  // ==========================================================
  // 4. HANDLE SAVE / UPDATE SINGLE FEE CHALLANA ROW (ON ENTER / BLUR)
  // ==========================================================
  const handleSaveFeeChallanaRow = async (item: ChallanFeeItem) => {
    if (!receiptNo.trim()) {
      toast.error("Receipt No is required.");
      return;
    }
    if (!studentName.trim() && !regNo.trim()) {
      toast.error("Student Name / Reg No is required.");
      return;
    }
    if (!remark.trim()) {
      toast.error("Remark is required before saving fee changes.");
      return;
    }

    try {
      const formattedDate = date
        ? date.includes("T")
          ? date
          : `${date}T00:00:00`
        : "2026-06-30T00:00:00";

      const payload = {
        fid: "string",
        feeId: String(item.feeId ?? ""),
        feeName: item.feeName,
        feeType: item.feeType,
        receiptNO: receiptNo,
        academicYear: academicYear,
        fYear: fYear || "Apr-2017 to Mar-2018",
        ssNo: ssNo || regNo,
        term: String(term || "1"),
        date: formattedDate,
        course: course || "string",
        group: group || "string",
        studentName: studentName || "string",
        status: "string",
        year: String(year || "1"),
        caste: caste || "string",
        paymentMode: paymentMode || "string",
        remark: remark || "By Mistake",
        fee: String(item.fee || "0"),
        oldFee: String(item.paidAmount || "0"),
        newFee: String(item.amount || "0"),
        totalAmount: "string",
        concession: "string",
        paidAmount: "string",
        dueAmount: "string",
        payAmount: "string",
        cid: item.cid || "NT125",
        id: String(item.id || ""),
      };

      console.log("Saving Edit Fee Challan Payload for item:", payload);
      const res = await saveFeeChallana(payload);

      toast.success(
        res?.message ||
          `Edit Fee Challan for ${item.feeName} saved successfully!`,
      );
    } catch (err: any) {
      console.error("Save Fee Challan Error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save fee challan row.",
      );
    }
  };

  // ==========================================================
  // 5. HANDLE SAVE / UPDATE ALL CHALLAN HEADS
  // ==========================================================
  const handleSave = async () => {
    if (!receiptNo.trim()) {
      toast.error("Receipt No is required.");
      return;
    }
    if (!studentName.trim()) {
      toast.error("Student Name is required. Please search a valid Receipt No.");
      return;
    }
    if (!remark.trim()) {
      toast.error("Remark is required.");
      return;
    }
    if (feeItems.length === 0) {
      toast.error("No fee heads available to save.");
      return;
    }

    setSaving(true);
    try {
      let successCount = 0;
      let failedCount = 0;
      const formattedDate = date
        ? date.includes("T")
          ? date
          : `${date}T00:00:00`
        : "2026-06-30T00:00:00";

      for (const item of feeItems) {
        const payload = {
          fid: "string",
          feeId: String(item.feeId ?? ""),
          feeName: item.feeName,
          feeType: item.feeType,
          receiptNO: receiptNo,
          academicYear: academicYear,
          fYear: fYear || "Apr-2017 to Mar-2018",
          ssNo: ssNo || regNo,
          term: String(term || "1"),
          date: formattedDate,
          course: course || "string",
          group: group || "string",
          studentName: studentName || "string",
          status: "string",
          year: String(year || "1"),
          caste: caste || "string",
          paymentMode: paymentMode || "string",
          remark: remark || "By Mistake",
          fee: String(item.fee || "0"),
          oldFee: String(item.paidAmount || "0"),
          newFee: String(item.amount || "0"),
          totalAmount: "string",
          concession: "string",
          paidAmount: "string",
          dueAmount: "string",
          payAmount: "string",
          cid: item.cid || "NT125",
          id: String(item.id || ""),
        };

        try {
          console.log("Saving Edit Fee Challan item:", payload);
          await saveFeeChallana(payload);
          successCount++;
        } catch (err: any) {
          failedCount++;
          console.error("Save error for fee item:", payload, err);
        }
      }

      if (failedCount === 0) {
        toast.success(
          `Edit Fee Challan saved successfully! (${successCount} head(s) updated, Total: ₹ ${formatAmount(totalAmount)})`,
        );
      } else if (successCount > 0) {
        toast.warning(
          `Partially updated: ${successCount} saved, ${failedCount} failed.`,
        );
      } else {
        toast.error("Failed to save Edit Fee Challan records.");
      }
    } catch (err: any) {
      console.error("Save challan error:", err);
      toast.error(err?.message || "Failed to update challan details.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // 5. RESET FORM (CLEARS ALL FIELDS)
  // ==========================================================
  const handleReset = () => {
    setReceiptNo("");
    clearChallanDataExceptReceipt();
    toast.info("Challan editing form cleared.");
  };

  // Print receipt action
  const handlePrint = () => {
    if (!receiptNo.trim()) {
      toast.error("Please load a valid challan receipt first.");
      return;
    }
    toast.info(`Preparing print preview for Receipt #${receiptNo}...`);
    window.print();
  };

  return (
    <div className="dbs-headmaster-container dbs-challan-container">
      {/* Page Header */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>Fee Challan Editing</h2>
          <p className="dbs-headmaster-subtitle">
            Enter Receipt Number to fetch, modify, and update fee challan receipts ({academicYear})
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {receiptNo && (
            <button
              type="button"
              className="dbs-headmaster-reset-btn"
              onClick={() => handleFetchChallanaData()}
              disabled={loadingData}
              title="Reload challan data"
              style={{ minWidth: "auto", height: "42px", padding: "0 16px" }}
            >
              <RefreshCw size={15} className={loadingData ? "dbs-spin" : ""} />
              <span>Reload</span>
            </button>
          )}

          <button
            type="button"
            className="dbs-challan-print-btn"
            onClick={handlePrint}
            title="Print receipt copy"
            disabled={!receiptNo || feeItems.length === 0}
          >
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Form Details Card */}
      <div className="dbs-headmaster-form-card">
        <h3>Challan Details</h3>

        <div className="dbs-headmaster-grid">
          {/* Left Column 1: Receipt No with Search & onBlur (Primary Trigger) */}
          <div className="dbs-headmaster-input">
            <label>Receipt No *</label>
            <div className="dbs-challan-receipt-search-box">
              <input
                type="text"
                placeholder="Enter Receipt No (e.g. 113744)"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val) {
                    handleFetchChallanaData(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFetchChallanaData();
                }}
              />
              <button
                type="button"
                className="dbs-challan-search-icon-btn"
                onClick={() => handleFetchChallanaData()}
                disabled={loadingData || !receiptNo.trim()}
                title="Search by Receipt No"
              >
                {loadingData ? (
                  <Loader2 size={14} className="dbs-spin" />
                ) : (
                  <Search size={14} />
                )}
              </button>
            </div>
          </div>

          {/* Right Column 1: Date */}
          <div className="dbs-headmaster-input">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Select Date"
            />
          </div>

          {/* Left Column 2: S.S.No. / Reg.No. */}
          <div className="dbs-headmaster-input">
            <label>S.S.No. / Reg.No.</label>
            <input
              type="text"
              placeholder="e.g. 23761A0236"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
          </div>

          {/* Right Column 2: Student Name */}
          <div className="dbs-headmaster-input">
            <label>Student Name</label>
            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>

          {/* Left Column 3: Course */}
          <div className="dbs-headmaster-input">
            <label>Course</label>
            <input
              type="text"
              placeholder="Course e.g. B.Tech"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>

          {/* Right Column 3: Group / Branch */}
          <div className="dbs-headmaster-input">
            <label>Group</label>
            <input
              type="text"
              placeholder="Group e.g. EEE, CSE"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            />
          </div>

          {/* Left Column 4: Year */}
          <div className="dbs-headmaster-input">
            <label>Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">-- Select Year --</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          {/* Right Column 4: Caste */}
          <div className="dbs-headmaster-input">
            <label>Caste</label>
            <input
              type="text"
              placeholder="Caste e.g. SC, BC, FREE"
              value={caste}
              onChange={(e) => setCaste(e.target.value)}
            />
          </div>

          {/* Left Column 5: Term */}
          <div className="dbs-headmaster-input">
            <label>Term</label>
            <select value={term} onChange={(e) => setTerm(e.target.value)}>
              <option value="">-- Select Term --</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          {/* Right Column 5: Total Amount (Readonly) */}
          <div className="dbs-headmaster-input">
            <label>Total Amount</label>
            <input
              type="text"
              className="dbs-challan-input-readonly"
              value={`₹ ${formatAmount(totalAmount)}`}
              readOnly
            />
          </div>

          {/* Left Column 6: Payment Mode */}
          <div className="dbs-headmaster-input">
            <label>Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="">-- Select Payment Mode --</option>
              <option value="Bank Challan">Bank Challan</option>
              <option value="Cash">Cash</option>
              <option value="Online / NetBanking">Online / NetBanking</option>
              <option value="Cheque">Cheque</option>
              <option value="Demand Draft (DD)">Demand Draft (DD)</option>
              <option value="UPI / QR">UPI / QR</option>
              <option value="Card">Card</option>
            </select>
          </div>

          {/* Right Column 6: F.Year */}
          <div className="dbs-headmaster-input">
            <label>F.Year</label>
            <input
              type="text"
              placeholder="Apr-2017 to Mar-2018"
              value={fYear}
              onChange={(e) => setFYear(e.target.value)}
            />
          </div>

          {/* Left Column 7: Remark */}
          <div className="dbs-headmaster-input" style={{ gridColumn: "1 / -1" }}>
            <label>Remark *</label>
            <input
              type="text"
              placeholder="Enter remarks (required)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="dbs-headmaster-actions">
          <button
            type="button"
            className="dbs-headmaster-reset-btn"
            onClick={handleReset}
            disabled={saving || loadingData}
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="button"
            className="dbs-headmaster-save-btn"
            onClick={handleSave}
            disabled={saving || loadingData || !receiptNo || feeItems.length === 0}
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

      {/* Fee Breakdown Table Header */}
      <div className="dbs-headmaster-table-header">
        <div>
          <h2>Fee Breakdown</h2>
          <p className="dbs-headmaster-subtitle">
            Itemized breakdown of fee heads, previous payments, and editable amounts
          </p>
        </div>
      </div>

      {/* Fee Breakdown Table */}
      <div className="dbs-headmaster-table-container">
        {loadingData ? (
          <div className="dbs-empty-state">
            <Loader2 className="dbs-empty-state-icon dbs-spin" />
            <div className="dbs-empty-state-title">Loading Challan Details...</div>
            <div className="dbs-empty-state-desc">
              Retrieving student details and fee items for Receipt #{receiptNo}...
            </div>
          </div>
        ) : feeItems.length === 0 ? (
          <div className="dbs-empty-state">
            <FileText className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No Challan Loaded</div>
            <div className="dbs-empty-state-desc">
              Enter a <strong>Receipt No</strong> above and press <strong>Enter</strong> or click <strong>Search</strong> to load the student details and itemized fee breakdown.
            </div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div className="dbs-table-scroll active-scroll">
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th style={{ width: "7%", textAlign: "center" }}>S.NO</th>
                    <th style={{ width: "35%" }}>FEE NAME</th>
                    <th style={{ width: "22%" }}>FEE TYPE</th>
                    <th style={{ width: "12%", textAlign: "right" }}>FEE</th>
                    <th style={{ width: "12%", textAlign: "right" }}>PAID AMOUNT</th>
                    <th style={{ width: "12%", textAlign: "right" }}>AMOUNT</th>
                  </tr>
                </thead>

                <tbody>
                  {feeItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>{item.feeName}</td>
                      <td style={{ color: "var(--dbs-text-muted)" }}>
                        {item.feeType}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                        {item.fee}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                        {item.paidAmount}
                      </td>
                      <td className="dbs-challan-table-amount-td">
                        <input
                          type="text"
                          className="dbs-challan-table-input"
                          value={item.amount}
                          onChange={(e) =>
                            handleAmountChange(item.id, e.target.value)
                          }
                          onBlur={() => {
                            if (item.amount !== "" && String(item.amount) !== String(item.paidAmount)) {
                              handleSaveFeeChallanaRow(item);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveFeeChallanaRow(item);
                            }
                          }}
                          placeholder="0.00"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="dbs-challan-total-row">
                    <td colSpan={3} className="dbs-challan-total-label">
                      Total Summary ({feeItems.length} Heads):
                    </td>
                    <td className="dbs-challan-total-col-val fee">
                      ₹ {formatAmount(totalOriginalFee)}
                    </td>
                    <td className="dbs-challan-total-col-val paid">
                      ₹ {formatAmount(totalPaidAmount)}
                    </td>
                    <td className="dbs-challan-total-col-val current">
                      ₹ {formatAmount(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Financial Summary Cards */}
            <div className="dbs-challan-summary-grid">
              <div className="dbs-challan-summary-card">
                <span className="dbs-challan-summary-card-label">
                  Total Assigned Fee
                </span>
                <span className="dbs-challan-summary-card-value text-slate">
                  ₹ {formatAmount(totalOriginalFee)}
                </span>
              </div>

              <div className="dbs-challan-summary-card">
                <span className="dbs-challan-summary-card-label">
                  Total Paid Amount
                </span>
                <span className="dbs-challan-summary-card-value text-emerald">
                  ₹ {formatAmount(totalPaidAmount)}
                </span>
              </div>

              <div className="dbs-challan-summary-card primary">
                <span className="dbs-challan-summary-card-label">
                  Grand Total (Adjusted)
                </span>
                <span className="dbs-challan-summary-card-value text-primary">
                  ₹ {formatAmount(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditFeeChallana;
