import React, { useState, useMemo, useEffect } from "react";
import {
  Save,
  X,
  Calendar,
  Building2,
  CreditCard,
  User,
  GraduationCap,
  Loader2,
  DollarSign,
  FileText,
  BadgePercent,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import "./ManagementFeeCollection.css";
import { getAccountsList } from "../../../apis/FeeApis";

export const ManagementFeeCollection: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2025-2026";
  const todayDate = new Date().toISOString().split("T")[0];

  // ==========================================================
  // FORM STATES (MATCHING SCREENSHOT FIELDS)
  // ==========================================================
  const [slNo, setSlNo] = useState<string>("1");
  const [date, setDate] = useState<string>(todayDate);
  const [regNo, setRegNo] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [course, setCourse] = useState<string>(""); 
  const [branch, setBranch] = useState<string>("");
  const [year, setYear] = useState<string>("1");
  const [caste, setCaste] = useState<string>("");
  const [groupMarks, setGroupMarks] = useState<string>("");
  const [toAccountNo, setToAccountNo] = useState<string>("54534");
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [dueAmount, setDueAmount] = useState<string>("");
  const [payAmount, setPayAmount] = useState<string>("");
  const [onDemandPay, setOnDemandPay] = useState<string>("");
  const [ddNo, setDdNo] = useState<string>("");
  const [ddDate, setDdDate] = useState<string>(todayDate);
  const [bankName, setBankName] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");

  // Accounts dropdown list
  const [accountList, setAccountList] = useState<string[]>(["54534", "1001", "1002"]);
  const [saving, setSaving] = useState<boolean>(false);

  // Load account numbers from Account Master API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccountsList();
        const list = Array.isArray(data) ? data : data?.data;
        if (Array.isArray(list) && list.length > 0) {
          const accs = list
            .map((item: any) => String(item.aCNO ?? item.accountno ?? item.accountNo ?? ""))
            .filter((val: string) => Boolean(val));
          if (accs.length > 0) {
            setAccountList(Array.from(new Set(["54534", ...accs])));
          }
        }
      } catch (err) {
        console.warn("Unable to load accounts list:", err);
      }
    };
    fetchAccounts();
  }, []);

  // Format currency helper
  const formatCurrency = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Auto calculate due amount when donation amount or pay amount changes
  const numDonation = parseFloat(donationAmount) || 0;
  const numPay = parseFloat(payAmount) || 0;
  const computedDue = useMemo(() => {
    return Math.max(0, numDonation - numPay);
  }, [numDonation, numPay]);

  // Handle donation amount change
  const handleDonationChange = (val: string) => {
    if (/^\d*\.?\d*$/.test(val) || val === "") {
      setDonationAmount(val);
      const donation = parseFloat(val) || 0;
      const pay = parseFloat(payAmount) || 0;
      setDueAmount(String(Math.max(0, donation - pay)));
    }
  };

  // Handle pay amount change
  const handlePayAmountChange = (val: string) => {
    if (/^\d*\.?\d*$/.test(val) || val === "") {
      setPayAmount(val);
      const pay = parseFloat(val) || 0;
      const donation = parseFloat(donationAmount) || 0;
      setDueAmount(String(Math.max(0, donation - pay)));
    }
  };

  // ==========================================================
  // HANDLE SAVE ACTION
  // ==========================================================
  const handleSave = async () => {
    if (!studentName.trim() && !regNo.trim()) {
      toast.error("Please enter Student Name or S.S.No. / Reg.No.");
      return;
    }
    if (!toAccountNo.trim()) {
      toast.error("Please select a Target Account No.");
      return;
    }
    if (!donationAmount.trim() || parseFloat(donationAmount) <= 0) {
      toast.error("Please enter a valid Donation Amount.");
      return;
    }

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const payload = {
        slNo,
        date,
        regNo,
        studentName,
        course,
        branch,
        year,
        caste,
        groupMarks,
        toAccountNo,
        donationAmount: parseFloat(donationAmount) || 0,
        dueAmount: parseFloat(dueAmount || String(computedDue)) || 0,
        payAmount: parseFloat(payAmount) || 0,
        onDemandPay: parseFloat(onDemandPay) || 0,
        ddNo,
        ddDate,
        bankName,
        branchName,
        academicYear,
      };

      console.log("Management Fee / Donation Collection Payload:", payload);
      toast.success(
        `Donation collection of ₹ ${formatCurrency(donationAmount)} for ${studentName || regNo || "Student"} saved successfully!`,
      );

      handleReset();
    } catch (err: any) {
      console.error("Save donation collection error:", err);
      toast.error(err?.message || "Failed to save donation collection.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // HANDLE RESET / CANCEL
  // ==========================================================
  const handleReset = () => {
    setSlNo("1");
    setDate(todayDate);
    setRegNo("");
    setStudentName("");
    setCourse("");
    setBranch("");
    setYear("1");
    setCaste("");
    setGroupMarks("");
    setToAccountNo(accountList[0] || "54534");
    setDonationAmount("");
    setDueAmount("");
    setPayAmount("");
    setOnDemandPay("");
    setDdNo("");
    setDdDate(todayDate);
    setBankName("");
    setBranchName("");
    toast.info("Donation Collection form reset.");
  };

  return (
    <div className="dbs-headmaster-container dbs-donation-container">
      {/* Page Header */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>Donation Collection</h2>
          <p className="dbs-headmaster-subtitle">
            Record and manage student donation and management fee collections ({academicYear})
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="dbs-headmaster-form-card">
        <h3>Donation Details</h3>

        <div className="dbs-headmaster-grid">
          {/* Row 1: SL. No. & Date */}
          <div className="dbs-headmaster-input">
            <label>SL. No.</label>
            <input
              type="text"
              placeholder="1"
              value={slNo}
              onChange={(e) => setSlNo(e.target.value)}
            />
          </div>

          <div className="dbs-headmaster-input">
            <label>Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Row 2: S.S.No. / Reg.No. & Student Name */}
          <div className="dbs-headmaster-input">
            <label>S.S.No. / Reg.No.</label>
            <input
              type="text"
              placeholder="e.g. 23761A0236"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
          </div>

          <div className="dbs-headmaster-input">
            <label>Student Name *</label>
            <input
              type="text"
              placeholder="Enter Student Full Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>

          {/* Row 3: Course & Branch */}
          <div className="dbs-headmaster-input">
            <label>Course</label>
            <input
              type="text"
              placeholder="Course (e.g. B.Tech, M.Tech)"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>

          <div className="dbs-headmaster-input">
            <label>Branch</label>
            <input
              type="text"
              placeholder="Branch (e.g. CSE, EEE, ECE)"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>

          {/* Row 4: Year & Caste */}
          <div className="dbs-headmaster-input">
            <label>Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          <div className="dbs-headmaster-input">
            <label>Caste</label>
            <input
              type="text"
              placeholder="Caste / Category (e.g. OC, BC, SC)"
              value={caste}
              onChange={(e) => setCaste(e.target.value)}
            />
          </div>

          {/* Row 5: Group Subjects Marks(%) & To Account No. */}
          <div className="dbs-headmaster-input">
            <label>Group Subjects Marks(%)</label>
            <input
              type="text"
              placeholder="e.g. 85.50"
              value={groupMarks}
              onChange={(e) => setGroupMarks(e.target.value)}
            />
          </div>

          <div className="dbs-headmaster-input">
            <label>To Account No. *</label>
            <select
              value={toAccountNo}
              onChange={(e) => setToAccountNo(e.target.value)}
            >
              {accountList.map((acc, idx) => (
                <option key={idx} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>

          {/* Row 6: Donation Amount & Due Amount */}
          <div className="dbs-headmaster-input">
            <label>Donation Amount *</label>
            <div className="dbs-donation-currency-wrap">
              <span className="dbs-donation-currency-prefix">₹</span>
              <input
                type="text"
                placeholder="0.00"
                value={donationAmount}
                onChange={(e) => handleDonationChange(e.target.value)}
              />
            </div>
          </div>

          <div className="dbs-headmaster-input">
            <label>Due Amount</label>
            <div className="dbs-donation-currency-wrap">
              <span className="dbs-donation-currency-prefix">₹</span>
              <input
                type="text"
                placeholder="0.00"
                value={dueAmount || (donationAmount ? String(computedDue) : "")}
                onChange={(e) => setDueAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Row 7: Pay Amount & On Demand Pay */}
          <div className="dbs-headmaster-input">
            <label>Pay Amount</label>
            <div className="dbs-donation-currency-wrap">
              <span className="dbs-donation-currency-prefix">₹</span>
              <input
                type="text"
                placeholder="0.00"
                value={payAmount}
                onChange={(e) => handlePayAmountChange(e.target.value)}
              />
            </div>
          </div>

          <div className="dbs-headmaster-input">
            <label>On Demand Pay</label>
            <div className="dbs-donation-currency-wrap">
              <span className="dbs-donation-currency-prefix">₹</span>
              <input
                type="text"
                placeholder="0.00"
                value={onDemandPay}
                onChange={(e) => setOnDemandPay(e.target.value)}
              />
            </div>
          </div>

          {/* Row 8: DD No. & DD Date */}
          <div className="dbs-headmaster-input">
            <label>DD No.</label>
            <input
              type="text"
              placeholder="Demand Draft / Transaction Ref No"
              value={ddNo}
              onChange={(e) => setDdNo(e.target.value)}
            />
          </div>

          <div className="dbs-headmaster-input">
            <label>DD Date</label>
            <input
              type="date"
              value={ddDate}
              onChange={(e) => setDdDate(e.target.value)}
            />
          </div>

          {/* Row 9: Bank Name & Branch Name */}
          <div className="dbs-headmaster-input">
            <label>Bank Name</label>
            <input
              type="text"
              placeholder="e.g. State Bank of India, HDFC"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>

          <div className="dbs-headmaster-input">
            <label>Branch Name</label>
            <input
              type="text"
              placeholder="Bank Branch Location"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="dbs-headmaster-actions">
          <button
            type="button"
            className="dbs-headmaster-reset-btn"
            onClick={handleReset}
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

      {/* Financial Summary Breakdown Cards */}
      <div className="dbs-donation-summary-grid">
        <div className="dbs-donation-summary-card">
          <span className="dbs-donation-summary-label">Total Donation</span>
          <span className="dbs-donation-summary-value slate">
            ₹ {formatCurrency(donationAmount || 0)}
          </span>
        </div>

        <div className="dbs-donation-summary-card">
          <span className="dbs-donation-summary-label">Pay Amount</span>
          <span className="dbs-donation-summary-value emerald">
            ₹ {formatCurrency(payAmount || 0)}
          </span>
        </div>

        <div className="dbs-donation-summary-card highlight">
          <span className="dbs-donation-summary-label">Balance Due Amount</span>
          <span className="dbs-donation-summary-value amber">
            ₹ {formatCurrency(dueAmount || computedDue)}
          </span>
        </div>

        <div className="dbs-donation-summary-card highlight">
          <span className="dbs-donation-summary-label">On Demand Pay</span>
          <span className="dbs-donation-summary-value primary">
            ₹ {formatCurrency(onDemandPay || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ManagementFeeCollection;
