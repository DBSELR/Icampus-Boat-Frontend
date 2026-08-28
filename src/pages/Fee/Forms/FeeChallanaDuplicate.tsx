import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  CreditCard,
  User,
  Printer,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import "./FeeChallanaDuplicate.css";
import {
  getFeeChallanaCurrentAcyr,
  getMaxFeeRcptNo,
  getStudentSSNo,
  getStudentFeeData,
  getStudentFeeDataSearchName,
  getStudentFeeTerms,
  getStudentFeeDetails,
  getStudentFeeDues,
  getPaidAmount
} from "../../../apis/FeeApis";

export const FeeChallanaDuplicate: React.FC = () => {
  // Top Header Badges & Search Inputs
  const [academicYear, setAcademicYear] = useState<string>("");
  const [regNo, setRegNo] = useState<string>("");
  const [ssNo, setSsNo] = useState<string>("");
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Student Info Banner State
  const [studentName, setStudentName] = useState<string>("");
  const [fatherName, setFatherName] = useState<string>("");
  const [courseBranch, setCourseBranch] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [casteTag, setCasteTag] = useState<string>("");
  const [scholarAmt, setScholarAmt] = useState<string>("0");
  const [statusBadge, setStatusBadge] = useState<string>("");
  const [isStaffChild, setIsStaffChild] = useState<boolean>(false);

  // Term & Payment Options State
  const [year, setYear] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [yearsList, setYearsList] = useState<string[]>([]);
  const [termsList, setTermsList] = useState<any[]>([]);

  // Year Dues Grid State
  const [yearDues, setYearDues] = useState<any[]>([]);

  // Fee Breakdown Table Grid & Pay Inputs State
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({});

  // Loading States
  const [loadingStudent, setLoadingStudent] = useState<boolean>(false);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Paid Receipts History Modal State
  const [showPaidModal, setShowPaidModal] = useState<boolean>(false);
  const [paidHistoryList, setPaidHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Printable Fee Receipt Modal State
  const [showReceiptPrintModal, setShowReceiptPrintModal] = useState<boolean>(false);
  const [receiptPrintData, setReceiptPrintData] = useState<any>(null);

  // Helper to safely fetch property values from case-insensitive API rows
  const getPropVal = (obj: any, ...keys: string[]): string => {
    if (!obj) return "";
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null) return String(obj[k]);
      const lowerKey = k.toLowerCase();
      const matchedKey = Object.keys(obj).find(ok => ok.toLowerCase() === lowerKey);
      if (matchedKey && obj[matchedKey] !== undefined && obj[matchedKey] !== null) {
        return String(obj[matchedKey]);
      }
    }
    return "";
  };

  // Initial Load: Academic Year check and Receipt Number
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const acyrRes = await getFeeChallanaCurrentAcyr().catch(() => null);
      if (Array.isArray(acyrRes) && acyrRes.length > 0) {
        setAcademicYear(getPropVal(acyrRes[0], "AcademicYear", "academicYear"));
      }

      const rcptRes = await getMaxFeeRcptNo().catch(() => null);
      if (Array.isArray(rcptRes) && rcptRes.length > 0) {
        setReceiptNo(getPropVal(rcptRes[0], "RECPTNO", "recptNo", "ReceiptNo") || "1");
      }
    } catch (e) {
      console.error("Error loading initial data", e);
    }
  };

  // Search Student Handler
  const handleSearchStudent = async (searchQuery?: string) => {
    const queryNo = (searchQuery !== undefined ? searchQuery : regNo || ssNo).trim();
    if (!queryNo) {
      toast.error("Please enter AdmNo. / Reg.No.");
      return;
    }

    setLoadingStudent(true);
    try {
      let resolvedSsNo = queryNo;

      // 1. Get SSNo mapping
      try {
        const ssRes = await getStudentSSNo(queryNo);
        if (Array.isArray(ssRes) && ssRes.length > 0) {
          const foundSerial = getPropVal(
            ssRes[0],
            "SSNO",
            "ssNo",
            "studentSerialNo",
            "RegistrationNo"
          );
          if (foundSerial) {
            resolvedSsNo = foundSerial;
            setSsNo(foundSerial);
          }
        }
      } catch (e) {
        console.log("SSNo mapping lookup fallback to raw query");
      }

      // 2. Fetch student details and terms using resolvedSsNo or queryNo
      let stdRes = await getStudentFeeData(resolvedSsNo).catch(() => null);
      if (!stdRes || (Array.isArray(stdRes) && stdRes.length === 0)) {
        stdRes = await getStudentFeeData(queryNo).catch(() => null);
      }

      let termsRes = await getStudentFeeTerms(resolvedSsNo).catch(() => null);
      if (!termsRes || (Array.isArray(termsRes) && termsRes.length === 0)) {
        termsRes = await getStudentFeeTerms(queryNo).catch(() => null);
      }

      let stdObj = null;
      if (Array.isArray(stdRes) && stdRes.length > 0) {
        stdObj = stdRes[0];
      } else if (stdRes?.data && stdRes.data.length > 0) {
        stdObj = stdRes.data[0];
      }

      // If queryNo is name or not found, try search by name
      if (!stdObj && queryNo) {
        const nameRes = await getStudentFeeDataSearchName(queryNo).catch(() => null);
        if (Array.isArray(nameRes) && nameRes.length > 0) {
          stdObj = nameRes[0];
        } else if (nameRes?.data && nameRes.data.length > 0) {
          stdObj = nameRes.data[0];
        }
      }

      if (stdObj) {
        const sName = getPropVal(stdObj, "SNAME", "sName", "studentName");
        const fName = getPropVal(stdObj, "FName", "fName", "fatherName");
        const crs = getPropVal(stdObj, "COURSE", "course");
        const brn = getPropVal(stdObj, "BSName", "branchName", "branch");
        const sec = getPropVal(stdObj, "Section", "section");
        const cst = getPropVal(stdObj, "ModeofAdm", "modeOfAdm", "CASTE", "caste");
        const sch = getPropVal(stdObj, "SCHAMOUNT", "schAmount", "scholarAmt") || "0";
        const st = getPropVal(stdObj, "Status", "status");
        const facVal = getPropVal(stdObj, "Fac_Child", "facChild");
        const isChild = facVal.toLowerCase() === "true" || facVal === "1";

        const aYr = Number(getPropVal(stdObj, "AYEAR", "ayear")) || 1;
        const sYr = Number(getPropVal(stdObj, "SYEAR", "syear", "year")) || 1;

        setStudentName(sName);
        setFatherName(fName);
        setCourseBranch(crs && brn ? `${crs}-${brn}` : crs || brn);
        setSection(sec || "A");
        setCasteTag(cst);
        setScholarAmt(sch);
        setStatusBadge(st);
        setIsStaffChild(isChild);

        // Populate Studying Years list from AYEAR to SYEAR
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

      // Populate terms list
      let tArr: any[] = [];
      if (Array.isArray(termsRes)) tArr = termsRes;
      else if (termsRes?.data) tArr = termsRes.data;
      setTermsList(tArr);
      if (tArr.length > 0) {
        setTerm(getPropVal(tArr[0], "TERMNO", "termNo", "TERM", "term") || "1");
      }

      // Fetch Year-wise Dues Grid
      fetchYearDues(resolvedSsNo);
    } catch (error) {
      toast.error("Error searching student details.");
    } finally {
      setLoadingStudent(false);
    }
  };

  // Fetch Year-wise Dues Grid (GVDues)
  const fetchYearDues = async (targetSsNo?: string) => {
    const queryNum = targetSsNo || ssNo;
    if (!queryNum) return;

    try {
      let duesRes = await getStudentFeeDues(queryNum).catch(() => null);
      let duesArr: any[] = [];
      if (Array.isArray(duesRes)) duesArr = duesRes;
      else if (duesRes?.data) duesArr = duesRes.data;

      if (duesArr.length > 0) {
        const mappedDues = duesArr.map((d: any) => ({
          year: getPropVal(d, "YEAR", "year", "SYear", "sYear"),
          due: Number(getPropVal(d, "DUE", "due", "DueAmount", "dueAmount") || 0).toFixed(2)
        }));
        setYearDues(mappedDues);
      }
    } catch (e) {
      console.error("Error fetching student year dues", e);
    }
  };

  // Fetch Fee Breakdown Grid
  const fetchFeeBreakdown = async () => {
    if (!ssNo || !term) {
      setFeeHeads([]);
      setPayAmounts({});
      return;
    }

    setLoadingDetails(true);
    try {
      const detailsRes = await getStudentFeeDetails(ssNo, year || "1", term);
      let headsArr: any[] = [];
      if (Array.isArray(detailsRes)) headsArr = detailsRes;
      else if (detailsRes?.data) headsArr = detailsRes.data;

      setFeeHeads(headsArr);

      // Initialize pay amounts inputs with empty string
      const initPay: Record<string, string> = {};
      headsArr.forEach((_, idx) => {
        initPay[`head_${idx}`] = "";
      });
      setPayAmounts(initPay);
    } catch (error) {
      console.error("Error loading fee breakdown grid", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchFeeBreakdown();
  }, [term, year, ssNo]);

  // Handle Pay Amount Inline Inputs
  const handlePayAmountChange = (key: string, value: string) => {
    setPayAmounts(prev => ({ ...prev, [key]: value }));
  };

  // Live Sum Calculations
  const totalPayAmount = Object.values(payAmounts).reduce((sum, val) => {
    const num = parseFloat(val) || 0;
    return sum + num;
  }, 0);

  const totalDueAmount = feeHeads.reduce((sum, h) => {
    const bal = Number(getPropVal(h, "TotBALANCE", "balance", "due")) || 0;
    return sum + bal;
  }, 0);

  const paidAfterDue = Math.max(0, totalDueAmount - totalPayAmount);

  // Clear Form State
  const handleCancel = () => {
    setRegNo("");
    setSsNo("");
    setCasteTag("");
    setStudentName("");
    setFatherName("");
    setCourseBranch("");
    setSection("");
    setYear("");
    setTerm("");
    setStatusBadge("");
    setIsStaffChild(false);
    setFeeHeads([]);
    setPayAmounts({});
    setYearDues([]);
    loadInitialData();
  };

  // Open Paid Fee History Modal
  const handleOpenPaidHistory = async (checkAmt?: number | string) => {
    if (checkAmt !== undefined && Number(checkAmt) <= 0) {
      return;
    }
    if (!ssNo) {
      toast.error("Please fetch a student profile first.");
      return;
    }
    setShowPaidModal(true);
    setLoadingHistory(true);
    try {
      const res = await getPaidAmount(ssNo, year || "1");
      let listArr: any[] = [];
      if (Array.isArray(res)) listArr = res;
      else if (res?.data) listArr = res.data;

      setPaidHistoryList(listArr);
    } catch (error) {
      toast.error("Failed to load paid fee receipts history.");
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
        .map((head, idx) => {
          const key = `head_${idx}`;
          const val = payAmounts[key];
          if (val && parseFloat(val) > 0) {
            return {
              feeName: getPropVal(head, "FEENAME", "feeName"),
              feeType: getPropVal(head, "FEETYPE", "feeType"),
              payAmount: val
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
        fatherName: fatherName,
        courseBranch: courseBranch,
        year: year,
        term: term,
        paymentMode: "Cash",
        narration: "Duplicate Challan View",
        totalAmount: totalPayAmount,
        items: printItems
      });
    }

    setShowReceiptPrintModal(true);
  };

  // Isolated Receipt Window Print
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
    <div className="dbs-fee-challana-modern-container">
      {/* PAGE HEADER */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Fee Challana Duplicate (View Only)</h2>
          <p>Search and review student fee details without saving payment records</p>
        </div>
        <div className="dbs-header-badges-row">
          {academicYear && (
            <span className="dbs-header-status-badge">
              ACADEMIC YEAR: {academicYear}
            </span>
          )}
          {statusBadge && (
            <span className="dbs-header-status-badge">
              STATUS: {statusBadge}
            </span>
          )}
          {isStaffChild && (
            <span className="dbs-header-staff-child-badge">
              STAFF CHILD
            </span>
          )}
        </div>
      </div>

      {/* 1. SEARCH HEADER & STUDENT PROFILE CARD */}
      <div className="dbs-admissions-stepper-form-card">
        <div className="dbs-form-card">
          <div className="dbs-card-title-row">
            <User className="dbs-card-title-icon" size={20} />
            <h3>1. Student Search & Header Details</h3>
            {loadingStudent && <RefreshCw size={16} className="dbs-spin dbs-text-primary ml-auto" />}
          </div>

          <div className="dbs-top-search-dues-layout">
            <div className="dbs-top-left-search-area">
              <div className="dbs-form-grid-3">
                {/* Reg No / SS No Lookup WITH SEARCH BUTTON */}
                <div className="dbs-input-box">
                  <label>AdmNo. / Reg.No. *</label>
                  <div className="dbs-lookup-search-wrapper">
                    <input
                      type="text"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchStudent())}
                      placeholder="Enter Reg No / SS No..."
                    />
                    <button
                      type="button"
                      className="dbs-lookup-search-btn"
                      onClick={() => handleSearchStudent()}
                      disabled={loadingStudent}
                      title="Search Student Details"
                    >
                      {loadingStudent ? <RefreshCw size={16} className="dbs-spin" /> : <Search size={16} />}
                      <span>Search</span>
                    </button>
                  </div>
                </div>

                {/* Receipt Date */}
                <div className="dbs-input-box">
                  <label>Receipt Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Receipt No */}
                <div className="dbs-input-box">
                  <label>Receipt No.</label>
                  <input
                    type="text"
                    value={receiptNo}
                    readOnly
                    placeholder="Receipt Number"
                  />
                </div>
              </div>

              {/* STUDENT DETAILS DISPLAY BANNER */}
              {studentName && (
                <div className="dbs-student-info-banner-card mt-3">
                  <div className="dbs-student-info-grid">
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Student Name:</span>
                      <span className="dbs-info-val"><strong>{studentName}</strong></span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Father Name:</span>
                      <span className="dbs-info-val">{fatherName}</span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Course & Branch:</span>
                      <span className="dbs-info-val">{courseBranch}</span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Section:</span>
                      <span className="dbs-info-val">{section}</span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Caste / Adm Mode:</span>
                      <span className="dbs-info-val">{casteTag}</span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Scholarship Amt:</span>
                      <span className="dbs-info-val">₹{scholarAmt}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: YEAR DUES GRID MINI CARD */}
            {yearDues.length > 0 && (
              <div className="dbs-year-dues-card">
                <div className="dbs-year-dues-header">Year Dues</div>
                <table className="dbs-year-dues-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Due (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearDues.map((yd, idx) => (
                      <tr key={idx}>
                        <td>
                          <button
                            type="button"
                            className="dbs-btn-inline-link dbs-text-primary dbs-bold"
                            onClick={() => {
                              if (yd.year) setYear(String(yd.year));
                            }}
                            title={`Click to load fee breakdown for Year ${yd.year}`}
                          >
                            Year {yd.year}
                          </button>
                        </td>
                        <td className="dbs-text-warning">₹{yd.due}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. TERM OPTIONS CARD */}
      <div className="dbs-admissions-stepper-form-card">
        <div className="dbs-form-card">
          <div className="dbs-card-title-row">
            <CreditCard className="dbs-card-title-icon" size={20} />
            <h3>2. Term & Year Selection</h3>
          </div>

          <div className="dbs-form-grid-3">
            {/* Year Selector */}
            <div className="dbs-input-box">
              <label>Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Select Year</option>
                {yearsList.map((y, idx) => <option key={idx} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Term Selector */}
            <div className="dbs-input-box">
              <label>Term</label>
              <select value={term} onChange={(e) => setTerm(e.target.value)}>
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
          </div>
        </div>
      </div>

      {/* 3. FEE HEADS BREAKDOWN GRID */}
      <div className="dbs-admissions-stepper-form-card">
        <div className="dbs-form-card">
          <div className="dbs-card-title-row">
            <CreditCard className="dbs-card-title-icon" size={20} />
            <h3>3. Fee Breakdown Grid</h3>
            {loadingDetails && <RefreshCw size={16} className="dbs-spin dbs-text-primary ml-auto" />}
          </div>

          <div className="dbs-fee-breakdown-area">
            {feeHeads.length === 0 ? (
              <div className="dbs-empty-state">
                <AlertCircle className="dbs-empty-state-icon" />
                <div className="dbs-empty-state-title">No fee head details available</div>
                <div className="dbs-empty-state-desc">Fetch a student profile and select a Term above to view fee breakdown grid.</div>
              </div>
            ) : (
              <div className="dbs-table-card">
                <div className="dbs-table-scroll active-scroll">
                  <table className="dbs-data-table">
                    <thead>
                      <tr>
                        <th>S.No.</th>
                        <th>Fee Name</th>
                        <th>Fee Type</th>
                        <th>Amount (₹)</th>
                        <th>Paid (₹)</th>
                        <th>Given Con. (₹)</th>
                        <th>Given Refund. (₹)</th>
                        <th>Due (₹)</th>
                        <th>Pay Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeHeads.map((head, idx) => {
                        const key = `head_${idx}`;
                        const feeName = getPropVal(head, "FEENAME", "feeName");
                        const feeType = getPropVal(head, "FEETYPE", "feeType");
                        const totalAmt = getPropVal(head, "AMOUNT", "totalFee", "fee") || "0";
                        const paidAmt = getPropVal(head, "PAIDAMOUNT", "paidFee", "amount") || "0";
                        const givenCon = getPropVal(head, "CONCESSION", "concession") || "0";
                        const givenRef = getPropVal(head, "RefundAmt", "refundAmt") || "0";
                        const dueAmt = getPropVal(head, "TotBALANCE", "balance", "due") || "0";

                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td><strong>{feeName}</strong></td>
                            <td>{feeType}</td>
                            <td>₹{totalAmt}</td>
                            <td>
                              <button
                                type="button"
                                className="dbs-btn-inline-link dbs-text-success dbs-bold"
                                onClick={() => handleOpenPaidHistory(paidAmt)}
                                title={Number(paidAmt) > 0 ? "Click to view previous paid receipts" : ""}
                                style={{ cursor: Number(paidAmt) > 0 ? "pointer" : "default" }}
                              >
                                ₹{paidAmt}
                              </button>
                            </td>
                            <td>₹{givenCon}</td>
                            <td>₹{givenRef}</td>
                            <td className="dbs-text-warning">₹{dueAmt}</td>
                            <td>
                              <input
                                type="text"
                                className="dbs-table-inline-input dbs-pay-input"
                                value={payAmounts[key] || ""}
                                onChange={(e) => handlePayAmountChange(key, e.target.value)}
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
            )}

            {/* LIVE TOTAL SUMMARY BANNER */}
            <div className="dbs-total-pay-summary-banner mt-3">
              <div className="dbs-total-pay-text">
                Total Pay Amount: <strong>₹{totalPayAmount.toLocaleString()}</strong>
              </div>
              <div className="dbs-total-pay-text ml-4">
                Paid After Due: <strong>₹{paidAfterDue.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS (NO SAVE BUTTON) */}
          <div className="dbs-form-actions-row mt-4">
            <button type="button" className="dbs-form-cancel-btn" onClick={handleCancel}>
              Clear / Reset
            </button>

            {/* <button
              type="button"
              className="dbs-btn-reprint"
              onClick={() => openReceiptPrintModal()}
              disabled={feeHeads.length === 0}
            >
              <Printer size={16} />
              <span>Preview Receipt</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* PRINTABLE RECEIPT MODAL */}
      {showReceiptPrintModal && receiptPrintData && (
        <div className="dbs-modal-overlay">
          <div className="dbs-modal-content-box dbs-receipt-print-box">
            <div className="dbs-modal-header">
              <h3>Fee Payment Receipt Preview</h3>
              <button className="dbs-modal-close-btn" onClick={() => setShowReceiptPrintModal(false)}>
                &times;
              </button>
            </div>
            <div className="dbs-modal-body">
              <div id="printable-fee-receipt" className="dbs-fee-receipt-print-document">
                <div className="dbs-receipt-header">
                  <h2>LAKIREDDY BALI REDDY COLLEGE OF ENGINEERING (AUTONOMOUS)</h2>
                  <p>L.B.Reddy Nagar, Mylavaram - 521 230, N T R Dist., A.P. INDIA</p>
                  <span className="dbs-receipt-title-badge">FEE RECEIPT (DUPLICATE)</span>
                </div>

                <div className="dbs-receipt-meta-grid">
                  <div><strong>Receipt No:</strong> {receiptPrintData.receiptNo}</div>
                  <div><strong>Date:</strong> {receiptPrintData.date}</div>
                  <div><strong>Reg. No.:</strong> {receiptPrintData.ssNo}</div>
                  <div><strong>Student Name:</strong> {receiptPrintData.studentName}</div>
                  {receiptPrintData.fatherName && <div><strong>Father Name:</strong> {receiptPrintData.fatherName}</div>}
                  {receiptPrintData.courseBranch && <div><strong>Course & Branch:</strong> {receiptPrintData.courseBranch}</div>}
                  {receiptPrintData.term && <div><strong>Year & Term:</strong> Year {receiptPrintData.year || "1"} / Term {receiptPrintData.term}</div>}
                </div>

                <table className="dbs-receipt-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>S.No</th>
                      <th>Fee Particulars</th>
                      <th>Type</th>
                      <th style={{ textAlign: "right", width: "140px" }}>Amount (₹)</th>
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
                        <td>Fee Payment Amount</td>
                        <td>Fee</td>
                        <td style={{ textAlign: "right" }}>₹{receiptPrintData.totalAmount}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ fontWeight: 700 }}>Total Amount:</td>
                      <td style={{ textAlign: "right", fontWeight: 800 }}>₹{receiptPrintData.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>

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

      {/* PAID RECEIPT HISTORY MODAL */}
      {showPaidModal && (
        <div className="dbs-modal-overlay">
          <div className="dbs-modal-content-box" style={{ width: "900px", maxWidth: "95%" }}>
            <div className="dbs-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={20} />
                <h3>Paid Fee Receipts Details</h3>
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
                  <div className="dbs-empty-state-title">Loading paid receipt history...</div>
                </div>
              ) : paidHistoryList.length === 0 ? (
                <div className="dbs-empty-state">
                  <AlertCircle size={32} className="dbs-empty-state-icon" />
                  <div className="dbs-empty-state-title">No previous receipt history found</div>
                  <div className="dbs-empty-state-desc">No paid receipts registered for student {ssNo}.</div>
                </div>
              ) : (
                <div className="dbs-table-card">
                  <div className="dbs-table-scroll active-scroll" style={{ maxHeight: "380px" }}>
                    <table className="dbs-data-table">
                      <thead>
                        <tr>
                          <th>Receipt No.</th>
                          <th>Date</th>
                          <th>Year</th>
                          <th>Fee Type</th>
                          <th>Amount (₹)</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paidHistoryList.map((rec, idx) => {
                          const rNo = getPropVal(rec, "RECEIPTNO", "receiptNo", "RECPTNO");
                          const dt = getPropVal(rec, "PaidDate", "paidDate", "DATE");
                          const yr = getPropVal(rec, "Year", "year");
                          const fType = getPropVal(rec, "FEETYPE", "feeType");
                          const amt = getPropVal(rec, "Amount", "amount");
                          const rem = getPropVal(rec, "Remark", "remarks", "remark");

                          return (
                            <tr key={idx}>
                              <td className="dbs-bold dbs-text-primary">{rNo}</td>
                              <td>{dt}</td>
                              <td>Year {yr}</td>
                              <td>{fType}</td>
                              <td className="dbs-bold dbs-text-success">₹{amt}</td>
                              <td>{rem || "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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

export default FeeChallanaDuplicate;
