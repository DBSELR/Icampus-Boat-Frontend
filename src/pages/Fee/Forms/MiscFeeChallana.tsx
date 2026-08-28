import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  X,
  Printer,
  Search,
  Loader2,
  Receipt,
  FileCheck,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import "./MiscFeeChallana.css";
import {
  getMiscFeeChallanaFeeList,
  getMiscFeeChallanaReceiptNo,
  getMiscFeeChallanaSSNo,
  getMiscFeeChallanaAdmissionLoad,
  saveMiscFeeChallana,
} from "../../../apis/FeeApis";

export interface MiscFeeItem {
  id: string | number;
  sNo: number;
  feeName: string;
  feeType: string;
  accountNo: string;
  payAmount: string | number;
  selected: boolean;
}

const DEFAULT_MISC_TYPES = ["Student", "Others"];

const DEFAULT_PAYMENT_MODES = [
  { value: "0", label: "Select Payment Mode" },
  { value: "Bank Challan", label: "Bank Challan" },
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
  { value: "DD", label: "DD" },
];

const INITIAL_MISC_HEADS: MiscFeeItem[] = [
  {
    id: 1,
    sNo: 1,
    feeName: "ID CARD",
    feeType: "MISC FEE",
    accountNo: "54534",
    payAmount: "100.00",
    selected: false,
  },
  {
    id: 2,
    sNo: 2,
    feeName: "BUS PASS",
    feeType: "MISC FEE",
    accountNo: "54535",
    payAmount: "500.00",
    selected: false,
  },
  {
    id: 3,
    sNo: 3,
    feeName: "LIBRARY FINE",
    feeType: "MISC FEE",
    accountNo: "54536",
    payAmount: "50.00",
    selected: false,
  },
  {
    id: 4,
    sNo: 4,
    feeName: "CERTIFICATE FEE",
    feeType: "MISC FEE",
    accountNo: "54537",
    payAmount: "200.00",
    selected: false,
  },
  {
    id: 5,
    sNo: 5,
    feeName: "DUPLICATE ID CARD",
    feeType: "MISC FEE",
    accountNo: "54534",
    payAmount: "150.00",
    selected: false,
  },
  {
    id: 6,
    sNo: 6,
    feeName: "LAB BREAKAGE",
    feeType: "MISC FEE",
    accountNo: "54538",
    payAmount: "250.00",
    selected: false,
  },
];

const getFormattedToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatToYearMonthDate = (val: string): string => {
  if (!val) return "";
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
    return trimmed.replace(/\//g, "-");
  }
  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    } else if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return trimmed;
};

const formatDisplayDate = (val: string): string => {
  if (!val) return "";
  const parts = val.trim().split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return val;
};

function numberToWords(num: number): string {
  if (num === 0) return "ZERO RUPEES ONLY";
  const a = [
    "",
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN",
    "ELEVEN",
    "TWELVE",
    "THIRTEEN",
    "FOURTEEN",
    "FIFTEEN",
    "SIXTEEN",
    "SEVENTEEN",
    "EIGHTEEN",
    "NINETEEN",
  ];
  const b = [
    "",
    "",
    "TWENTY",
    "THIRTY",
    "FORTY",
    "FIFTY",
    "SIXTY",
    "SEVENTY",
    "EIGHTY",
    "NINETY",
  ];

  const numToWordsChunk = (n: number): string => {
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " HUNDRED ";
      n %= 100;
      if (n > 0) str += "AND ";
    }
    if (n >= 20) {
      str += b[Math.floor(n / 20)] + (n % 20 !== 0 ? "-" + a[n % 20] : "") + " ";
    } else if (n > 0) {
      str += a[n] + " ";
    }
    return str.trim();
  };

  let result = "";
  if (num >= 10000000) {
    result += numToWordsChunk(Math.floor(num / 10000000)) + " CRORE ";
    num %= 10000000;
  }
  if (num >= 100000) {
    result += numToWordsChunk(Math.floor(num / 100000)) + " LAKH ";
    num %= 100000;
  }
  if (num >= 1000) {
    result += numToWordsChunk(Math.floor(num / 1000)) + " THOUSAND ";
    num %= 1000;
  }
  if (num > 0) {
    result += numToWordsChunk(num);
  }
  return (result.trim() + " RUPEES ONLY").toUpperCase();
}

function numberToWordsTitleCase(num: number): string {
  if (num === 0) return "Zero Only";
  const raw = numberToWords(num);
  const clean = raw
    .replace(/ RUPEES ONLY$/i, " Only")
    .replace(/ RUPEES$/i, "")
    .toLowerCase();
  return clean
    .split(" ")
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");
}


export const MiscFeeChallana: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2024-2025";

  // Form Fields matching screenshot
  const [receiptNo, setReceiptNo] = useState<string>("1");
  const [date, setDate] = useState<string>(getFormattedToday());
  const [miscType, setMiscType] = useState<string>("Student");
  const [ssNoRegNo, setSsNoRegNo] = useState<string>("");
  const [studentSerialNo, setStudentSerialNo] = useState<string>("");
  const [studentYear, setStudentYear] = useState<string>("1");
  const [name, setName] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [yearCourseBranch, setYearCourseBranch] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<string>("Cash");
  const [chequeDdNo, setChequeDdNo] = useState<string>("");
  const [chequeDdDate, setChequeDdDate] = useState<string>("");
  const [bank, setBank] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");

  // Fee Items Breakdown Table
  const [feeItems, setFeeItems] = useState<MiscFeeItem[]>(INITIAL_MISC_HEADS);
  const [loadingHeads, setLoadingHeads] = useState<boolean>(false);

  // Operation states
  const [searchingStudent, setSearchingStudent] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Printable Challan Receipt Preview Modal
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Enable Cheque/DD fields for Bank Challan and Cheque; disable for DD and Cash
  const isBankOrCheque =
    paymentMode === "Bank Challan" || paymentMode === "Cheque";
  const isPaymentDetailsDisabled = !isBankOrCheque;

  // ==========================================================
  // 1. FETCH RECEIPT NO (MiscFeeChallana/GetReceiptNo)
  // ==========================================================
  const fetchReceiptNo = async () => {
    try {
      const currentAcademicYear =
        localStorage.getItem("academicYear") || "2024-2025";
      const payload = {
        academicYear: currentAcademicYear,
      };
      const res = await getMiscFeeChallanaReceiptNo(payload);
      const list = Array.isArray(res) ? res : res?.data;

      if (Array.isArray(list) && list.length > 0) {
        const no =
          list[0]?.rECPTNO ??
          list[0]?.recptno ??
          list[0]?.receiptNo ??
          list[0]?.rECEIPTNO;
        if (no !== undefined && no !== null) {
          setReceiptNo(String(no));
        }
      }
    } catch (err) {
      console.error("Error fetching Misc Fee Challana Receipt No:", err);
    }
  };

  // ==========================================================
  // 2. FETCH MISCELLANEOUS FEE LIST (MiscFeeChallana/FeeList)
  // ==========================================================
  const fetchFeeList = async () => {
    try {
      setLoadingHeads(true);
      const currentAcademicYear =
        localStorage.getItem("academicYear") || "2024-2025";
      const payload = {
        academicYear: currentAcademicYear,
      };
      const res = await getMiscFeeChallanaFeeList(payload);
      const list = Array.isArray(res) ? res : res?.data;

      if (Array.isArray(list) && list.length > 0) {
        const mapped: MiscFeeItem[] = list.map((item: any, idx: number) => ({
          id: item.iD ?? item.id ?? idx + 1,
          sNo: idx + 1,
          feeName: item.fEENAME ?? item.feename ?? item.feeName ?? "MISC FEE",
          feeType: item.fEETYPE ?? item.feetype ?? item.feeType ?? "MISC FEE",
          accountNo:
            item.aCCOUNTNO ??
            item.aCNO ??
            item.accountno ??
            item.accountNo ??
            "",
          payAmount:
            item.aMOUNT !== undefined && item.aMOUNT !== null
              ? String(item.aMOUNT)
              : "100.00",
          selected: false,
        }));
        setFeeItems(mapped);
      } else {
        setFeeItems([]);
      }
    } catch (err) {
      console.error("Error fetching Misc Fee Challana FeeList:", err);
      toast.error("Failed to load fee list from server");
    } finally {
      setLoadingHeads(false);
    }
  };

  useEffect(() => {
    fetchReceiptNo();
    fetchFeeList();
  }, [academicYear]);

  // ==========================================================
  // 3. MISC TYPE CHANGE HANDLER
  // ==========================================================
  const handleMiscTypeChange = (selected: string) => {
    setMiscType(selected);
    if (selected === "Others") {
      setSsNoRegNo("");
      setStudentSerialNo("");
    }
  };

  // ==========================================================
  // 4. PAYMENT MODE CHANGE HANDLER
  // ==========================================================
  const handlePaymentModeChange = (mode: string) => {
    setPaymentMode(mode);
    if (mode === "Bank Challan" || mode === "Cheque") {
      if (!chequeDdDate) {
        setChequeDdDate(getFormattedToday());
      }
    } else {
      setChequeDdNo("");
      setChequeDdDate("");
      setBank("");
      setBranchName("");
    }
  };

  // ==========================================================
  // 5. STUDENT AUTO-LOOKUP (GetSSNo -> FeeChallanaAdmissionLoad)
  // ==========================================================
  const handleSearchStudent = async () => {
    if (miscType === "Others") return;

    const searchVal = ssNoRegNo.trim();
    if (!searchVal) {
      toast.error("Please enter a S.S.No. / Reg.No.");
      return;
    }

    try {
      setSearchingStudent(true);

      // Step 1: Call GetSSNo API
      const ssNoRes = await getMiscFeeChallanaSSNo({ ssNo: searchVal });
      const ssNoList = Array.isArray(ssNoRes) ? ssNoRes : ssNoRes?.data;

      let serialNo = searchVal;
      if (Array.isArray(ssNoList) && ssNoList.length > 0) {
        serialNo =
          ssNoList[0]?.studentSerialNo ||
          ssNoList[0]?.StudentSerialNo ||
          ssNoList[0]?.sSNO ||
          searchVal;
      }
      setStudentSerialNo(serialNo);

      // Step 2: Call FeeChallanaAdmissionLoad API with studentSerialNo
      const admRes = await getMiscFeeChallanaAdmissionLoad({ ssNo: serialNo });
      const admList = Array.isArray(admRes) ? admRes : admRes?.data;

      if (Array.isArray(admList) && admList.length > 0) {
        const student = admList[0];
        const sName =
          student.sName ||
          student.SNAME ||
          student.studentName ||
          student.STUDENTNAME ||
          "";
        const course =
          student.cOURSE ||
          student.COURSE ||
          student.course ||
          "";
        const branchName =
          student.bRANCHNAME ||
          student.BRANCHNAME ||
          student.branchName ||
          student.BRANCH ||
          "";
        const sYear = String(
          student.sYear ??
            student.SYEAR ??
            student.year ??
            student.YEAR ??
            "1",
        );

        if (sName) setName(sName);
        setStudentYear(sYear);

        const parts = [
          sYear ? (sYear.startsWith("Year") ? sYear : `Year ${sYear}`) : "",
          course,
          branchName,
        ].filter(Boolean);

        if (parts.length > 0) {
          setYearCourseBranch(parts.join(" / "));
        }

        toast.success(`Student data loaded for ${searchVal}`);
      } else {
        toast.info(
          `No student details returned for ${searchVal}. You can enter details manually.`,
        );
      }
    } catch (err) {
      console.error("Student lookup error:", err);
      toast.error("Could not fetch student details. Please fill manually.");
    } finally {
      setSearchingStudent(false);
    }
  };

  // ==========================================================
  // 6. TABLE ROW INTERACTIONS
  // ==========================================================
  const handleToggleRow = (index: number) => {
    setFeeItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selected: !updated[index].selected,
      };
      return updated;
    });
  };

  const handleAmountChange = (index: number, val: string) => {
    if (!/^\d*\.?\d*$/.test(val) && val !== "") return;
    setFeeItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        payAmount: val,
      };
      return updated;
    });
  };

  // ==========================================================
  // 7. COMPUTED TOTAL PAY AMOUNT
  // ==========================================================
  const totalPayAmount = useMemo(() => {
    return feeItems.reduce((acc, item) => {
      if (!item.selected) return acc;
      const val = parseFloat(String(item.payAmount)) || 0;
      return acc + val;
    }, 0);
  }, [feeItems]);

  const selectedFeeItems = useMemo(() => {
    return feeItems.filter((item) => item.selected);
  }, [feeItems]);

  // ==========================================================
  // 8. ACTIONS: SAVE, CANCEL, REPRINT
  // ==========================================================
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!paymentMode || paymentMode === "0") {
      toast.error("Please select a Payment Mode");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter Payee / Student Name");
      return;
    }

    if (selectedFeeItems.length === 0) {
      toast.error("Please select at least one fee head item from the table");
      return;
    }

    if (totalPayAmount <= 0) {
      toast.error("Total pay amount must be greater than 0.00");
      return;
    }

    try {
      setSaving(true);

      const currentAcademicYear =
        localStorage.getItem("academicYear") || "2024-2025";

      // Save each selected fee item
      for (const item of selectedFeeItems) {
        const payload = {
          ReceiptNO: String(receiptNo || ""),
          Date: formatToYearMonthDate(date),
          SSNo: String(studentSerialNo || ssNoRegNo || ""),
          MiscType: String(miscType || ""),
          AcademicYear: String(currentAcademicYear || ""),
          FYear: String(currentAcademicYear || ""),
          Year: String(studentYear || "1"),
          PaymentMode: String(paymentMode || ""),
          Name: String(name || "").trim(),
          Purpose: String(purpose || "").trim(),
          DDNo: isBankOrCheque ? String(chequeDdNo || "").trim() : "",
          DDDate: isBankOrCheque ? formatToYearMonthDate(chequeDdDate) : "",
          Bank: isBankOrCheque ? String(bank || "").trim() : "",
          Branch: isBankOrCheque ? String(branchName || "").trim() : "",
          FeeId: String(item.id || 0),
          FeeName: String(item.feeName || ""),
          FeeType: String(item.feeType || ""),
          ACNO: String(item.accountNo || ""),
          PayAmount: String(item.payAmount || "0"),
          CID: "0",
        };

        console.log("Saving Misc Fee Challana item (all string payload with YYYY-MM-DD):", payload);
        await saveMiscFeeChallana(payload);
      }

      toast.success(
        `Miscellaneous Fee Challan #${receiptNo} of ₹${totalPayAmount.toFixed(2)} saved successfully!`,
      );

      // Automatically open print preview
      setShowPrintModal(true);

      // Refresh / Fetch next Receipt No from API
      await fetchReceiptNo();
    } catch (err: any) {
      console.error("Save Challan Error:", err);
      toast.error(err?.message || "Failed to save Miscellaneous Fee Challan");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchReceiptNo();
    setSsNoRegNo("");
    setStudentSerialNo("");
    setName("");
    setPurpose("");
    setYearCourseBranch("");
    setPaymentMode("Cash");
    setChequeDdNo("");
    setChequeDdDate("");
    setBank("");
    setBranchName("");
    setFeeItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: false,
      })),
    );
    toast.info("Challan form reset.");
  };

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="dbs-headmaster-container dbs-misc-challan-container">
      {/* Page Header */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>Miscellaneous Fee Challan</h2>
          <p className="dbs-headmaster-subtitle">
            Generate and manage miscellaneous student & staff fee challans ({academicYear})
          </p>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="dbs-headmaster-form-card">
        <h3>Miscellaneous Fee Challan Configuration</h3>

        <form onSubmit={handleSave}>
          <div className="dbs-headmaster-grid">
            {/* Receipt No. */}
            <div className="dbs-headmaster-input">
              <label>Receipt No. *</label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                onBlur={() => {
                  if (!receiptNo.trim()) {
                    fetchReceiptNo();
                  }
                }}
                placeholder="Receipt No."
              />
            </div>

            {/* Date */}
            <div className="dbs-headmaster-input">
              <label>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>

            {/* Misc. Type */}
            <div className="dbs-headmaster-input">
              <label>Misc. Type *</label>
              <select
                value={miscType}
                onChange={(e) => handleMiscTypeChange(e.target.value)}
              >
                {DEFAULT_MISC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* S.S.No. / Reg.No. with Lookup Action Button */}
            <div className="dbs-headmaster-input">
              <label>S.S.No. / Reg.No.</label>
              <div className="dbs-input-with-action">
                <input
                  type="text"
                  value={ssNoRegNo}
                  onChange={(e) => setSsNoRegNo(e.target.value)}
                  disabled={miscType === "Others" || searchingStudent}
                  onBlur={() => {
                    if (miscType !== "Others" && ssNoRegNo.trim() && !name) {
                      handleSearchStudent();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchStudent();
                    }
                  }}
                  placeholder={
                    miscType === "Others"
                      ? "Disabled for Others"
                      : "e.g. 24761A0501"
                  }
                />
                <button
                  type="button"
                  className="dbs-input-action-btn"
                  onClick={handleSearchStudent}
                  disabled={
                    miscType === "Others" ||
                    searchingStudent ||
                    !ssNoRegNo.trim()
                  }
                  title="Search Student Record"
                >
                  {searchingStudent ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="dbs-headmaster-input">
              <label>Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter student / payee name"
              />
            </div>

            {/* Purpose */}
            <div className="dbs-headmaster-input">
              <label>Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. ID Card Replacement, Library Dues"
              />
            </div>

            {/* Year / Course / Branch */}
            <div className="dbs-headmaster-input">
              <label>Year / Course / Branch</label>
              <input
                type="text"
                value={yearCourseBranch}
                onChange={(e) => setYearCourseBranch(e.target.value)}
                placeholder="e.g. IV / B.Tech / CSE"
              />
            </div>

            {/* Payment Mode */}
            <div className="dbs-headmaster-input">
              <label>Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={(e) => handlePaymentModeChange(e.target.value)}
              >
                {DEFAULT_PAYMENT_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cheque / DD No. */}
            <div className="dbs-headmaster-input">
              <label>Cheque / DD No.</label>
              <input
                type="text"
                value={chequeDdNo}
                onChange={(e) => setChequeDdNo(e.target.value)}
                disabled={isPaymentDetailsDisabled}
                readOnly={isPaymentDetailsDisabled}
                placeholder={
                  isPaymentDetailsDisabled
                    ? "N/A"
                    : "Cheque / DD Reference"
                }
              />
            </div>

            {/* Cheque / DD Date */}
            <div className="dbs-headmaster-input">
              <label>Cheque / DD Date</label>
              <input
                type="date"
                value={chequeDdDate}
                onChange={(e) => setChequeDdDate(e.target.value)}
                disabled={isPaymentDetailsDisabled}
                readOnly={isPaymentDetailsDisabled}
                placeholder={
                  isPaymentDetailsDisabled ? "N/A" : "YYYY-MM-DD"
                }
              />
            </div>

            {/* Bank */}
            <div className="dbs-headmaster-input">
              <label>Bank</label>
              <input
                type="text"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                disabled={isPaymentDetailsDisabled}
                readOnly={isPaymentDetailsDisabled}
                placeholder={
                  isPaymentDetailsDisabled
                    ? "N/A"
                    : "e.g. State Bank of India"
                }
              />
            </div>

            {/* Branch Name */}
            <div className="dbs-headmaster-input">
              <label>Branch Name</label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                disabled={isPaymentDetailsDisabled}
                readOnly={isPaymentDetailsDisabled}
                placeholder={
                  isPaymentDetailsDisabled
                    ? "N/A"
                    : "Bank branch name"
                }
              />
            </div>
          </div>

          {/* Action Buttons: Cancel, Save */}
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
              type="submit"
              className="dbs-headmaster-save-btn"
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>

      {/* Table Section Header */}
      <div className="dbs-headmaster-table-header">
        <div>
          <h2>Miscellaneous Fee Particulars</h2>
          <p className="dbs-headmaster-subtitle">
            Select fee heads to include and specify payment amounts
          </p>
        </div>
      </div>

      {/* Table Container in HeadMaster style */}
      <div className="dbs-headmaster-table-container">
        {loadingHeads ? (
          <div className="dbs-empty-state">
            <Loader2 className="dbs-empty-state-icon animate-spin" />
            <div className="dbs-empty-state-title">Loading Fee Heads...</div>
            <div className="dbs-empty-state-desc">
              Please wait while we retrieve the records.
            </div>
          </div>
        ) : feeItems.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No fee heads found</div>
            <div className="dbs-empty-state-desc">
              Configure miscellaneous fee heads to view them here.
            </div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div className="dbs-table-scroll active-scroll">
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th style={{ width: "8%", textAlign: "center" }}>S.NO</th>
                    <th style={{ width: "32%" }}>FEE NAME</th>
                    <th style={{ width: "20%" }}>FEE TYPE</th>
                    <th style={{ width: "16%" }}>ACCOUNT NO.</th>
                    <th style={{ width: "16%", textAlign: "right" }}>PAY AMOUNT</th>
                    <th style={{ width: "8%", textAlign: "center" }}>SELECT</th>
                  </tr>
                </thead>

                <tbody>
                  {feeItems.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      style={{
                        backgroundColor: item.selected
                          ? "rgba(14, 116, 144, 0.05)"
                          : undefined,
                      }}
                    >
                      <td style={{ textAlign: "center", fontWeight: 600 }}>{item.sNo}</td>
                      <td style={{ fontWeight: 700, color: "var(--dbs-text, #1e293b)" }}>
                        {item.feeName}
                      </td>
                      <td>
                        <span
                          style={{
                            background: "var(--dbs-surface-muted, #f1f5f9)",
                            padding: "3px 10px",
                            borderRadius: "4px",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "var(--dbs-primary, #0e7490)",
                            border: "1px solid var(--dbs-border, #e2e8f0)",
                          }}
                        >
                          {item.feeType}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontWeight: 600 }}>
                        {item.accountNo}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <input
                          type="text"
                          value={item.payAmount}
                          onChange={(e) => handleAmountChange(idx, e.target.value)}
                          className="dbs-table-amount-input"
                          placeholder="0.00"
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleToggleRow(idx)}
                          className="dbs-table-checkbox"
                          title="Select fee head"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Total Pay Amount Summary Card */}
      <div className="dbs-challan-total-bar">
        <span className="dbs-challan-total-label">Total Pay Amount :</span>
        <span className="dbs-challan-total-val">₹ {formatCurrency(totalPayAmount)}</span>
      </div>

      {/* ==========================================================
          PRINTABLE CHALLAN RECEIPT PREVIEW MODAL
      ========================================================== */}
      {showPrintModal && (
        <div className="dbs-misc-modal-overlay">
          <div className="dbs-misc-modal-box">
            {/* Modal Header */}
            <div className="dbs-misc-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileCheck size={18} />
                <span>Miscellaneous Fee Challan / Receipt</span>
              </div>
              <button
                type="button"
                className="dbs-misc-modal-close-btn"
                onClick={() => setShowPrintModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Receipt Body */}
            <div className="dbs-misc-modal-body">
              <div className="dbs-misc-receipt-sheet" id="printable-misc-receipt">
                {/* Top Header Row with Logo, Title, and Pill */}
                <div className="dbs-receipt-header-row">
                  {/* Left College Logo */}
                  <div className="dbs-receipt-logo-wrap">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="50" cy="50" r="46" stroke="#475569" strokeWidth="3" strokeDasharray="4 2" />
                      <circle cx="50" cy="50" r="38" stroke="#000000" strokeWidth="2" />
                      <circle cx="50" cy="50" r="28" fill="#f8fafc" stroke="#000000" strokeWidth="1.5" />
                      <path
                        d="M50 28 L54 40 L67 40 L57 48 L61 60 L50 52 L39 60 L43 48 L33 40 L46 40 Z"
                        fill="#0284c7"
                        opacity="0.85"
                      />
                      <circle cx="50" cy="50" r="10" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
                      <text x="50" y="53" fontSize="7" textAnchor="middle" fontWeight="bold" fill="#000000">
                        LBRCE
                      </text>
                    </svg>
                  </div>

                  {/* Center Title & Pill */}
                  <div className="dbs-receipt-center-header">
                    <div className="dbs-receipt-college-title">
                      LAKIREDDY BALI REDDY COLLEGE OF ENGINEERING (AUTONOMOUS)
                    </div>
                    <div className="dbs-receipt-pill">
                      MISCELLANEOUS RECEIPT
                    </div>
                  </div>
                </div>

                {/* Student Copy */}
                <div className="dbs-receipt-copy-type">
                  Student Copy
                </div>

                {/* Horizontal Divider Line */}
                <div className="dbs-receipt-hr" />

                {/* Pupil & Challan Meta Section */}
                <div className="dbs-receipt-meta-section">
                  {/* Row 1 */}
                  <div className="dbs-receipt-meta-row">
                    <div style={{ flex: 1.2 }}>
                      <span className="dbs-receipt-meta-label">Receipt No.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;</span>
                      <span className="dbs-receipt-meta-val">{receiptNo}</span>
                    </div>
                    <div style={{ flex: 1.2, textAlign: "center" }}>
                      <span className="dbs-receipt-meta-label">A/C No.&nbsp;:&nbsp;</span>
                      <span className="dbs-receipt-meta-val">
                        {selectedFeeItems[0]?.accountNo || "54534"}
                      </span>
                    </div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <span className="dbs-receipt-meta-label">Date&nbsp;&nbsp;:&nbsp;</span>
                      <span className="dbs-receipt-meta-val">{formatDisplayDate(date)}</span>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="dbs-receipt-meta-row" style={{ marginTop: "4px" }}>
                    <div>
                      <span className="dbs-receipt-meta-label">Name of Pupil&nbsp;&nbsp;:&nbsp;</span>
                      <span className="dbs-receipt-meta-val" style={{ textTransform: "uppercase" }}>
                        {name || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="dbs-receipt-meta-row" style={{ marginTop: "4px" }}>
                    <div style={{ flex: 1 }}>
                      <span className="dbs-receipt-meta-label">Branch&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;</span>
                      <span className="dbs-receipt-meta-val">
                        {yearCourseBranch || "N/A"}
                      </span>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span className="dbs-receipt-meta-label">SSNo.:&nbsp;</span>
                      <span className="dbs-receipt-meta-val">
                        {studentSerialNo || ssNoRegNo || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table Area */}
                <div className="dbs-receipt-table-wrapper">
                  <table className="dbs-receipt-table">
                    <thead>
                      <tr>
                        <th className="col-particulars">Particulars</th>
                        <th className="col-amount">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFeeItems.length > 0 ? (
                        selectedFeeItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="cell-particulars">{item.feeName}</td>
                            <td className="cell-amount">
                              {Number(item.payAmount).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="cell-particulars">No fee heads selected</td>
                          <td className="cell-amount">0.00</td>
                        </tr>
                      )}

                      {/* Spacer row to maintain proper receipt height and vertical divider */}
                      <tr className="row-empty">
                        <td className="cell-particulars" />
                        <td className="cell-amount" />
                      </tr>

                      {/* Total Row */}
                      <tr className="row-total">
                        <td className="cell-total-label">Total</td>
                        <td className="cell-total-amount">
                          {totalPayAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Amount in words */}
                <div className="dbs-receipt-words-section">
                  <strong>Rupees</strong>
                  <span>{numberToWordsTitleCase(totalPayAmount)}</span>
                </div>

                {/* Signatures */}
                <div className="dbs-receipt-sign-section">
                  <div className="dbs-receipt-sign-col">
                    <div className="dbs-receipt-sign-title">Clerk</div>
                  </div>

                  <div className="dbs-receipt-sign-col">
                    <div className="dbs-receipt-sign-img">
                      <svg width="120" height="24" viewBox="0 0 120 24" fill="none">
                        <path
                          d="M10 18 Q 30 4, 50 16 T 85 10 T 115 14"
                          stroke="#334155"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    </div>
                    <div className="dbs-receipt-sign-title">Principal</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="dbs-misc-modal-actions">
              <button
                type="button"
                className="dbs-headmaster-reset-btn"
                onClick={() => setShowPrintModal(false)}
                style={{ minWidth: "100px" }}
              >
                <X size={16} />
                Close
              </button>
              <button
                type="button"
                className="dbs-headmaster-save-btn"
                onClick={() => window.print()}
                style={{ minWidth: "120px" }}
              >
                <Printer size={16} />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiscFeeChallana;

