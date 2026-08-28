import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Save,
  RefreshCw,
  AlertCircle,
  CreditCard,
  User,
  Printer,
  FileText,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import "./FeeRefundAmount.css";
import {
  getFeeRefundCurrentAcyr,
  getRefundReceiptNo,
  getFeeRefundStudentSSNo,
  getFeeRefundStudentData,
  getFeeRefundTerms,
  getFeeRefundDetails,
  getFeeRefundDues,
  saveFeeRefundAmount,
  getFeeRefundPaidAmount,
  getFeeRefundPrintReceiptNo,
  getFeeReceiptDataRefund
} from "../../../apis/FeeApis";

export const FeeRefundAmount: React.FC = () => {
  // Top Header Search & Student Details
  const [topSearch, setTopSearch] = useState<string>("");
  const [statusBadge, setStatusBadge] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("");

  // Form Fields - Left & Right Columns
  const [ssNo, setSsNo] = useState<string>("");
  const [receiptNo, setReceiptNo] = useState<string>("1");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [studentName, setStudentName] = useState<string>("");
  const [courseBranch, setCourseBranch] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [casteTag, setCasteTag] = useState<string>("");
  const [remark, setRemark] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [term, setTerm] = useState<string>("");

  // Year Dues & Years/Terms Dropdowns
  const [yearDues, setYearDues] = useState<any[]>([]);
  const [yearsList, setYearsList] = useState<string[]>([]);
  const [termsList, setTermsList] = useState<any[]>([]);

  // Fee Breakdown Table Grid & Refund Inputs State
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [refundAmounts, setRefundAmounts] = useState<Record<string, string>>({});

  // Loading States
  const [loadingStudent, setLoadingStudent] = useState<boolean>(false);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Modal Popups State
  const [showPaidModal, setShowPaidModal] = useState<boolean>(false);
  const [paidHistoryList, setPaidHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Printable Fee Receipt Modal State
  const [showReceiptPrintModal, setShowReceiptPrintModal] = useState<boolean>(false);
  const [receiptPrintData, setReceiptPrintData] = useState<any>(null);


  // Safely extract property value from dynamic API row
  const getPropVal = (obj: any, ...keys: string[]): string => {
    if (!obj) return "";
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null) {
        return String(obj[k]);
      }
      const lowerKey = k.toLowerCase();
      const matchedKey = Object.keys(obj).find((ok) => ok.toLowerCase() === lowerKey);
      if (matchedKey && obj[matchedKey] !== undefined && obj[matchedKey] !== null) {
        return String(obj[matchedKey]);
      }
    }
    return "";
  };

  // Initial Load: Academic Year check and Receipt Number
  useEffect(() => {
    fetchInitialSetup();
  }, []);

  const fetchInitialSetup = async () => {
    try {
      const acyrRes = await getFeeRefundCurrentAcyr();
      let acYrStr = "";
      if (Array.isArray(acyrRes) && acyrRes.length > 0) {
        acYrStr = getPropVal(acyrRes[0], "AcademicYear", "academicYear");
      }
      setAcademicYear(acYrStr);

      fetchAutoReceiptNo();
    } catch (error) {
      console.error("Error loading initial fee refund setup:", error);
    }
  };

  const fetchAutoReceiptNo = async () => {
    try {
      const rcptRes = await getRefundReceiptNo();
      let rNo = "1";
      if (Array.isArray(rcptRes) && rcptRes.length > 0) {
        const val = getPropVal(rcptRes[0], "RefundNo", "refundNo", "CONCNO");
        if (val) rNo = val;
      }
      setReceiptNo(rNo);
    } catch (error) {
      console.error("Error loading refund receipt number:", error);
    }
  };

  // Clear Form State
  const handleClear = () => {
    setSsNo("");
    setTopSearch("");
    setStudentName("");
    setCourseBranch("");
    setGroup("");
    setCasteTag("");
    setStatusBadge("");
    setRemark("");
    setYear("");
    setTerm("");
    setYearDues([]);
    setYearsList([]);
    setTermsList([]);
    setFeeHeads([]);
    setRefundAmounts({});
    fetchAutoReceiptNo();
  };

  // Search Student Handler
  const handleSearchStudent = async (searchVal?: string) => {
    const query = (searchVal !== undefined ? searchVal : topSearch || ssNo).trim();
    if (!query) {
      toast.error("Please enter AdmNo. / Reg.No.");
      return;
    }

    setLoadingStudent(true);
    try {
      // 1. Get SSNo mapping
      const ssRes = await getFeeRefundStudentSSNo(query);
      let resolvedSsNo = ssRes[0].studentSerialNo;
      if (Array.isArray(ssRes) && ssRes.length > 0) {
        resolvedSsNo = getPropVal(ssRes[0], "SSNO", "ssNo", "studentSerialNo") || query;
      }
      setSsNo(ssRes[0].studentSerialNo);

      // 2. Get Student details and Terms
      const [stdRes, termsRes] = await Promise.all([
        getFeeRefundStudentData(resolvedSsNo),
        getFeeRefundTerms(resolvedSsNo)
      ]);

      let stdObj: any = null;
      if (Array.isArray(stdRes) && stdRes.length > 0) stdObj = stdRes[0];

      if (stdObj) {
        const sName = getPropVal(stdObj, "SNAME", "sName", "studentName");
        const crs = getPropVal(stdObj, "COURSE", "course");
        const brn = getPropVal(stdObj, "BSName", "branchName", "branch");
        const grp = getPropVal(stdObj, "BRANCHNAME", "group");
        const cst = getPropVal(stdObj, "ModeofAdm", "modeOfAdm", "CASTE", "caste");
        const st = getPropVal(stdObj, "Status", "status");

        const aYr = Number(getPropVal(stdObj, "AYEAR", "ayear")) || 1;
        const sYr = Number(getPropVal(stdObj, "SYEAR", "syear", "year")) || 1;

        setStudentName(sName);
        setCourseBranch(crs && brn ? `${crs}-${brn}` : crs || brn);
        setGroup(grp);
        setCasteTag(cst);
        setStatusBadge(st);

        // Populate Studying Years list
        const yList: string[] = [];
        for (let y = aYr; y <= sYr; y++) {
          yList.push(String(y));
        }
        setYearsList(yList.length > 0 ? yList : ["1", "2", "3", "4"]);
        setYear(String(sYr));

        toast.success(`Found student profile: ${sName}`);
      } else {
        toast.error("No student record found for given AdmNo / RegNo.");
      }

      // Populate Terms List
      let tArr: any[] = [];
      if (Array.isArray(termsRes)) tArr = termsRes;
      setTermsList(tArr);
      if (tArr.length > 0) {
        setTerm(getPropVal(tArr[0], "TERMNO", "termNo", "TERM", "term") || "1");
      }

      // 3. Fetch Year Dues Summary

      fetchYearDues(resolvedSsNo);
    } catch (error) {
      toast.error("Error searching student details.");
    } finally {
      setLoadingStudent(false);
    }
  };

  // Fetch Year-wise Dues Grid
  const fetchYearDues = async (targetSsNo?: string) => {
    const sNo = targetSsNo || ssNo;
    console.log(ssNo)
    if (!sNo) return;
    try {
      const duesRes = await getFeeRefundDues(sNo);
      let duesArr: any[] = [];
      if (Array.isArray(duesRes)) duesArr = duesRes;
      setYearDues(duesArr);
    } catch (error) {
      console.error("Error fetching year dues:", error);
    }
  };

  // Fetch Fee Refund Breakdown Details Grid
  const fetchFeeBreakdown = async () => {
    if (!ssNo || !term) {
      setFeeHeads([]);
      setRefundAmounts({});
      return;
    }

    setLoadingDetails(true);
    try {
      const detailsRes = await getFeeRefundDetails(ssNo, year || "1", term);
      let headsArr: any[] = [];
      if (Array.isArray(detailsRes)) headsArr = detailsRes;

      setFeeHeads(headsArr);

      // Initialize refund amounts inputs
      const initInputs: Record<string, string> = {};
      headsArr.forEach((item, idx) => {
        const idKey = `${getPropVal(item, "FeeID", "feeId", "ID", "id")}_${getPropVal(item, "FeeName", "feeName")}_${idx}`;
        initInputs[idKey] = "";
      });
      setRefundAmounts(initInputs);
    } catch (error) {
      toast.error("Error loading fee refund breakdown details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Trigger breakdown fetch when Year or Term changes
  useEffect(() => {
    if (ssNo && year && term) {
      fetchFeeBreakdown();
    }
  }, [year, term]);

  // Handle Refund Input Change
  const handleRefundInputChange = (feeIdKey: string, value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setRefundAmounts((prev) => ({
        ...prev,
        [feeIdKey]: value
      }));
    }
  };

  // Computed Totals for Fee Breakdown Table
  const totals = useMemo(() => {
    let totalFee = 0;
    let paidAmount = 0;
    let balance = 0;
    let prevRefund = 0;
    let currentRefundTotal = 0;

    feeHeads.forEach((item, idx) => {
      const idKey = `${getPropVal(item, "FeeID", "feeId", "ID", "id")}_${getPropVal(item, "FeeName", "feeName")}_${idx}`;
      const feeAmt = Number(getPropVal(item, "Fee", "amount", "fee")) || 0;
      const paidAmt = Number(getPropVal(item, "PAIDAMOUNT", "paidAmount", "paid")) || 0;
      const balAmt = Number(getPropVal(item, "BALANCE", "balance", "due")) || 0;
      const concAmt = Number(getPropVal(item, "Concession", "concession", "refund")) || 0;

      totalFee += feeAmt;
      paidAmount += paidAmt;
      balance += balAmt;
      prevRefund += concAmt;

      const inputVal = Number(refundAmounts[idKey]) || 0;
      currentRefundTotal += inputVal;
    });

    return {
      totalFee,
      paidAmount,
      balance,
      prevRefund,
      currentRefundTotal
    };
  }, [feeHeads, refundAmounts]);

  // Save Fee Refund Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ssNo || !studentName) {
      toast.error("Please enter a valid AdmNo. / Reg.No. and fetch student details.");
      return;
    }

    if (totals.currentRefundTotal <= 0) {
      toast.error("Please enter a valid Refund Amount greater than 0.");
      return;
    }

    setSaving(true);
    try {
      let savedCount = 0;

      for (let idx = 0; idx < feeHeads.length; idx++) {
        const item = feeHeads[idx];
        const idKey = `${getPropVal(item, "FeeID", "feeId", "ID", "id")}_${getPropVal(item, "FeeName", "feeName")}_${idx}`;
        const refValStr = refundAmounts[idKey] || "0";
        const refVal = Number(refValStr);
        const paidAmt = Number(getPropVal(item, "PAIDAMOUNT", "paidAmount", "paid")) || 0;

        if (refVal > 0) {
          if (refVal > paidAmt) {
            toast.error(`Refund amount ₹${refVal} cannot exceed Paid Amount ₹${paidAmt} for ${getPropVal(item, "FeeName", "feeName")}`);
            setSaving(false);
            return;
          }

          const payload = {
            receiptNO: receiptNo,
            date: date,
            ssNo: ssNo,
            academicYear: academicYear || "2025-2026",
            fYear: "Apr-2017 to Mar-2018",
            year: year || "1",
            caste: casteTag || "",
            term: term || "1",
            remark: remark || "",
            feeId: getPropVal(item, "FeeID", "feeId", "ID", "id"),
            feeName: getPropVal(item, "FeeName", "feeName"),
            feeType: getPropVal(item, "FeeType", "feeType"),
            fee: getPropVal(item, "Fee", "amount", "fee"),
            payAmount: refValStr,
            cid: localStorage.getItem("userId") || "admin"
          };

          await saveFeeRefundAmount(payload);
          savedCount++;
        }
      }

      if (savedCount > 0) {
        toast.success("Fee Refund Amount voucher saved successfully!");

        // Trigger Receipt Print Modal
        openReceiptPrintModal();

        // Refresh Dues & Breakdown
        fetchFeeBreakdown();
        fetchYearDues();
        fetchAutoReceiptNo();
      } else {
        toast.error("No valid refund amounts were entered.");
      }
    } catch (error) {
      toast.error("Error saving fee refund voucher.");
    } finally {
      setSaving(false);
    }
  };

  // Open Paid Receipt History Modal
  const handleOpenPaidHistoryModal = async () => {
    if (!ssNo) {
      toast.error("Please search a student profile first.");
      return;
    }

    setLoadingHistory(true);
    setShowPaidModal(true);
    try {
      const historyRes = await getFeeRefundPaidAmount(ssNo, year || "1");
      let hList: any[] = [];
      if (Array.isArray(historyRes)) hList = historyRes;
      setPaidHistoryList(hList);
    } catch (error) {
      toast.error("Error loading refund receipt details history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Open Print Receipt Modal Popup ONLY
  const openReceiptPrintModal = (customPrintData?: any) => {
    setShowPaidModal(false);

    if (customPrintData) {
      setReceiptPrintData(customPrintData);
    } else {
      const printItems = feeHeads
        .map((item, idx) => {
          const idKey = `${getPropVal(item, "FeeID", "feeId", "ID", "id")}_${getPropVal(item, "FeeName", "feeName")}_${idx}`;
          const rVal = Number(refundAmounts[idKey]) || 0;
          if (rVal > 0) {
            return {
              feeName: getPropVal(item, "FeeName", "feeName"),
              feeType: getPropVal(item, "FeeType", "feeType"),
              payAmount: String(rVal)
            };
          }
          return null;
        })
        .filter(Boolean);

      setReceiptPrintData({
        receiptNo: receiptNo,
        date: date,
        ssNo: ssNo,
        studentName: studentName,
        fatherName: "",
        courseBranch: courseBranch,
        year: year,
        term: term,
        paymentMode: "Cash",
        narration: remark,
        totalAmount: totals.currentRefundTotal > 0 ? totals.currentRefundTotal : totals.prevRefund,
        items: printItems.length > 0 ? printItems : [{ feeName: "Refund Amount", feeType: "Refund", payAmount: totals.prevRefund }]
      });
    }

    setShowReceiptPrintModal(true);
  };

  // Dedicated Print Receipt Function -> Prints ONLY receipt HTML data in isolated print window
  const handlePrintOnlyReceipt = () => {
    const printEl = document.getElementById("printable-fee-receipt");
    if (!printEl) {
      window.print();
      return;
    }

    const printWindow = window.open("", "_blank", "width=850,height=700");
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Payment Receipt</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 20px;
              background: #ffffff;
              color: #000000;
            }
            .dbs-fee-receipt-print-document {
              width: 100%;
              padding: 0;
              box-sizing: border-box;
              background: #ffffff;
              color: #000000;
              border: none;
            }
            .dbs-receipt-header {
              text-align: center;
              border-bottom: 2px double #1e293b;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .dbs-receipt-header h2 {
              font-size: 1.3rem;
              font-weight: 800;
              color: #1e3a8a;
              margin-bottom: 4px;
            }
            .dbs-receipt-header p {
              font-size: 0.85rem;
              color: #475569;
              margin-bottom: 8px;
            }
            .dbs-receipt-title-badge {
              display: inline-block;
              background-color: #1e3a8a;
              color: #ffffff;
              padding: 4px 16px;
              border-radius: 4px;
              font-weight: 800;
              font-size: 0.85rem;
              letter-spacing: 1px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .dbs-receipt-meta-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px 20px;
              background-color: #f8fafc;
              padding: 12px 16px;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              margin-bottom: 16px;
              font-size: 0.88rem;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .dbs-receipt-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .dbs-receipt-table th {
              background-color: #f1f5f9;
              color: #1e293b;
              padding: 8px 12px;
              border: 1px solid #cbd5e1;
              font-weight: 700;
              text-align: left;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .dbs-receipt-table td {
              padding: 8px 12px;
              border: 1px solid #cbd5e1;
            }
            .dbs-receipt-table tfoot td {
              background-color: #f8fafc;
              border-top: 2px solid #cbd5e1;
              font-size: 0.95rem;
              font-weight: 700;
            }
            .dbs-receipt-remarks {
              font-size: 0.85rem;
              color: #475569;
              margin-bottom: 20px;
            }
            .dbs-signature-row {
              display: flex;
              justify-content: space-between;
              margin-top: 60px;
              padding-top: 10px;
              font-weight: 700;
            }
            .dbs-signature-row div {
              text-align: center;
              border-top: 1px dashed #94a3b8;
              width: 200px;
              padding-top: 6px;
            }
          </style>
        </head>
        <body>
          ${printEl.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="dbs-fee-refund-modern-container">
      {/* PAGE HEADER */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Fee Refund Amount</h2>
          <p>Process and issue student fee refund vouchers and concession records</p>
        </div>
        <div className="dbs-header-badges-row">
          {academicYear && (
            <span className="dbs-header-status-badge">
              ACADEMIC YEAR: {academicYear}
            </span>
          )}
          {statusBadge && (
            <span className="dbs-header-status-badge">
              {statusBadge}
            </span>
          )}
        </div>
      </div>

      {/* CARD 1: SEARCH & STUDENT PARAMS + YEAR DUES ON RIGHT */}
      <div className="dbs-admissions-stepper-form-card">
        <div className="dbs-form-card">
          <div className="dbs-card-title-row">
            <User size={18} className="dbs-card-title-icon" />
            <h3>Student Profile & Refund Parameters</h3>
          </div>

          <div className="dbs-top-search-dues-layout">
            {/* Left Area: Search & Form Inputs */}
            <div className="dbs-top-left-search-area">
              <div className="dbs-form-grid-3">
                {/* Search Box */}
                <div className="dbs-input-box">
                  <label>Adm No. / Reg. No.</label>
                  <div className="dbs-lookup-search-wrapper">
                    <input
                      type="text"
                      placeholder="Enter RegNo..."
                      value={topSearch || ssNo}
                      onChange={(e) => {
                        setTopSearch(e.target.value);
                        setSsNo(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearchStudent();
                      }}
                    />
                    <button
                      type="button"
                      className="dbs-lookup-search-btn"
                      onClick={() => handleSearchStudent()}
                      disabled={loadingStudent}
                    >
                      {loadingStudent ? (
                        <RefreshCw size={14} className="dbs-spin" />
                      ) : (
                        <Search size={14} />
                      )}
                      <span>Search</span>
                    </button>
                  </div>
                </div>

                {/* Refund Receipt No */}
                <div className="dbs-input-box">
                  <label>Refund Voucher No.</label>
                  <input type="text" value={receiptNo} readOnly className="dbs-bold" />
                </div>

                {/* Refund Date */}
                <div className="dbs-input-box">
                  <label>Refund Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Auto-populated Student Banner Info */}
              {studentName && (
                <div className="dbs-student-info-banner-card">
                  <div className="dbs-student-info-grid">
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Name:</span>
                      <span className="dbs-info-val"><strong>{studentName}</strong></span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Programme:</span>
                      <span className="dbs-info-val"><strong>{courseBranch}</strong></span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Branch/Group:</span>
                      <span className="dbs-info-val"><strong>{group}</strong></span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Caste/Mode:</span>
                      <span className="dbs-info-val"><strong>{casteTag || "N/A"}</strong></span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Adm / Reg No:</span>
                      <span className="dbs-info-val"><strong>{ssNo}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              <div className="dbs-form-grid-3">
                {/* Year Dropdown */}
                <div className="dbs-input-box">
                  <label>Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    disabled={yearsList.length === 0}
                  >
                    <option value="">Select Year</option>
                    {yearsList.map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Term Dropdown */}
                <div className="dbs-input-box">
                  <label>Term</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    disabled={termsList.length === 0}
                  >
                    <option value="">Select Term</option>
                    {termsList.map((tItem, idx) => {
                      const tNo = getPropVal(tItem, "TERMNO", "termNo", "TERM", "term");
                      return (
                        <option key={idx} value={tNo}>
                          Term {tNo}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Remarks / Narration */}
                <div className="dbs-input-box">
                  <label>Remarks / Narration</label>
                  <input
                    type="text"
                    placeholder="Reason for refund..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right Area: Year Dues Mini Card */}
            <div className="dbs-year-dues-card">
              <div className="dbs-year-dues-header">
                Year-wise Dues
              </div>
              <table className="dbs-year-dues-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Due Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {yearDues.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ color: "#94a3b8", padding: "16px" }}>
                        No dues data
                      </td>
                    </tr>
                  ) : (
                    yearDues.map((dItem, dIdx) => {
                      const dYr = getPropVal(dItem, "Year", "year", "YEAR");
                      const dDue = getPropVal(dItem, "Balance", "balance", "Due", "due") || "0";
                      return (
                        <tr key={dIdx}>
                          <td>
                            <button
                              type="button"
                              className="dbs-btn-inline-link"
                              onClick={() => {
                                setYear(dYr);
                              }}
                            >
                              {dYr}
                            </button>
                          </td>
                          <td className={Number(dDue) > 0 ? "dbs-text-warning dbs-bold" : "dbs-text-success"}>
                            ₹{dDue}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: FEE HEADS REFUND BREAKDOWN DATATABLE */}
      <div className="dbs-admissions-stepper-form-card">
        <div className="dbs-form-card">
          <div className="dbs-card-title-row">
            <CreditCard size={18} className="dbs-card-title-icon" />
            <h3>Fee Heads Refund Breakdown Grid</h3>
          </div>

          <div className="dbs-fee-breakdown-area">
            {loadingDetails ? (
              <div className="dbs-empty-state">
                <RefreshCw size={28} className="dbs-spin dbs-text-primary" />
                <div className="dbs-empty-state-title">Loading Fee Breakdown...</div>
              </div>
            ) : feeHeads.length === 0 ? (
              <div className="dbs-empty-state">
                <AlertCircle size={32} className="dbs-empty-state-icon" />
                <div className="dbs-empty-state-title">No Fee Heads Available</div>
                <div className="dbs-empty-state-desc">
                  Please search student and select Year & Term to view fee heads.
                </div>
              </div>
            ) : (
              <div className="dbs-table-container">
                <div className="dbs-table-card">
                  <div className="dbs-table-scroll active-scroll">
                    <table className="dbs-data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Fee Name</th>
                          <th>Fee Type</th>
                          <th>Total Fee (₹)</th>
                          <th>Paid Amount (₹)</th>
                          <th>Balance Due (₹)</th>
                          <th>Prev. Refund (₹)</th>
                          <th>Refund Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeHeads.map((item, idx) => {
                          const idKey = `${getPropVal(item, "FeeID", "feeId", "ID", "id")}_${getPropVal(item, "FeeName", "feeName")}_${idx}`;
                          const fName = getPropVal(item, "FeeName", "feeName");
                          const fType = getPropVal(item, "FeeType", "feeType");
                          const fAmt = getPropVal(item, "Fee", "amount", "fee") || "0";
                          const pAmt = getPropVal(item, "PAIDAMOUNT", "paidAmount", "paid") || "0";
                          const bAmt = getPropVal(item, "totBALANCE", "due") || "0";
                          const refAmt = getPropVal(item, "RefundAmt", "refundAmt", "refund") || "0";

                          return (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td className="dbs-bold">{fName}</td>
                              <td>{fType}</td>
                              <td>₹{fAmt}</td>
                              <td className="dbs-text-success dbs-bold">₹{pAmt}</td>
                              <td className={Number(bAmt) > 0 ? "dbs-text-warning dbs-bold" : ""}>
                                ₹{bAmt}
                              </td>
                              <td className="dbs-text-primary">₹{refAmt}</td>
                              <td>
                                <input
                                  type="text"
                                  className="dbs-table-inline-input dbs-refund-input"
                                  value={refundAmounts[idKey] || ""}
                                  onChange={(e) => handleRefundInputChange(idKey, e.target.value)}
                                  placeholder="0"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total Summary Banner */}
                <div className="dbs-total-pay-summary-banner">
                  <div className="dbs-total-pay-text">
                    Total Fee: <strong>₹{totals.totalFee}</strong>
                  </div>
                  <div className="dbs-total-pay-text ml-4">
                    Total Paid:{" "}
                    <button
                      type="button"
                      className="dbs-btn-inline-link"
                      style={{ color: "#ffffff", fontSize: "1.25rem" }}
                      onClick={handleOpenPaidHistoryModal}
                      title="Click to view Paid Fee Receipt Details"
                    >
                      <strong>₹{totals.paidAmount}</strong>
                    </button>
                  </div>
                  <div className="dbs-total-pay-text ml-4">
                    Balance Due: <strong>₹{totals.balance}</strong>
                  </div>
                  <div className="dbs-total-pay-text ml-4">
                    Total Refund: <strong>₹{totals.currentRefundTotal > 0 ? totals.currentRefundTotal : totals.prevRefund}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="dbs-form-actions-row">
        <button
          type="button"
          className="dbs-form-save-btn"
          onClick={handleSave}
          disabled={saving || feeHeads.length === 0}
        >
          {saving ? <RefreshCw size={16} className="dbs-spin" /> : <Save size={16} />}
          <span>Save Refund Voucher</span>
        </button>

        <button
          type="button"
          className="dbs-form-cancel-btn"
          onClick={handleClear}
        >
          Cancel
        </button>

        <button
          type="button"
          className="dbs-btn-reprint"
          onClick={async () => {
            if (!ssNo) {
              toast.error("Please search student profile first.");
              return;
            }
            try {
              const rRes = await getFeeRefundPrintReceiptNo(ssNo);
              let rNo = "";
              if (Array.isArray(rRes) && rRes.length > 0) {
                rNo = getPropVal(rRes[0], "RECPTNO", "recptNo", "RefundNo");
              }
              if (rNo) {
                const rDataRes = await getFeeReceiptDataRefund(rNo);
                let printObj: any = null;
                if (Array.isArray(rDataRes) && rDataRes.length > 0) printObj = rDataRes[0];
                openReceiptPrintModal({
                  receiptNo: rNo,
                  date: getPropVal(printObj, "DATE", "date") || date,
                  ssNo: ssNo,
                  studentName: studentName,
                  courseBranch: courseBranch,
                  year: year,
                  term: term,
                  paymentMode: "Cash",
                  narration: remark,
                  totalAmount: getPropVal(printObj, "RefundAmt", "amount") || totals.prevRefund,
                  items: [{ feeName: "Refund Fee Amount", feeType: "Refund", payAmount: getPropVal(printObj, "RefundAmt", "amount") || totals.prevRefund }]
                });
              } else {
                openReceiptPrintModal();
              }
            } catch (err) {
              openReceiptPrintModal();
            }
          }}
        >
          <Printer size={16} />
          <span>Reprint</span>
        </button>
      </div>

      {/* PRINTABLE FEE REFUND RECEIPT MODAL */}
      {showReceiptPrintModal && receiptPrintData && (
        <div className="dbs-modal-overlay dbs-print-modal-overlay">
          <div className="dbs-modal-content-box dbs-receipt-print-box">
            <div className="dbs-modal-header">
              <h3>Fee Refund Receipt Preview</h3>
              <button className="dbs-modal-close-btn" onClick={() => setShowReceiptPrintModal(false)}>
                &times;
              </button>
            </div>
            <div className="dbs-modal-body">
              {/* Printable Document Target */}
              <div id="printable-fee-receipt" className="dbs-fee-receipt-print-document">
                <div className="dbs-receipt-header">
                  <h2>LAKIREDDY BALI REDDY COLLEGE OF ENGINEERING (AUTONOMOUS)</h2>
                  <p>L.B.Reddy Nagar, Mylavaram - 521 230, N T R Dist., A.P. INDIA</p>
                  <span className="dbs-receipt-title-badge">FEE REFUND RECEIPT</span>
                </div>

                <div className="dbs-receipt-meta-grid">
                  <div><strong>Voucher No:</strong> {receiptPrintData.receiptNo}</div>
                  <div><strong>Date:</strong> {receiptPrintData.date}</div>
                  <div><strong>Reg. No.:</strong> {receiptPrintData.ssNo}</div>
                  <div><strong>Student Name:</strong> {receiptPrintData.studentName}</div>
                  {receiptPrintData.courseBranch && <div><strong>Course & Branch:</strong> {receiptPrintData.courseBranch}</div>}
                  {receiptPrintData.term && <div><strong>Year & Term:</strong> Year {receiptPrintData.year || "1"} / Term {receiptPrintData.term}</div>}
                  <div><strong>Payment Mode:</strong> {receiptPrintData.paymentMode}</div>
                </div>

                <table className="dbs-receipt-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>S.No</th>
                      <th>Fee Particulars</th>
                      <th>Type</th>
                      <th style={{ textAlign: "right", width: "140px" }}>Refund Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptPrintData.items && receiptPrintData.items.length > 0 ? (
                      receiptPrintData.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{item.feeName}</td>
                          <td>{item.feeType}</td>
                          <td style={{ textAlign: "right" }}>₹{item.payAmount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td>1</td>
                        <td>Fee Refund Amount</td>
                        <td>Refund</td>
                        <td style={{ textAlign: "right" }}>₹{receiptPrintData.totalAmount}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ fontWeight: 700 }}>Total Refunded Amount:</td>
                      <td style={{ textAlign: "right", fontWeight: 800 }}>₹{receiptPrintData.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>

                {receiptPrintData.narration && (
                  <p className="dbs-receipt-remarks"><strong>Remarks:</strong> {receiptPrintData.narration}</p>
                )}

                <div className="dbs-signature-row">
                  <div>Student Signature</div>
                  <div>Cashier / Authorized Signatory</div>
                </div>
              </div>
            </div>

            <div className="dbs-modal-footer">
              <button type="button" className="dbs-btn-reprint" onClick={handlePrintOnlyReceipt}>
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
              <button type="button" className="dbs-form-cancel-btn" onClick={() => setShowReceiptPrintModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAID FEE RECEIPT DETAILS MODAL POPUP */}
      {showPaidModal && (
        <div className="dbs-modal-overlay">
          <div className="dbs-modal-content-box" style={{ width: "900px", maxWidth: "95%" }}>
            <div className="dbs-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={20} />
                <h3>Paid Fee Refund History Details</h3>
              </div>
              <button type="button" className="dbs-modal-close-btn" onClick={() => setShowPaidModal(false)}>
                &times;
              </button>
            </div>

            <div className="dbs-modal-body">
              {studentName && (
                <div className="dbs-student-info-banner-card" style={{ marginBottom: "16px" }}>
                  <div className="dbs-student-info-grid">
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Student Name:</span>
                      <span className="dbs-info-val"><strong>{studentName}</strong></span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Adm / Reg No:</span>
                      <span className="dbs-info-val"><strong>{ssNo}</strong></span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Total History:</span>
                      <span className="dbs-info-val"><strong>{paidHistoryList.length} Records</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {loadingHistory ? (
                <div className="dbs-empty-state">
                  <RefreshCw size={28} className="dbs-spin dbs-text-primary" />
                  <div className="dbs-empty-state-title">Loading refund history...</div>
                </div>
              ) : paidHistoryList.length === 0 ? (
                <div className="dbs-empty-state">
                  <AlertCircle size={32} className="dbs-empty-state-icon" />
                  <div className="dbs-empty-state-title">No previous refund history found</div>
                  <div className="dbs-empty-state-desc">No refund records registered for student {ssNo}.</div>
                </div>
              ) : (
                <div className="dbs-table-container">
                  <div className="dbs-table-card">
                    <div className="dbs-table-scroll active-scroll" style={{ maxHeight: "380px" }}>
                      <table className="dbs-data-table">
                        <thead>
                          <tr>
                            <th>Refund No.</th>
                            <th>Date</th>
                            <th>Year</th>
                            <th>Fee Type</th>
                            <th>Refund Amount (₹)</th>
                            <th>Remarks</th>
                            <th style={{ textAlign: "center" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paidHistoryList.map((rec, idx) => {
                            const rNo = getPropVal(rec, "Refundno", "refundNo", "RECPTNO");
                            const dt = getPropVal(rec, "PaidDate", "paidDate", "DATE");
                            const yr = getPropVal(rec, "Year", "year");
                            const fType = getPropVal(rec, "FEETYPE", "feeType");
                            const amt = getPropVal(rec, "RefundAmt", "refundAmt", "amount");
                            const rem = getPropVal(rec, "Remark", "remarks", "remark");

                            return (
                              <tr key={idx}>
                                <td className="dbs-bold dbs-text-primary">{rNo}</td>
                                <td>{dt}</td>
                                <td>Year {yr}</td>
                                <td>{fType}</td>
                                <td className="dbs-bold dbs-text-success">₹{amt}</td>
                                <td>{rem || "-"}</td>
                                <td style={{ textAlign: "center" }}>
                                  <button
                                    type="button"
                                    className="dbs-btn-reprint"
                                    style={{ padding: "6px 14px", fontSize: "0.82rem", margin: "0 auto" }}
                                    onClick={() => {
                                      setShowPaidModal(false);
                                      openReceiptPrintModal({
                                        receiptNo: rNo,
                                        date: dt,
                                        ssNo: ssNo,
                                        studentName: studentName,
                                        courseBranch: courseBranch,
                                        year: yr,
                                        term: term,
                                        paymentMode: "Cash",
                                        narration: rem,
                                        totalAmount: amt,
                                        items: [{ feeName: `${fType} Fee`, feeType: fType, payAmount: amt }]
                                      });
                                    }}
                                    title="Print Receipt"
                                  >
                                    <Printer size={14} />
                                    <span>Print Receipt</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="dbs-modal-footer">
              <button type="button" className="dbs-form-cancel-btn" onClick={() => setShowPaidModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeRefundAmount;
