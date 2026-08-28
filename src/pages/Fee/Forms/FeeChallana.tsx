import React, { useState, useEffect } from "react";
import { Search, Save, RefreshCw, AlertCircle, Trash2, CreditCard, DollarSign, User, Printer, PlusCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import "./FeeChallana.css";
import {
  getFeeChallanaCurrentAcyr,
  getFeeChallanaList,
  getMaxFeeRcptNo,
  getStudentSSNo,
  getStudentFeeData,
  getStudentFeeDataSearchName,
  getStudentFeeTerms,
  getStudentFeeDetails,
  getStudentFeeDues,
  getPaidAmount,
  saveFeeChallanaDetails,
  deleteFeeChallana,
  addAmountFeeChallana
} from "../../../apis/FeeApis";

/**
 * Case-insensitive property extraction helper function.
 * Matches any key variant regardless of casing (e.g. SNAME, sNAME, sName, sname).
 */
const getPropVal = (obj: any, ...keys: string[]): string => {
  if (!obj || typeof obj !== "object") return "";

  // 1. Direct key match
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return String(obj[k]);
  }

  // 2. Case-insensitive key match against all object keys
  const objKeys = Object.keys(obj);
  for (const targetKey of keys) {
    const lowerTarget = targetKey.toLowerCase();
    const foundKey = objKeys.find(k => k.toLowerCase() === lowerTarget);
    if (foundKey && obj[foundKey] !== undefined && obj[foundKey] !== null) {
      return String(obj[foundKey]);
    }
  }

  // 3. Fallback: return first non-null property value
  const vals = Object.values(obj).filter(v => v !== null && v !== undefined);
  if (vals.length > 0) return String(vals[0]);

  return "";
};

export const FeeChallana: React.FC = () => {
  // Top Header Search
  const [topSearch, setTopSearch] = useState<string>("");
  const [statusBadge, setStatusBadge] = useState<string>("");
  const [isStaffChild, setIsStaffChild] = useState<boolean>(false);

  // Form Fields - Left Column
  const [chNo, setChNo] = useState<string>("");
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [studentName, setStudentName] = useState<string>("");
  const [courseBranch, setCourseBranch] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [concession, setConcession] = useState<string>("0");
  const [refund, setRefund] = useState<string>("0");
  const [paymentMode, setPaymentMode] = useState<string>("Cash");
  const [bank, setBank] = useState<string>("");
  const [fine, setFine] = useState<string>("0");
  const [enterAmount, setEnterAmount] = useState<string>("");

  // Form Fields - Right Column
  const [ssNo, setSsNo] = useState<string>("");
  const [regNo, setRegNo] = useState<string>("");
  const [casteTag, setCasteTag] = useState<string>("");
  const [fatherName, setFatherName] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [totalFeeAmount, setTotalFeeAmount] = useState<string>("0");
  const [paidFeeAmount, setPaidFeeAmount] = useState<string>("0");
  const [scholarAmt, setScholarAmt] = useState<string>("0");
  const [ddNo, setDdNo] = useState<string>("");
  const [ddDate, setDdDate] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [narration, setNarration] = useState<string>("");

  // Year Dues Mini Table State
  const [yearDues, setYearDues] = useState<any[]>([]);

  // Fee Breakdown Table Grid State
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({});
  const [yearsList, setYearsList] = useState<string[]>([]);
  const [termsList, setTermsList] = useState<any[]>([]);

  // Saved Challans Registry Grid State
  const [savedChallansList, setSavedChallansList] = useState<any[]>([]);
  const [tableSearch, setTableSearch] = useState<string>("");
  const [loadingGrid, setLoadingGrid] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Modal Popups State
  const [showPaidModal, setShowPaidModal] = useState<boolean>(false);
  const [paidHistoryList, setPaidHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // ADD AMOUNT MODAL POPUP STATE (ASPX MP5 Modal)
  const [showAddAmtModal, setShowAddAmtModal] = useState<boolean>(false);
  const [addAmtFeeNameVal, setAddAmtFeeNameVal] = useState<string>("1");
  const [addAmtValue, setAddAmtValue] = useState<string>("");
  const [addAmtRemarks, setAddAmtRemarks] = useState<string>("");
  const [savingAddAmt, setSavingAddAmt] = useState<boolean>(false);

  // Fee Receipt Print State
  const [showReceiptPrintModal, setShowReceiptPrintModal] = useState<boolean>(false);
  const [receiptPrintData, setReceiptPrintData] = useState<any>(null);

  // UI Loading States
  const [loadingStudent, setLoadingStudent] = useState<boolean>(false);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch Max Fee Receipt Number from getMaxFeeRcptNo API and fill into receiptNo field
  const loadMaxReceiptNumber = async () => {
    try {
      const rcptRes = await getMaxFeeRcptNo();
      let rcptVal = "";
      if (Array.isArray(rcptRes) && rcptRes.length > 0) {
        rcptVal = getPropVal(rcptRes[0], "RECPTNO", "recptno", "ReceiptNo", "rECPTNO", "maxFeeRcptNo");
      } else if (rcptRes && typeof rcptRes === "object") {
        rcptVal = getPropVal(rcptRes, "RECPTNO", "recptno", "ReceiptNo", "rECPTNO") || String(Object.values(rcptRes)[0] || "");
      }
      if (rcptVal) {
        setReceiptNo(rcptVal);
      }
    } catch (error) {
      console.error("Failed to load max fee receipt number", error);
    }
  };

  // Fetch Initial Receipt Number on Mount
  const loadInitialData = async () => {
    setLoadingGrid(true);
    try {
      await loadMaxReceiptNumber();
    } catch (error) {
      console.error("Failed to load initial fee challan data", error);
    } finally {
      setLoadingGrid(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

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

  // Fetch Student Profile, Terms & Dues
  const handleSearchStudent = async (searchVal?: string) => {
    const queryNo = (searchVal !== undefined ? searchVal : regNo).trim();
    if (!queryNo) {
      toast.error("Please enter AdmNo. / Reg.No.");
      return;
    }

    setLoadingStudent(true);
    try {
      loadMaxReceiptNumber();

      // 1. Resolve SSNo mapping first (RegistrationNo -> StudentSerialNo) per ASPX logic
      let resolvedSsNo = queryNo;
      try {
        const mapRes = await getStudentSSNo(queryNo);
        let mapArr: any[] = [];
        if (Array.isArray(mapRes)) mapArr = mapRes;
        else if (mapRes?.data) mapArr = mapRes.data;

        if (mapArr.length > 0) {
          const foundSerial = getPropVal(
            mapArr[0],
            "STUDENTSERIALNO",
            "studentSerialNo",
            "SSNO",
            "ssNo",
            "REGISTRATIONNO",
            "registrationno"
          );
          if (foundSerial) {
            resolvedSsNo = foundSerial;
            setSsNo(foundSerial);
          }
        }
      } catch (e) {
        console.log("SSNo mapping lookup fallback to raw query");
      }

      // 2. Fetch student details, terms, and dues using resolvedSsNo or queryNo
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

  // When Term or Year changes -> Fetch Fee Breakdown Grid
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

      // Calculate Totals
      let totAcc = 0;
      let paidAcc = 0;
      let concAcc = 0;
      let refAcc = 0;

      headsArr.forEach((h: any) => {
        const tot = Number(getPropVal(h, "AMOUNT", "totalFee", "fee")) || 0;
        const paid = Number(getPropVal(h, "PAIDAMOUNT", "paidFee", "amount")) || 0;
        const conc = Number(getPropVal(h, "CONCESSION", "concession")) || 0;
        const ref = Number(getPropVal(h, "RefundAmt", "refundAmt")) || 0;

        totAcc += tot;
        paidAcc += paid;
        concAcc += conc;
        refAcc += ref;
      });

      setTotalFeeAmount(String(totAcc));
      setPaidFeeAmount(String(paidAcc));
      setConcession(String(concAcc));
      setRefund(String(refAcc));
      setPayAmounts({});
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
    setChNo("");
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
    setTotalFeeAmount("0");
    setPaidFeeAmount("0");
    setScholarAmt("0");
    setConcession("0");
    setRefund("0");
    setPaymentMode("Cash");
    setBank("");
    setBranchName("");
    setFine("0");
    setEnterAmount("");
    setNarration("");
    setDdNo("");
    setDdDate("");
    setFeeHeads([]);
    setPayAmounts({});
    setYearDues([
      { year: "1", due: "0.00" },
      { year: "2", due: "0.00" },
      { year: "3", due: "0.00" }
    ]);
    loadInitialData();
  };

  // DIRECT ADD AMT BUTTON CLICK: Opens Add Amount Modal Popup (MP5) directly without any validations per ASPX logic
  const handleOpenAddAmtModal = () => {
    setShowAddAmtModal(true);
  };

  // SUBMIT ADD AMOUNT FORM (ASPX btnadd1_Click) -> Saves Add Amount AND Reloads Year Dues Grid (GVDues)
  const handleSaveAddAmount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addAmtValue || isNaN(Number(addAmtValue)) || Number(addAmtValue) <= 0) {
      toast.error("Please enter a valid Add Amount.");
      return;
    }

    let feeTypeName = "Miscellaneous Fee";
    if (addAmtFeeNameVal === "1") feeTypeName = "TUTION FEE";
    else if (addAmtFeeNameVal === "2") feeTypeName = "Miscellaneous Fee";
    else if (addAmtFeeNameVal === "3") feeTypeName = "JNTUK OD(Original Degree) Fee";
    else if (addAmtFeeNameVal === "4") feeTypeName = "Graduation Day registration fee";

    setSavingAddAmt(true);
    try {
      const payload = {
        Date: date,
        SSNo: ssNo || "0",
        AcademicYear: localStorage.getItem("AcYr") || "2024-2025",
        StudentName: studentName || "",
        Course: courseBranch ? courseBranch.split("-")[0] : "",
        Group: courseBranch ? courseBranch.split("-")[1] || "" : "",
        Year: year || "1",
        Caste: casteTag || "",
        AddAmt: addAmtValue,
        FeeId: "59",
        FeeName: feeTypeName,
        FeeType: feeTypeName,
        CID: localStorage.getItem("userId") || "admin",
        Remark: addAmtRemarks
      };

      await addAmountFeeChallana(payload);
      toast.success("Add Amount saved successfully!");
      setShowAddAmtModal(false);
      setAddAmtValue("");
      setAddAmtRemarks("");
      
      // RELOAD BOTH FEE BREAKDOWN GRID AND YEAR DUES GRID (matching ASPX line 1222)
      fetchFeeBreakdown();
      fetchYearDues();
    } catch (error) {
      toast.error("Error saving add amount.");
    } finally {
      setSavingAddAmt(false);
    }
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

  // Open Print Receipt Modal Popup ONLY (AND CLOSE Paid Fee Receipt Details Modal if open)
  const openReceiptPrintModal = (customPrintData?: any) => {
    setShowPaidModal(false); // Automatically close Paid Fee Receipt Details popup!

    if (customPrintData) {
      setReceiptPrintData(customPrintData);
    } else {
      // Build print receipt structure from current form state
      const printItems: any[] = [];
      feeHeads.forEach((h, idx) => {
        const key = `head_${idx}`;
        const payAmt = payAmounts[key];
        if (payAmt && parseFloat(payAmt) > 0) {
          printItems.push({
            feeName: getPropVal(h, "FEENAME", "feeName"),
            feeType: getPropVal(h, "FEETYPE", "feeType"),
            payAmount: payAmt
          });
        }
      });

      setReceiptPrintData({
        receiptNo,
        date,
        ssNo,
        studentName,
        fatherName,
        courseBranch,
        year,
        term,
        paymentMode,
        ddNo,
        bank,
        narration,
        totalAmount: totalPayAmount,
        items: printItems
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

  // Submit Handler -> Calls saveFeeChallana and opens print view modal ONLY
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ssNo || !studentName) {
      toast.error("Please enter a valid AdmNo. / Reg.No. and fetch student details.");
      return;
    }

    if (totalPayAmount <= 0) {
      toast.error("Total Pay Amount must be greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      let saveCount = 0;
      const savedItemsForPrint: any[] = [];

      for (let i = 0; i < feeHeads.length; i++) {
        const head = feeHeads[i];
        const key = `head_${i}`;
        const payAmtStr = payAmounts[key] || "0";
        const payAmtNum = parseFloat(payAmtStr);

        if (payAmtNum > 0) {
          const payload = {
            BCNO: chNo,
            ReceiptNO: receiptNo,
            Date: date,
            SSNo: ssNo,
            Year: year,
            Term: term,
            Caste: casteTag,
            PaymentMode: paymentMode || "Cash",
            Remark: narration,
            FeeId: getPropVal(head, "FEEID", "feeID", "feeId"),
            FeeName: getPropVal(head, "FEENAME", "feeName"),
            FeeType: getPropVal(head, "FEETYPE", "feeType"),
            Fee: getPropVal(head, "AMOUNT", "totalFee", "fee"),
            PayAmount: payAmtStr,
            Fine: fine || "0",
            DDNo: ddNo,
            DDDate: ddDate,
            Bank: bank,
            Branch: branchName,
            UserId: localStorage.getItem("userId") || "admin"
          };

          await saveFeeChallanaDetails(payload);
          saveCount++;

          savedItemsForPrint.push({
            feeName: getPropVal(head, "FEENAME", "feeName"),
            feeType: getPropVal(head, "FEETYPE", "feeType"),
            payAmount: payAmtStr
          });
        }
      }

      if (saveCount > 0) {
        toast.success("Fee Payment Saved Successfully!");

        // Construct print receipt object
        const printPayload = {
          receiptNo,
          date,
          ssNo,
          studentName,
          fatherName,
          courseBranch,
          year,
          term,
          paymentMode,
          ddNo,
          bank,
          narration,
          totalAmount: totalPayAmount,
          items: savedItemsForPrint
        };

        // Open Receipt Print Modal ONLY
        openReceiptPrintModal(printPayload);
        handleCancel();
      } else {
        toast.error("No valid pay amount specified to save.");
      }
    } catch (error) {
      toast.error("Error saving fee challan payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dbs-fee-challana-modern-container">

      {/* HEADER SECTION */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Fee Challan Console</h2>
          <p>Process student tuition, special, and miscellaneous fee payments</p>
        </div>

        {/* STATUS BADGES */}
        <div className="dbs-header-badges-row">
          {statusBadge && <span className="dbs-header-status-badge">{statusBadge}</span>}
          {isStaffChild && <span className="dbs-header-staff-child-badge">STAFF CHILD</span>}
        </div>
      </div>

      {/* 1. STUDENT LOOKUP & HEADER CARD (WITH YEAR DUES ON RIGHT SIDE OF SEARCH) */}
      <div className="dbs-admissions-stepper-form-card">
        <div className="dbs-form-card">

          <div className="dbs-card-title-row">
            <User className="dbs-card-title-icon" size={20} />
            <h3>1. Student Search & Receipt Header</h3>
            {loadingStudent && <RefreshCw size={16} className="dbs-spin dbs-text-primary ml-auto" />}
          </div>

          <div className="dbs-top-search-dues-layout">

            {/* LEFT AREA: SEARCH INPUTS & STUDENT BANNER */}
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

                {/* Date */}
                <div className="dbs-input-box">
                  <label>Receipt Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Receipt No */}
                <div className="dbs-input-box">
                  <label>Receipt No. *</label>
                  <input
                    type="text"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
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
                            {yd.year}
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

      {/* 2. TERM & PAYMENT MODE DETAILS CARD */}
      <form onSubmit={handleSave} className="dbs-admissions-stepper-form-card">
        <div className="dbs-form-card">

          <div className="dbs-card-title-row">
            <CreditCard className="dbs-card-title-icon" size={20} />
            <h3>2. Payment Mode & Term Options</h3>
          </div>

          <div className="dbs-form-grid-3">

            {/* Year Selector */}
            <div className="dbs-input-box">
              <label>Year *</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Select Year</option>
                {yearsList.map((y, idx) => <option key={idx} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Term Selector */}
            <div className="dbs-input-box">
              <label>Select Term *</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                disabled={!studentName}
              >
                <option value="">Select Term</option>
                {termsList.map((t, idx) => {
                  const val = getPropVal(t, "TERMNO", "termNo", "TERM", "term");
                  return <option key={idx} value={val}>Term {val}</option>;
                })}
              </select>
            </div>

            {/* Payment Mode */}
            <div className="dbs-input-box">
              <label>Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Demand Draft">Demand Draft</option>
                <option value="Bank Challan">Bank Challan</option>
                <option value="Scholarship">Scholarship</option>
                <option value="OnlinePayment">Online Payment</option>
              </select>
            </div>

            {/* Enter Amount Distribution */}
            <div className="dbs-input-box">
              <label>Enter Amount (₹)</label>
              <input
                type="text"
                value={enterAmount}
                onChange={(e) => setEnterAmount(e.target.value)}
                placeholder="Amount to distribute across fee heads"
              />
            </div>

            {/* Fine */}
            <div className="dbs-input-box">
              <label>Fine (₹)</label>
              <input
                type="text"
                value={fine}
                onChange={(e) => setFine(e.target.value)}
                placeholder="0"
              />
            </div>

            {/* Remarks / Narration */}
            <div className="dbs-input-box">
              <label>Narration / Remarks</label>
              <input
                type="text"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Payment narration remarks"
              />
            </div>            

          </div>

          {/* CONDITIONAL DD / CHEQUE DETAILS */}
          {(paymentMode === "Demand Draft" || paymentMode === "Cheque") && (
            <div className="dbs-form-grid-4 mt-3">
              <div className="dbs-input-box">
                <label>DD / Cheque No. *</label>
                <input
                  type="text"
                  value={ddNo}
                  onChange={(e) => setDdNo(e.target.value)}
                  placeholder="Instrument No."
                />
              </div>
              <div className="dbs-input-box">
                <label>DD / Cheque Date *</label>
                <input
                  type="date"
                  value={ddDate}
                  onChange={(e) => setDdDate(e.target.value)}
                />
              </div>
              <div className="dbs-input-box">
                <label>Bank Name *</label>
                <input
                  type="text"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  placeholder="Bank Name"
                />
              </div>
              <div className="dbs-input-box">
                <label>Branch Name *</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Branch Name"
                />
              </div>
            </div>
          )}

          {/* 3. FEE BREAKDOWN TABLE GRID */}
          <div className="dbs-fee-breakdown-area mt-4">
            <div className="dbs-card-title-row">
              <DollarSign className="dbs-card-title-icon" size={20} />
              <h3>Fee Heads Breakdown Grid</h3>
              {loadingDetails && <RefreshCw size={16} className="dbs-spin dbs-text-primary ml-auto" />}
            </div>

            <div className="dbs-table-container">
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
                              <td>
                                {/* <button
                                  type="button"
                                  className="dbs-btn-inline-link dbs-text-primary"
                                  onClick={handleOpenPaidHistory}
                                >
                                  ₹{givenCon}
                                </button> */}
                                ₹{givenCon}
                              </td>
                              <td>
                                {/* <button
                                  type="button"
                                  className="dbs-btn-inline-link dbs-text-primary"
                                  onClick={handleOpenPaidHistory}
                                >
                                  ₹{givenRef}
                                </button> */}
                                ₹{givenRef}
                              </td>
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
            </div>

            {/* LIVE TOTAL PAY AMOUNT BANNER */}
            <div className="dbs-total-pay-summary-banner mt-3">
              <div className="dbs-total-pay-text">
                Total Pay Amount: <strong>₹{totalPayAmount.toLocaleString()}</strong>
              </div>
              <div className="dbs-total-pay-text ml-4">
                Paid After Due: <strong>₹{paidAfterDue.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* SAVE & ACTION BUTTONS - RIGHT ALIGNED */}
          <div className="dbs-form-actions-row mt-4">
            <button
              type="button"
              className="dbs-btn-add-amt"
              onClick={handleOpenAddAmtModal}
              title="Click to open Add Amount Modal Popup directly (ASPX MP5)"
            >
              <PlusCircle size={16} />
              <span>ADD AMT</span>
            </button>

            <button type="submit" className="dbs-form-save-btn" disabled={submitting || totalPayAmount <= 0}>
              {submitting ? <RefreshCw size={16} className="dbs-spin" /> : <Save size={16} />}
              <span>{submitting ? "Saving..." : "Save Fee Challan"}</span>
            </button>

            <button type="button" className="dbs-form-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>

            {/* <button type="button" className="dbs-btn-reprint" onClick={() => openReceiptPrintModal()}>
              <Printer size={16} />
              <span>Reprint</span>
            </button> */}
          </div>

        </div>
      </form>

      {/* ADD AMOUNT MODAL POPUP (ASPX MP5 MODAL) */}
      {showAddAmtModal && (
        <div className="dbs-modal-overlay">
          <div className="dbs-modal-content-box" style={{ maxWidth: "500px" }}>
            <div className="dbs-modal-header">
              <h3>Add Amount (Custom Fee Head)</h3>
              <button type="button" className="dbs-modal-close-btn" onClick={() => setShowAddAmtModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSaveAddAmount}>
              <div className="dbs-modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Select Fee Name */}
                <div className="dbs-input-box">
                  <label>Select Fee Name *</label>
                  <select
                    value={addAmtFeeNameVal}
                    onChange={(e) => setAddAmtFeeNameVal(e.target.value)}
                    required
                  >
                    <option value="1">TUTION FEE</option>
                    <option value="2">Miscellaneous Fee</option>
                    <option value="3">JNTUK OD(Original Degree) Fee</option>
                    <option value="4">Graduation Day registration fee</option>
                  </select>
                </div>

                {/* Add Amount (₹) */}
                <div className="dbs-input-box">
                  <label>Add Amount (₹) *</label>
                  <input
                    type="text"
                    value={addAmtValue}
                    onChange={(e) => setAddAmtValue(e.target.value)}
                    placeholder="Enter amount to add..."
                    required
                  />
                </div>

                {/* Remarks */}
                <div className="dbs-input-box">
                  <label>Remarks / Narration</label>
                  <input
                    type="text"
                    value={addAmtRemarks}
                    onChange={(e) => setAddAmtRemarks(e.target.value)}
                    placeholder="Enter remarks..."
                  />
                </div>

              </div>

              <div className="dbs-modal-footer">
                <button type="submit" className="dbs-form-save-btn" disabled={savingAddAmt}>
                  {savingAddAmt ? <RefreshCw size={16} className="dbs-spin" /> : <Save size={16} />}
                  <span>{savingAddAmt ? "Saving..." : "Save Amount"}</span>
                </button>
                <button type="button" className="dbs-form-cancel-btn" onClick={() => setShowAddAmtModal(false)}>
                  Close
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL POPUP */}
      {showReceiptPrintModal && receiptPrintData && (
        <div className="dbs-modal-overlay dbs-print-modal-overlay">
          <div className="dbs-modal-content-box dbs-receipt-print-box">
            
            {/* Printable Document Target */}
            <div id="printable-fee-receipt" className="dbs-fee-receipt-print-document">
              
              {/* College Header */}
              <div className="dbs-receipt-header">
                <h2>LAKIREDDY BALI REDDY COLLEGE OF ENGINEERING (AUTONOMOUS)</h2>
                <p>L.B.Reddy Nagar, Mylavaram - 521 230, N T R Dist., A.P. INDIA</p>
                <div className="dbs-receipt-title-badge">FEE PAYMENT RECEIPT</div>
              </div>

              {/* Meta Grid */}
              <div className="dbs-receipt-meta-grid">
                <div><strong>Receipt No:</strong> {receiptPrintData.receiptNo}</div>
                <div><strong>Date:</strong> {receiptPrintData.date}</div>
                <div><strong>Reg. No.:</strong> {receiptPrintData.ssNo}</div>
                <div><strong>Student Name:</strong> {receiptPrintData.studentName}</div>
                {receiptPrintData.fatherName && <div><strong>Father Name:</strong> {receiptPrintData.fatherName}</div>}
                {receiptPrintData.courseBranch && <div><strong>Course & Branch:</strong> {receiptPrintData.courseBranch}</div>}
                {receiptPrintData.term && <div><strong>Year & Term:</strong> Year {receiptPrintData.year || "1"} / Term {receiptPrintData.term}</div>}
                <div><strong>Payment Mode:</strong> {receiptPrintData.paymentMode}</div>
                {receiptPrintData.ddNo && <div><strong>DD/Chq No:</strong> {receiptPrintData.ddNo}</div>}
                {receiptPrintData.bank && <div><strong>Bank:</strong> {receiptPrintData.bank}</div>}
              </div>

              {/* Fee Heads Breakdown Table */}
              <table className="dbs-receipt-table">
                <thead>
                  <tr>
                    <th style={{ width: "8%" }}>S.No</th>
                    <th>Fee Particulars</th>
                    <th style={{ width: "25%" }}>Type</th>
                    <th style={{ width: "25%" }} className="dbs-text-right">Paid Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptPrintData.items && receiptPrintData.items.length > 0 ? (
                    receiptPrintData.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{item.feeName}</td>
                        <td>{item.feeType}</td>
                        <td className="dbs-text-right">₹{item.payAmount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>1</td>
                      <td>Tuition / Special Fee Payment</td>
                      <td>Regular</td>
                      <td className="dbs-text-right">₹{receiptPrintData.totalAmount}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="dbs-text-right"><strong>Total Amount Paid:</strong></td>
                    <td className="dbs-text-right"><strong>₹{receiptPrintData.totalAmount}</strong></td>
                  </tr>
                </tfoot>
              </table>

              {/* Remarks & Signatures */}
              <div className="dbs-receipt-footer">
                {receiptPrintData.narration && (
                  <p className="dbs-receipt-remarks"><strong>Remarks:</strong> {receiptPrintData.narration}</p>
                )}
                <div className="dbs-signature-row">
                  <div>
                    <br /><br />
                    <span>Student Signature</span>
                  </div>
                  <div>
                    <br /><br />
                    <span>Cashier / Authorized Signatory</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
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

      {/* PAID FEE RECEIPT DETAILS MODAL POPUP (BEAUTIFUL & PROPERLY STRUCTURED) */}
      {showPaidModal && (
        <div className="dbs-modal-overlay">
          <div className="dbs-modal-content-box" style={{ width: "900px", maxWidth: "95%" }}>
            <div className="dbs-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={20} />
                <h3>Paid Fee Receipt Details</h3>
              </div>
              <button type="button" className="dbs-modal-close-btn" onClick={() => setShowPaidModal(false)}>
                ×
              </button>
            </div>

            <div className="dbs-modal-body">

              {/* Student Summary Banner inside Modal */}
              {studentName && (
                <div className="dbs-student-info-banner-card mb-3" style={{ marginBottom: "16px" }}>
                  <div className="dbs-student-info-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Student:</span>
                      <span className="dbs-info-val"><strong>{studentName}</strong></span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Adm / Reg No:</span>
                      <span className="dbs-info-val"><strong>{ssNo}</strong></span>
                    </div>
                    <div className="dbs-info-item">
                      <span className="dbs-info-label">Total Receipts:</span>
                      <span className="dbs-info-val"><strong>{paidHistoryList.length} Records</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {loadingHistory ? (
                <div className="dbs-empty-state">
                  <RefreshCw size={28} className="dbs-spin dbs-text-primary" />
                  <div className="dbs-empty-state-title">Loading receipt history...</div>
                </div>
              ) : paidHistoryList.length === 0 ? (
                <div className="dbs-empty-state">
                  <AlertCircle size={32} className="dbs-empty-state-icon" />
                  <div className="dbs-empty-state-title">No previous receipt payments found</div>
                  <div className="dbs-empty-state-desc">No payment history records registered for student {ssNo}.</div>
                </div>
              ) : (
                <div className="dbs-table-container">
                  <div className="dbs-table-card">
                    <div className="dbs-table-scroll active-scroll" style={{ maxHeight: "380px" }}>
                      <table className="dbs-data-table">
                        <thead>
                          <tr>
                            <th style={{ textAlign: "center" }}>Action</th>
                            <th>Recp.No.</th>
                            <th>Paid Date</th>
                            <th>Year</th>
                            <th>Payment Mode</th>
                            <th>Fee Type</th>
                            <th>Paid Amount (₹)</th>
                            <th>Narration</th>                            
                          </tr>
                        </thead>
                        <tbody>
                          {paidHistoryList.map((rec, idx) => {
                            const rNo = getPropVal(rec, "RECPTNO", "recptNo", "receiptNo");
                            const dt = getPropVal(rec, "PaidDate", "paidDate", "DATE", "date");
                            const yr = getPropVal(rec, "Year", "year");
                            const pMode = getPropVal(rec, "PAYMENTMODE", "paymentMode");
                            const fType = getPropVal(rec, "FEETYPE", "feeType");
                            const amt = getPropVal(rec, "Amount", "amount");
                            const rem = getPropVal(rec, "Remarks", "remarks", "REMARK");

                            return (
                              <tr key={idx}>
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
                                        fatherName: fatherName,
                                        courseBranch: courseBranch,
                                        year: yr,
                                        term: term,
                                        paymentMode: pMode,
                                        narration: rem,
                                        totalAmount: amt,
                                        items: [{ feeName: `${fType} Fee`, feeType: fType, payAmount: amt }]
                                      });
                                    }}
                                    title="Print Receipt"
                                  >
                                    <Printer size={14} />
                                  </button>
                                </td>
                                <td><strong className="dbs-font-mono dbs-text-primary">{rNo}</strong></td>
                                <td>{dt}</td>
                                <td>Year {yr}</td>
                                <td><span className="dbs-pill-category">{pMode}</span></td>
                                <td>{fType}</td>
                                <td className="dbs-text-success dbs-bold">₹{amt}</td>
                                <td>{rem || "-"}</td>
                                
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

export default FeeChallana;
